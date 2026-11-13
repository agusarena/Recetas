"use client";

/**
 * Barra flotante con los cronómetros activos. Persiste en pantalla durante
 * toda la navegación (vive en el layout raíz) para que el usuario no pierda
 * la cuenta regresiva al mirar otro paso.
 */
import { formatearTiempo } from "@/lib/porciones";
import { useTimers } from "@/components/timers/TimerProvider";
import { IconoCampana, IconoCruz, IconoPausa, IconoPlay } from "@/components/iconos";

export function BarraTimers() {
  const { timers, pausar, reanudar, detener } = useTimers();
  if (timers.length === 0) return null;

  const activos = timers.filter((t) => t.estado !== "terminado");
  const terminados = timers.filter((t) => t.estado === "terminado");

  return (
    <div className="sticky bottom-0 z-50 border-t border-linea bg-papel/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-3 py-2">
        <ul className="flex flex-wrap items-stretch gap-2">
          {activos.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 rounded-md border border-linea bg-crema px-3 py-2"
            >
              <span className="text-lg font-semibold tabular-nums text-tinta">
                {formatearTiempo(t.restante_segundos)}
              </span>
              <span className="max-w-32 truncate text-xs text-humo">{t.etiqueta}</span>
              {t.estado === "corriendo" ? (
                <button
                  type="button"
                  aria-label={`Pausar ${t.etiqueta}`}
                  onClick={() => pausar(t.id)}
                  className="rounded-md p-1 text-tinta transition-colors hover:bg-linea"
                >
                  <IconoPausa className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label={`Reanudar ${t.etiqueta}`}
                  onClick={() => reanudar(t.id)}
                  className="rounded-md p-1 text-tinta transition-colors hover:bg-linea"
                >
                  <IconoPlay className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                aria-label={`Quitar ${t.etiqueta}`}
                onClick={() => detener(t.id)}
                className="rounded-md p-1 text-humo transition-colors hover:bg-linea hover:text-tinta"
              >
                <IconoCruz className="h-4 w-4" />
              </button>
            </li>
          ))}
          {terminados.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 rounded-md bg-verde-tenue px-3 py-2"
            >
              <IconoCampana className="h-4 w-4 shrink-0 text-verde" />
              <span className="text-sm font-semibold text-verde">
                ¡Listo! {t.etiqueta}
              </span>
              <button
                type="button"
                aria-label="Descartar aviso"
                onClick={() => detener(t.id)}
                className="rounded-md p-1 text-verde transition-colors hover:bg-verde-tenue/70"
              >
                <IconoCruz className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
