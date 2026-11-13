"use client";

/**
 * Barra flotante con los cronómetros activos. Persiste en pantalla durante
 * toda la navegación (vive en el layout raíz) para que el usuario no pierda
 * la cuenta regresiva al mirar otro paso.
 */
import { formatearTiempo } from "@/lib/porciones";
import { useTimers } from "@/components/timers/TimerProvider";

export function BarraTimers() {
  const { timers, pausar, reanudar, detener } = useTimers();
  if (timers.length === 0) return null;

  const activos = timers.filter((t) => t.estado !== "terminado");
  const terminados = timers.filter((t) => t.estado === "terminado");

  return (
    <div className="sticky bottom-0 z-50 px-2 pb-2">
      <div className="mx-auto max-w-3xl rounded-xl border border-stone-300 bg-white/95 p-2 shadow-lg backdrop-blur">
        <ul className="flex flex-wrap items-stretch gap-2">
          {activos.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 rounded-lg bg-stone-100 px-3 py-2"
            >
              <span className="font-mono text-lg tabular-nums text-stone-900">
                {formatearTiempo(t.restante_segundos)}
              </span>
              <span className="max-w-32 truncate text-xs text-stone-600">{t.etiqueta}</span>
              {t.estado === "corriendo" ? (
                <button
                  type="button"
                  aria-label={`Pausar ${t.etiqueta}`}
                  onClick={() => pausar(t.id)}
                  className="rounded-md px-1.5 py-0.5 text-sm hover:bg-stone-200"
                >
                  ⏸
                </button>
              ) : (
                <button
                  type="button"
                  aria-label={`Reanudar ${t.etiqueta}`}
                  onClick={() => reanudar(t.id)}
                  className="rounded-md px-1.5 py-0.5 text-sm hover:bg-stone-200"
                >
                  ▶
                </button>
              )}
              <button
                type="button"
                aria-label={`Quitar ${t.etiqueta}`}
                onClick={() => detener(t.id)}
                className="rounded-md px-1.5 py-0.5 text-sm text-stone-500 hover:bg-stone-200"
              >
                ✕
              </button>
            </li>
          ))}
          {terminados.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2"
            >
              <span className="text-sm font-semibold text-emerald-800">
                ⏰ ¡Listo! {t.etiqueta}
              </span>
              <button
                type="button"
                aria-label="Descartar aviso"
                onClick={() => detener(t.id)}
                className="rounded-md px-1.5 py-0.5 text-sm text-emerald-700 hover:bg-emerald-200"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
