/**
 * Motor de búsqueda — lógica de negocio pura.
 *
 * No importa Supabase ni Next: recibe datos ya resueltos y devuelve un
 * ranking. Esto permite testearla y reutilizarla desde la web, una API
 * o una futura app móvil / capa de IA sin cambios.
 *
 * Reglas (en orden):
 *  1. Filtro estricto de seguridad: descarta recetas que no cumplan las
 *     restricciones/alergias, que superen el tiempo máximo o que no entren
 *     en el perfil de sabor pedido (salado/dulce).
 *  2. Cálculo de coincidencia sobre ingredientes OBLIGATORIOS
 *     (se ignoran es_basico y es_opcional).
 *  3. Ranking por RELEVANCIA: si marcaste algo, solo se muestran recetas
 *     que usan lo tuyo, ordenadas por cercanía y después por cuánto de tu
 *     heladera aprovechan (salados antes que dulces a igual relevancia); si
 *     no hay ninguna, aparecen las más cercanas para no dejar vacía la lista.
 */
import type {
  Alergeno,
  CategoriaReceta,
  Dificultad,
  EtiquetaDieta,
  FiltrosBusqueda,
  IngredienteFaltante,
  NivelCoincidencia,
  RecetaConIngredientes,
  RecetaIngredienteConDetalle,
  ReemplazoUsado,
  ResultadoBusqueda,
} from "@/types";

/** Etiquetas de dieta válidas, en orden de presentación para la UI. */
export const RESTRICCIONES: { valor: EtiquetaDieta; etiqueta: string }[] = [
  { valor: "vegetariano", etiqueta: "Vegetariano" },
  { valor: "vegano", etiqueta: "Vegano" },
  { valor: "sin_tacc", etiqueta: "Sin TACC" },
  { valor: "sin_lactosa", etiqueta: "Sin Lactosa" },
  { valor: "sin_frutos_secos", etiqueta: "Sin Frutos Secos" },
];

/**
 * Mapa de alergia ↔ restricción del usuario. Es la red de seguridad: aunque
 * una receta no traiga la etiqueta de dieta, si ALGUNO de sus ingredientes
 * (incluso opcionales) contiene el alérgeno, se descarta.
 */
const ALERGENO_POR_RESTRICCION: Partial<Record<EtiquetaDieta, Alergeno>> = {
  sin_tacc: "gluten",
  sin_lactosa: "lactosa",
  sin_frutos_secos: "frutos_secos",
};

/** Orden de menor a mayor esfuerzo, para desempatar el ranking. */
const ORDEN_DIFICULTAD: Record<Dificultad, number> = {
  cero_cocina: 0,
  facil: 1,
};

/** Cantidad mínima de resultados objetivo antes de bajar al Nivel 3. */
/** Cantidad de sugerencias del Modo Indeciso. */
export const SUGERENCIAS_INDECISO = 3;

// ─────────────────────────────────────────────────────────────────────────────
// Paso 1 — Filtro estricto de seguridad
// ─────────────────────────────────────────────────────────────────────────────

/**
 * true si la receta cumple TODAS las restricciones del usuario:
 * - por etiqueta de dieta declarada en la receta, y
 * - por ausencia del alérgeno asociado en cualquiera de sus ingredientes.
 */
export function cumpleRestricciones(
  receta: RecetaConIngredientes,
  restricciones: EtiquetaDieta[],
): boolean {
  for (const restriccion of restricciones) {
    // La etiqueta de dieta debe estar declarada en la receta.
    if (!receta.etiquetas_dieta.includes(restriccion)) return false;

    // Red de seguridad por alérgeno en ingredientes (incluye opcionales).
    const alergenoProhibido = ALERGENO_POR_RESTRICCION[restriccion];
    if (alergenoProhibido) {
      const contieneAlergeno = receta.ingredientes.some((ri) =>
        ri.ingrediente.alergenos.includes(alergenoProhibido),
      );
      if (contieneAlergeno) return false;
    }
  }
  return true;
}

/** true si la receta no supera el tiempo máximo (null = sin límite). */
export function cumpleTiempo(receta: RecetaConIngredientes, tiempoMaximo: number | null): boolean {
  return tiempoMaximo === null || receta.tiempo_minutos <= tiempoMaximo;
}

