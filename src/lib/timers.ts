/**
 * Lógica pura de los cronómetros del Modo Cocina.
 *
 * La fuente de verdad es `termina_en` (epoch ms), no un contador que se resta
 * cada segundo: los navegadores frenan los `setInterval` en pestañas en
 * segundo plano y el celular puede bloquear la pantalla. Recalcular el
 * restante desde el reloj mantiene el timer exacto aunque el tick se atrase.
 *
 * La persistencia en localStorage permite recargar la página sin perder la
 * cuenta regresiva.
 */
import type { EstadoTimer, Timer } from "@/types";

const CLAVE = "recetas-app:timers";
const ESTADOS: EstadoTimer[] = ["corriendo", "pausado", "terminado"];

/** Segundos que faltan para `terminaEn`, redondeados hacia arriba. */
function segundosHasta(terminaEn: number, ahora: number): number {
  return Math.max(0, Math.ceil((terminaEn - ahora) / 1000));
}

/** Crea un timer corriendo. `ahora` e `id` se inyectan para poder testearlo. */
export function crearTimer(
  etiqueta: string,
  segundos: number,
  ahora: number = Date.now(),
  id: string = crypto.randomUUID(),
): Timer {
  const duracion = Math.max(1, Math.round(segundos));
  return {
    id,
    etiqueta,
    duracion_segundos: duracion,
    restante_segundos: duracion,
    estado: "corriendo",
    termina_en: ahora + duracion * 1000,
  };
}

/** Recalcula el restante desde el reloj y marca el timer como terminado. */
export function avanzarTimer(timer: Timer, ahora: number): Timer {
  if (timer.estado !== "corriendo" || timer.termina_en === null) return timer;

  const restante = segundosHasta(timer.termina_en, ahora);
  if (restante <= 0) {
    return { ...timer, restante_segundos: 0, estado: "terminado", termina_en: null };
  }
  return restante === timer.restante_segundos
    ? timer
    : { ...timer, restante_segundos: restante };
}

/** Congela el restante y anula el deadline. */
export function pausarTimer(timer: Timer, ahora: number): Timer {
  if (timer.estado !== "corriendo") return timer;

  const restante =
    timer.termina_en === null ? timer.restante_segundos : segundosHasta(timer.termina_en, ahora);

  if (restante <= 0) {
    return { ...timer, restante_segundos: 0, estado: "terminado", termina_en: null };
  }
  return { ...timer, restante_segundos: restante, estado: "pausado", termina_en: null };
}

/** Vuelve a correr desde el restante congelado, con un deadline nuevo. */
export function reanudarTimer(timer: Timer, ahora: number): Timer {
  if (timer.estado !== "pausado") return timer;

  const restante = Math.max(1, timer.restante_segundos);
  return {
    ...timer,
    restante_segundos: restante,
    estado: "corriendo",
    termina_en: ahora + restante * 1000,
  };
}

/** Reconcilia timers persistidos con el reloj actual (ej. al recargar). */
export function reconciliarTimers(timers: Timer[], ahora: number = Date.now()): Timer[] {
  return timers.map((timer) => {
    // Dato viejo o incompleto: un timer "corriendo" sin deadline se reconstruye
    // desde el restante para no quedar congelado.
    if (timer.estado === "corriendo" && timer.termina_en === null) {
      const reconstruido: Timer = {
        ...timer,
        termina_en: ahora + Math.max(0, timer.restante_segundos) * 1000,
      };
      return avanzarTimer(reconstruido, ahora);
    }
    return avanzarTimer(timer, ahora);
  });
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

/** Valida datos de localStorage y descarta timers corruptos. */
export function normalizarTimers(valor: unknown): Timer[] {
  if (!Array.isArray(valor)) return [];

  const timers: Timer[] = [];
  for (const item of valor) {
    if (!esObjeto(item)) continue;

    const id = item.id;
    const etiqueta = item.etiqueta;
    const duracion = Number(item.duracion_segundos);
    const restante = Number(item.restante_segundos);
    const estado = item.estado;
    const terminaEn = item.termina_en === null ? null : Number(item.termina_en);

    if (typeof id !== "string" || id.length === 0) continue;
    if (typeof etiqueta !== "string" || etiqueta.length === 0) continue;
    if (!Number.isFinite(duracion) || duracion <= 0) continue;
    if (!Number.isFinite(restante) || restante < 0) continue;
    if (!ESTADOS.includes(estado as EstadoTimer)) continue;
    if (terminaEn !== null && !Number.isFinite(terminaEn)) continue;

    timers.push({
      id,
      etiqueta,
      duracion_segundos: Math.round(duracion),
      restante_segundos: Math.round(restante),
      estado: estado as EstadoTimer,
      termina_en: terminaEn,
    });
  }
  return timers;
}

/**
 * Lee los timers del navegador. SSR-safe: devuelve [] en el servidor.
 */
export function leerTimers(): Timer[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return [];
    return normalizarTimers(JSON.parse(crudo));
  } catch {
    return [];
  }
}

/** Persiste los timers. Debe llamarse solo en el cliente. */
export function guardarTimers(timers: Timer[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(timers));
  } catch {
    // Cuota agotada o modo privado: el timer sigue funcionando en memoria.
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Store externo para `useSyncExternalStore`
//
// El estado de los timers no vive en un useState del componente: es un store
// con snapshot estable. Así la hidratación desde localStorage no genera
// renders en cascada y dos pestañas pueden sincronizarse por el evento
// `storage`.
// ─────────────────────────────────────────────────────────────────────────────

let cache: Timer[] | null = null;
let terminadosAlCargar = new Set<string>();
const oyentes = new Set<() => void>();
const SIN_TIMERS: Timer[] = [];

function notificar(): void {
  for (const oyente of oyentes) oyente();
}

function marcarTerminadosActuales(timers: Timer[]): void {
  terminadosAlCargar = new Set(
    timers.filter((timer) => timer.estado === "terminado").map((timer) => timer.id),
  );
}

/**
 * Snapshot estable. La primera lectura hidrata desde localStorage y reconcilia
 * con el reloj; las siguientes devuelven la misma referencia hasta que cambie.
 */
export function obtenerTimers(): Timer[] {
  if (typeof window === "undefined") return [];
  if (cache === null) {
    cache = reconciliarTimers(leerTimers());
    marcarTerminadosActuales(cache);
  }
  return cache;
}

/** Snapshot para SSR: el servidor no conoce el localStorage. */
export function obtenerTimersServidor(): Timer[] {
  return SIN_TIMERS;
}

/** IDs que ya estaban terminados al hidratar: no deben sonar de nuevo. */
export function timersTerminadosAlCargar(): ReadonlySet<string> {
  return terminadosAlCargar;
}

/** Suscribe el store a React y a los cambios de otras pestañas. */
export function suscribirseTimers(oyente: () => void): () => void {
  oyentes.add(oyente);
  if (typeof window === "undefined") return () => oyentes.delete(oyente);

  const alCambiarStorage = (evento: StorageEvent) => {
    if (evento.key !== CLAVE) return;
    cache = reconciliarTimers(leerTimers());
    notificar();
  };

  window.addEventListener("storage", alCambiarStorage);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener("storage", alCambiarStorage);
  };
}

/** Reemplaza el estado, lo persiste y notifica a React. */
export function actualizarTimers(timers: Timer[]): void {
  cache = timers;
  guardarTimers(timers);
  notificar();
}
