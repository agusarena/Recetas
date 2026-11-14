/**
 * Capa de acceso a datos (Supabase) con caché de servidor/CDN mediante
 * `use cache` + `cacheLife` (Cache Components de Next 16).
 *
 * Las consultas de catálogo (ingredientes/recetas) cambian poco, así que
 * se reutilizan entre pedidos y quedan aptas para prerender.
 *
 * Convenciones (auditoría de best-practices):
 * · Columnas SIEMPRE explícitas en el select: `*` en el join arrastra el
 *   jsonb `pasos` de la receta repetido en cada fila de ingrediente, y
 *   metadatos (created_at) que la app no usa.
 * · Los IDs que llegan de la URL se validan antes de ir a Postgres:
 *   un uuid malformado sería un error de sintaxis SQL (página de error)
 *   en vez de un "no encontrada" limpio.
 *
 * IMPORTANTE: las funciones `use cache` NUNCA lanzan. Next 16 no permite
 * capturar errores de una función cacheada en el componente; devuelven un
 * `Estado<T>` tipado que la UI interpreta.
 */
import { cacheLife } from "next/cache";
import { crearClienteSupabase } from "@/lib/supabase";
import type {
  Alergeno,
  CategoriaReceta,
  Dificultad,
  EtiquetaDieta,
  Ingrediente,
  Receta,
  RecetaConIngredientes,
  RecetaIngredienteConDetalle,
  ResumenReceta,
  Unidad,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Estado del pedido (nunca lanza)
// ─────────────────────────────────────────────────────────────────────────────

export type Estado<T> =
  | { ok: true; datos: T }
  | { ok: false; motivo: "supabase_no_configurado" | "error"; detalle?: string };

/** Estado de fallo con detalle técnico (para logs, no para el usuario). */
function errorEstado(detalle: string): Estado<never> {
  return { ok: false, motivo: "error", detalle };
}

// ─────────────────────────────────────────────────────────────────────────────
// Proyecciones de columnas (explícitas, sin `*`)
// ─────────────────────────────────────────────────────────────────────────────

/** Columnas de ingredientes que consume la app (sin created_at). */
const COLS_INGREDIENTE = "id, nombre, categoria, es_basico, alergenos";

/** Columnas de receta que consume la app (sin created_at). */
const COLS_RECETA =
  "id, titulo, categoria, descripcion_corta, tiempo_minutos, dificultad, porciones_base, pasos, tip_principiante, etiquetas_dieta, macros_generales, imagen_url";

/**
 * Fila de la relación, con ingrediente y receta resueltos en un solo viaje.
 * Es un template literal (no un join): el tipo literal es lo que permite
 * a supabase-js inferir la forma de las filas en el cliente.
 */
const SELECCION_RECETA_INGREDIENTE = `receta_id, ingrediente_id, cantidad_base, unidad, texto_principiante, es_opcional, reemplazo_sugerido, reemplazo_ingrediente_id, ingrediente:ingredientes!receta_ingredientes_ingrediente_id_fkey(${COLS_INGREDIENTE}), receta:recetas(${COLS_RECETA})`;

/** Un uuid v4-ish: suficiente para descartar basura de URL antes de SQL. */
const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Forma de una fila del join receta_ingredientes → ingrediente/receta.
 * Se declara acá y se impone con `.returns()`: la inferencia genérica de
 * supabase-js no distingue relación 1-a-1 de 1-a-N en este join, y los
 * normalizadores ya validan cada campo por su cuenta.
 */
type FilaRecetaIngrediente = {
  receta_id: string;
  ingrediente_id: string;
  cantidad_base: number;
  unidad: string;
  texto_principiante: string | null;
  es_opcional: boolean;
  reemplazo_sugerido: string | null;
  reemplazo_ingrediente_id: string | null;
  ingrediente: Record<string, unknown> | null;
  receta: Record<string, unknown> | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Validación / normalización de filas crudas
// ─────────────────────────────────────────────────────────────────────────────

const ALERGENOS_VALIDOS = new Set<Alergeno>([
  "gluten",
  "lactosa",
  "frutos_secos",
  "huevo",
  "pescado",
]);
const DIFICULTADES_VALIDAS = new Set<Dificultad>(["cero_cocina", "facil"]);
const CATEGORIAS_VALIDAS = new Set<CategoriaReceta>(["salado", "dulce"]);
const UNIDADES_VALIDAS = new Set<Unidad>(["g", "ml", "unidad", "cda", "taza", "pizca"]);
const ETIQUETAS_VALIDAS = new Set<EtiquetaDieta>([
  "vegetariano",
  "vegano",
  "sin_tacc",
  "sin_lactosa",
  "sin_frutos_secos",
]);

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizarIngrediente(fila: any): Ingrediente {
  return {
    id: String(fila.id),
    nombre: String(fila.nombre ?? ""),
    categoria: String(fila.categoria ?? "otros"),
    es_basico: Boolean(fila.es_basico),
    alergenos: Array.isArray(fila.alergenos)
      ? fila.alergenos.filter((a: unknown): a is Alergeno => ALERGENOS_VALIDOS.has(a as Alergeno))
      : [],
  };
}

function normalizarReceta(fila: any): Receta {
  return {
    id: String(fila.id),
    titulo: String(fila.titulo ?? ""),
    descripcion_corta: String(fila.descripcion_corta ?? ""),
    categoria: CATEGORIAS_VALIDAS.has(fila.categoria)
      ? (fila.categoria as CategoriaReceta)
      : "salado",
    tiempo_minutos: Number(fila.tiempo_minutos ?? 0),
    dificultad: DIFICULTADES_VALIDAS.has(fila.dificultad)
      ? (fila.dificultad as Dificultad)
      : "facil",
    porciones_base: Math.max(1, Number(fila.porciones_base ?? 1)),
    pasos: Array.isArray(fila.pasos)
      ? fila.pasos.map((p: any, i: number) => ({
          orden: Number(p?.orden ?? i + 1),
          texto: String(p?.texto ?? ""),
          tiempo_segundos: p?.tiempo_segundos == null ? null : Number(p.tiempo_segundos),
        }))
      : [],
    tip_principiante: fila.tip_principiante == null ? null : String(fila.tip_principiante),
    etiquetas_dieta: Array.isArray(fila.etiquetas_dieta)
      ? fila.etiquetas_dieta.filter(
          (e: unknown): e is EtiquetaDieta => ETIQUETAS_VALIDAS.has(e as EtiquetaDieta),
        )
      : [],
    macros_generales: {
      calorias: Number(fila?.macros_generales?.calorias ?? 0),
      perfil: String(fila?.macros_generales?.perfil ?? ""),
      proteinas: Number(fila?.macros_generales?.proteinas ?? 0),
      carbohidratos: Number(fila?.macros_generales?.carbohidratos ?? 0),
      grasas: Number(fila?.macros_generales?.grasas ?? 0),
    },
    imagen_url: fila.imagen_url == null ? null : String(fila.imagen_url),
  };
}

function normalizarRecetaIngrediente(fila: any): RecetaIngredienteConDetalle {
  return {
    receta_id: String(fila.receta_id),
    ingrediente_id: String(fila.ingrediente_id),
    cantidad_base: Number(fila.cantidad_base ?? 0),
    unidad: UNIDADES_VALIDAS.has(fila.unidad) ? (fila.unidad as Unidad) : "unidad",
    texto_principiante: fila.texto_principiante == null ? null : String(fila.texto_principiante),
    es_opcional: Boolean(fila.es_opcional),
    reemplazo_sugerido: fila.reemplazo_sugerido == null ? null : String(fila.reemplazo_sugerido),
    reemplazo_ingrediente_id:
      fila.reemplazo_ingrediente_id == null ? null : String(fila.reemplazo_ingrediente_id),
    ingrediente: normalizarIngrediente(fila.ingrediente),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─────────────────────────────────────────────────────────────────────────────
// Consultas cacheadas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Catálogo completo de recetas con sus ingredientes resueltos.
 * Es el insumo del motor de búsqueda: con cientos de recetas sigue siendo
 * una sola consulta cacheada (sin N+1).
 */
export async function obtenerCatalogo(): Promise<Estado<RecetaConIngredientes[]>> {
  "use cache";
  cacheLife("hours");

  const supabase = crearClienteSupabase();
  if (!supabase) return { ok: false, motivo: "supabase_no_configurado" };

  const { data, error } = await supabase
    .from("receta_ingredientes")
    .select(SELECCION_RECETA_INGREDIENTE)
    .returns<FilaRecetaIngrediente[]>();
  if (error) return errorEstado(error.message);

  const recetas = new Map<string, RecetaConIngredientes>();
  for (const fila of data ?? []) {
    if (!fila?.receta?.id) continue;
    const receta = normalizarReceta(fila.receta);
    if (!recetas.has(receta.id)) recetas.set(receta.id, { ...receta, ingredientes: [] });
    if (fila.ingrediente?.id) {
      recetas.get(receta.id)!.ingredientes.push(normalizarRecetaIngrediente(fila));
    }
  }
  return { ok: true, datos: [...recetas.values()] };
}

/** Lista de ingredientes para el autocompletado de la pantalla de inicio. */
export async function obtenerIngredientes(): Promise<Estado<Ingrediente[]>> {
  "use cache";
  cacheLife("hours");

  const supabase = crearClienteSupabase();
  if (!supabase) return { ok: false, motivo: "supabase_no_configurado" };

  const { data, error } = await supabase
    .from("ingredientes")
    .select(COLS_INGREDIENTE)
    .order("nombre");
  if (error) return errorEstado(error.message);

  return { ok: true, datos: (data ?? []).map(normalizarIngrediente) };
}

/** Predicado para filas de la relación con ingrediente resuelto. */
function filaConIngrediente(fila: unknown): boolean {
  return Boolean((fila as { ingrediente?: { id?: unknown } }).ingrediente?.id);
}

/**
 * Una receta por ID, para el Modo Cocina. IDs con formato inválido se
 * resuelven acá (datos: null → la UI muestra 404) en vez de llegar a
 * Postgres y provocar un error de sintaxis uuid.
 */
export async function obtenerReceta(id: string): Promise<Estado<RecetaConIngredientes | null>> {
  "use cache";
  cacheLife("hours");

  if (!RE_UUID.test(id)) return { ok: true, datos: null };

  const supabase = crearClienteSupabase();
  if (!supabase) return { ok: false, motivo: "supabase_no_configurado" };

  const { data, error } = await supabase
    .from("receta_ingredientes")
    .select(SELECCION_RECETA_INGREDIENTE)
    .eq("receta_id", id)
    .returns<FilaRecetaIngrediente[]>();
  if (error) return errorEstado(error.message);
  if (!data || data.length === 0) return { ok: true, datos: null };

  const receta = normalizarReceta(data[0].receta);
  return {
    ok: true,
    datos: {
      ...receta,
      ingredientes: data.filter(filaConIngrediente).map(normalizarRecetaIngrediente),
    },
  };
}

/** Proyección liviana para listados (favoritos): sin pasos ni ingredientes. */
export function resumirReceta(receta: Receta): ResumenReceta {
  return {
    id: receta.id,
    titulo: receta.titulo,
    descripcion_corta: receta.descripcion_corta,
    tiempo_minutos: receta.tiempo_minutos,
    dificultad: receta.dificultad,
    etiquetas_dieta: receta.etiquetas_dieta,
    imagen_url: receta.imagen_url,
  };
}
