"use client";

/** Historial local de recetas cocinadas, sin login ni sincronización externa. */
import { useMemo } from "react";
import Link from "next/link";
import type { RecetaCocinada, ResumenReceta } from "@/types";
import { usePreferencias } from "@/lib/use-preferencias";
import { formatearMinutos } from "@/lib/porciones";
import { PlaceholderImagen } from "@/components/PlaceholderImagen";
import { IconoCheck, IconoReloj } from "@/components/iconos";

function fechaRelativa(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "Fecha desconocida";
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(fecha);
}

export function ListaHistorial({ recetas }: { recetas: ResumenReceta[] }) {
  const { preferencias, hidratado, quitarCocinada } = usePreferencias();
  const porId = useMemo(() => new Map(recetas.map((r) => [r.id, r])), [recetas]);

  const historial = useMemo(
    () =>
      preferencias.cocinadas
        .map((registro) => ({ registro, receta: porId.get(registro.receta_id) }))
        .filter((item): item is { registro: RecetaCocinada; receta: ResumenReceta } =>
          Boolean(item.receta),
        ),
    [preferencias.cocinadas, porId],
  );

  if (!hidratado) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/2 rounded bg-crema" />
          <div className="h-24 rounded-xl bg-crema" />
          <div className="h-24 rounded-xl bg-crema" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-12 pt-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">
          Lo que ya cocinaste
        </h1>
        <p className="mt-1.5 text-sm text-tinta-suave">
          {historial.length === 0
            ? "Cuando termines una receta, marcala y queda anotada acá."
            : `${historial.length} receta${historial.length === 1 ? "" : "s"} en tu historial.`}
        </p>
      </header>

      {historial.length === 0 ? (
        <div className="border-t border-linea pt-8">
          <IconoCheck className="h-8 w-8 text-verde" />
          <p className="mt-3 font-semibold text-tinta">Todavía no hay recetas cocinadas.</p>
          <p className="mt-1 text-sm text-tinta-suave">
            Entrá a una receta y tocá «La cociné» cuando la termines.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-verde px-5 py-3 text-sm font-semibold text-papel transition-colors hover:bg-verde-oscuro"
          >
            Buscar qué cocinar
          </Link>
        </div>
      ) : (
        <div className="border-t border-linea">
          {historial.map(({ registro, receta }) => (
            <article key={registro.receta_id} className="flex gap-4 border-b border-linea py-5">
              <Link href={`/receta/${receta.id}`} className="shrink-0">
                <PlaceholderImagen
                  titulo={receta.titulo}
                  url={receta.imagen_url}
                  categoria={receta.categoria}
                  className="h-20 w-20 rounded-lg sm:h-24 sm:w-24"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold leading-snug text-tinta">
                    <Link href={`/receta/${receta.id}`} className="hover:text-verde hover:underline">
                      {receta.titulo}
                    </Link>
                  </h2>
                  <button
                    type="button"
                    onClick={() => quitarCocinada(receta.id)}
                    className="shrink-0 text-xs font-semibold text-humo hover:text-tomate"
                  >
                    Quitar
                  </button>
                </div>
                <p className="mt-1 text-sm text-tinta-suave">{receta.descripcion_corta}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-humo">
                  <span className="inline-flex items-center gap-1.5">
                    <IconoCheck className="h-3.5 w-3.5 text-verde" />
                    Cocinada el {fechaRelativa(registro.cocinada_en)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <IconoReloj className="h-3.5 w-3.5" />
                    {formatearMinutos(receta.tiempo_minutos)}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
