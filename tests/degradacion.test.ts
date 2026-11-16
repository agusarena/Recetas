import { describe, expect, it } from "vitest";
import type {
  CategoriaReceta,
  EtiquetaDieta,
  FiltrosBusqueda,
  Ingrediente,
  RecetaConIngredientes,
  RecetaIngredienteConDetalle,
} from "@/types";
import { calcularDegradaciones, sugerirCompras } from "@/lib/degradacion";

function ing(
  id: string,
  nombre: string,
  opciones: { basico?: boolean } = {},
): Ingrediente {
  return {
    id,
    nombre,
    categoria: "test",
    es_basico: opciones.basico ?? false,
    alergenos: [],
  };
}

function rel(
  recetaId: string,
  ingrediente: Ingrediente,
  opciones: { opcional?: boolean; reemplazoId?: string | null } = {},
): RecetaIngredienteConDetalle {
  return {
    receta_id: recetaId,
    ingrediente_id: ingrediente.id,
    cantidad_base: 1,
    unidad: "unidad",
    texto_principiante: null,
    es_opcional: opciones.opcional ?? false,
    es_principal: false,
    reemplazo_sugerido: null,
    reemplazo_ingrediente_id: opciones.reemplazoId ?? null,
    ingrediente,
  };
}

function receta(
  id: string,
  opciones: {
    tiempo?: number;
    categoria?: CategoriaReceta;
    etiquetas?: EtiquetaDieta[];
    ingredientes?: RecetaIngredienteConDetalle[];
  } = {},
): RecetaConIngredientes {
  return {
    id,
    titulo: id,
    descripcion_corta: "",
    categoria: opciones.categoria ?? "salado",
    tiempo_minutos: opciones.tiempo ?? 10,
    dificultad: "facil",
    porciones_base: 2,
    pasos: [],
    tip_principiante: null,
    etiquetas_dieta: opciones.etiquetas ?? [],
    macros_generales: {
      calorias: 0,
      perfil: "",
      proteinas: 0,
      carbohidratos: 0,
      grasas: 0,
    },
    imagen_url: null,
    ingredientes: opciones.ingredientes ?? [],
  };
}

const sal = ing("sal", "Sal", { basico: true });

// Pantry marcado: dulce de leche (no matchea nada del catálogo).
const ddl = ing("ddl", "Dulce de leche");
// Candidatos a compra.
const papa = ing("papa", "Papa");
const huevo = ing("huevo", "Huevos");

// Tortilla: papa + huevo (40 min).
const tortilla = receta("tortilla", {
  tiempo: 40,
  ingredientes: [rel("tortilla", sal, { opcional: true }), rel("tortilla", papa), rel("tortilla", huevo)],
});
// Flan: huevo + dulce de leche, dulce (10 min).
const flan = receta("flan", {
  tiempo: 10,
  categoria: "dulce",
  ingredientes: [rel("flan", huevo), rel("flan", ddl)],
});

const CATALOGO = [tortilla, flan];

function filtros(cambios: Partial<FiltrosBusqueda> = {}): FiltrosBusqueda {
  return {
    ingredientes: ["ddl"],
    restricciones: [],
    tiempo_maximo: null,
    categoria: null,
    modo_indeciso: false,
    semilla: 0,
    ...cambios,
  };
}

describe("calcularDegradaciones", () => {
  it("no sugiere quitar tiempo ni sabor cuando no hay filtros", () => {
    const d = calcularDegradaciones(CATALOGO, filtros());
    expect(d.sinTiempo).toBeNull();
    expect(d.sinSabor).toBeNull();
    expect(d.sinAmbos).toBeNull();
  });

  it("cuenta recetas al quitar el límite de tiempo", () => {
    const d = calcularDegradaciones(CATALOGO, filtros({ tiempo_maximo: 15 }));
    // Sin límite de tiempo aparece la tortilla (usa huevo, no el ddl... no:
    // la tortilla es ajena al pantry, no entra). Solo el flan usa ddl.
    expect(d.sinTiempo).toBe(1);
    expect(d.compras).toEqual([{ id: "huevo", nombre: "Huevos", recetas: 1 }]);
  });

  it("cuenta recetas al quitar el filtro de sabor", () => {
    const d = calcularDegradaciones(CATALOGO, filtros({ categoria: "salado" }));
    // Con filtro salado ni el flan entra: 0. Quitando el sabor, el flan pasa.
    expect(d.sinSabor).toBe(1);
  });

  it("compra desbloquea el flan (falta huevo)", () => {
    const d = calcularDegradaciones(CATALOGO, filtros({ categoria: "dulce" }));
    expect(d.compras[0]?.id).toBe("huevo");
    expect(d.compras[0]?.recetas).toBe(1);
    // La papa no desbloquea nada dulce.
    expect(d.compras.some((c) => c.id === "papa")).toBe(false);
  });

  it("no sugiere comprar lo que ya está marcado ni básicos", () => {
    const compras = sugerirCompras(CATALOGO, filtros({ ingredientes: ["ddl", "huevo"] }));
    expect(compras.some((c) => c.id === "ddl")).toBe(false);
    expect(compras.some((c) => c.id === "huevo")).toBe(false);
    expect(compras.some((c) => c.id === "sal")).toBe(false);
  });
});
