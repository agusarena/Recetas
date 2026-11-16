"use client";

/** Feedback mínimo y privado: sirve para recordar qué recetas funcionaron. */
import { usePreferencias } from "@/lib/use-preferencias";
import { IconoCheck, IconoCruz } from "@/components/iconos";

export function FeedbackReceta({ recetaId }: { recetaId: string }) {
  const { preferencias, hidratado, guardarFeedback } = usePreferencias();
  const valor = hidratado ? preferencias.feedback[recetaId] : undefined;

  return (
    <section className="border-t border-linea pt-5" aria-labelledby="feedback-receta">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="feedback-receta" className="font-semibold text-tinta">
            ¿Te sirvió esta receta?
          </h2>
          <p className="mt-0.5 text-xs text-humo">Queda guardado solo en este navegador.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={valor === "sirvio"}
            onClick={() => guardarFeedback(recetaId, "sirvio")}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
              valor === "sirvio"
                ? "border-verde bg-verde-tenue text-verde"
                : "border-linea bg-papel text-tinta-suave hover:border-verde hover:text-verde"
            }`}
          >
            <IconoCheck className="h-4 w-4" />
            Sí
          </button>
          <button
            type="button"
            aria-pressed={valor === "no_sirvio"}
            onClick={() => guardarFeedback(recetaId, "no_sirvio")}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
              valor === "no_sirvio"
                ? "border-tomate bg-tomate-tenue text-tomate-oscuro"
                : "border-linea bg-papel text-tinta-suave hover:border-tomate hover:text-tomate"
            }`}
          >
            <IconoCruz className="h-4 w-4" />
            No
          </button>
        </div>
      </div>
      {valor && (
        <p className="mt-3 text-sm font-medium text-verde" role="status">
          {valor === "sirvio" ? "Anotado: la volverías a cocinar." : "Anotado: la vamos a tener en cuenta."}
        </p>
      )}
    </section>
  );
}
