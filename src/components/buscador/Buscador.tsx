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
import { IconoCruz, IconoDado } from "@/components/iconos";

const OPCIONES_TIEMPO = [15, 30, 45] as const;

/** Normaliza para comparar: minúsculas y sin tildes. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

const CHIP_BASE =
  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors";
const CHIP_ACTIVO = "border-verde bg-verde text-papel";
const CHIP_INACTIVO =
  "border-linea bg-papel text-tinta hover:border-verde hover:text-verde";

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
    <div className="flex flex-col gap-7">
      {/* ── Heladera: buscador con autocompletado ─────────────────────── */}
      <section>
        <label htmlFor="buscador-ingredientes" className="mb-2 block text-base font-semibold text-tinta">
          ¿Qué tenés en la heladera?
        </label>

        {nombresSeleccionados.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-2">
            {nombresSeleccionados.map((nombre, i) => (
              <li key={seleccionados[i]}>
                <button
                  type="button"
                  onClick={() => quitar(seleccionados[i])}
                  className="flex items-center gap-1.5 rounded-md bg-verde px-2.5 py-1 text-sm font-medium text-papel transition-colors hover:bg-verde-oscuro"
                >
                  {nombre}
                  <IconoCruz className="h-3.5 w-3.5 opacity-80" />
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
            className="w-full rounded-lg border border-linea bg-papel px-4 py-3.5 text-lg text-tinta outline-none transition-colors placeholder:text-humo focus:border-verde"
          />
          {listaAbierta && sugerencias.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-linea bg-papel shadow-lg">
              {sugerencias.map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault() /* evita blur antes del click */}
                    onClick={() => agregar(i.id)}
                    className="block w-full px-4 py-2.5 text-left text-sm text-tinta transition-colors hover:bg-crema"
                  >
                    {i.nombre}
                    <span className="ml-2 text-xs text-humo">{i.categoria}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-2 text-xs text-humo">
          La sal, el agua, el aceite y la pimienta se asumen siempre disponibles.
        </p>
      </section>

      {/* ── Restricciones / alergias (localStorage) ────────────────────── */}
      <section>
        <span className="mb-2 block text-base font-semibold text-tinta">Restricciones y alergias</span>
        <div className="flex flex-wrap gap-2">
          {RESTRICCIONES.map(({ valor, etiqueta }) => {
            const activo = preferencias.restricciones.includes(valor);
            return (
              <button
                key={valor}
                type="button"
                aria-pressed={activo}
                onClick={() => toggleRestriccion(valor as EtiquetaDieta)}
                className={`${CHIP_BASE} ${activo ? CHIP_ACTIVO : CHIP_INACTIVO}`}
              >
                {etiqueta}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-humo">
          Se guardan en tu navegador: no hace falta configurarlas de nuevo.
        </p>
      </section>

      {/* ── Tiempo máximo ──────────────────────────────────────────────── */}
      <section>
        <span className="mb-2 block text-base font-semibold text-tinta">Tiempo máximo</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Tiempo máximo">
          <button
            type="button"
            aria-pressed={tiempoMaximo === null}
            onClick={() => setTiempoMaximo(null)}
            className={`${CHIP_BASE} ${tiempoMaximo === null ? CHIP_ACTIVO : CHIP_INACTIVO}`}
          >
            Sin límite
          </button>
          {OPCIONES_TIEMPO.map((minutos) => (
            <button
              key={minutos}
              type="button"
              aria-pressed={tiempoMaximo === minutos}
              onClick={() => setTiempoMaximo(minutos)}
              className={`${CHIP_BASE} ${tiempoMaximo === minutos ? CHIP_ACTIVO : CHIP_INACTIVO}`}
            >
              {minutos} min
            </button>
          ))}
        </div>
      </section>

      {/* ── Acciones ───────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 border-t border-linea pt-6 sm:flex-row">
        <button
          type="button"
          onClick={() => irAHResultados(false)}
          className="flex-1 rounded-lg bg-verde px-6 py-3.5 text-base font-semibold text-papel transition-colors hover:bg-verde-oscuro"
        >
          Buscar qué puedo cocinar
        </button>
        <button
          type="button"
          onClick={() => irAHResultados(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-tomate bg-papel px-6 py-3.5 text-base font-semibold text-tomate transition-colors hover:bg-tomate-tenue"
        >
          <IconoDado className="h-5 w-5" />
          Sorprendeme
        </button>
      </section>
    </div>
  );
}
