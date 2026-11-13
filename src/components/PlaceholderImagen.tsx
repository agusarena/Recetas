/**
 * Placeholder de imagen: usa la foto real si existe, y si no, un degradado
 * con un emoji de comida (elegido de forma estable por hash del título).
 * Mantener <img> en vez de next/image: aún no hay dominio de Storage
 * configurado en next.config.
 */
const EMOJIS = ["🍳", "🥘", "🍲", "🥗", "🍜", "🍕", "🥙", "🍛"];

export function PlaceholderImagen({
  titulo,
  url,
  className = "",
}: {
  titulo: string;
  url: string | null;
  className?: string;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={titulo}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }
  const emoji = EMOJIS[hashCode(titulo) % EMOJIS.length];
  return (
    <div
      role="img"
      aria-label={titulo}
      className={`flex items-center justify-center bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 ${className}`}
    >
      <span className="text-4xl opacity-80">{emoji}</span>
    </div>
  );
}

function hashCode(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
