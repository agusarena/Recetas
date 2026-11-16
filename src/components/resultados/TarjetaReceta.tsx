/**
 * Tarjeta de resultado (Pantalla 2).
 * Server Component; solo el botón de favorito es cliente.
 *
 * Se presenta como fila de un recetario: imagen, título en serif, línea de
 * datos con iconos y una sola insignia de estado. Nada de cajas con sombra.
 */
import Link from "next/link";
import type { ResultadoBusqueda } from "@/types";
import { formatearMinutos } from "@/lib/porciones";
import { PlaceholderImagen } from "@/components/PlaceholderImagen";
import { BotonFavorito } from "@/components/BotonFavorito";
import { DisclaimerNutricional } from "@/components/Disclaimer";
import { BotonListaCompras } from "@/components/resultados/BotonListaCompras";
import { armarLista } from "@/lib/lista-compras";
import { IconoReloj, IconoSombrero, IconoCesta, IconoDado } from "@/components/iconos";

const ETIQUETA_DIFICULTAD = {
  cero_cocina: "Cero cocina",
  facil: "Fácil",
} as const;

function BadgeCoincidencia({ resultado, modoIndeciso }: { resultado: ResultadoBusqueda; modoIndeciso: boolean }) {
  if (modoIndeciso) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-crema px-2.5 py-1 text-xs font-semibold text-tinta-suave">
        <IconoDado className="h-3.5 w-3.5" />
        Idea rápida
      </span>
    );
  }
  if (resultado.nivel === "tenes_todo") {
    const reemplazos = resultado.reemplazos_usados
      .map((r) => r.reemplazo ?? r.nombre)
      .join(", ");
    return (
      <span className="inline-block rounded-md bg-verde-tenue px-2.5 py-1 text-xs font-semibold text-verde">
        {reemplazos ? `Tenés todo usando: ${reemplazos}` : "Tenés todo: cocinalo hoy"}
      </span>
    );
  }
  const faltantes = resultado.faltantes.map((f) => f.nombre).join(", ");
  const reemplazo = resultado.faltantes.find((f) => f.reemplazo_sugerido)?.reemplazo_sugerido;
  const cuantos = resultado.faltantes.length;
  return (
    <span className="inline-block rounded-md bg-tomate-tenue px-2.5 py-1 text-xs font-semibold text-tomate-oscuro">
      {cuantos === 1 ? "Te falta 1" : `Te faltan ${cuantos}`}: {faltantes}
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
    <article className="flex gap-4 px-1 py-5 sm:px-2">
        <PlaceholderImagen
          titulo={receta.titulo}
          url={receta.imagen_url}
          categoria={receta.categoria}
          className="h-24 w-24 shrink-0 rounded-lg sm:h-28 sm:w-28"
        />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-xl font-semibold leading-snug text-tinta">
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

        <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-humo">
          <span className="inline-flex items-center gap-1.5">
            <IconoReloj className="h-3.5 w-3.5" />
            {formatearMinutos(receta.tiempo_minutos)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconoSombrero className="h-3.5 w-3.5" />
            {ETIQUETA_DIFICULTAD[receta.dificultad]}
          </span>
          {resultado.obligatorios_totales > 0 && !modoIndeciso && (
            <span className="inline-flex items-center gap-1.5">
              <IconoCesta className="h-3.5 w-3.5" />
              {resultado.coincidentes}/{resultado.obligatorios_totales} ingredientes
            </span>
          )}
        </p>

        <p className="mt-2 text-xs text-humo">
          <span className="font-semibold text-tinta-suave">Por porción (orientativo):</span>{" "}
          {macros.calorias} kcal, {macros.proteinas} g proteínas, {macros.carbohidratos} g
          carbohidratos y {macros.grasas} g grasas
        </p>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <BadgeCoincidencia resultado={resultado} modoIndeciso={modoIndeciso} />
          <Link
            href={`/receta/${receta.id}`}
            className="text-sm font-semibold text-verde hover:underline"
          >
            Ver receta
          </Link>
        </div>

        {resultado.faltantes.length > 0 && (
          <div className="mt-2">
            <BotonListaCompras
              items={armarLista(
                receta.ingredientes.filter((ri) =>
                  resultado.faltantes.some((f) => f.nombre === ri.ingrediente.nombre),
                ),
              )}
              titulo={receta.titulo}
              compacto
            />
          </div>
        )}

        <div className="mt-3">
          <DisclaimerNutricional compacto />
        </div>
      </div>
    </article>
  );
}
