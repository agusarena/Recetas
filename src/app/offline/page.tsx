import type { Metadata } from "next";
import Link from "next/link";
import { IconoOlla } from "@/components/iconos";

export const metadata: Metadata = {
  title: "Sin conexión",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
      <IconoOlla className="h-9 w-9 text-verde" />
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-tinta">
        Te quedaste sin conexión
      </h1>
      <p className="mt-3 max-w-md text-tinta-suave">
        Podés volver a la última receta que abriste desde el historial del navegador. Cuando
        recuperes internet, todo vuelve a estar disponible.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg bg-verde px-5 py-3 text-sm font-semibold text-sobre-acento transition-colors hover:bg-verde-oscuro"
      >
        Reintentar
      </Link>
    </main>
  );
}
