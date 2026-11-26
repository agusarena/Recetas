/**
 * Créditos de las fotos de Wikimedia Commons (generados por
 * scripts/fotos-recetas.ts). Las licencias CC BY y CC BY-SA exigen mostrar
 * el autor junto a la foto.
 */
import creditos from "@/lib/fotos-creditos.json";

export interface CreditoFoto {
  archivo: string;
  autor: string;
  licencia: string;
  pagina: string;
}

const CREDITOS: Record<string, CreditoFoto> = creditos;

/** Crédito de la foto de una receta, o null si no tiene foto propia. */
export function creditoDeFoto(recetaId: string): CreditoFoto | null {
  return CREDITOS[recetaId] ?? null;
}
