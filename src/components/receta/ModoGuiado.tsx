"use client";

/**
 * Modo guiado de la receta: muestra un paso por vez y avanza al completar
 * el anterior. El progreso se comparte con la lista de pasos de ModoCocina.
 */
import type { Paso } from "@/types";
import { formatearTiempo } from "@/lib/porciones";
import { useTimers } from "@/components/timers/TimerProvider";
import { IconoCheck, IconoFlechaIzquierda, IconoReloj } from "@/components/iconos";

interface ModoGuiadoProps {
  titulo: string;
  pasos: Paso[];
  /** Índice del paso actual; `pasos.length` = receta terminada. */
  indice: number;
  onAnterior: () => void;
  onCompletar: () => void;
  onReiniciar: () => void;
  onSalir: () => void;
}

export function ModoGuiado({
  titulo,
  pasos,
  indice,
  onAnterior,
  onCompletar,
  onReiniciar,
  onSalir,
}: ModoGuiadoProps) {
  const { iniciar } = useTimers();
  const total = pasos.length;

  if (indice >= total) {
    return (
      <div className="rounded-xl border border-verde bg-verde-tenue p-5">
        <p className="font-display text-2xl font-semibold text-verde">¡Receta lista!</p>
        <p className="mt-1 text-sm text-tinta-suave">
          Completaste los {total} pasos. Buen provecho.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReiniciar}
            className="rounded-md border border-linea bg-papel px-3 py-2 text-sm font-semibold text-tinta-suave transition-colors hover:border-verde hover:text-verde"
          >
            Empezar de nuevo
          </button>
          <button
            type="button"
            onClick={onSalir}
            className="rounded-md bg-verde px-3 py-2 text-sm font-semibold text-sobre-acento transition-opacity hover:opacity-90"
          >
            Volver a la receta
          </button>
        </div>
      </div>
    );
  }

  const paso = pasos[indice];
  const porcentaje = Math.round((indice / total) * 100);
  const esUltimo = indice === total - 1;

  return (
    <div className="rounded-xl border border-linea bg-papel p-5">
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-humo">
        <span>
          Paso {indice + 1} de {total}
        </span>
        <button
          type="button"
          onClick={onSalir}
          className="font-semibold text-verde hover:underline"
        >
          Salir del modo guiado
        </button>
      </div>
      <div
        role="progressbar"
        aria-label="Progreso de la receta"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={indice}
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-crema"
      >
        <div className="h-full bg-verde transition-all" style={{ width: `${porcentaje}%` }} />
      </div>

      <p className="mt-5 font-display text-xl leading-relaxed text-tinta sm:text-2xl">
        {paso.texto}
      </p>

      {paso.tiempo_segundos !== null && (
        <button
          type="button"
          onClick={() => iniciar(`Paso ${paso.orden} — ${titulo}`, paso.tiempo_segundos as number)}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-tomate bg-papel px-3 py-2 text-sm font-semibold text-tomate transition-colors hover:bg-tomate-tenue"
        >
          <IconoReloj className="h-4 w-4" />
          Cronómetro de {formatearTiempo(paso.tiempo_segundos)}
        </button>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAnterior}
          disabled={indice === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-linea bg-papel px-3 py-2 text-sm font-semibold text-tinta-suave transition-colors hover:border-verde hover:text-verde disabled:opacity-40 disabled:hover:border-linea disabled:hover:text-tinta-suave"
        >
          <IconoFlechaIzquierda className="h-4 w-4" />
          Anterior
        </button>
        <button
          type="button"
          onClick={onCompletar}
          className="inline-flex items-center gap-2 rounded-md bg-verde px-4 py-2 text-sm font-semibold text-sobre-acento transition-opacity hover:opacity-90"
        >
          <IconoCheck className="h-4 w-4" />
          {esUltimo ? "Terminé la receta" : "Listo, siguiente paso"}
        </button>
      </div>
    </div>
  );
}
