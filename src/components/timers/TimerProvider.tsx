"use client";

/**
 * Sistema de cronómetros del Modo Cocina.
 *
 * - Múltiples timers simultáneos (ej. papas hirviendo + huevo duro).
 * - Tick central con un único interval mientras haya timers corriendo.
 * - Recalcula desde un deadline (`termina_en`), no restando segundos: así no
 *   se atrasa cuando la pestaña queda en segundo plano.
 * - Persiste en localStorage: recargar la página no pierde la cuenta.
 * - Mantiene la pantalla despierta (Screen Wake Lock) mientras cocinás.
 * - Al terminar: alerta sonora (Web Audio) y vibración (si el dispositivo
 *   lo soporta). No se dispara una alarma retroactiva al recargar.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Timer } from "@/types";
import {
  actualizarTimers,
  avanzarTimer,
  crearTimer,
  obtenerTimers,
  obtenerTimersServidor,
  pausarTimer,
  reanudarTimer,
  suscribirseTimers,
  timersTerminadosAlCargar,
} from "@/lib/timers";

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

// ─────────────────────────────────────────────────────────────────────────────
// Screen Wake Lock (tipado mínimo: no todos los lib.dom lo incluyen)
// ─────────────────────────────────────────────────────────────────────────────

type SentinelDespertar = {
  release: () => Promise<void>;
  addEventListener?: (tipo: "release", callback: () => void) => void;
};

type NavigatorConWakeLock = Navigator & {
  wakeLock?: { request: (tipo: "screen") => Promise<SentinelDespertar> };
};

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const timers = useSyncExternalStore(
    suscribirseTimers,
    obtenerTimers,
    obtenerTimersServidor,
  );

  // Los que ya estaban terminados al cargar se consideran avisados: recargar
  // la página no debe disparar una alarma retroactiva.
  const [alertados] = useState<Set<string>>(() => {
    obtenerTimers();
    return new Set(timersTerminadosAlCargar());
  });
  const wakeLock = useRef<SentinelDespertar | null>(null);

  const iniciar = useCallback((etiqueta: string, segundos: number) => {
    actualizarTimers([...obtenerTimers(), crearTimer(etiqueta, segundos)]);
  }, []);

  const pausar = useCallback((id: string) => {
    const ahora = Date.now();
    actualizarTimers(
      obtenerTimers().map((t) => (t.id === id ? pausarTimer(t, ahora) : t)),
    );
  }, []);

  const reanudar = useCallback((id: string) => {
    const ahora = Date.now();
    actualizarTimers(
      obtenerTimers().map((t) => (t.id === id ? reanudarTimer(t, ahora) : t)),
    );
  }, []);

  const detener = useCallback((id: string) => {
    alertados.delete(id);
    actualizarTimers(obtenerTimers().filter((t) => t.id !== id));
  }, [alertados]);

  // Tick central: solo corre mientras haya timers activos.
  const hayActivos = timers.some((t) => t.estado === "corriendo");
  useEffect(() => {
    if (!hayActivos) return;
    const intervalo = setInterval(() => {
      const ahora = Date.now();
      const actuales = obtenerTimers();
      const siguientes = actuales.map((t) => avanzarTimer(t, ahora));
      if (siguientes.some((t, i) => t !== actuales[i])) actualizarTimers(siguientes);
    }, 500);
    return () => clearInterval(intervalo);
  }, [hayActivos]);

  // Alerta al terminar. La mutación del Set no re-renderiza: es solo control
  // de efecto, igual que la barra de timers.
  useEffect(() => {
    for (const t of timers) {
      if (t.estado === "terminado" && !alertados.has(t.id)) {
        alertados.add(t.id);
        sonarAlerta();
        vibrar();
      }
    }
  }, [timers, alertados]);

  // Mantiene la pantalla encendida mientras hay timers corriendo.
  useEffect(() => {
    let cancelado = false;
    const pedir = async () => {
      if (!hayActivos || document.visibilityState !== "visible" || wakeLock.current) return;
      const nav = navigator as NavigatorConWakeLock;
      if (!nav.wakeLock) return;

      try {
        const sentinel = await nav.wakeLock.request("screen");
        if (cancelado) {
          await sentinel.release();
          return;
        }
        wakeLock.current = sentinel;
        sentinel.addEventListener?.("release", () => {
          if (wakeLock.current === sentinel) wakeLock.current = null;
        });
      } catch {
        // Navegador sin soporte, sin HTTPS o permiso denegado.
      }
    };

    void pedir();
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === "visible") void pedir();
    };
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      cancelado = true;
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      const sentinel = wakeLock.current;
      wakeLock.current = null;
      void sentinel?.release().catch(() => undefined);
    };
  }, [hayActivos]);

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
