/** Cabecera mínima del sitio: marca y accesos principales. */
import Link from "next/link";
import { IconoCorazon, IconoOlla } from "@/components/iconos";

export function SitioHeader() {
  return (
    <header className="border-b border-linea">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-base font-semibold text-tinta transition-colors hover:text-verde"
        >
          <IconoOlla className="h-5 w-5 text-verde" />
          Recetas
        </Link>

        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-4 text-sm font-semibold"
        >
          <Link
            href="/"
            className="text-tinta-suave transition-colors hover:text-verde"
          >
            Buscar
          </Link>
          <Link
            href="/favoritos"
            className="inline-flex items-center gap-1.5 text-tinta-suave transition-colors hover:text-tomate"
          >
            <IconoCorazon className="h-4 w-4" />
            Favoritos
          </Link>
          <Link
            href="/historial"
            className="text-tinta-suave transition-colors hover:text-verde"
          >
            Historial
          </Link>
        </nav>
      </div>
    </header>
  );
}
