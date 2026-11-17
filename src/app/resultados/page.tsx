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
import { calcularDegradaciones } from "@/lib/degradacion";
import type { Degradaciones } from "@/lib/degradacion";
import { armarLista } from "@/lib/lista-compras";
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
const CHIP_ACTIVO = "border-verde bg-verde text-sobre-acento";
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

/** URL de resultados eliminando los parámetros indicados. */
function urlSin(params: URLSearchParams, claves: string[]): string {
  const copia = new URLSearchParams(params);
  for (const clave of claves) copia.delete(clave);
  const query = copia.toString();
  return query ? `/resultados?${query}` : "/resultados";
}

/** URL sumando un ingrediente al pantry marcado. */
function urlConIngrediente(params: URLSearchParams, id: string): string {
  const copia = new URLSearchParams(params);
  const actuales = (copia.get("ingredientes") ?? "").split(",").filter(Boolean);
  copia.set("ingredientes", [...actuales, id].join(","));
  return `/resultados?${copia.toString()}`;
}

/** URL del modo "Sorprendeme": conserva restricciones y tiempo, ignora pantry. */
function urlIndeciso(params: URLSearchParams): string {
  const copia = new URLSearchParams(params);
  copia.set("modo", "indeciso");
  copia.set("semilla", "0");
  return `/resultados?${copia.toString()}`;
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

interface OpcionSalida {
  href: string;
  titulo: string;
  detalle: string;
}

/**
 * Pantalla de resultados vacía. Nunca queda en "no hay nada": ofrece
 * salidas verificadas (conteos recalculados con el motor) que relajan
 * filtros o suman una compra, y "Sorprendeme" como última salida.
 * Nunca sugiere quitar restricciones alimentarias.
 */
function SinResultados({
  filtros,
  params,
  degradaciones,
}: {
  filtros: ReturnType<typeof validarFiltros>;
  params: URLSearchParams;
  degradaciones: Degradaciones | null;
}) {
  const opciones: OpcionSalida[] = [];
  if (degradaciones) {
    if (degradaciones.sinTiempo) {
      opciones.push({
        href: urlSin(params, ["tiempo"]),
        titulo: "Cocinar sin límite de tiempo",
        detalle: `+${degradaciones.sinTiempo} receta${degradaciones.sinTiempo === 1 ? "" : "s"}`,
      });
    }
    if (degradaciones.sinSabor) {
      opciones.push({
        href: urlSin(params, ["categoria"]),
        titulo: "Quitar el filtro de sabor",
        detalle: `+${degradaciones.sinSabor} receta${degradaciones.sinSabor === 1 ? "" : "s"}`,
      });
    }
    if (degradaciones.sinAmbos) {
      opciones.push({
        href: urlSin(params, ["tiempo", "categoria"]),
        titulo: "Sin límite de tiempo ni filtro de sabor",
        detalle: `+${degradaciones.sinAmbos} receta${degradaciones.sinAmbos === 1 ? "" : "s"}`,
      });
    }
    for (const compra of degradaciones.compras) {
      opciones.push({
        href: urlConIngrediente(params, compra.id),
        titulo: `Si comprás ${compra.nombre.toLowerCase()}`,
        detalle: `+${compra.recetas} receta${compra.recetas === 1 ? "" : "s"}`,
      });
    }
  }

  return (
    <div className="border-t border-linea pt-6">
      <p className="font-semibold text-tinta">
        {filtros.ingredientes.length > 0
          ? "Ninguna receta usa lo que marcaste con estos filtros."
          : "No encontré recetas con estos filtros."}
      </p>
      {opciones.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-tinta-suave">Pero hay salidas:</p>
          <ul className="mt-4 space-y-2">
            {opciones.map((opcion) => (
              <li key={opcion.href + opcion.titulo}>
                <Link
                  href={opcion.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-linea bg-papel px-4 py-3 transition-colors hover:border-verde"
                >
                  <span className="font-medium text-tinta">{opcion.titulo}</span>
                  <span className="shrink-0 text-sm font-semibold text-verde">
                    {opcion.detalle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-sm text-tinta-suave">
          Volvé a{" "}
          <Link href="/" className="font-semibold text-verde hover:underline">
            marcar ingredientes
          </Link>{" "}
          o revisá las restricciones elegidas.
        </p>
      )}
      <p className="mt-6 text-sm text-tinta-suave">
        ¿Nada te convence? Dejanos elegir por vos:{" "}
        <Link
          href={urlIndeciso(params)}
          className="font-semibold text-verde hover:underline"
        >
          Sorprendeme
        </Link>
      </p>
    </div>
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
  const degradaciones =
    resultados.length === 0 ? calcularDegradaciones(estado.datos, filtros) : null;
  return (
    <ListaResultados
      resultados={resultados}
      filtros={filtros}
      params={params}
      degradaciones={degradaciones}
    />
  );
}

function ListaResultados({
  resultados,
  filtros,
  params,
  degradaciones,
}: {
  resultados: ResultadoBusqueda[];
  filtros: ReturnType<typeof validarFiltros>;
  params: URLSearchParams;
  degradaciones: Degradaciones | null;
}) {
  const restricciones = filtros.restricciones
    .map((r) => ETIQUETA_RESTRICCION.get(r) ?? r)
    .join(", ");

  // Lista de compras de TODA la búsqueda: relaciones de los faltantes, con
  // cantidad y sección del super (armarLista agrupa por ingrediente).
  const nombresFaltantes = new Set(
    resultados.flatMap((r) => r.faltantes.map((f) => f.nombre)),
  );
  const listaCompras = armarLista(
    resultados.flatMap((r) =>
      r.receta.ingredientes.filter((ri) => nombresFaltantes.has(ri.ingrediente.nombre)),
    ),
  );

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
        {listaCompras.length > 0 && (
          <div className="mt-3">
            <BotonListaCompras
              items={listaCompras}
              titulo="Todo lo que falta para estas recetas"
            />
          </div>
        )}
      </header>

      {resultados.length === 0 ? (
        <SinResultados filtros={filtros} params={params} degradaciones={degradaciones} />
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
