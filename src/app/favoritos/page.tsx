/**
 * Pantalla de favoritos. El catálogo se resuelve en el servidor (cacheado) y
 * el cliente filtra por los IDs guardados en localStorage. Sin login.
 */
import { Suspense } from "react";
import type { Metadata } from "next";
import { obtenerCatalogo, resumirReceta } from "@/lib/datos";
import { supabaseConfigurado } from "@/lib/supabase";
import { ListaFavoritos } from "@/components/favoritos/ListaFavoritos";
import { AvisoConfiguracion } from "@/components/AvisoConfiguracion";

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Las recetas que guardaste para cocinar más tarde.",
};

export default function Page() {
  return (
    <Suspense fallback={<Esqueleto />}>
      <VistaFavoritos />
    </Suspense>
  );
}

function Esqueleto() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/2 rounded bg-crema" />
        <div className="h-24 rounded-xl bg-crema" />
        <div className="h-24 rounded-xl bg-crema" />
      </div>
    </main>
  );
}

async function VistaFavoritos() {
  if (!supabaseConfigurado()) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <AvisoConfiguracion />
      </main>
    );
  }

  const estado = await obtenerCatalogo();
  if (!estado.ok) {
    console.error("[favoritos]", estado.detalle);
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <p className="border-t border-linea pt-6 text-tinta-suave">
          No pudimos cargar las recetas. Revisá tu conexión e intentá de nuevo.
        </p>
      </main>
    );
  }

  return <ListaFavoritos recetas={estado.datos.map(resumirReceta)} />;
}