// ─────────────────────────────────────────────────────────────────────────────
// Paso 2 — Cálculo de coincidencia
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Un ingrediente de una receta es OBLIGATORIO si no es opcional y no es
 * básico… salvo que el usuario declaró que no tiene ese básico
 * (`sin_basicos`): entonces también falta y entra en el conteo.
 */
export function esObligatorio(
  ri: RecetaIngredienteConDetalle,
  sinBasicos?: Set<string>,
): boolean {
  if (ri.es_opcional) return false;
  if (!ri.ingrediente.es_basico) return true;
  return sinBasicos?.has(ri.ingrediente_id) ?? false;
}

/** Ingredientes OBLIGATORIOS: ni básicos (sal, agua, aceite...) ni opcionales. */
export function ingredientesObligatorios(
  receta: RecetaConIngredientes,
  sinBasicos?: Set<string>,
) {
  return receta.ingredientes.filter((ri) => esObligatorio(ri, sinBasicos));
}

/**
 * Separa los obligatorios en cubiertos y faltantes.
 *
 * Un obligatorio se cubre de dos formas:
 * 1. el usuario tiene el ingrediente exacto; o
 * 2. el usuario tiene el ingrediente marcado como reemplazo (`reemplazo_ingrediente_id`).
 *
 * Los reemplazos cuentan para el nivel de coincidencia, pero se informan
 * aparte para que la UI pueda decir "tenés todo usando queso cremoso".
 */
function evaluarObligatorios(
  obligatorios: RecetaIngredienteConDetalle[],
  ingredientesUsuario: string[],
): { faltantes: IngredienteFaltante[]; reemplazos_usados: ReemplazoUsado[] } {
  const pantry = new Set(ingredientesUsuario);
  const faltantes: IngredienteFaltante[] = [];
  const reemplazos_usados: ReemplazoUsado[] = [];

  for (const ri of obligatorios) {
    if (pantry.has(ri.ingrediente_id)) continue;

    const reemplazoId = ri.reemplazo_ingrediente_id;
    if (reemplazoId && reemplazoId !== ri.ingrediente_id && pantry.has(reemplazoId)) {
      reemplazos_usados.push({
        nombre: ri.ingrediente.nombre,
        reemplazo: ri.reemplazo_sugerido,
      });
      continue;
    }

    faltantes.push({
      nombre: ri.ingrediente.nombre,
      reemplazo_sugerido: ri.reemplazo_sugerido,
    });
  }

  return { faltantes, reemplazos_usados };
}

/** Peso de cuánto de la receta cubrís, en la relevancia. */
const PESO_COBERTURA = 0.5;
/** Peso de cuánto de tu heladera usa la receta, en la relevancia. */
const PESO_USO_HELADERA = 0.5;
/** Un protagonista pesa el doble que un acompañamiento o condimento. */
const PESO_PRINCIPAL = 2;

function pesoIngrediente(ri: RecetaIngredienteConDetalle): number {
  return ri.es_principal ? PESO_PRINCIPAL : 1;
}

/** true si la heladera cubre el obligatorio, directo o por reemplazo. */
function estaCubierto(ri: RecetaIngredienteConDetalle, heladera: Set<string>): boolean {
  if (heladera.has(ri.ingrediente_id)) return true;
  const reemplazoId = ri.reemplazo_ingrediente_id;
  return Boolean(reemplazoId && reemplazoId !== ri.ingrediente_id && heladera.has(reemplazoId));
}

/**
 * Evalúa una receta contra el pantry del usuario.
 * Siempre devuelve resultado: con 3 o más faltantes el nivel es `falta_varios`
 * (la lista de faltantes queda completa, que es lo que muestra la lista de
 * compras).
 *
 * La relevancia combina dos proporciones, ponderadas por protagonista:
 *  - cobertura: peso de los obligatorios cubiertos / peso de los obligatorios.
 *    Te falta el pollo de una milanesa → pesa más que te falte el pan rallado.
 *  - uso de tu heladera: peso de tus ingredientes que la receta usa / peso
 *    máximo posible (todo como protagonista: 2 × cantidad de tu heladera).
 *    Usar un protagonista de tu heladera vale más que usar un condimento.
 */
