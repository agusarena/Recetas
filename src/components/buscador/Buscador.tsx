"use client";

/**
 * Buscador de la pantalla de inicio:
 * - input con autocompletado + chips de la heladera,
 * - restricciones/alergias sincronizadas con localStorage,
 * - filtro de tiempo máximo,
 * - "Sorprendeme" (Modo Indeciso).
 */
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EtiquetaDieta, Ingrediente } from "@/types";
import { RESTRICCIONES } from "@/lib/motor-busqueda";
import { filtrosAQuery } from "@/lib/filtros";
import { usePreferencias } from "@/lib/use-preferencias";

const OPCIONES_TIEMPO = [15, 30, 45] as const;

/** Normaliza para comparar: minúsculas y sin tildes. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function Buscador({ ingredientes }: { ingredientes: Ingrediente[] }) {
  const router = useRouter();
  const { preferencias, toggleRestriccion } = usePreferencias();

  const [consulta, setConsulta] = useState("");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [tiempoMaximo, setTiempoMaximo] = useState<number | null>(null);
  const [listaAbierta, setListaAbierta] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const porId = useMemo(
    () => new Map(ingredientes.map((i) => [i.id, i])),
    [ingredientes],
  );

  const sugerencias = useMemo(() => {
    const q = normalizar(consulta.trim());
    if (q.length === 0) return [];
    return ingredientes
      .filter((i) => !seleccionados.includes(i.id) && normalizar(i.nombre).includes(q))
      .slice(0, 8);
  }, [consulta, ingredientes, seleccionados]);

  function agregar(id: string) {
    setSeleccionados((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setConsulta("");
    setListaAbierta(false);
    inputRef.current?.focus();
  }

  function quitar(id: string) {
    setSeleccionados((prev) => prev.filter((s) => s !== id));
  }

  function irAHResultados(modoIndeciso: boolean) {
    const query = filtrosAQuery({
      ingredientes: seleccionados,
      restricciones: preferencias.restricciones,
      tiempo_maximo: tiempoMaximo,
      modo_indeciso: modoIndeciso,
      semilla: modoIndeciso ? Date.now() : undefined,
    });
    router.push(query ? `/resultados?${query}` : "/resultados");
  }

  const nombresSeleccionados = seleccionados
    .map((id) => porId.get(id)?.nombre ?? "")
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Heladera: buscador con autocompletado ─────────────────────── */}
      <section>
        <label htmlFor="buscador-ingredientes" className="mb-2 block text-sm font-semibold">
          ¿Qué tenés en la heladera?
        </label>

        {nombresSeleccionados.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2">
            {nombresSeleccionados.map((nombre, i) => (
              <li key={seleccionados[i]}>
                <button
                  type="button"
                  onClick={() => quitar(seleccionados[i])}
                  className="flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  {nombre}
                  <span aria-hidden>×</span>
                  <span className="sr-only">Quitar {nombre}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="relative">
          <input
            id="buscador-ingredientes"
            ref={inputRef}
            type="text"
            value={consulta}
            autoComplete="off"
            placeholder="Ej: huevo, papa, arroz…"
            onChange={(e) => {
              setConsulta(e.target.value);
              setListaAbierta(true);
            }}
            onFocus={() => setListaAbierta(true)}
            onBlur={() => setListaAbierta(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && sugerencias.length > 0) {
                e.preventDefault();
                agregar(sugerencias[0].id);
              }
              if (e.key === "Escape") setListaAbierta(false);
            }}
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          {listaAbierta && sugerencias.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg">
              {sugerencias.map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault() /* evita blur antes del click */}
                    onClick={() => agregar(i.id)}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-emerald-50"
                  >
                    {i.nombre}
                    <span className="ml-2 text-xs text-stone-400">{i.categoria}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          La sal, el agua, el aceite y la pimienta se asumen siempre disponibles.
        </p>
      </section>

      {/* ── Restricciones / alergias (localStorage) ────────────────────── */}
      <section>
        <span className="mb-2 block text-sm font-semibold">Restricciones y alergias</span>
        <div className="flex flex-wrap gap-2">
          {RESTRICCIONES.map(({ valor, etiqueta }) => {
            const activo = preferencias.restricciones.includes(valor);
            return (
              <button
                key={valor}
                type="button"
                aria-pressed={activo}
                onClick={() => toggleRestriccion(valor as EtiquetaDieta)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  activo
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
                }`}
              >
                {etiqueta}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          Se guardan en tu navegador: no hace falta configurarlas de nuevo.
        </p>
      </section>

      {/* ── Tiempo máximo ──────────────────────────────────────────────── */}
      <section>
        <span className="mb-2 block text-sm font-semibold">Tiempo máximo</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tiempo máximo">
          <button
            type="button"
            aria-pressed={tiempoMaximo === null}
            onClick={() => setTiempoMaximo(null)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              tiempoMaximo === null
                ? "border-stone-800 bg-stone-800 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
            }`}
          >
            Sin límite
          </button>
          {OPCIONES_TIEMPO.map((minutos) => (
            <button
              key={minutos}
              type="button"
              aria-pressed={tiempoMaximo === minutos}
              onClick={() => setTiempoMaximo(minutos)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                tiempoMaximo === minutos
                  ? "border-stone-800 bg-stone-800 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
              }`}
            >
              {minutos} min
            </button>
          ))}
        </div>
      </section>

      {/* ── Acciones ───────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => irAHResultados(false)}
          className="flex-1 rounded-lg bg-emerald-700 px-6 py-3.5 text-base font-bold text-white shadow-sm hover:bg-emerald-800"
        >
          Buscar qué puedo cocinar
        </button>
        <button
          type="button"
          onClick={() => irAHResultados(true)}
          className="rounded-lg border-2 border-amber-500 bg-amber-50 px-6 py-3.5 text-base font-bold text-amber-800 hover:bg-amber-100"
        >
          🎲 Sorprendeme
        </button>
      </section>
    </div>
  );
}
