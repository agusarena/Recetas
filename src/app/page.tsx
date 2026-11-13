/**
 * Pantalla 1 — Inicio / Buscador.
 * Server Component: precarga el catálogo de ingredientes (cacheado) y lo
 * entrega al buscador cliente. Sin configuración de Supabase, degrada con
 * un aviso claro en vez de romper.
 */
import { obtenerIngredientes } from "@/lib/datos";
import { supabaseConfigurado } from "@/lib/supabase";
import { Buscador } from "@/components/buscador/Buscador";
import { AvisoConfiguracion } from "@/components/AvisoConfiguracion";

export default function Page() {
  return <PantallaInicio />;
}

async function PantallaInicio() {
  if (!supabaseConfigurado()) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-stone-900">
          ¿Qué cocino hoy?
        </h1>
        <AvisoConfiguracion />
      </main>
    );
  }

  const estado = await obtenerIngredientes();
  if (!estado.ok) {
    console.error("[inicio]", estado.detalle);
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-stone-900">
          ¿Qué cocino hoy?
        </h1>
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-stone-700">
          No pudimos cargar el catálogo de ingredientes. Revisá tu conexión e
          intentá de nuevo.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
          ¿Qué cocino hoy?
        </h1>
        <p className="mt-2 text-stone-600">
          Decinos qué tenés y qué no podés comer: te mostramos recetas simples
          para resolver la comida ya.
        </p>
      </header>
      <Buscador ingredientes={estado.datos} />
    </main>
  );
}
