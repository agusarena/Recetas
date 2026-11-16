import { describe, expect, it } from "vitest";
import { leerSemilla } from "../scripts/parse-seed";

describe("seed.sql", () => {
  const semilla = leerSemilla();
  const idsIngredientes = new Set(semilla.ingredientes.map((i) => i.id));
  const idsRecetas = new Set(semilla.recetas.map((r) => r.id));

  it("parsea el catálogo completo", () => {
    expect(semilla.ingredientes).toHaveLength(68);
    expect(semilla.recetas).toHaveLength(100);
    expect(semilla.relaciones.length).toBeGreaterThanOrEqual(360);
  });

  it("cada receta tiene al menos un protagonista, y es obligatorio", () => {
    for (const receta of semilla.recetas) {
      const principales = receta.ingredientes.filter((ri) => ri.es_principal);
      expect(principales.length, receta.titulo).toBeGreaterThan(0);
      for (const ri of principales) {
        expect(ri.es_opcional, receta.titulo).toBe(false);
      }
    }
  });

  it("no tiene relaciones huérfanas ni recetas vacías", () => {
    for (const relacion of semilla.relaciones) {
      expect(idsRecetas.has(relacion.receta_id)).toBe(true);
      expect(idsIngredientes.has(relacion.ingrediente_id)).toBe(true);
    }
    for (const receta of semilla.recetas) {
      expect(receta.ingredientes.length).toBeGreaterThan(0);
      expect(receta.macros_generales.calorias).toBeGreaterThan(0);
    }
  });

  it("no duplica pares receta-ingrediente", () => {
    const pares = new Set<string>();
    for (const relacion of semilla.relaciones) {
      const clave = `${relacion.receta_id}:${relacion.ingrediente_id}`;
      expect(pares.has(clave)).toBe(false);
      pares.add(clave);
    }
  });

  it("vincula los reemplazos con ingredientes reales", () => {
    const conReemplazo = semilla.relaciones.filter((r) => r.reemplazo_ingrediente_id);
    expect(conReemplazo.length).toBeGreaterThanOrEqual(15);

    for (const relacion of conReemplazo) {
      expect(idsIngredientes.has(relacion.reemplazo_ingrediente_id as string)).toBe(true);
      expect(relacion.reemplazo_sugerido).toBeTruthy();
      expect(relacion.reemplazo_ingrediente_id).not.toBe(relacion.ingrediente_id);
    }
  });

  it("los básicos no declaran alérgenos", () => {
    for (const ingrediente of semilla.ingredientes.filter((i) => i.es_basico)) {
      expect(ingrediente.alergenos).toEqual([]);
    }
  });

  it("declara categoría salado/dulce en todas las recetas", () => {
    const dulces = semilla.recetas.filter((r) => r.categoria === "dulce").map((r) => r.titulo);
    expect(dulces.length).toBeGreaterThanOrEqual(6);
    expect(dulces.some((t) => t.toLowerCase().includes("postre"))).toBe(true);
    for (const receta of semilla.recetas) {
      expect(["salado", "dulce"]).toContain(receta.categoria);
    }
  });

  it("todo ingrediente no básico es obligatorio en al menos una receta", () => {
    const obligatorios = new Set(
      semilla.relaciones.filter((r) => !r.es_opcional).map((r) => r.ingrediente_id),
    );
    const sinReceta = semilla.ingredientes
      .filter((i) => !i.es_basico && !obligatorios.has(i.id))
      .map((i) => i.nombre);
    expect(sinReceta).toEqual([]);
  });

  it("buscar por un ingrediente trae las recetas que lo usan, primero", async () => {
    const { buscarRecetas } = await import("../src/lib/motor-busqueda");
    const carne = semilla.ingredientes.find((i) => i.nombre === "Carne picada");
    expect(carne).toBeDefined();

    const resultados = buscarRecetas(semilla.recetas, {
      ingredientes: [carne!.id],
      restricciones: [],
      tiempo_maximo: null,
    });

    const usanCarne = resultados.filter((r) =>
      r.receta.ingredientes.some(
        (ri) => ri.ingrediente_id === carne!.id && !ri.es_opcional && !ri.ingrediente.es_basico,
      ),
    );
    expect(usanCarne.length).toBeGreaterThanOrEqual(3);

    // Las que usan carne picada encabezan la lista: ninguna receta ajena va antes.
    const primeras = resultados.slice(0, usanCarne.length);
    expect(primeras).toEqual(usanCarne);
    // Y la primera es una donde la carne es protagonista del plato.
    expect(
      resultados[0].receta.ingredientes.some(
        (ri) => ri.ingrediente_id === carne!.id && ri.es_principal,
      ),
    ).toBe(true);
  });
});
