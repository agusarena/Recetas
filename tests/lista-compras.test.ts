import { describe, expect, it } from "vitest";
import type { Ingrediente, RecetaIngredienteConDetalle, Unidad } from "@/types";
import {
  armarLista,
  armarTextoLista,
  seccionDe,
  urlWhatsApp,
} from "@/lib/lista-compras";

function ingrediente(id: string, nombre: string, categoria: string): Ingrediente {
  return { id, nombre, categoria, es_basico: false, alergenos: [] };
}

function rel(
  recetaId: string,
  ingrediente: Ingrediente,
  cantidad: number,
  unidad: Unidad,
  texto: string | null = null,
): RecetaIngredienteConDetalle {
  return {
    receta_id: recetaId,
    ingrediente_id: ingrediente.id,
    cantidad_base: cantidad,
    unidad,
    texto_principiante: texto,
    es_opcional: false,
    reemplazo_sugerido: null,
    reemplazo_ingrediente_id: null,
    ingrediente,
  };
}

const papa = ingrediente("papa", "Papa", "verduras");
const bife = ingrediente("bife", "Bifes de carne", "carnes");
const leche = ingrediente("leche", "Leche", "lácteos");
const pan = ingrediente("pan", "Pan", "panadería");

describe("armarLista", () => {
  it("arma el texto con cantidad y nombre en minúscula", () => {
    const items = armarLista([rel("r", papa, 600, "g")]);
    expect(items).toEqual([
      { id: "papa", texto: "600 g de papa", seccion: "Verdulería" },
    ]);
  });

  it("suma apariciones del mismo ingrediente y unidad", () => {
    const items = armarLista([
      rel("a", leche, 300, "ml"),
      rel("b", leche, 200, "ml"),
    ]);
    expect(items).toEqual([
      { id: "leche", texto: "500 ml de leche", seccion: "Lácteos" },
    ]);
  });

  it("mantiene líneas separadas con unidades distintas", () => {
    const items = armarLista([
      rel("a", papa, 300, "g"),
      rel("b", papa, 2, "unidad"),
    ]);
    expect(items).toHaveLength(2);
  });

  it("formatea fracciones de unidad", () => {
    const items = armarLista([rel("a", pan, 0.5, "unidad")]);
    expect(items[0]?.texto).toBe("½ unidad de pan");
  });

  it("ordena por recorrido de supermercado", () => {
    const items = armarLista([
      rel("a", pan, 1, "unidad"),
      rel("b", leche, 1, "unidad"),
      rel("c", bife, 2, "unidad"),
      rel("d", papa, 3, "unidad"),
    ]);
    expect(items.map((i) => i.seccion)).toEqual([
      "Verdulería",
      "Carnicería",
      "Lácteos",
      "Panadería",
    ]);
  });
});

describe("seccionDe", () => {
  it("mapea las categorías del catálogo", () => {
    expect(seccionDe("verduras")).toBe("Verdulería");
    expect(seccionDe("carnes")).toBe("Carnicería");
    expect(seccionDe("básicos")).toBe("Otros");
    expect(seccionDe("categoria-desconocida")).toBe("Otros");
  });
});

describe("armarTextoLista", () => {
  it("agrupa por sección con encabezado y emojis", () => {
    const texto = armarTextoLista(armarLista([rel("a", papa, 2, "unidad")]), "Bifes");
    expect(texto).toContain("🛒 Lista de compras — Bifes");
    expect(texto).toContain("🥬 Verdulería");
    expect(texto).toContain("- 2 unidades de papa");
  });

  it("omite secciones vacías", () => {
    const texto = armarTextoLista(armarLista([rel("a", leche, 1, "unidad")]));
    expect(texto).not.toContain("Verdulería");
    expect(texto).toContain("🧀 Lácteos");
  });
});

describe("urlWhatsApp", () => {
  it("codifica el texto para wa.me", () => {
    expect(urlWhatsApp("hola mundo")).toBe(
      "https://wa.me/?text=hola%20mundo",
    );
  });
});
