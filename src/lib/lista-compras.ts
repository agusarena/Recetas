/**
 * Lista de compras "para llevar": items con cantidad y sección del
 * supermercado, agrupados y listos para copiar al portapapeles o mandar
 * por WhatsApp (enlace wa.me, sin backend).
 */
import type { RecetaIngredienteConDetalle, Unidad } from "@/types";
import { formatearCantidad } from "./porciones";

/** Un ítem de la lista: qué comprar y en qué sección del super. */
export interface ItemLista {
  /** ID del ingrediente, para agrupar apariciones en varias recetas. */
  id: string;
  /** Texto final: "600 g de papa", "2 latas de lentejas". */
  texto: string;
  /** Sección del supermercado: "Verdulería", "Carnicería"... */
  seccion: string;
}

/** Categoría del catálogo → sección del supermercado. */
const SECCION_CATEGORIA: Record<string, string> = {
  verduras: "Verdulería",
  carnes: "Carnicería",
  lácteos: "Lácteos",
  almacén: "Almacén",
  panadería: "Panadería",
  frescos: "Frescos",
  básicos: "Otros",
};

/** Orden de recorrida del supermercado (primero la verdulería). */
export const ORDEN_SECCIONES = [
  "Verdulería",
  "Carnicería",
  "Lácteos",
  "Almacén",
  "Panadería",
  "Frescos",
  "Otros",
] as const;

export function seccionDe(categoria: string): string {
  return SECCION_CATEGORIA[categoria] ?? "Otros";
}

/** Minúscula inicial para que el texto fluya ("600 g de papa"). */
function enMinúscula(nombre: string): string {
  return nombre.charAt(0).toLowerCase() + nombre.slice(1);
}

/**
 * Arma la lista a partir de relaciones receta↔ingrediente. Apariciones del
 * mismo ingrediente con la misma unidad se suman (2 recetas que piden 1
 * lata de lentejas → "2 unidades de lentejas en lata"); con unidades
 * distintas quedan como líneas separadas.
 */
export function armarLista(
  relaciones: RecetaIngredienteConDetalle[],
): ItemLista[] {
  type Acumulado = {
    id: string;
    nombre: string;
    categoria: string;
    totales: Map<Unidad, number>; // unidad → cantidad
  };

  const porId = new Map<string, Acumulado>();
  for (const ri of relaciones) {
    let acumulado = porId.get(ri.ingrediente_id);
    if (!acumulado) {
      acumulado = {
        id: ri.ingrediente_id,
        nombre: ri.ingrediente.nombre,
        categoria: ri.ingrediente.categoria,
        totales: new Map(),
      };
      porId.set(ri.ingrediente_id, acumulado);
    }
    const actual = acumulado.totales.get(ri.unidad) ?? 0;
    acumulado.totales.set(ri.unidad, actual + ri.cantidad_base);
  }

  const items: ItemLista[] = [];
  for (const { id, nombre, categoria, totales } of porId.values()) {
    for (const [unidad, cantidad] of totales) {
      const cantidadFormateada = formatearCantidad(cantidad, unidad);
      items.push({
        id,
        texto: `${cantidadFormateada} de ${enMinúscula(nombre)}`,
        seccion: seccionDe(categoria),
      });
    }
  }
  const orden = new Map<string, number>(
    ORDEN_SECCIONES.map((seccion, i) => [seccion, i]),
  );
  return items.sort(
    (a, b) =>
      (orden.get(a.seccion) ?? orden.size) - (orden.get(b.seccion) ?? orden.size) ||
      a.texto.localeCompare(b.texto, "es"),
  );
}

/** Emojis por sección: WhatsApp se lee mejor con un ancla visual. */
const EMOJI_SECCION: Record<string, string> = {
  Verdulería: "🥬",
  Carnicería: "🥩",
  Lácteos: "🧀",
  Almacén: "🥫",
  Panadería: "🥖",
  Frescos: "🥚",
  Otros: "🧂",
};

/**
 * Texto final de la lista, agrupado por sección del super, para copiar o
 * mandar por WhatsApp.
 */
export function armarTextoLista(items: ItemLista[], titulo?: string): string {
  const encabezado = titulo
    ? `🛒 Lista de compras — ${titulo}`
    : "🛒 Lista de compras";

  const bloques: string[] = [encabezado, ""];
  for (const seccion of ORDEN_SECCIONES) {
    const deSeccion = items.filter((item) => item.seccion === seccion);
    if (deSeccion.length === 0) continue;
    bloques.push(`${EMOJI_SECCION[seccion]} ${seccion}`);
    for (const item of deSeccion) bloques.push(`- ${item.texto}`);
    bloques.push("");
  }
  // El último bloque deja un vacío: se recorta para no terminar con \n\n.
  return bloques.join("\n").trimEnd();
}

/** Enlace universal de WhatsApp con el texto pre-cargado. */
export function urlWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}
