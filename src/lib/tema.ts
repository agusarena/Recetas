/**
 * Tema de la página: "sistema" (por defecto), "claro" u "oscuro".
 * La preferencia se guarda en localStorage y se refleja como `data-tema` en
 * <html>, que es lo que activa la paleta de globals.css.
 *
 * Sin "use client": el layout (servidor) usa SCRIPT_TEMA_INICIAL para fijar
 * el tema antes del primer paint, y el hook de cliente usa el resto.
 */

export type Tema = "sistema" | "claro" | "oscuro";
export type TemaEfectivo = "claro" | "oscuro";

export const CLAVE_TEMA = "recetas-app:tema";
export const TEMA_DEFAULT: Tema = "sistema";
export const TEMAS: readonly Tema[] = ["sistema", "claro", "oscuro"];
export const MEDIA_OSCURO = "(prefers-color-scheme: dark)";

/** Color de la barra del navegador (theme-color), según el tema que se muestra. */
export const COLOR_NAVEGADOR: Record<TemaEfectivo, string> = {
  claro: "#1e5c45",
  oscuro: "#1d1b18",
};

export function esTema(valor: unknown): valor is Tema {
  return typeof valor === "string" && (TEMAS as readonly string[]).includes(valor);
}

/** Traduce la preferencia a la paleta concreta que hay que mostrar. */
export function resolverTema(tema: Tema, sistemaOscuro: boolean): TemaEfectivo {
  if (tema === "sistema") return sistemaOscuro ? "oscuro" : "claro";
  return tema;
}

/** Lee la preferencia guardada. SSR-safe: devuelve el default. */
export function leerTema(): Tema {
  if (typeof window === "undefined") return TEMA_DEFAULT;
  try {
    const crudo = window.localStorage.getItem(CLAVE_TEMA);
    return esTema(crudo) ? crudo : TEMA_DEFAULT;
  } catch {
    return TEMA_DEFAULT;
  }
}

/** Persiste la preferencia. Debe llamarse solo en el cliente. */
export function guardarTema(tema: Tema): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    // Modo privado o cuota agotada: el tema funciona, solo no se recuerda.
  }
}

/** Aplica la preferencia en <html> según el sistema operativo actual. */
export function aplicarTema(tema: Tema): void {
  if (typeof document === "undefined") return;
  const sistemaOscuro = window.matchMedia(MEDIA_OSCURO).matches;
  const efectivo = resolverTema(tema, sistemaOscuro);
  document.documentElement.dataset.tema = efectivo;

  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = COLOR_NAVEGADOR[efectivo];
}

const oyentes = new Set<() => void>();

/** Cambia el tema, lo guarda y avisa a los componentes suscriptos. */
export function establecerTema(tema: Tema): void {
  guardarTema(tema);
  aplicarTema(tema);
  oyentes.forEach((oyente) => oyente());
}

/**
 * Se entera de cambios de tema: en esta pestaña (establecerTema), en otras
 * (evento storage) y del sistema operativo. Aplica el tema al suscribirse.
 */
export function suscribirseTema(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  aplicarTema(leerTema());

  const mediaOscuro = window.matchMedia(MEDIA_OSCURO);
  const alCambiarSistema = () => {
    aplicarTema(leerTema());
    callback();
  };
  const alCambiarStorage = (evento: StorageEvent) => {
    if (evento.key !== CLAVE_TEMA) return;
    alCambiarSistema();
  };

  oyentes.add(callback);
  mediaOscuro.addEventListener("change", alCambiarSistema);
  window.addEventListener("storage", alCambiarStorage);
  return () => {
    oyentes.delete(callback);
    mediaOscuro.removeEventListener("change", alCambiarSistema);
    window.removeEventListener("storage", alCambiarStorage);
  };
}

/**
 * Script síncrono para el <head>: pone data-tema y el color de la barra antes
 * de que el navegador pinte, leyendo la misma clave que leerTema(). Se mantiene
 * como string porque se inyecta tal cual en el HTML del servidor.
 */
export const SCRIPT_TEMA_INICIAL = `(function(){var t=null;try{t=localStorage.getItem(${JSON.stringify(CLAVE_TEMA)})}catch(err){}var o=(t==="claro"||t==="oscuro")?t:(matchMedia(${JSON.stringify(MEDIA_OSCURO)}).matches?"oscuro":"claro");document.documentElement.dataset.tema=o;var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.name="theme-color";document.head.appendChild(m)}m.content=${JSON.stringify(COLOR_NAVEGADOR)}[o]})();`;
