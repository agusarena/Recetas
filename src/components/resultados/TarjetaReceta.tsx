/**
 * Tarjeta de resultado (Pantalla 2).
 * Server Component; solo el botón de favorito es cliente.
 */
import Link from "next/link";
import type { ResultadoBusqueda } from "@/types";
import { formatearMinutos } from "@/lib/porciones";
import { PlaceholderImagen } from "@/components/PlaceholderImagen";
import { BotonFavorito } from "@/components/BotonFavorito";
import { DisclaimerNutricional } from "@/components/Disclaimer";

const ETIQUETA_DIFICULTAD = {
  cero_cocina: "Cero cocina",
  facil: "Fácil",
} as const;

function BadgeCoincidencia({ resultado, modoIndeciso }: { resultado: ResultadoBusqueda; modoIndeciso: boolean }) {
  if (modoIndeciso) {
    return (
      <span className="inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
        🎲 Idea rápida
      </span>
    );
  }
  if (resultado.nivel === "tenes_todo") {
    return (
      <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        ✅ Tenés todo — cocinalo ya
      </span>
    );
  }
  const faltantes = resultado.faltantes.map((f) => f.nombre).join(", ");
  const reemplazo = resultado.faltantes.find((f) => f.reemplazo_sugerido)?.reemplazo_sugerido;
  return (
    <span className="inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
      {resultado.nivel === "falta_uno" ? "Te falta 1" : "Te faltan 2"}: {faltantes}
      {reemplazo ? ` (sirve: ${reemplazo})` : ""}
    </span>
  );
}

export function TarjetaReceta({
  resultado,
  modoIndeciso = false,
}: {
  resultado: ResultadoBusqueda;
  modoIndeciso?: boolean;
}) {
  const { receta } = resultado;
  const macros = receta.macros_generales;

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        <PlaceholderImagen
          titulo={receta.titulo}
          url={receta.imagen_url}
          className="h-24 w-24 shrink-0 rounded-lg sm:h-28 sm:w-28"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-bold leading-tight text-stone-900">
              <Link
                href={`/receta/${receta.id}`}
                className="hover:text-emerald-700 hover:underline"
              >
                {receta.titulo}
              </Link>
            </h2>
            <BotonFavorito recetaId={receta.id} />
          </div>

          <p className="mt-0.5 text-sm text-stone-600">{receta.descripcion_corta}</p>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-stone-500">
            <span>⏱ {formatearMinutos(receta.tiempo_minutos)}</span>
            <span>🏷 {ETIQUETA_DIFICULTAD[receta.dificultad]}</span>
            {resultado.obligatorios_totales > 0 && !modoIndeciso && (
              <span>
                🛒 {resultado.coincidentes}/{resultado.obligatorios_totales} ingredientes
              </span>
            )}
          </p>

          <p className="mt-1.5 text-xs text-stone-600">
            <span className="font-semibold">Por porción (orientativo):</span>{" "}
            {macros.calorias} kcal · {macros.proteinas} g proteínas ·{" "}
            {macros.carbohidratos} g carbohidratos · {macros.grasas} g grasas
          </p>

          <div className="mt-2">
            <BadgeCoincidencia resultado={resultado} modoIndeciso={modoIndeciso} />
          </div>

          <p className="mt-2">
            <Link
              href={`/receta/${receta.id}`}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Ver receta →
            </Link>
          </p>
        </div>
      </div>
      <div className="border-t border-stone-100 px-4 py-1.5">
        <DisclaimerNutricional compacto />
      </div>
    </article>
  );
}
