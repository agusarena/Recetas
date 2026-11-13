"use client";
/** Botón de favorito persistido en localStorage (sin login). */
import { usePreferencias } from "@/lib/use-preferencias";
import { IconoCorazon } from "@/components/iconos";

export function BotonFavorito({ recetaId }: { recetaId: string }) {
  const { preferencias, toggleFavorito } = usePreferencias();
  const esFavorito = preferencias.favoritos.includes(recetaId);

  return (
    <button
      type="button"
      aria-pressed={esFavorito}
      aria-label={esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
      onClick={() => toggleFavorito(recetaId)}
      className={`rounded-md p-1.5 transition-colors ${
        esFavorito ? "text-tomate" : "text-humo hover:text-tomate"
      }`}
    >
      <IconoCorazon relleno={esFavorito} className="h-5 w-5" />
    </button>
  );
}
