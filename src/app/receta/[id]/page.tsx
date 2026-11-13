/**
 * Pantalla 3 — Vista de Receta / Modo Cocina.
 * Server Component: resuelve la receta por ID con datos cacheados y
 * entrega el componente interactivo. Sin `generateStaticParams`, Next
 * sirve un App Shell y completa el contenido (ISR) tras la visita.
 */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { obtenerReceta } from "@/lib/datos";
import { supabaseConfigurado } from "@/lib/supabase";
import { ModoCocina } from "@/components/receta/ModoCocina";
import { AvisoConfiguracion } from "@/components/AvisoConfiguracion";

export async function generateMetadata(
  props: PageProps<"/receta/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const estado = await obtenerReceta(id);
  return { title: estado.ok && estado.datos ? estado.datos.titulo : "Receta" };
}

export default function Page(props: PageProps<"/receta/[id]">) {
  return (
    <Suspense fallback={<Esqueleto />}>
      <VistaReceta params={props.params} />
    </Suspense>
  );
}

function Esqueleto() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-1/2 rounded bg-stone-200" />
        <div className="h-14 rounded-xl bg-stone-200" />
        <div className="h-48 rounded-xl bg-stone-200" />
        <div className="h-64 rounded-xl bg-stone-200" />
      </div>
    </main>
  );
}

async function VistaReceta({
  params,
}: {
  params: PageProps<"/receta/[id]">["params"];
}) {
  const { id } = await params;

  if (!supabaseConfigurado()) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <AvisoConfiguracion />
      </main>
    );
  }

  const estado = await obtenerReceta(id);
  if (!estado.ok) {
    console.error("[receta]", estado.detalle);
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-stone-700">
          No pudimos cargar la receta. Revisá tu conexión e intentá de nuevo.
        </p>
      </main>
    );
  }

  if (!estado.datos) notFound();

  return <ModoCocina receta={estado.datos} />;
}
