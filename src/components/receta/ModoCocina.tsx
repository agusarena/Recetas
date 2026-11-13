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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-24">
      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <header className="mb-5">
        <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← Volver a la heladera
        </Link>

        <div className="mt-3 flex gap-4">
          <PlaceholderImagen
            titulo={receta.titulo}
            url={receta.imagen_url}
            className="h-20 w-20 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-3xl">
                {receta.titulo}
              </h1>
              <BotonFavorito recetaId={receta.id} />
            </div>
            <p className="mt-1 text-sm text-stone-600">{receta.descripcion_corta}</p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              ⏱ {formatearMinutos(receta.tiempo_minutos)} ·{" "}
              {receta.dificultad === "cero_cocina" ? "Cero cocina" : "Fácil"}
            </p>
          </div>
        </div>
      </header>

      {/* ── Ajustador de porciones ─────────────────────────────────────── */}
      <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <div>
          <span className="block text-sm font-semibold">Porciones</span>
          <span className="text-xs text-stone-500">
            Recalcula ingredientes y macros automáticamente
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Una porción menos"
            onClick={() => setPorciones((p) => Math.max(1, p - 1))}
            disabled={porciones <= 1}
            className="h-10 w-10 rounded-lg border border-stone-300 bg-white text-xl font-bold text-stone-700 hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-40"
          >
            −
          </button>
          <span className="w-8 text-center text-xl font-bold tabular-nums">{porciones}</span>
          <button
            type="button"
            aria-label="Una porción más"
            onClick={() => setPorciones((p) => Math.min(PORCION_MAXIMA, p + 1))}
            disabled={porciones >= PORCION_MAXIMA}
            className="h-10 w-10 rounded-lg border border-stone-300 bg-white text-xl font-bold text-stone-700 hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-40"
          >
            +
          </button>
        </div>
      </section>

      {/* ── Ingredientes ───────────────────────────────────────────────── */}
      <section className="mb-5 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-bold text-stone-900">Ingredientes</h2>
        <ul className="divide-y divide-stone-100">
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
      <section className="mb-5 rounded-xl border border-stone-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Paso a paso</h2>
          {pasos.length > 0 && (
            <span className="text-xs font-medium text-stone-500">
              {hechoPasos.size}/{pasos.length} pasos · {progresoPasos}%
            </span>
          )}
        </div>
        <ol className="space-y-3">
          {pasos.map((paso) => (
            <li
              key={paso.orden}
              className={`flex items-start gap-3 rounded-lg p-2 ${
                hechoPasos.has(paso.orden) ? "bg-emerald-50" : ""
              }`}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={hechoPasos.has(paso.orden)}
                aria-label={`Marcar paso ${paso.orden}`}
                onClick={() => togglePaso(paso.orden)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  hechoPasos.has(paso.orden)
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-stone-300 bg-white text-transparent hover:border-emerald-500"
                }`}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm leading-relaxed ${
                    hechoPasos.has(paso.orden) ? "text-stone-400 line-through" : "text-stone-800"
                  }`}
                >
                  <span className="mr-1 font-bold">{paso.orden}.</span>
                  {paso.texto}
                </p>
                {paso.tiempo_segundos !== null && (
                  <button
                    type="button"
                    onClick={() =>
                      iniciar(`Paso ${paso.orden} — ${receta.titulo}`, paso.tiempo_segundos as number)
                    }
                    className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    ⏱ Cronómetro de {formatearTiempo(paso.tiempo_segundos)}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Tip para principiantes ─────────────────────────────────────── */}
      {receta.tip_principiante && (
        <section className="mb-5 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <h2 className="mb-1 text-sm font-bold text-sky-900">💡 Tip de principiante</h2>
          <p className="text-sm leading-relaxed text-sky-900">{receta.tip_principiante}</p>
        </section>
      )}

      {/* ── Macros ─────────────────────────────────────────────────────── */}
      <section className="mb-5 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-2 text-lg font-bold text-stone-900">Valores orientativos</h2>
        <div className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
          <DatoMacro etiqueta="kcal" valor={macrosTotales.calorias} />
          <DatoMacro etiqueta="g proteínas" valor={macrosTotales.proteinas} />
          <DatoMacro etiqueta="g carbohidratos" valor={macrosTotales.carbohidratos} />
          <DatoMacro etiqueta="g grasas" valor={macrosTotales.grasas} />
        </div>
        <p className="mt-2 text-center text-xs text-stone-500">
          Perfil: {receta.macros_generales.perfil || "—"} · para {porciones}{" "}
          {porciones === 1 ? "porción" : "porciones"}
        </p>
      </section>

      <DisclaimerNutricional />
    </main>
  );
}

function DatoMacro({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="rounded-lg bg-stone-50 p-2">
      <span className="block text-xl font-bold tabular-nums text-stone-900">{valor}</span>
      <span className="text-xs text-stone-500">{etiqueta}</span>
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
    <li className="flex items-start gap-3 py-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={hecha}
        aria-label={`Marcar ${ri.ingrediente.nombre}`}
        onClick={onToggle}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs font-bold ${
          hecha
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-stone-300 bg-white text-transparent hover:border-emerald-500"
        }`}
      >
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${hecha ? "text-stone-400 line-through" : "text-stone-800"}`}>
          <span className="font-semibold">{ri.ingrediente.nombre}</span>
          <span className="ml-2 font-mono text-stone-700">
            {formatearCantidad(cantidadEscalada, ri.unidad)}
          </span>
          {ri.ingrediente.es_basico && (
            <span className="ml-2 rounded bg-stone-100 px-1.5 py-0.5 text-[11px] font-medium text-stone-500">
              ya lo tenés siempre
            </span>
          )}
          {ri.es_opcional && (
            <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-[11px] font-medium text-sky-700">
              opcional
            </span>
          )}
        </p>
        {ri.texto_principiante && (
          <p className="mt-0.5 text-xs text-stone-500">{ri.texto_principiante}</p>
        )}
        {ri.reemplazo_sugerido && (
          <p className="mt-0.5 text-xs text-emerald-700">
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
