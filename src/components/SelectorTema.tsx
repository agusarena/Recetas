"use client";

/** Selector de tema de la página: sistema, claro u oscuro. Vive en la cabecera. */
import { IconoLuna, IconoMonitor, IconoSol } from "@/components/iconos";
import type { Tema } from "@/lib/tema";
import { useTema } from "@/lib/use-tema";

const OPCIONES: {
  valor: Tema;
  etiqueta: string;
  Icono: typeof IconoSol;
}[] = [
  { valor: "sistema", etiqueta: "Tema del sistema", Icono: IconoMonitor },
  { valor: "claro", etiqueta: "Tema claro", Icono: IconoSol },
  { valor: "oscuro", etiqueta: "Tema oscuro", Icono: IconoLuna },
];

export function SelectorTema() {
  const { tema, cambiarTema } = useTema();

  return (
    <div
      role="group"
      aria-label="Tema de la página"
      className="inline-flex items-center gap-0.5 rounded-lg border border-linea bg-crema p-0.5"
    >
      {OPCIONES.map(({ valor, etiqueta, Icono }) => {
        const activa = tema === valor;
        return (
          <button
            key={valor}
            type="button"
            aria-pressed={activa}
            title={etiqueta}
            onClick={() => cambiarTema(valor)}
            className={`inline-flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
              activa ? "bg-papel text-verde shadow-sm" : "text-humo hover:text-tinta"
            }`}
          >
            <Icono className="h-4 w-4" />
            <span className="sr-only">{etiqueta}</span>
          </button>
        );
      })}
    </div>
  );
}