export function evaluarCoincidencia(
  receta: RecetaConIngredientes,
  ingredientesUsuario: string[],
  sinBasicos?: Set<string>,
): Pick<
  ResultadoBusqueda,
  | "nivel"
  | "coincidentes"
  | "obligatorios_totales"
  | "faltantes"
  | "reemplazos_usados"
  | "usados"
  | "relevancia"
> {
  const obligatorios = ingredientesObligatorios(receta, sinBasicos);
  const { faltantes, reemplazos_usados } = evaluarObligatorios(obligatorios, ingredientesUsuario);

  const nivel =
    faltantes.length === 0
      ? ("tenes_todo" as const)
      : faltantes.length === 1
        ? ("falta_uno" as const)
        : faltantes.length === 2
          ? ("falta_dos" as const)
          : ("falta_varios" as const);

  const heladera = new Set(ingredientesUsuario);
  const pesoObligatorios = obligatorios.reduce((suma, ri) => suma + pesoIngrediente(ri), 0);
  const pesoCubierto = obligatorios
    .filter((ri) => estaCubierto(ri, heladera))
    .reduce((suma, ri) => suma + pesoIngrediente(ri), 0);
  const cobertura = pesoObligatorios === 0 ? 1 : pesoCubierto / pesoObligatorios;

  const usadosEnReceta = receta.ingredientes.filter((ri) => heladera.has(ri.ingrediente_id));
  const usados = usadosEnReceta.map((ri) => ri.ingrediente.nombre);
  const pesoUsado = usadosEnReceta.reduce((suma, ri) => suma + pesoIngrediente(ri), 0);
  const usoHeladera =
    heladera.size === 0 ? 0 : pesoUsado / (PESO_PRINCIPAL * heladera.size);

  const coincidentes = obligatorios.length - faltantes.length;
  const relevancia =
    Math.round((PESO_COBERTURA * cobertura + PESO_USO_HELADERA * usoHeladera) * 1000) / 1000;

  return {
    nivel,
    coincidentes,
    obligatorios_totales: obligatorios.length,
    faltantes,
    reemplazos_usados,
    usados,
    relevancia,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Paso 3 — Ranking
// ─────────────────────────────────────────────────────────────────────────────

/** Desempate: menor tiempo → menor dificultad → título (estable). */
function compararPorEsfuerzo(a: RecetaConIngredientes, b: RecetaConIngredientes): number {
  return (
    a.tiempo_minutos - b.tiempo_minutos ||
    ORDEN_DIFICULTAD[a.dificultad] - ORDEN_DIFICULTAD[b.dificultad] ||
    a.titulo.localeCompare(b.titulo)
  );
}

/** Rango de cercanía de cada nivel: menor = te queda menos para cocinarla. */
const RANGO_NIVEL: Record<NivelCoincidencia, number> = {
  tenes_todo: 0,
  falta_uno: 1,
  falta_dos: 2,
  falta_varios: 3,
};

/**
 * Orden global del ranking (ver `buscarRecetas`):
 *  1. Usa tus ingredientes antes que una receta ajena a tu heladera.
 *  2. Dentro de cada grupo: lo más cercano a cocinable primero.
 *  3. A igual cercanía, la mayor relevancia (usa más de lo tuyo).
 *  4. A igual relevancia, salado antes que dulce (así choclo y atún no
 *     compiten contra un postre), y después menor esfuerzo.
 */
function compararResultados(a: ResultadoBusqueda, b: ResultadoBusqueda): number {
  const relevanteA = a.coincidentes > 0 ? 0 : 1;
  const relevanteB = b.coincidentes > 0 ? 0 : 1;
  if (relevanteA !== relevanteB) return relevanteA - relevanteB;

  if (a.nivel !== b.nivel) return RANGO_NIVEL[a.nivel] - RANGO_NIVEL[b.nivel];

  if (a.relevancia !== b.relevancia) return b.relevancia - a.relevancia;

  const dulceA = a.receta.categoria === "dulce" ? 1 : 0;
  const dulceB = b.receta.categoria === "dulce" ? 1 : 0;
  if (dulceA !== dulceB) return dulceA - dulceB;

  return compararPorEsfuerzo(a.receta, b.receta);
}

/**
 * true si la receta entra en el perfil de sabor pedido (salado/dulce).
 * null = sin filtro: entran ambos.
 */
function cumpleCategoria(
  receta: RecetaConIngredientes,
  categoria: CategoriaReceta | null | undefined,
): boolean {
  return !categoria || receta.categoria === categoria;
}

/**
 * Motor principal. Aplica las reglas de negocio y devuelve los resultados
 * ordenados por relevancia, no solo por cercanía:
 *
 *  1. Si marcaste ingredientes, SOLO se muestran recetas que usan algo de
 *     lo tuyo (con reemplazo incluido), de la más cercana a la más lejana
 *     — aunque les falten 3 o más. Una receta ajena a tu heladera no se
 *     muestra nunca: si pusiste dulce de leche y harina no querés empanadas
 *     que te pidan comprar carne y cebolla de regalo.
 *  2. Recetas dulces después de las saladas a igual cercanía.
 *  3. Con la heladera vacía (nada marcado) se muestran las ajenas más
 *     cercanas para no dejar la pantalla vacía. Pero si marcaste
 *     ingredientes y ninguna receta usa lo tuyo, se devuelve []: la UI
 *     muestra opciones de degradación en vez de recetas que no pediste.
 */
export function buscarRecetas(
  catalogo: RecetaConIngredientes[],
  filtros: FiltrosBusqueda,
): ResultadoBusqueda[] {
  const aptas = catalogo.filter(
    (receta) =>
      cumpleRestricciones(receta, filtros.restricciones) &&
      cumpleTiempo(receta, filtros.tiempo_maximo) &&
      cumpleCategoria(receta, filtros.categoria),
  );

  if (filtros.modo_indeciso) return sugerirIndeciso(aptas, filtros);

  const sinBasicos = new Set(filtros.sin_basicos ?? []);
  const evaluadas = aptas.map((receta) => ({
    receta,
    ...evaluarCoincidencia(receta, filtros.ingredientes, sinBasicos),
  }));

  const relevantes = evaluadas
    .filter((r) => r.coincidentes > 0)
    .sort(compararResultados);
  if (relevantes.length > 0) return relevantes;

  // Marcaste ingredientes y nada coincide: no mostramos ajenas. La UI
  // degrada con opciones reales (quitar filtros, comprar algo, Sorprendeme).
  if (filtros.ingredientes.length > 0) return [];

  // Heladera vacía: las ajenas más cercanas sirven de punto de partida.
  // "Falta 3+" queda fuera: sería una lista de compras gigante.
  return evaluadas
    .filter((r) => r.nivel !== "falta_varios")
    .sort(compararResultados);
}

// ─────────────────────────────────────────────────────────────────────────────
// Modo Indeciso ("Sorprendeme")
// ─────────────────────────────────────────────────────────────────────────────

/** PRNG determinista (mulberry32) para que la elección sea reproducible. */
function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Toma las recetas ya filtradas por restricciones/tiempo, conserva solo las
 * fáciles y "cero cocina", prioriza las más rápidas y elige 3 al azar
 * (sesgadas hacia las rápidas) con una semilla reproducible.
 */
function sugerirIndeciso(aptas: RecetaConIngredientes[], filtros: FiltrosBusqueda): ResultadoBusqueda[] {
  const semilla = filtros.semilla ?? 0;
  const faciles = aptas
    .filter((r) => ORDEN_DIFICULTAD[r.dificultad] <= ORDEN_DIFICULTAD.facil)
    .sort(compararPorEsfuerzo);

  if (faciles.length === 0) return [];

  // Sesgo: dentro del pool, pesa más el orden (rápidas primero).
  const azar = mulberry32(semilla);
  const ponderadas = faciles.map((receta, indice) => ({
    receta,
    peso: 1 / (indice + 1) + azar(),
  }));
  ponderadas.sort((a, b) => b.peso - a.peso);

  const sinBasicos = new Set(filtros.sin_basicos ?? []);
  return ponderadas.slice(0, SUGERENCIAS_INDECISO).map(({ receta }) => ({
    receta,
    ...evaluarCoincidencia(receta, filtros.ingredientes, sinBasicos),
  }));
}
