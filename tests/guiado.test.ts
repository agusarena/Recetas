import { describe, expect, it } from "vitest";
import { primerPasoPendiente } from "../src/lib/guiado";
import type { Paso } from "../src/types";

const pasos: Paso[] = [1, 2, 3].map((orden) => ({
  orden,
  texto: `Paso ${orden}`,
  tiempo_segundos: null,
}));

describe("primerPasoPendiente", () => {
  it("arranca en el primer paso si no hay nada completado", () => {
    expect(primerPasoPendiente(pasos, new Set())).toBe(0);
  });

  it("retoma en el primer paso sin completar, aunque haya pasos posteriores hechos", () => {
    expect(primerPasoPendiente(pasos, new Set([1, 3]))).toBe(1);
  });

  it("devuelve la cantidad de pasos cuando la receta está terminada", () => {
    expect(primerPasoPendiente(pasos, new Set([1, 2, 3]))).toBe(pasos.length);
  });
});
