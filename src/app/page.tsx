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
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">
          ¿Qué cocino hoy?
        </h1>
        <div className="mt-6">
          <AvisoConfiguracion />
        </div>
      </main>
    );
  }

  const estado = await obtenerIngredientes();
  if (!estado.ok) {
    console.error("[inicio]", estado.detalle);
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-tinta sm:text-4xl">
          ¿Qué cocino hoy?
        </h1>
        <p className="mt-6 border-t border-linea pt-6 text-tinta-suave">
          No pudimos cargar el catálogo de ingredientes. Revisá tu conexión e
          intentá de nuevo.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-10 sm:pt-14">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-tinta sm:text-5xl">
          ¿Qué cocino hoy?
        </h1>
        <p className="mt-3 max-w-xl text-lg leading-relaxed text-tinta-suave">
          Decinos qué tenés en la heladera y qué no podés comer: te mostramos
          recetas simples para resolver la comida ya.
        </p>
      </header>
      <Buscador ingredientes={estado.datos} />
    </main>
  );
}
