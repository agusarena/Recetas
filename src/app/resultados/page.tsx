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
import { AvisoConfiguracion } from "@/components/AvisoConfiguracion";
import { DisclaimerNutricional } from "@/components/Disclaimer";

const ETIQUETA_RESTRICCION = new Map(RESTRICCIONES.map((r) => [r.valor, r.etiqueta]));

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
        <div className="h-8 w-2/3 rounded bg-stone-200" />
        <div className="h-24 rounded-xl bg-stone-200" />
        <div className="h-24 rounded-xl bg-stone-200" />
        <div className="h-24 rounded-xl bg-stone-200" />
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <AvisoConfiguracion />
      </main>
    );
  }

  const estado = await obtenerCatalogo();
  if (!estado.ok) {
    console.error("[resultados]", estado.detalle);
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-stone-700">
          No pudimos cargar las recetas. Revisá tu conexión e intentá de nuevo.
        </p>
      </main>
    );
  }

  const resultados = buscarRecetas(estado.datos, filtros);
  return <ListaResultados resultados={resultados} filtros={filtros} />;
}

function ListaResultados({
  resultados,
  filtros,
}: {
  resultados: ResultadoBusqueda[];
  filtros: ReturnType<typeof validarFiltros>;
}) {
  const restricciones = filtros.restricciones
    .map((r) => ETIQUETA_RESTRICCION.get(r) ?? r)
    .join(", ");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <header className="mb-6">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← Volver a la heladera
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
          {filtros.modo_indeciso ? "🎲 Tres ideas para hoy" : "Lo que podés cocinar"}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          {resultados.length === 0
            ? "Sin resultados con estos filtros."
            : `${resultados.length} receta${resultados.length === 1 ? "" : "s"}`}
          {restricciones && ` · respetando: ${restricciones}`}
          {filtros.tiempo_maximo !== null && ` · hasta ${filtros.tiempo_maximo} min`}
        </p>
      </header>

      {resultados.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-6 text-stone-700">
          <p className="mb-3 font-medium">
            No encontré nada que cumpla esas restricciones y tiempos.
          </p>
          <p className="text-sm">
            Probá sin el filtro de tiempo, revisá las restricciones o volvé a{" "}
            <Link href="/" className="font-semibold text-emerald-700 hover:underline">
              agregar más ingredientes
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {resultados.map((resultado) => (
            <TarjetaReceta
              key={resultado.receta.id}
              resultado={resultado}
              modoIndeciso={filtros.modo_indeciso === true}
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        <DisclaimerNutricional />
      </div>
    </main>
  );
}
