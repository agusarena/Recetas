import { describe, expect, it } from "vitest";
import { leerSemilla } from "../scripts/parse-seed";

describe("seed.sql", () => {
  const semilla = leerSemilla();
  const idsIngredientes = new Set(semilla.ingredientes.map((i) => i.id));
  const idsRecetas = new Set(semilla.recetas.map((r) => r.id));

  it("parsea el catálogo completo", () => {
    expect(semilla.ingredientes).toHaveLength(54);
    expect(semilla.recetas).toHaveLength(37);
    expect(semilla.relaciones.length).toBeGreaterThanOrEqual(140);
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
});
