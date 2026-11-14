"use client";

/**
 * Preferencias de usuario SIN login: persistidas en localStorage.
 * Cero fricción — el usuario solo completa esto si quiere, y sobrevive
 * entre visitas y recargas del navegador.
 *
 * Todo valor leído se valida contra el esquema, por si el usuario (o una
 * versión vieja de la app) dejó datos corruptos.
 */
import type { EtiquetaDieta, Preferencias } from "@/types";
import { PREFERENCIAS_VERSION } from "@/types";
import { RESTRICCIONES } from "@/lib/motor-busqueda";

const CLAVE = "recetas-app:preferencias";

const RESTRICCIONES_VALIDAS = new Set(
  RESTRICCIONES.map((r) => r.valor),
);

export const PREFERENCIAS_DEFAULT: Preferencias = {
  version: PREFERENCIAS_VERSION,
  restricciones: [],
  favoritos: [],
  heladera: [],
  ultima_busqueda: null,
};

/** Convierte un valor desconocido en Preferencias válidas o en el default. */
export function validarPreferencias(valor: unknown): Preferencias {
  if (typeof valor !== "object" || valor === null) return { ...PREFERENCIAS_DEFAULT };

  const datos = valor as Partial<Preferencias>;
  const restricciones = Array.isArray(datos.restricciones)
    ? datos.restricciones.filter((r): r is EtiquetaDieta => RESTRICCIONES_VALIDAS.has(r))
    : [];
  const favoritos = Array.isArray(datos.favoritos)
    ? datos.favoritos.filter((f): f is string => typeof f === "string")
    : [];
  const heladera = Array.isArray(datos.heladera)
    ? datos.heladera.filter((h): h is string => typeof h === "string")
    : [];
  const ultima_busqueda =
    typeof datos.ultima_busqueda === "string" && datos.ultima_busqueda.trim().length > 0
      ? datos.ultima_busqueda
      : null;

  return {
    version: PREFERENCIAS_VERSION,
    restricciones: [...new Set(restricciones)],
    favoritos: [...new Set(favoritos)],
    heladera: [...new Set(heladera)],
    ultima_busqueda,
  };
}

/** Lee las preferencias del navegador. SSR-safe: devuelve el default. */
export function leerPreferencias(): Preferencias {
  if (typeof window === "undefined") return { ...PREFERENCIAS_DEFAULT };
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return { ...PREFERENCIAS_DEFAULT };
    return validarPreferencias(JSON.parse(crudo));
  } catch {
    return { ...PREFERENCIAS_DEFAULT };
  }
}

/** Persiste las preferencias. Debe llamarse solo en el cliente. */
export function guardarPreferencias(preferencias: Preferencias): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(preferencias));
  } catch {
    // Cuota agotada o modo privado: la app sigue funcionando sin persistencia.
  }
}

/**
 * Se entera de cambios de preferencias (incluidas pestañas sincronizadas
 * mediante el evento `storage`) y de la primera lectura post-hidratación.
 */
export function suscribirsePreferencias(
  callback: (preferencias: Preferencias) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  callback(leerPreferencias());

  const alCambiar = (evento: StorageEvent) => {
    if (evento.key === CLAVE) callback(leerPreferencias());
  };

  window.addEventListener("storage", alCambiar);
  return () => window.removeEventListener("storage", alCambiar);
}
