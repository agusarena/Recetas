/**
 * Escalado de porciones y formateo "humano" de cantidades.
 *
 * Usado por el Modo Cocina (`- 1 +`) para recalcular ingredientes y macros.
 */
import type { Macros, Unidad } from "@/types";

/** Factor de escalado: porciones deseadas / porciones base de la receta. */
export function factorPorciones(porcionesBase: number, porcionesDeseadas: number): number {
  if (porcionesBase <= 0) return 1;
  return porcionesDeseadas / porcionesBase;
}

/** Escala una cantidad base por el factor dado (con redondeo saneado). */
export function escalarCantidad(cantidadBase: number, factor: number): number {
  return cantidadBase * factor;
}

/**
 * Redondeo "amigable" según la unidad:
 * - g / ml: hasta 100 → múltiplos de 5; desde 100 → múltiplos de 10.
 * - unidades / cda / taza: múltiplos de ½.
 * - pizca: siempre se mantiene discreta (mínimo 1).
 */
export function redondearCantidad(cantidad: number, unidad: Unidad): number {
  if (unidad === "pizca") return Math.max(1, Math.round(cantidad));
  if (unidad === "g" || unidad === "ml") {
    const base = cantidad >= 100 ? 10 : 5;
    return Math.round(cantidad / base) * base;
  }
  return Math.round(cantidad * 2) / 2; // múltiplos de 0.5
}

const FRACCIONES: [number, string][] = [
  [0.25, "¼"],
  [0.33, "⅓"],
  [0.5, "½"],
  [0.67, "⅔"],
  [0.75, "¾"],
];

function fraccionLegible(valor: number): string {
  const entero = Math.floor(valor);
  const resto = valor - entero;
  const fraccion = FRACCIONES.find(([f]) => Math.abs(resto - f) < 0.05);
  if (!fraccion) return `${valor}`;
  if (entero === 0) return fraccion[1];
  return `${entero} ${fraccion[1]}`;
}

/** Etiqueta legible de la unidad para acompañar la cantidad. */
export function etiquetaUnidad(unidad: Unidad, cantidad: number): string {
  switch (unidad) {
    case "g":
      return "g";
    case "ml":
      return "ml";
    case "cda":
      return cantidad === 1 ? "cda" : "cdas";
    case "taza":
      return cantidad === 1 ? "taza" : "tazas";
    case "pizca":
      return "pizca";
    case "unidad":
      return cantidad === 1 ? "unidad" : "unidades";
  }
}

/** Formatea una cantidad ya escalada y redondeada: ej. "1 ½", "250 g". */
export function formatearCantidad(cantidad: number, unidad: Unidad): string {
  const redondeada = redondearCantidad(cantidad, unidad);
  const numero = Number.isInteger(redondeada) ? `${redondeada}` : fraccionLegible(redondeada);
  const sufijo = etiquetaUnidad(unidad, redondeada);
  return unidad === "unidad" ? `${numero} ${sufijo}`.trim() : `${numero} ${sufijo}`;
}

/** Escala los macros orientativos por porción a la cantidad de porciones elegida. */
export function escalarMacros(macros: Macros, porciones: number): Macros {
  return {
    calorias: Math.round(macros.calorias * porciones),
    perfil: macros.perfil,
    proteinas: Math.round(macros.proteinas * porciones),
    carbohidratos: Math.round(macros.carbohidratos * porciones),
    grasas: Math.round(macros.grasas * porciones),
  };
}

/** Formatea segundos como cronómetro: "12:30", "1:05:00". */
export function formatearTiempo(segundos: number): string {
  const s = Math.max(0, Math.ceil(segundos));
  const horas = Math.floor(s / 3600);
  const minutos = Math.floor((s % 3600) / 60);
  const resto = s % 60;
  const mm = `${minutos}`.padStart(2, "0");
  const ss = `${resto}`.padStart(2, "0");
  return horas > 0 ? `${horas}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Descripción amigable de los minutos totales: "45 min", "1 h 15". */
export function formatearMinutos(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}
