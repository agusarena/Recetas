/**
 * Motor de búsqueda — lógica de negocio pura.
 *
 * No importa Supabase ni Next: recibe datos ya resueltos y devuelve un
 * ranking. Esto permite testearla y reutilizarla desde la web, una API
 * o una futura app móvil / capa de IA sin cambios.
 *
 * Reglas (en orden):
 *  1. Filtro estricto de seguridad: descarta recetas que no cumplen las
 *     restricciones/alergias o que superan el tiempo máximo.
 *  2. Cálculo de coincidencia sobre ingredientes OBLIGATORIOS
 *     (se ignoran `es_basico` y `es_opcional`).
 *  3. Ranking por niveles: 100 % → falta 1 → falta 2 (solo si 1+2 < 3).
 */
import type {
  Alergeno,
  Dificultad,
  EtiquetaDieta,
  FiltrosBusqueda,
  IngredienteFaltante,
  RecetaConIngredientes,
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

/** Máximo de faltantes tolerados para mostrar una receta (Nivel 3). */
const MAX_FALTANTES = 2;

/** Cantidad mínima de resultados objetivo antes de bajar al Nivel 3. */
const MIN_RESULTADOS = 3;

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

/** Ingredientes OBLIGATORIOS: ni básicos (sal, agua, aceite...) ni opcionales. */
export function ingredientesObligatorios(receta: RecetaConIngredientes) {
  return receta.ingredientes.filter(
    (ri) => !ri.ingrediente.es_basico && !ri.es_opcional,
  );
}

/**
 * Evalúa una receta contra el pantry del usuario.
 * Devuelve `null` si faltan más de 2 ingredientes obligatorios.
 */
export function evaluarCoincidencia(
  receta: RecetaConIngredientes,
  ingredientesUsuario: string[],
): Pick<ResultadoBusqueda, "nivel" | "coincidentes" | "obligatorios_totales" | "faltantes"> | null {
  const obligatorios = ingredientesObligatorios(receta);
  const pantry = new Set(ingredientesUsuario);

  const faltantes: IngredienteFaltante[] = obligatorios
    .filter((ri) => !pantry.has(ri.ingrediente_id))
    .map((ri) => ({
      nombre: ri.ingrediente.nombre,
      reemplazo_sugerido: ri.reemplazo_sugerido,
    }));

  if (faltantes.length > MAX_FALTANTES) return null;

  const nivel =
    faltantes.length === 0
      ? ("tenes_todo" as const)
      : faltantes.length === 1
        ? ("falta_uno" as const)
        : ("falta_dos" as const);

  return {
    nivel,
    coincidentes: obligatorios.length - faltantes.length,
    obligatorios_totales: obligatorios.length,
    faltantes,
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

/** Ordena resultados de un mismo nivel por esfuerzo creciente. */
function ordenarResultados(resultados: ResultadoBusqueda[]): ResultadoBusqueda[] {
  return resultados.sort((a, b) => compararPorEsfuerzo(a.receta, b.receta));
}

/**
 * Motor principal. Aplica las 3 reglas de negocio y devuelve los resultados
 * ordenados: primero "Tenés todo", luego "Te falta 1" y, solo si con esos
 * niveles no alcanzan los 3 resultados, "Te falta 2".
 */
export function buscarRecetas(
  catalogo: RecetaConIngredientes[],
  filtros: FiltrosBusqueda,
): ResultadoBusqueda[] {
  const aptas = catalogo.filter(
    (receta) =>
      cumpleRestricciones(receta, filtros.restricciones) &&
      cumpleTiempo(receta, filtros.tiempo_maximo),
  );

  if (filtros.modo_indeciso) return sugerirIndeciso(aptas, filtros);

  const porNivel: Record<string, ResultadoBusqueda[]> = {
    tenes_todo: [],
    falta_uno: [],
    falta_dos: [],
  };

  for (const receta of aptas) {
    const evaluacion = evaluarCoincidencia(receta, filtros.ingredientes);
    if (evaluacion) porNivel[evaluacion.nivel].push({ receta, ...evaluacion });
  }

  ordenarResultados(porNivel.tenes_todo);
  ordenarResultados(porNivel.falta_uno);
  ordenarResultados(porNivel.falta_dos);

  const resultado = [...porNivel.tenes_todo, ...porNivel.falta_uno];
  if (resultado.length < MIN_RESULTADOS) resultado.push(...porNivel.falta_dos);

  return resultado;
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

  return ponderadas.slice(0, SUGERENCIAS_INDECISO).map(({ receta }) => {
    const evaluacion = evaluarCoincidencia(receta, filtros.ingredientes);
    if (evaluacion) return { receta, ...evaluacion };

    // Faltan más de 2: se reporta honestamente (nivel 3, lista truncada).
    const pantry = new Set(filtros.ingredientes);
    const obligatorios = ingredientesObligatorios(receta);
    const faltanTodos = obligatorios.filter((ri) => !pantry.has(ri.ingrediente_id));
    return {
      receta,
      nivel: "falta_dos" as const,
      coincidentes: obligatorios.length - faltanTodos.length,
      obligatorios_totales: obligatorios.length,
      faltantes: faltanTodos.slice(0, MAX_FALTANTES).map((ri) => ({
        nombre: ri.ingrediente.nombre,
        reemplazo_sugerido: ri.reemplazo_sugerido,
      })),
    };
  });
}
