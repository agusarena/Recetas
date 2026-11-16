"use client";

/**
 * Lleva la lista de compras a donde importa: copia al portapapeles o
 * manda el texto (agrupado por sección del super) por WhatsApp con un
 * enlace `wa.me`. Sin backend ni login.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { IconoCesta, IconoCheck, IconoWhatsApp } from "@/components/iconos";
import { armarTextoLista, urlWhatsApp } from "@/lib/lista-compras";
import type { ItemLista } from "@/lib/lista-compras";

type EstadoCopia = "inicial" | "copiado" | "error";

function copiarConTextarea(texto: string): boolean {
  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  return ok;
}

export function BotonListaCompras({
  items,
  titulo,
  compacto = false,
}: {
  items: ItemLista[];
  titulo?: string;
  compacto?: boolean;
}) {
  const unicos = useMemo(
    () =>
      items.filter(
        (item, i) =>
          item.texto.trim().length > 0 &&
          items.findIndex((o) => o.id === item.id && o.seccion === item.seccion) === i,
      ),
    [items],
  );
  const [estado, setEstado] = useState<EstadoCopia>("inicial");
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  if (unicos.length === 0) return null;

  const texto = armarTextoLista(unicos, titulo);

  async function copiar() {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
        ok = true;
      } else {
        ok = copiarConTextarea(texto);
      }
    } catch {
      ok = copiarConTextarea(texto);
    }

    setEstado(ok ? "copiado" : "error");
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setEstado("inicial"), 2500);
  }

  const etiqueta =
    estado === "copiado"
      ? "¡Lista copiada!"
      : estado === "error"
        ? "No se pudo copiar"
        : compacto
          ? "Copiar lo que falta"
          : `Copiar lista (${unicos.length})`;

  const clases = compacto ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void copiar()}
        className={`inline-flex items-center gap-1.5 rounded-md border border-linea bg-papel font-semibold text-tinta-suave transition-colors hover:border-verde hover:text-verde ${clases}`}
      >
        {estado === "copiado" ? (
          <IconoCheck className="h-3.5 w-3.5 text-verde" />
        ) : (
          <IconoCesta className="h-3.5 w-3.5" />
        )}
        {etiqueta}
      </button>
      <a
        href={urlWhatsApp(texto)}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 rounded-md border border-linea bg-papel font-semibold text-tinta-suave transition-colors hover:border-verde hover:text-verde ${clases}`}
      >
        <IconoWhatsApp className="h-3.5 w-3.5" />
        WhatsApp
      </a>
      <span role="status" aria-live="polite" className="sr-only">
        {estado === "copiado" ? "Lista copiada al portapapeles" : ""}
        {estado === "error" ? "No se pudo copiar la lista" : ""}
      </span>
    </span>
  );
}
