/**
 * Degradaciones para la pantalla de resultados vacía: en vez de un
 * "no hay nada", se ofrecen salidas reales con conteos verificados
 * volviendo a correr el motor con los filtros relajados.
 *
 * Reglas de seguridad (no se sugieren nunca):
 * - Quitar restricciones alimentarias (celíaco es celáco siempre).
 * - Comprar algo que solo habilita recetas que seguirían pidiendo 3+
 *   ingredientes (sería una lista de compras gigante).
 */
import type { FiltrosBusqueda, RecetaConIngredientes } from "@/types";
import { buscarRecetas, esObligatorio } from "./motor-busqueda";

/** Ingrediente cuya compra desbloquea recetas, para el bloque "Si comprás…". */
export interface CompraSugerida {
  id: string;
  nombre: string;
  /** Recetas que quedarían a 0, 1 o 2 ingredientes de poder cocinarse. */
  recetas: number;
}

/** Conteos de cada salida posible. `null` = la opción no aplica. */
export interface Degradaciones {
  /** Recetas visibles sin el límite de tiempo (null si no había filtro). */
  sinTiempo: number | null;
  /** Recetas visibles sin el filtro de sabor (null si no había filtro). */
  sinSabor: number | null;
  /** Recetas visibles quitando ambos filtros (null si no aplica ninguno). */
  sinAmbos: number | null;
  /** Top de compras que más recetas desbloquean (máximo 3). */
  compras: CompraSugerida[];
}

/** Corre el motor con una variante de los filtros y cuenta resultados. */
function contar(catalogo: RecetaConIngredientes[], filtros: FiltrosBusqueda): number {
  return buscarRecetas(catalogo, { ...filtros, modo_indeciso: false }).length;
}

/**
 * Calcula todas las degradaciones para los filtros actuales. Se usa en la
 * pantalla de resultados solo cuando hay 0 resultados, pero es pura y
 * testeable por separado.
 */
export function calcularDegradaciones(
  catalogo: RecetaConIngredientes[],
  filtros: FiltrosBusqueda,
): Degradaciones {
  const sinTiempo =
    filtros.tiempo_maximo !== null
      ? contar(catalogo, { ...filtros, tiempo_maximo: null })
      : null;
  const sinSabor = filtros.categoria
    ? contar(catalogo, { ...filtros, categoria: null })
    : null;
  const sinAmbos =
    filtros.tiempo_maximo !== null && filtros.categoria
      ? contar(catalogo, { ...filtros, tiempo_maximo: null, categoria: null })
      : null;

  return {
    sinTiempo,
    sinSabor,
    sinAmbos,
    compras: sugerirCompras(catalogo, filtros),
  };
}

/** true si la receta pide el ingrediente (de directo o como reemplazo). */
function recetaUsa(
  receta: RecetaConIngredientes,
  id: string,
  sinBasicos: Set<string>,
): boolean {
  return receta.ingredientes.some(
    (ri) =>
      esObligatorio(ri, sinBasicos) &&
      (ri.ingrediente_id === id || ri.reemplazo_ingrediente_id === id),
  );
}

/**
 * Ingredientes que, comprados, desbloquean más recetas. Cada candidato se
 * evalúa agregándolo al pantry y contando cuántas recetas que LO USAN
 * quedarían a 0-2 ingredientes. Se ignoran básicos (ya se asumen) y lo ya
 * marcado.
 */
export function sugerirCompras(
  catalogo: RecetaConIngredientes[],
  filtros: FiltrosBusqueda,
  tope = 3,
): CompraSugerida[] {
  // Candidatos: todo ingrediente que alguna receta pida como obligatorio
  // (los básicos solo si el usuario dijo que no los tiene).
  const sinBasicosCandidatos = new Set(filtros.sin_basicos ?? []);
  const candidatos = new Map<string, string>(); // id → nombre
  for (const receta of catalogo) {
    for (const ri of receta.ingredientes) {
      if (!esObligatorio(ri, sinBasicosCandidatos)) continue;
      if (!candidatos.has(ri.ingrediente_id)) {
        candidatos.set(ri.ingrediente_id, ri.ingrediente.nombre);
      }
    }
  }

  const marcados = new Set(filtros.ingredientes);
  const sinBasicos = new Set(filtros.sin_basicos ?? []);
  const compras: CompraSugerida[] = [];
  for (const [id, nombre] of candidatos) {
    if (marcados.has(id)) continue;
    const resultados = buscarRecetas(catalogo, {
      ...filtros,
      modo_indeciso: false,
      ingredientes: [...filtros.ingredientes, id],
    });
    // Solo cuentan las recetas que usan lo comprado: una receta ya visible
    // por lo marcado no es "desbloqueada" por esta compra.
    const recetas = resultados.filter(
      (r) => r.faltantes.length <= 2 && recetaUsa(r.receta, id, sinBasicos),
    ).length;
    if (recetas > 0) compras.push({ id, nombre, recetas });
  }

  compras.sort(
    (a, b) => b.recetas - a.recetas || a.nombre.localeCompare(b.nombre, "es"),
  );
  return compras.slice(0, tope);
}
