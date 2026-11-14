import { describe, expect, it } from "vitest";
import type { Timer } from "@/types";
import {
  avanzarTimer,
  crearTimer,
  normalizarTimers,
  pausarTimer,
  reanudarTimer,
  reconciliarTimers,
} from "@/lib/timers";

function timer(extra: Partial<Timer> = {}): Timer {
  return {
    id: "t1",
    etiqueta: "Paso 1",
    duracion_segundos: 60,
    restante_segundos: 60,
    estado: "corriendo",
    termina_en: 61_000,
    ...extra,
  };
}

describe("cronómetros", () => {
  it("crea un timer con deadline exacto", () => {
    const creado = crearTimer("Paso 1", 60, 1_000, "t1");
    expect(creado.termina_en).toBe(61_000);
    expect(creado.restante_segundos).toBe(60);
    expect(creado.estado).toBe("corriendo");
  });

  it("recalcula el restante desde el reloj aunque el tick se atrase", () => {
    expect(avanzarTimer(timer(), 31_000).restante_segundos).toBe(30);
    expect(avanzarTimer(timer(), 60_500).restante_segundos).toBe(1);
  });

  it("termina al llegar al deadline y no vuelve atrás", () => {
    const terminado = avanzarTimer(timer(), 61_000);
    expect(terminado.estado).toBe("terminado");
    expect(terminado.restante_segundos).toBe(0);
    expect(terminado.termina_en).toBeNull();
    expect(avanzarTimer(terminado, 99_000)).toEqual(terminado);
  });

  it("pausa congelando el restante y reanuda con un deadline nuevo", () => {
    const pausado = pausarTimer(timer(), 31_000);
    expect(pausado.estado).toBe("pausado");
    expect(pausado.restante_segundos).toBe(30);
    expect(pausado.termina_en).toBeNull();
    expect(avanzarTimer(pausado, 50_000)).toEqual(pausado);

    const reanudado = reanudarTimer(pausado, 40_000);
    expect(reanudado.estado).toBe("corriendo");
    expect(reanudado.termina_en).toBe(70_000);
  });

  it("si pausás justo cuando terminó, queda terminado", () => {
    const pausado = pausarTimer(timer(), 70_000);
    expect(pausado.estado).toBe("terminado");
    expect(pausado.restante_segundos).toBe(0);
  });

  it("reconcilia timers persistidos al recargar", () => {
    const guardados = [timer({ termina_en: 5_000 }), timer({ id: "t2", estado: "pausado", termina_en: null })];
    const reconciliados = reconciliarTimers(guardados, 6_000);
    expect(reconciliados[0].estado).toBe("terminado");
    expect(reconciliados[1].estado).toBe("pausado");
  });

  it("reconstruye un timer corriendo sin deadline", () => {
    const [reconstruido] = reconciliarTimers([timer({ termina_en: null })], 1_000);
    expect(reconstruido.estado).toBe("corriendo");
    expect(reconstruido.termina_en).toBe(61_000);
  });

  it("descarta datos corruptos de localStorage", () => {
    expect(normalizarTimers(null)).toEqual([]);
    expect(
      normalizarTimers([
        { id: "ok", etiqueta: "Paso", duracion_segundos: 60, restante_segundos: 30, estado: "pausado", termina_en: null },
        { id: "", etiqueta: "sin id" },
        { id: "malo", etiqueta: "estado raro", duracion_segundos: 60, restante_segundos: 60, estado: "volando" },
        "basura",
      ]),
    ).toEqual([
      { id: "ok", etiqueta: "Paso", duracion_segundos: 60, restante_segundos: 30, estado: "pausado", termina_en: null },
    ]);
  });
});
