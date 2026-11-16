/**
 * Fotos ilustrativas gratuitas desde el CDN de Unsplash.
 *
 * No usa API, clave ni backend. Son imágenes de apoyo para que la persona
 * pueda decidir por lo que ve mientras el catálogo no tenga fotos propias.
 * Si una URL no responde, PlaceholderImagen vuelve a su placeholder seguro.
 */
const PARAMETROS = "?auto=format&fit=crop&w=640&q=82";

const FOTOS = {
  ensalada: `https://images.unsplash.com/photo-1512621776951-a57141f2eefd${PARAMETROS}`,
  pasta: `https://images.unsplash.com/photo-1551183053-bf91a1d81141${PARAMETROS}`,
  carne: `https://images.unsplash.com/photo-1544025162-d76694265947${PARAMETROS}`,
  sopa: `https://images.unsplash.com/photo-1547592180-85f173990554${PARAMETROS}`,
  pollo: `https://images.unsplash.com/photo-1532550907401-a500c9a57435${PARAMETROS}`,
  arroz: `https://images.unsplash.com/photo-1512058564366-18510be2db19${PARAMETROS}`,
  desayuno: `https://images.unsplash.com/photo-1528207776546-365bb710ee93${PARAMETROS}`,
  postre: `https://images.unsplash.com/photo-1563729784474-d77dbb933a9e${PARAMETROS}`,
} as const;

/** Normaliza títulos sin duplicar la lógica del buscador. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Elige una imagen ilustrativa estable según el nombre de la receta.
 * Las coincidencias específicas van antes que el fallback de categoría.
 */
export function imagenGratisParaReceta(
  titulo: string,
  categoria?: "salado" | "dulce",
): string {
  const texto = normalizar(titulo);

  if (/bife|carne|empanada|hamburguesa|alb[oó]ndiga|parrilla/.test(texto)) {
    return FOTOS.carne;
  }
  if (/pollo/.test(texto)) return FOTOS.pollo;
  if (/ensalada|palta|atun|tomate/.test(texto)) return FOTOS.ensalada;
  if (/arroz|risotto/.test(texto)) return FOTOS.arroz;
  if (/sopa|guiso|lenteja/.test(texto)) return FOTOS.sopa;
  if (/fideo|pasta|ñoqui|noqui|tallar/.test(texto)) return FOTOS.pasta;
  if (/banana|panque|tostada|avena|omelette|huevo|revuelto/.test(texto)) {
    return FOTOS.desayuno;
  }
  if (categoria === "dulce") return FOTOS.postre;
  return FOTOS.ensalada;
}
