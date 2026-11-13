/**
 * Validación de filtros de búsqueda entrantes (desde `searchParams` de la
 * URL o desde el endpoint /api/buscar). Nunca confiar en la query cruda.
 */
import type { EtiquetaDieta, FiltrosBusqueda } from "@/types";
import { RESTRICCIONES } from "@/lib/motor-busqueda";

const RESTRICCIONES_VALIDAS = new Set(
  RESTRICCIONES.map((r) => r.valor),
) as Set<EtiquetaDieta>;

/** Techo del filtro de tiempo para evitar valores absurdos (ej. 999999). */
const TIEMPO_MAXIMO_ABSOLUTO = 240;

export function validarFiltros(params: URLSearchParams): FiltrosBusqueda {
  const ingredientes = (params.get("ingredientes") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  const restricciones = (params.get("restricciones") ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter((r): r is EtiquetaDieta => RESTRICCIONES_VALIDAS.has(r as EtiquetaDieta));

  const tiempoCrudo = Number.parseInt(params.get("tiempo") ?? "", 10);
  const tiempo_maximo =
    Number.isFinite(tiempoCrudo) && tiempoCrudo > 0
      ? Math.min(tiempoCrudo, TIEMPO_MAXIMO_ABSOLUTO)
      : null;

  const modo_indeciso = params.get("modo") === "indeciso";

  const semillaCruda = Number.parseInt(params.get("semilla") ?? "", 10);
  const semilla = Number.isFinite(semillaCruda) ? semillaCruda : 0;

  return { ingredientes, restricciones, tiempo_maximo, modo_indeciso, semilla };
}

/** Serializa filtros a query string para navegar a /resultados. */
export function filtrosAQuery(filtros: FiltrosBusqueda): string {
  const params = new URLSearchParams();
  if (filtros.ingredientes.length > 0) params.set("ingredientes", filtros.ingredientes.join(","));
  if (filtros.restricciones.length > 0)
    params.set("restricciones", filtros.restricciones.join(","));
  if (filtros.tiempo_maximo !== null) params.set("tiempo", String(filtros.tiempo_maximo));
  if (filtros.modo_indeciso) {
    params.set("modo", "indeciso");
    params.set("semilla", String(filtros.semilla ?? 0));
  }
  return params.toString();
}
