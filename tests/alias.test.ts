import { describe, expect, it } from "vitest";
import type { Ingrediente } from "@/types";
import { buscarPorTexto, normalizar, resolverAlias } from "@/lib/alias";

function ingrediente(id: string, nombre: string): Ingrediente {
  return { id, nombre, categoria: "test", es_basico: false, alergenos: [] };
}

const CATALOGO = [
  ingrediente("frutilla", "Frutillas"),
  ingrediente("choclo", "Choclo en lata"),
  ingrediente("palta", "Palta"),
  ingrediente("bife", "Bifes de carne"),
  ingrediente("picada", "Carne picada"),
  ingrediente("morron", "Morrón rojo"),
  ingrediente("zapallito", "Zapallito verde"),
  ingrediente("banana", "Banana"),
  ingrediente("pan", "Pan"),
];

describe("normalizar", () => {
  it("quita tildes y pasa a minúsculas", () => {
    expect(normalizar("ChoclÓ")).toBe("choclo");
    expect(normalizar("Morrón")).toBe("morron");
  });
});

describe("resolverAlias", () => {
  it("resuelve los alias típicos", () => {
    expect(resolverAlias("fresa")).toBe("frutilla");
    expect(resolverAlias("maiz")).toBe("choclo");
    expect(resolverAlias("aguacate")).toBe("palta");
    expect(resolverAlias("churrasco")).toBe("bife");
    expect(resolverAlias("pimiento")).toBe("morron");
    expect(resolverAlias("platano")).toBe("banana");
  });

  it("acepta prefijos de alias", () => {
    expect(resolverAlias("churra")).toBe("bife");
  });

  it("devuelve null si no hay alias", () => {
    expect(resolverAlias("papa")).toBeNull();
  });
});

describe("buscarPorTexto", () => {
  it("matchea por substring directo", () => {
    const r = buscarPorTexto("choclo", CATALOGO);
    expect(r.map((c) => c.ingrediente.id)).toEqual(["choclo"]);
    expect(r[0]?.porAlias).toBe(false);
  });

  it("resuelve alias a un ingrediente del catálogo", () => {
    const r = buscarPorTexto("fresa", CATALOGO);
    expect(r.map((c) => c.ingrediente.id)).toEqual(["frutilla"]);
    expect(r[0]?.porAlias).toBe(true);
  });

  it("churrasco encuentra Bifes de carne", () => {
    const r = buscarPorTexto("churrasco", CATALOGO);
    expect(r.map((c) => c.ingrediente.id)).toEqual(["bife"]);
  });

  it("molida encuentra Carne picada", () => {
    const r = buscarPorTexto("molida", CATALOGO);
    expect(r.map((c) => c.ingrediente.id)).toEqual(["picada"]);
  });

  it("ignora tildes en ambos lados", () => {
    const r = buscarPorTexto("morrón", CATALOGO);
    expect(r.map((c) => c.ingrediente.id)).toEqual(["morron"]);
  });

  it("prefiere el match exacto primero", () => {
    const r = buscarPorTexto("pan", CATALOGO);
    // "Pan" exacto primero; "Banana" contiene "pan"? no. Frutillas? no.
    expect(r[0]?.ingrediente.id).toBe("pan");
  });

  it("no devuelve nada con texto vacío", () => {
    expect(buscarPorTexto("   ", CATALOGO)).toEqual([]);
  });

  it("no devuelve nada si no hay ni match ni alias", () => {
    expect(buscarPorTexto("sushi", CATALOGO)).toEqual([]);
  });
});
