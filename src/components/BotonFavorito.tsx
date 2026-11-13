"use client";

/** Botón de favorito persistido en localStorage (sin login). */
import { usePreferencias } from "@/lib/use-preferencias";

export function BotonFavorito({ recetaId }: { recetaId: string }) {
  const { preferencias, toggleFavorito } = usePreferencias();
  const esFavorito = preferencias.favoritos.includes(recetaId);

  return (
    <button
      type="button"
      aria-pressed={esFavorito}
      aria-label={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
      onClick={() => toggleFavorito(recetaId)}
      className={`rounded-full p-2 text-lg leading-none transition-transform hover:scale-110 ${
        esFavorito ? "text-rose-500" : "text-stone-400 hover:text-rose-400"
      }`}
    >
      {esFavorito ? "♥" : "♡"}
    </button>
  );
}
