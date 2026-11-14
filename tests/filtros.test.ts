import { describe, expect, it } from "vitest";
import { filtrosAQuery, validarFiltros } from "@/lib/filtros";

describe("validación de filtros", () => {
  it("normaliza ingredientes y descarta valores inválidos", () => {
    const filtros = validarFiltros(
      new URLSearchParams({
        ingredientes: " huevo, papa ,, ",
        restricciones: "sin_tacc,mentira,vegano",
        tiempo: "30",
      }),
    );
    expect(filtros.ingredientes).toEqual(["huevo", "papa"]);
    expect(filtros.restricciones).toEqual(["sin_tacc", "vegano"]);
    expect(filtros.tiempo_maximo).toBe(30);
  });

  it("ignora tiempos inválidos y limita valores absurdos", () => {
    expect(validarFiltros(new URLSearchParams()).tiempo_maximo).toBeNull();
    expect(validarFiltros(new URLSearchParams({ tiempo: "0" })).tiempo_maximo).toBeNull();
    expect(validarFiltros(new URLSearchParams({ tiempo: "-5" })).tiempo_maximo).toBeNull();
    expect(validarFiltros(new URLSearchParams({ tiempo: "999999" })).tiempo_maximo).toBe(240);
  });

  it("detecta el modo indeciso y la semilla", () => {
    const filtros = validarFiltros(
      new URLSearchParams({ modo: "indeciso", semilla: "123", tiempo: "abc" }),
    );
    expect(filtros.modo_indeciso).toBe(true);
    expect(filtros.semilla).toBe(123);
    expect(filtros.tiempo_maximo).toBeNull();
  });

  it("serializa solo los filtros presentes", () => {
    expect(
      filtrosAQuery({
        ingredientes: ["huevo", "papa"],
        restricciones: ["sin_tacc"],
        tiempo_maximo: 30,
        modo_indeciso: false,
      }),
    ).toBe("ingredientes=huevo%2Cpapa&restricciones=sin_tacc&tiempo=30");

    expect(
      filtrosAQuery({
        ingredientes: [],
        restricciones: [],
        tiempo_maximo: null,
        modo_indeciso: true,
        semilla: 42,
      }),
    ).toBe("modo=indeciso&semilla=42");
  });
});
