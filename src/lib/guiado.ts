/**
 * Modo guiado de la receta: muestra un paso por vez. Lib pura para poder
 * testear el avance sin React.
 */
import type { Paso } from "@/types";

/**
 * Índice del primer paso que todavía no se completó, en el orden de la
 * receta. Si todos están hechos devuelve `pasos.length`.
 */
export function primerPasoPendiente(pasos: Paso[], hechos: ReadonlySet<number>): number {
  const indice = pasos.findIndex((paso) => !hechos.has(paso.orden));
  return indice === -1 ? pasos.length : indice;
}
