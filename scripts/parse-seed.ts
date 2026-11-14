/**
 * Parser mínimo de `supabase/seed.sql` para diagnósticos y tests.
 *
 * No reemplaza a la base: lee el archivo real del repo para poder correr el
 * motor de búsqueda contra el catálogo sin red ni credenciales. Si el formato
 * del seed cambia, los tests fallan ruidosamente en vez de medir datos falsos.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  Alergeno,
  Dificultad,
  EtiquetaDieta,
  Ingrediente,
  Macros,
  RecetaConIngredientes,
  RecetaIngredienteConDetalle,
  Unidad,
} from "@/types";

const ALERGENOS = new Set<Alergeno>(["gluten", "lactosa", "frutos_secos", "huevo", "pescado"]);
const ETIQUETAS = new Set<EtiquetaDieta>([
  "vegetariano",
  "vegano",
  "sin_tacc",
  "sin_lactosa",
  "sin_frutos_secos",
]);
const UNIDADES = new Set<Unidad>(["g", "ml", "unidad", "cda", "taza", "pizca"]);

const RUTA_SEED = fileURLToPath(new URL("../supabase/seed.sql", import.meta.url));

export interface Semilla {
  ingredientes: Ingrediente[];
  recetas: RecetaConIngredientes[];
  relaciones: RecetaIngredienteConDetalle[];
}

function seccion(sql: string, inicio: string, fin: string): string {
  const desde = sql.indexOf(inicio);
  if (desde < 0) throw new Error(`No encontré "${inicio}" en seed.sql`);
  const hasta = sql.indexOf(fin, desde);
  if (hasta < 0) throw new Error(`No encontré "${fin}" en seed.sql`);
  return sql.slice(desde, hasta);
}

function desescapar(texto: string): string {
  return texto.replace(/''/g, "'");
}

function parsearIngredientes(sql: string): Ingrediente[] {
  const bloque = seccion(
    sql,
    "insert into ingredientes",
    "on conflict (id) do nothing;",
  );
  const regex =
    /^\s*\('([0-9a-f-]{36})',\s*'([^']*)',\s*'([^']*)',\s*(true|false),\s*'\{([^}]*)\}'\)/gm;

  return [...bloque.matchAll(regex)].map((m) => ({
    id: m[1],
    nombre: desescapar(m[2]),
    categoria: desescapar(m[3]),
    es_basico: m[4] === "true",
    alergenos: m[5]
      .split(",")
      .map((a) => a.trim())
      .filter((a): a is Alergeno => ALERGENOS.has(a as Alergeno)),
  }));
}

function parsearRecetas(sql: string): RecetaConIngredientes[] {
  const bloque = seccion(sql, "insert into recetas", "on conflict (id) do nothing;");
  const regex =
    /^\s*\('([0-9a-f-]{36})',\s*\n\s*'([^']*)',\s*\n\s*'([^']*)',\s*\n\s*(\d+),\s*'(cero_cocina|facil)',\s*(\d+),/gm;
  const coincidencias = [...bloque.matchAll(regex)];

  return coincidencias.map((m, indice) => {
    const desde = m.index ?? 0;
    const hasta = coincidencias[indice + 1]?.index ?? bloque.length;
    const tramo = bloque.slice(desde, hasta);

    const etiquetasCrudas = tramo.match(/'\{([a-z_,]+)\}',\s*\n/)?.[1] ?? "";
    const macrosCrudas = tramo.match(/'(\{[^']*\})'::jsonb/)?.[1] ?? "{}";

    let macros: Partial<Macros> = {};
    try {
      macros = JSON.parse(macrosCrudas) as Partial<Macros>;
    } catch {
      // Si el JSON cambia de formato, los valores quedan en 0 y el test lo detecta.
    }

    return {
      id: m[1],
      titulo: desescapar(m[2]),
      descripcion_corta: desescapar(m[3]),
      tiempo_minutos: Number(m[4]),
      dificultad: m[5] as Dificultad,
      porciones_base: Number(m[6]),
      pasos: [],
      tip_principiante: null,
      etiquetas_dieta: etiquetasCrudas
        .split(",")
        .map((e) => e.trim())
        .filter((e): e is EtiquetaDieta => ETIQUETAS.has(e as EtiquetaDieta)),
      macros_generales: {
        calorias: Number(macros.calorias ?? 0),
        perfil: String(macros.perfil ?? ""),
        proteinas: Number(macros.proteinas ?? 0),
        carbohidratos: Number(macros.carbohidratos ?? 0),
        grasas: Number(macros.grasas ?? 0),
      },
      imagen_url: null,
      ingredientes: [],
    };
  });
}

function parsearReemplazos(sql: string): Map<string, string> {
  const bloque = seccion(
    sql,
    "update public.receta_ingredientes",
    "as v(receta_id, ingrediente_id, reemplazo_id)",
  );
  const regex = /^\s*\('([0-9a-f-]{36})',\s*'([0-9a-f-]{36})',\s*'([0-9a-f-]{36})'\)/gm;
  const mapa = new Map<string, string>();
  for (const m of bloque.matchAll(regex)) {
    mapa.set(`${m[1]}:${m[2]}`, m[3]);
  }
  return mapa;
}

function parsearRelaciones(
  sql: string,
  ingredientes: Ingrediente[],
): RecetaIngredienteConDetalle[] {
  const bloque = seccion(
    sql,
    "insert into receta_ingredientes",
    "on conflict (receta_id, ingrediente_id) do nothing;",
  );
  const reemplazos = parsearReemplazos(sql);
  const porId = new Map(ingredientes.map((i) => [i.id, i]));
  const regex =
    /^\s*\('([0-9a-f-]{36})',\s*'([0-9a-f-]{36})',\s*([\d.]+),\s*'([a-z]+)',\s*'([^']*)',\s*(true|false),\s*(null|'([^']*)')\)/gm;

  return [...bloque.matchAll(regex)].map((m) => {
    const ingrediente = porId.get(m[2]);
    if (!ingrediente) throw new Error(`Relación con ingrediente inexistente: ${m[2]}`);

    return {
      receta_id: m[1],
      ingrediente_id: m[2],
      cantidad_base: Number(m[3]),
      unidad: (UNIDADES.has(m[4] as Unidad) ? m[4] : "unidad") as Unidad,
      texto_principiante: null,
      es_opcional: m[6] === "true",
      reemplazo_sugerido: m[8] ? desescapar(m[8]) : null,
      reemplazo_ingrediente_id: reemplazos.get(`${m[1]}:${m[2]}`) ?? null,
      ingrediente,
    };
  });
}

/** Lee y parsea el seed. Lanza si una relación apunta a un ID inexistente. */
export function leerSemilla(ruta: string = RUTA_SEED): Semilla {
  const sql = readFileSync(ruta, "utf8");
  const ingredientes = parsearIngredientes(sql);
  const recetas = parsearRecetas(sql);
  const relaciones = parsearRelaciones(sql, ingredientes);

  const porReceta = new Map(recetas.map((r) => [r.id, r]));
  for (const relacion of relaciones) {
    const receta = porReceta.get(relacion.receta_id);
    if (!receta) throw new Error(`Relación con receta inexistente: ${relacion.receta_id}`);
    receta.ingredientes.push(relacion);

    if (
      relacion.reemplazo_ingrediente_id &&
      !ingredientes.some((i) => i.id === relacion.reemplazo_ingrediente_id)
    ) {
      throw new Error(
        `Reemplazo inexistente en ${relacion.receta_id}/${relacion.ingrediente_id}: ${relacion.reemplazo_ingrediente_id}`,
      );
    }
  }

  return { ingredientes, recetas, relaciones };
}
