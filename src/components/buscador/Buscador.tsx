"use client";

/**
 * Buscador de la pantalla de inicio:
 * - input con autocompletado navegable por teclado (combobox ARIA) + chips,
 * - restricciones/alergias y heladera sincronizadas con localStorage,
 * - filtro de tiempo máximo,
 * - "Sorprendeme" (Modo Indeciso).
 */
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EtiquetaDieta, Ingrediente } from "@/types";
import { RESTRICCIONES } from "@/lib/motor-busqueda";
import { buscarPorTexto } from "@/lib/alias";
import { filtrosAQuery } from "@/lib/filtros";
import { usePreferencias } from "@/lib/use-preferencias";
import { IconoCruz, IconoDado } from "@/components/iconos";

const OPCIONES_TIEMPO = [15, 30, 45] as const;

const CHIP_BASE =
  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors";
const CHIP_ACTIVO = "border-verde bg-verde text-papel";
const CHIP_INACTIVO =
  "border-linea bg-papel text-tinta hover:border-verde hover:text-verde";

export function Buscador({ ingredientes }: { ingredientes: Ingrediente[] }) {
  const router = useRouter();
  const {
    preferencias,
    toggleRestriccion,
    setHeladera,
    toggleSinBasico,
    guardarUltimaBusqueda,
  } = usePreferencias();

  const [consulta, setConsulta] = useState("");
  const [tiempoMaximo, setTiempoMaximo] = useState<number | null>(null);
  const [listaAbierta, setListaAbierta] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const porId = useMemo(
    () => new Map(ingredientes.map((i) => [i.id, i])),
    [ingredientes],
  );

  // Básicos del catálogo (sal, aceite, orégano…): se muestran como "lo que
  // siempre tenés" y se pueden desmarcar si no los tenés.
  const basicos = useMemo(() => ingredientes.filter((i) => i.es_basico), [ingredientes]);

  // La heladera vive en las preferencias (localStorage). Filtramos IDs que ya
  // no existen en el catálogo sin duplicar estado: una sola fuente de verdad.
  const seleccionados = useMemo(
    () => preferencias.heladera.filter((id) => porId.has(id)),
    [preferencias.heladera, porId],
  );

  const sugerencias = useMemo(() => {
    if (consulta.trim().length === 0) return [];
    return buscarPorTexto(consulta, ingredientes).filter(
      (c) => !seleccionados.includes(c.ingrediente.id),
    );
  }, [consulta, ingredientes, seleccionados]);

  function agregar(id: string) {
    if (!seleccionados.includes(id)) setHeladera([...seleccionados, id]);
    setConsulta("");
    setListaAbierta(false);
    setIndiceActivo(-1);
    inputRef.current?.focus();
  }

  function quitar(id: string) {
    setHeladera(seleccionados.filter((s) => s !== id));
  }

  function moverIndice(delta: number) {
    setListaAbierta(true);
    if (sugerencias.length === 0) return;
    setIndiceActivo((prev) => {
      const siguiente = prev + delta;
      if (siguiente < 0) return sugerencias.length - 1;
      if (siguiente >= sugerencias.length) return 0;
      return siguiente;
    });
  }

  function irAHResultados(modoIndeciso: boolean) {
    const query = filtrosAQuery({
      ingredientes: seleccionados,
      restricciones: preferencias.restricciones,
      tiempo_maximo: tiempoMaximo,
      sin_basicos: preferencias.sin_basicos,
      modo_indeciso: modoIndeciso,
      semilla: modoIndeciso ? Date.now() : undefined,
    });
    guardarUltimaBusqueda(query || null);
    router.push(query ? `/resultados?${query}` : "/resultados");
  }

  const nombresSeleccionados = seleccionados
    .map((id) => porId.get(id)?.nombre ?? "")
    .filter(Boolean);

  const indiceValido = indiceActivo >= 0 && indiceActivo < sugerencias.length;
  const idActivo = indiceValido
    ? `sugerencia-${sugerencias[indiceActivo].ingrediente.id}`
    : undefined;

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
            role="combobox"
            aria-expanded={listaAbierta && sugerencias.length > 0}
            aria-controls="sugerencias-heladera"
            aria-autocomplete="list"
            aria-activedescendant={idActivo}
            value={consulta}
            autoComplete="off"
            placeholder="Ej: huevo, papa, arroz…"
            onChange={(e) => {
              setConsulta(e.target.value);
              setListaAbierta(true);
              setIndiceActivo(e.target.value.trim() ? 0 : -1);
            }}
            onFocus={() => setListaAbierta(true)}
            onBlur={() => {
              setListaAbierta(false);
              setIndiceActivo(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                moverIndice(1);
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                moverIndice(-1);
              }
              if (e.key === "Enter") {
                e.preventDefault();
                if (listaAbierta && sugerencias.length > 0) {
                  const elegido = sugerencias[indiceValido ? indiceActivo : 0];
                  agregar(elegido.ingrediente.id);
                } else if (seleccionados.length > 0) {
                  irAHResultados(false);
                }
              }
              if (e.key === "Escape") {
                setListaAbierta(false);
                setIndiceActivo(-1);
              }
            }}
            className="w-full rounded-lg border border-linea bg-papel px-4 py-3.5 text-lg text-tinta outline-none transition-colors placeholder:text-humo focus:border-verde"
          />
          {listaAbierta && sugerencias.length > 0 && (
            <ul
              id="sugerencias-heladera"
              role="listbox"
              aria-label="Sugerencias de ingredientes"
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-linea bg-papel shadow-lg"
            >
              {sugerencias.map((c, indice) => (
                <li
                  key={c.ingrediente.id}
                  id={`sugerencia-${c.ingrediente.id}`}
                  role="option"
                  aria-selected={indice === indiceActivo}
                  onMouseDown={(e) => e.preventDefault() /* evita blur antes del click */}
                  onMouseEnter={() => setIndiceActivo(indice)}
                  onClick={() => agregar(c.ingrediente.id)}
                  className={`cursor-pointer px-4 py-2.5 text-sm text-tinta transition-colors ${
                    indice === indiceActivo ? "bg-crema" : "hover:bg-crema"
                  }`}
                >
                  {c.ingrediente.nombre}
                  {c.porAlias && (
                    <span className="ml-2 text-xs text-verde">también «{consulta.trim()}»</span>
                  )}
                  <span className="ml-2 text-xs text-humo">{c.ingrediente.categoria}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-2 text-xs text-humo">
          Buscá por lo que tengas: si escribís «fresa», «maíz» o «churrasco»
          te lo traducimos a frutillas, choclo y bifes. Tu heladera queda
          guardada en este navegador.
        </p>
      </section>

      {/* ── Lo que siempre tenés (básicos configurables) ───────────────── */}
      <section>
        <span className="mb-2 block text-base font-semibold text-tinta">
          Lo que siempre tenés
        </span>
        <div className="flex flex-wrap gap-2">
          {basicos.map((basico) => {
            const tenes = !preferencias.sin_basicos.includes(basico.id);
            return (
              <button
                key={basico.id}
                type="button"
                aria-pressed={tenes}
                onClick={() => toggleSinBasico(basico.id)}
                className={`${CHIP_BASE} ${tenes ? CHIP_ACTIVO : CHIP_INACTIVO}`}
              >
                {basico.nombre}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-humo">
          Sal, agua, aceite y especias se asumen siempre disponibles. Si no
          tenés alguno, destapalo: va a aparecer en la lista de compras.
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
