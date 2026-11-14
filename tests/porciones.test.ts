import { describe, expect, it } from "vitest";
import {
  escalarCantidad,
  escalarMacros,
  factorPorciones,
  formatearCantidad,
  formatearMinutos,
  formatearTiempo,
  redondearCantidad,
} from "@/lib/porciones";

describe("escalado de porciones", () => {
  const factor = factorPorciones(2, 3); // 1.5

  it("calcula el factor y escala cantidades", () => {
    expect(factor).toBe(1.5);
    expect(escalarCantidad(600, factor)).toBe(900);
    expect(factorPorciones(0, 3)).toBe(1);
  });

  it("redondea según la unidad sin mostrar 0 g", () => {
    expect(redondearCantidad(105, "g")).toBe(110);
    expect(redondearCantidad(2, "g")).toBe(1);
    expect(redondearCantidad(0, "g")).toBe(0);
    expect(redondearCantidad(1.25, "unidad")).toBe(1.5);
    expect(redondearCantidad(0.2, "pizca")).toBe(1);
  });

  it("formatea cantidades con fracciones y singular/plural correctos", () => {
    expect(formatearCantidad(escalarCantidad(600, factor), "g")).toBe("900 g");
    expect(formatearCantidad(escalarCantidad(1, factor), "unidad")).toBe("1 ½ unidades");
    expect(formatearCantidad(0.5, "unidad")).toBe("½ unidad");
    expect(formatearCantidad(escalarCantidad(30, factor), "g")).toBe("45 g");
    expect(formatearCantidad(escalarCantidad(0.5, 1.5), "unidad")).toBe("1 unidad");
    expect(formatearCantidad(escalarCantidad(2, factor), "cda")).toBe("3 cdas");
    expect(formatearCantidad(escalarCantidad(1, 2), "pizca")).toBe("2 pizcas");
  });

  it("escala macros por porción", () => {
    const macros = escalarMacros(
      { calorias: 420, perfil: "x", proteinas: 16, carbohidratos: 44, grasas: 19 },
      3,
    );
    expect(macros.calorias).toBe(1260);
    expect(macros.proteinas).toBe(48);
    expect(macros.perfil).toBe("x");
  });

  it("formatea tiempos de cocina", () => {
    expect(formatearMinutos(45)).toBe("45 min");
    expect(formatearMinutos(90)).toBe("1 h 30 min");
    expect(formatearMinutos(60)).toBe("1 h");
    expect(formatearTiempo(600)).toBe("10:00");
    expect(formatearTiempo(-3)).toBe("00:00");
  });
});
