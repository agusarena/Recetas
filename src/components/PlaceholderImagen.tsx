"use client";

/**
 * Imagen de receta: usa la foto guardada si existe; si no, una foto
 * ilustrativa gratuita; y si la red falla, un placeholder local estable.
 * Mantenemos <img> porque las fotos vienen de un CDN externo y no requieren
 * configuración de dominios ni procesamiento de Next.
 */
import { useState } from "react";
import { imagenGratisParaReceta } from "@/lib/imagenes-recetas";

/** Pares de tonos apagados (fondo / tinta) con aire de recetario. */
const TONOS = [
  { fondo: "#e8f0ec", tinta: "#1e5c45" }, // verde albahaca tenue
  { fondo: "#f9ede6", tinta: "#bf4318" }, // tomate tenue
  { fondo: "#f7f5f0", tinta: "#55524b" }, // crema y gris cálido
  { fondo: "#ede9e1", tinta: "#75716a" },
];

export function PlaceholderImagen({
  titulo,
  url,
  categoria,
  className = "",
}: {
  titulo: string;
  url: string | null;
  categoria?: "salado" | "dulce";
  className?: string;
}) {
  const [fallo, setFallo] = useState(false);
  const fuente = url ?? imagenGratisParaReceta(titulo, categoria);

  if (!fallo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fuente}
        alt={`Foto ilustrativa de ${titulo}`}
        loading="lazy"
        onError={() => setFallo(true)}
        className={`object-cover ${className}`}
      />
    );
  }
  const tono = TONOS[hashCode(titulo) % TONOS.length];
  return (
    <div
      role="img"
      aria-label={titulo}
      style={{ background: tono.fondo, color: tono.tinta }}
      className={`flex items-center justify-center ${className}`}
    >
      <span className="font-display text-4xl leading-none">{inicial(titulo)}</span>
    </div>
  );
}

function inicial(titulo: string): string {
  const letra = titulo.trim().charAt(0);
  return letra ? letra.toUpperCase() : "?";
}

function hashCode(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
