"use client";

/**
 * Sistema de cronómetros del Modo Cocina.
 *
 * - Múltiples timers simultáneos (ej. papas hirviendo + huevo duro).
 * - Tick central con un único interval mientras haya timers corriendo.
 * - Al terminar: alerta sonora (Web Audio) y vibración (si el dispositivo
 *   lo soporta). El permiso del navegador no se consume hasta que suena.
 *
 * Vive en el layout raíz para que la barra flotante sobreviva a la
 * navegación entre pantallas.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Timer } from "@/types";

interface TimersApi {
  timers: Timer[];
  /** Inicia una cuenta regresiva nueva. */
  iniciar: (etiqueta: string, segundos: number) => void;
  pausar: (id: string) => void;
  reanudar: (id: string) => void;
  /** Quita un timer (pausado, corriendo o terminado). */
  detener: (id: string) => void;
}

const TimersContext = createContext<TimersApi | null>(null);

/** Sonido de alerta con Web Audio API (sin archivos de audio). */
function sonarAlerta(): void {
  try {
    const Contexto =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Contexto) return;

    const ctx = new Contexto();
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const ganancia = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      const inicio = ctx.currentTime + i * 0.35;
      ganancia.gain.setValueAtTime(0.0001, inicio);
      ganancia.gain.exponentialRampToValueAtTime(0.25, inicio + 0.03);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.28);
      osc.connect(ganancia);
      ganancia.connect(ctx.destination);
      osc.start(inicio);
      osc.stop(inicio + 0.3);
    }
  } catch {
    // Navegador sin Web Audio: la vibración y la UI siguen siendo la señal.
  }
}

function vibrar(): void {
  try {
    navigator.vibrate?.([300, 120, 300, 120, 500]);
  } catch {
    // Dispositivo sin vibración.
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([]);
  const alertados = useRef(new Set<string>());

  const iniciar = useCallback((etiqueta: string, segundos: number) => {
    setTimers((prev) => [
      ...prev.filter((t) => t.estado !== "terminado"),
      {
        id: crypto.randomUUID(),
        etiqueta,
        duracion_segundos: Math.max(1, Math.round(segundos)),
        restante_segundos: Math.max(1, Math.round(segundos)),
        estado: "corriendo",
      },
    ]);
  }, []);

  const pausar = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id && t.estado === "corriendo" ? { ...t, estado: "pausado" } : t)),
    );
  }, []);

  const reanudar = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id && t.estado === "pausado" ? { ...t, estado: "corriendo" } : t)),
    );
  }, []);

  const detener = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Tick central: solo corre mientras haya timers activos.
  const hayActivos = timers.some((t) => t.estado === "corriendo");
  useEffect(() => {
    if (!hayActivos) return;
    const intervalo = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (t.estado !== "corriendo") return t;
          const restante = t.restante_segundos - 1;
          return restante <= 0
            ? { ...t, restante_segundos: 0, estado: "terminado" }
            : { ...t, restante_segundos: restante };
        }),
      );
    }, 1000);
    return () => clearInterval(intervalo);
  }, [hayActivos]);

  // Alerta al terminar (fuera del updater de estado, para no ser impuro).
  useEffect(() => {
    for (const t of timers) {
      if (t.estado === "terminado" && !alertados.current.has(t.id)) {
        alertados.current.add(t.id);
        sonarAlerta();
        vibrar();
      }
    }
  }, [timers]);

  const api = useMemo<TimersApi>(
    () => ({ timers, iniciar, pausar, reanudar, detener }),
    [timers, iniciar, pausar, reanudar, detener],
  );

  return <TimersContext.Provider value={api}>{children}</TimersContext.Provider>;
}

/** Hook de acceso a los cronómetros. Lanza si falta el provider. */
export function useTimers(): TimersApi {
  const api = useContext(TimersContext);
  if (!api) throw new Error("useTimers debe usarse dentro de <TimerProvider>");
  return api;
}
