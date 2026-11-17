"use client";

/**
 * Lista de recetas favoritas. Los IDs viven en localStorage; el catálogo
 * liviano llega desde el servidor.
 */
import { useMemo } from "react";
import Link from "next/link";
import type { ResumenReceta } from "@/types";
import { RESTRICCIONES } from "@/lib/motor-busqueda";
import { usePreferencias } from "@/lib/use-preferencias";
import { formatearMinutos } from "@/lib/porciones";
import { PlaceholderImagen } from "@/components/PlaceholderImagen";
import { BotonFavorito } from "@/components/BotonFavorito";
import { DisclaimerNutricional } from "@/components/Disclaimer";
import { IconoCorazon, IconoReloj, IconoSombrero } from "@/components/iconos";

const ETIQUETA_RESTRICCION = new Map(RESTRICCIONES.map((r) => [r.valor, r.etiqueta]));

const ETIQUETA_DIFICULTAD = {
  cero_cocina: "Cero cocina",
  facil: "Fácil",
} as const;

export function ListaFavoritos({ recetas }: { recetas: ResumenReceta[] }) {
  const { preferencias, hidratado } = usePreferencias();

  const porId = useMemo(() => new Map(recetas.map((r) => [r.id, r])), [recetas]);

  // Más recientes primero (los favoritos se agregan al final del array).
  const favoritas = useMemo(
    () =>
      [...preferencias.favoritos]
        .reverse()
        .map((id) => porId.get(id))
        .filter((r): r is ResumenReceta => Boolean(r)),
    [preferencias.favoritos, porId],
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
          Tus favoritos
        </h1>
        <p className="mt-1.5 text-sm text-tinta-suave">
          {favoritas.length === 0
            ? "Las recetas que guardes van a quedar acá."
            : `${favoritas.length} receta${favoritas.length === 1 ? "" : "s"} guardada${
                favoritas.length === 1 ? "" : "s"
              } en este navegador.`}
        </p>
      </header>

      {favoritas.length === 0 ? (
        <div className="border-t border-linea pt-8">
          <IconoCorazon className="h-8 w-8 text-tomate" />
          <p className="mt-3 font-semibold text-tinta">Todavía no guardaste ninguna receta.</p>
          <p className="mt-1 text-sm text-tinta-suave">
            Tocá el corazón en una receta y la vas a encontrar acá, incluso si cerrás el
            navegador.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-verde px-5 py-3 text-sm font-semibold text-sobre-acento transition-colors hover:bg-verde-oscuro"
          >
            Buscar qué puedo cocinar
          </Link>
        </div>
      ) : (
        <div className="border-t border-linea">
          {favoritas.map((receta) => (
            <article key={receta.id} className="flex gap-4 border-b border-linea py-5">
              <Link href={`/receta/${receta.id}`} className="shrink-0">
                <PlaceholderImagen
                  titulo={receta.titulo}
                  url={receta.imagen_url}
                  categoria={receta.categoria}
                  className="h-20 w-20 rounded-lg sm:h-24 sm:w-24"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold leading-snug text-tinta">
                    <Link
                      href={`/receta/${receta.id}`}
                      className="transition-colors hover:text-verde hover:underline"
                    >
                      {receta.titulo}
                    </Link>
                  </h2>
                  <BotonFavorito recetaId={receta.id} />
                </div>

                <p className="mt-0.5 text-sm text-tinta-suave">{receta.descripcion_corta}</p>

                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-humo">
                  <span className="inline-flex items-center gap-1.5">
                    <IconoReloj className="h-3.5 w-3.5" />
                    {formatearMinutos(receta.tiempo_minutos)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <IconoSombrero className="h-3.5 w-3.5" />
                    {ETIQUETA_DIFICULTAD[receta.dificultad]}
                  </span>
                </p>

                {receta.etiquetas_dieta.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {receta.etiquetas_dieta.map((etiqueta) => (
                      <li
                        key={etiqueta}
                        className="rounded bg-crema px-1.5 py-0.5 text-[11px] font-medium text-tinta-suave"
                      >
                        {ETIQUETA_RESTRICCION.get(etiqueta) ?? etiqueta}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8">
        <DisclaimerNutricional />
      </div>
    </main>
  );
}
