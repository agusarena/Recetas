import { describe, expect, it } from "vitest";
import { PREFERENCIAS_DEFAULT, leerPreferencias, validarPreferencias } from "@/lib/preferencias";
import { PREFERENCIAS_VERSION } from "@/types";

describe("preferencias en localStorage", () => {
  it("devuelve el default ante datos inválidos", () => {
    expect(validarPreferencias(null)).toEqual(PREFERENCIAS_DEFAULT);
    expect(validarPreferencias("basura")).toEqual(PREFERENCIAS_DEFAULT);
    expect(validarPreferencias({})).toEqual(PREFERENCIAS_DEFAULT);
  });

  it("migra datos viejos y completa los campos nuevos", () => {
    const viejas = validarPreferencias({
      version: 1,
      restricciones: ["sin_tacc"],
      favoritos: ["receta-1"],
    });
    expect(viejas.version).toBe(PREFERENCIAS_VERSION);
    expect(viejas.restricciones).toEqual(["sin_tacc"]);
    expect(viejas.favoritos).toEqual(["receta-1"]);
    expect(viejas.heladera).toEqual([]);
    expect(viejas.sin_basicos).toEqual([]);
    expect(viejas.cocinadas).toEqual([]);
    expect(viejas.feedback).toEqual({});
    expect(viejas.ultima_busqueda).toBeNull();
  });

  it("filtra valores corruptos y elimina duplicados", () => {
    const preferencias = validarPreferencias({
      restricciones: ["sin_tacc", "sin_tacc", "inventada", 42],
      favoritos: ["a", "a", 7],
      heladera: ["huevo", "huevo", null],
      ultima_busqueda: "ingredientes=huevo",
    });
    expect(preferencias.restricciones).toEqual(["sin_tacc"]);
    expect(preferencias.favoritos).toEqual(["a"]);
    expect(preferencias.heladera).toEqual(["huevo"]);
    expect(preferencias.sin_basicos).toEqual([]);
    expect(preferencias.cocinadas).toEqual([]);
    expect(preferencias.feedback).toEqual({});
    expect(preferencias.ultima_busqueda).toBe("ingredientes=huevo");
  });

  it("normaliza una última búsqueda vacía a null", () => {
    expect(validarPreferencias({ ultima_busqueda: "   " }).ultima_busqueda).toBeNull();
    expect(validarPreferencias({ ultima_busqueda: 123 }).ultima_busqueda).toBeNull();
  });

  it("conserva historial y feedback válidos, y descarta los corruptos", () => {
    const preferencias = validarPreferencias({
      cocinadas: [
        { receta_id: "r-1", cocinada_en: "2026-01-01T12:00:00.000Z" },
        { receta_id: 7, cocinada_en: "no" },
      ],
      feedback: {
        "r-1": "sirvio",
        "r-2": "no_sirvio",
        "r-3": "quizas",
      },
    });
    expect(preferencias.cocinadas).toEqual([
      { receta_id: "r-1", cocinada_en: "2026-01-01T12:00:00.000Z" },
    ]);
    expect(preferencias.feedback).toEqual({ "r-1": "sirvio", "r-2": "no_sirvio" });
  });

  it("en el servidor devuelve el default sin tocar window", () => {
    expect(leerPreferencias()).toEqual(PREFERENCIAS_DEFAULT);
  });
});
