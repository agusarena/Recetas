/**
 * Pantalla 2 — Resultados.
 *
 * Server Component que lee los filtros de la URL (searchParams), ejecuta el
 * motor de búsqueda en el servidor con el catálogo cacheado (`use cache`)
 * y devuelve tarjetas listas para CDN. Sin resultados, ofrece salidas útiles.
 */
import { Suspense } from "react";
import Link from "next/link";
import type { ResultadoBusqueda } from "@/types";
import { RESTRICCIONES, buscarRecetas } from "@/lib/motor-busqueda";
import { obtenerCatalogo } from "@/lib/datos";
import { supabaseConfigurado } from "@/lib/supabase";
import { validarFiltros } from "@/lib/filtros";
import { TarjetaReceta } from "@/components/resultados/TarjetaReceta";
import { BotonListaCompras } from "@/components/resultados/BotonListaCompras";
import { AvisoConfiguracion } from "@/components/AvisoConfiguracion";
import { DisclaimerNutricional } from "@/components/Disclaimer";
import { IconoFlechaIzquierda } from "@/components/iconos";

const ETIQUETA_RESTRICCION = new Map(RESTRICCIONES.map((r) => [r.valor, r.etiqueta]));

const CHIP_BASE = "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors";
const CHIP_ACTIVO = "border-verde bg-verde text-papel";
const CHIP_INACTIVO =
  "border-linea bg-papel text-tinta hover:border-verde hover:text-verde";

const OPCIONES_CATEGORIA = [
  { valor: null, etiqueta: "Todo" },
  { valor: "salado", etiqueta: "Salado" },
  { valor: "dulce", etiqueta: "Dulce" },
] as const;

/** Misma búsqueda, cambiando solo el perfil de sabor. */
function urlConCategoria(params: URLSearchParams, valor: string | null): string {
  const copia = new URLSearchParams(params);
  if (valor) copia.set("categoria", valor);
  else copia.delete("categoria");
  const query = copia.toString();
  return query ? `/resultados?${query}` : "/resultados";
}

export default function Page(props: PageProps<"/resultados">) {
  return (
    <Suspense fallback={<Esqueleto />}>
      <Resultados searchParams={props.searchParams} />
    </Suspense>
  );
}

function Esqueleto() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-2/3 rounded bg-crema" />
        <div className="h-24 rounded-xl bg-crema" />
        <div className="h-24 rounded-xl bg-crema" />
        <div className="h-24 rounded-xl bg-crema" />
      </div>
    </main>
  );
}

/** Aplanado de searchParams (string | string[] | undefined) a URLSearchParams. */
async function aUrlSearchParams(searchParams: PageProps<"/resultados">["searchParams"]) {
  const crudos = await searchParams;
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(crudos)) {
    if (Array.isArray(valor)) params.set(clave, valor.join(","));
    else if (valor != null) params.set(clave, valor);
  }
  return params;
}

async function Resultados({
  searchParams,
}: {
  searchParams: PageProps<"/resultados">["searchParams"];
}) {
  const params = await aUrlSearchParams(searchParams);
  const filtros = validarFiltros(params);

  if (!supabaseConfigurado()) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <AvisoConfiguracion />
      </main>
    );
  }

  const estado = await obtenerCatalogo();
  if (!estado.ok) {
    console.error("[resultados]", estado.detalle);
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <p className="border-t border-linea pt-6 text-tinta-suave">
          No pudimos cargar las recetas. Revisá tu conexión e intentá de nuevo.
        </p>
      </main>
    );
  }

  const resultados = buscarRecetas(estado.datos, filtros);
  return <ListaResultados resultados={resultados} filtros={filtros} params={params} />;
}

function ListaResultados({
  resultados,
  filtros,
  params,
}: {
  resultados: ResultadoBusqueda[];
  filtros: ReturnType<typeof validarFiltros>;
  params: URLSearchParams;
}) {
  const restricciones = filtros.restricciones
    .map((r) => ETIQUETA_RESTRICCION.get(r) ?? r)
    .join(", ");

  const faltantesUnicos = [...new Set(resultados.flatMap((r) => r.faltantes.map((f) => f.nombre)))]
    .sort((a, b) => a.localeCompare(b, "es"));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12 pt-8">
      <header className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-verde hover:underline"
        >
          <IconoFlechaIzquierda className="h-4 w-4" />
          Volver a la heladera
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">
          {filtros.modo_indeciso ? "Tres ideas para hoy" : "Lo que podés cocinar"}
        </h1>
        <p className="mt-1.5 text-sm text-tinta-suave">
          {resultados.length === 0
            ? "Sin resultados con estos filtros."
            : `${resultados.length} receta${resultados.length === 1 ? "" : "s"}`}
          {restricciones && `, respetando: ${restricciones}`}
          {filtros.tiempo_maximo !== null && `, hasta ${filtros.tiempo_maximo} min`}
        </p>
        <nav aria-label="Perfil de sabor" className="mt-3 flex flex-wrap gap-2">
          {OPCIONES_CATEGORIA.map(({ valor, etiqueta }) => {
            const activo = (filtros.categoria ?? null) === valor;
            return (
              <Link
                key={etiqueta}
                href={urlConCategoria(params, valor)}
                aria-current={activo ? "true" : undefined}
                className={`${CHIP_BASE} ${activo ? CHIP_ACTIVO : CHIP_INACTIVO}`}
              >
                {etiqueta}
              </Link>
            );
          })}
        </nav>
        {faltantesUnicos.length > 0 && (
          <div className="mt-3">
            <BotonListaCompras
              items={faltantesUnicos}
              titulo="Todo lo que falta para estas recetas"
            />
          </div>
        )}
      </header>

      {resultados.length === 0 ? (
        <div className="border-t border-linea pt-6 text-tinta-suave">
          <p className="mb-2 font-semibold text-tinta">
            No encontré nada que cumpla esas restricciones y tiempos.
          </p>
          <p className="text-sm">
            Probá sin el filtro de tiempo, revisá las restricciones o volvé a{" "}
            <Link href="/" className="font-semibold text-verde hover:underline">
              agregar más ingredientes
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="divide-y divide-linea border-t border-linea">
          {resultados.map((resultado) => (
            <TarjetaReceta
              key={resultado.receta.id}
              resultado={resultado}
              modoIndeciso={filtros.modo_indeciso === true}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <DisclaimerNutricional />
      </div>
    </main>
  );
}
