/**
 * Endpoint JSON del motor de búsqueda.
 *
 * Existe para desacoplar el motor de la web: una futura app móvil o capa
 * de IA puede consumir exactamente la misma lógica.
 *
 * GET /api/buscar?ingredientes=huevo,papa&restricciones=vegetariano&tiempo=30
 * GET /api/buscar?modo=indeciso&semilla=123
 */
import { buscarRecetas } from "@/lib/motor-busqueda";
import { obtenerCatalogo } from "@/lib/datos";
import { supabaseConfigurado } from "@/lib/supabase";
import { validarFiltros } from "@/lib/filtros";

export async function GET(request: Request) {
  const url = new URL(request.url);

  if (!supabaseConfigurado()) {
    return Response.json({ error: "supabase_no_configurado" }, { status: 503 });
  }

  const filtros = validarFiltros(url.searchParams);
  const estado = await obtenerCatalogo();
  if (!estado.ok) {
    console.error("[/api/buscar]", estado.detalle);
    return Response.json({ error: "error_interno" }, { status: 500 });
  }

  const resultados = buscarRecetas(estado.datos, filtros);
  return Response.json({ resultados, total: resultados.length });
}
