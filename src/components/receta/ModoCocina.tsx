"use client";

/**
 * Modo Cocina (Pantalla 3).
 * Client Component porque todo acá es interactivo: ajuste de porciones,
 * checkboxes de ingredientes y pasos, y arranque de cronómetros por paso.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import type { RecetaConIngredientes, RecetaIngredienteConDetalle, Timer } from "@/types";
import {
  escalarCantidad,
  escalarMacros,
  factorPorciones,
  formatearCantidad,
  formatearMinutos,
  formatearTiempo,
} from "@/lib/porciones";
import { useTimers } from "@/components/timers/TimerProvider";
import { BotonFavorito } from "@/components/BotonFavorito";
import { PlaceholderImagen } from "@/components/PlaceholderImagen";
import { DisclaimerNutricional } from "@/components/Disclaimer";
import {
  IconoCheck,
  IconoChispa,
  IconoFlechaIzquierda,
  IconoReloj,
} from "@/components/iconos";

const PORCION_MAXIMA = 12;

export function ModoCocina({ receta }: { receta: RecetaConIngredientes }) {
  const { iniciar } = useTimers();
  const [porciones, setPorciones] = useState(receta.porciones_base);
  const [hechoIngredientes, setHechoIngredientes] = useState<Set<string>>(new Set());
  const [hechoPasos, setHechoPasos] = useState<Set<number>>(new Set());

  const factor = factorPorciones(receta.porciones_base, porciones);
  const macrosTotales = useMemo(
    () => escalarMacros(receta.macros_generales, porciones),
    [receta.macros_generales, porciones],
  );

  function toggleIngrediente(id: string) {
    setHechoIngredientes((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }

  function togglePaso(orden: number) {
    setHechoPasos((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(orden)) siguiente.delete(orden);
      else siguiente.add(orden);
      return siguiente;
    });
  }

  const pasos = [...receta.pasos].sort((a, b) => a.orden - b.orden);
  const progresoPasos = pasos.length > 0 ? Math.round((hechoPasos.size / pasos.length) * 100) : 0;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-8">
      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <header className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-verde hover:underline"
        >
          <IconoFlechaIzquierda className="h-4 w-4" />
          Volver a la heladera
        </Link>

        <div className="mt-4 flex gap-4">
          <PlaceholderImagen
            titulo={receta.titulo}
            url={receta.imagen_url}
            className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-tinta sm:text-4xl">
                {receta.titulo}
              </h1>
              <BotonFavorito recetaId={receta.id} />
            </div>
            <p className="mt-1 text-sm text-tinta-suave">{receta.descripcion_corta}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-humo">
              <span className="inline-flex items-center gap-1.5">
                <IconoReloj className="h-3.5 w-3.5" />
                {formatearMinutos(receta.tiempo_minutos)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconoChispa className="h-3.5 w-3.5" />
                {receta.dificultad === "cero_cocina" ? "Cero cocina" : "Fácil"}
              </span>
            </p>
          </div>
        </div>
      </header>

      {/* ── Ajustador de porciones ─────────────────────────────────────── */}
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-linea py-4">
        <div>
          <span className="block font-semibold text-tinta">Porciones</span>
          <span className="text-xs text-humo">
            Recalcula ingredientes y macros automáticamente
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Una porción menos"
            onClick={() => setPorciones((p) => Math.max(1, p - 1))}
            disabled={porciones <= 1}
            className="h-10 w-10 rounded-lg border border-linea bg-papel text-xl font-semibold text-tinta transition-colors hover:border-verde hover:text-verde disabled:opacity-40 disabled:hover:border-linea disabled:hover:text-tinta"
          >
            −
          </button>
          <span className="w-8 text-center font-display text-2xl font-semibold tabular-nums text-tinta">
            {porciones}
          </span>
          <button
            type="button"
            aria-label="Una porción más"
            onClick={() => setPorciones((p) => Math.min(PORCION_MAXIMA, p + 1))}
            disabled={porciones >= PORCION_MAXIMA}
            className="h-10 w-10 rounded-lg border border-linea bg-papel text-xl font-semibold text-tinta transition-colors hover:border-verde hover:text-verde disabled:opacity-40 disabled:hover:border-linea disabled:hover:text-tinta"
          >
            +
          </button>
        </div>
      </section>

      {/* ── Ingredientes ───────────────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="mb-3 font-display text-xl font-semibold text-tinta">Ingredientes</h2>
        <ul className="divide-y divide-linea border-y border-linea">
          {receta.ingredientes
            .slice()
            .sort(
              (a, b) =>
                Number(a.ingrediente.es_basico) - Number(b.ingrediente.es_basico) ||
                Number(b.es_opcional) - Number(a.es_opcional),
            )
            .map((ri) => (
              <FilaIngrediente
                key={ri.ingrediente_id}
                ri={ri}
                factor={factor}
                hecha={hechoIngredientes.has(ri.ingrediente_id)}
                onToggle={() => toggleIngrediente(ri.ingrediente_id)}
              />
            ))}
        </ul>
      </section>

      {/* ── Paso a paso ────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-tinta">Paso a paso</h2>
          {pasos.length > 0 && (
            <span className="text-xs font-medium text-humo">
              {hechoPasos.size} de {pasos.length} pasos ({progresoPasos}%)
            </span>
          )}
        </div>
        <ol className="space-y-3">
          {pasos.map((paso) => (
            <li
              key={paso.orden}
              className={`flex items-start gap-3 rounded-lg p-2 transition-colors ${
                hechoPasos.has(paso.orden) ? "bg-verde-tenue" : ""
              }`}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={hechoPasos.has(paso.orden)}
                aria-label={`Marcar paso ${paso.orden}`}
                onClick={() => togglePaso(paso.orden)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  hechoPasos.has(paso.orden)
                    ? "border-verde bg-verde text-papel"
                    : "border-linea bg-papel text-transparent hover:border-verde"
                }`}
              >
                <IconoCheck className="h-3 w-3" />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm leading-relaxed ${
                    hechoPasos.has(paso.orden) ? "text-humo line-through" : "text-tinta"
                  }`}
                >
                  <span className="mr-1 font-semibold">{paso.orden}.</span>
                  {paso.texto}
                </p>
                {paso.tiempo_segundos !== null && (
                  <button
                    type="button"
                    onClick={() =>
                      iniciar(`Paso ${paso.orden} — ${receta.titulo}`, paso.tiempo_segundos as number)
                    }
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-tomate bg-papel px-3 py-1 text-xs font-semibold text-tomate transition-colors hover:bg-tomate-tenue"
                  >
                    <IconoReloj className="h-3.5 w-3.5" />
                    Cronómetro de {formatearTiempo(paso.tiempo_segundos)}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Tip para principiantes ─────────────────────────────────────── */}
      {receta.tip_principiante && (
        <section className="mb-6 border-l-2 border-verde bg-verde-tenue py-3 pl-4 pr-3">
          <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-verde">
            <IconoChispa className="h-4 w-4" />
            Tip de principiante
          </h2>
          <p className="text-sm leading-relaxed text-tinta">{receta.tip_principiante}</p>
        </section>
      )}

      {/* ── Macros ─────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="mb-3 font-display text-xl font-semibold text-tinta">Valores orientativos</h2>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-linea bg-linea text-center text-sm sm:grid-cols-4">
          <DatoMacro etiqueta="kcal" valor={macrosTotales.calorias} />
          <DatoMacro etiqueta="g proteínas" valor={macrosTotales.proteinas} />
          <DatoMacro etiqueta="g carbohidratos" valor={macrosTotales.carbohidratos} />
          <DatoMacro etiqueta="g grasas" valor={macrosTotales.grasas} />
        </div>
        <p className="mt-2 text-xs text-humo">
          Perfil: {receta.macros_generales.perfil || "—"}, para {porciones}{" "}
          {porciones === 1 ? "porción" : "porciones"}
        </p>
      </section>

      <DisclaimerNutricional />
    </main>
  );
}

function DatoMacro({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="bg-papel p-3">
      <span className="block font-display text-2xl font-semibold tabular-nums text-tinta">
        {valor}
      </span>
      <span className="text-xs text-humo">{etiqueta}</span>
    </div>
  );
}

function FilaIngrediente({
  ri,
  factor,
  hecha,
  onToggle,
}: {
  ri: RecetaIngredienteConDetalle;
  factor: number;
  hecha: boolean;
  onToggle: () => void;
}) {
  const cantidadEscalada = escalarCantidad(ri.cantidad_base, factor);

  return (
    <li className="flex items-start gap-3 py-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={hecha}
        aria-label={`Marcar ${ri.ingrediente.nombre}`}
        onClick={onToggle}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          hecha
            ? "border-verde bg-verde text-papel"
            : "border-linea bg-papel text-transparent hover:border-verde"
        }`}
      >
        <IconoCheck className="h-2.5 w-2.5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-relaxed ${hecha ? "text-humo line-through" : "text-tinta"}`}>
          <span className="font-semibold">{ri.ingrediente.nombre}</span>{" "}
          <span className="font-semibold tabular-nums text-tinta-suave">
            {formatearCantidad(cantidadEscalada, ri.unidad)}
          </span>
          {ri.ingrediente.es_basico && (
            <span className="ml-2 rounded bg-crema px-1.5 py-0.5 text-[11px] font-medium text-humo">
              ya lo tenés siempre
            </span>
          )}
          {ri.es_opcional && (
            <span className="ml-2 rounded bg-verde-tenue px-1.5 py-0.5 text-[11px] font-medium text-verde">
              opcional
            </span>
          )}
        </p>
        {ri.texto_principiante && (
          <p className="mt-0.5 text-xs text-humo">{ri.texto_principiante}</p>
        )}
        {ri.reemplazo_sugerido && (
          <p className="mt-0.5 text-xs text-verde">
            Si no tenés, sirve: <strong>{ri.reemplazo_sugerido}</strong>
          </p>
        )}
      </div>
    </li>
  );
}

/** Exportado para pruebas: cómo se ve un timer en la UI (formato compartido). */
export function etiquetaTimerPaso(paso: number, recetaTitulo: string): Timer["etiqueta"] {
  return `Paso ${paso} — ${recetaTitulo}`;
}
