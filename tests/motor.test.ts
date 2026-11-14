import { describe, expect, it } from "vitest";
import type {
  Alergeno,
  Dificultad,
  EtiquetaDieta,
  Ingrediente,
  RecetaConIngredientes,
  RecetaIngredienteConDetalle,
  Unidad,
} from "@/types";
import {
  buscarRecetas,
  evaluarCoincidencia,
  ingredientesObligatorios,
} from "@/lib/motor-busqueda";

function ing(
  id: string,
  nombre: string,
  opciones: { basico?: boolean; alergenos?: Alergeno[] } = {},
): Ingrediente {
  return {
    id,
    nombre,
    categoria: "test",
    es_basico: opciones.basico ?? false,
    alergenos: opciones.alergenos ?? [],
  };
}

function rel(
  recetaId: string,
  ingrediente: Ingrediente,
  opciones: {
    opcional?: boolean;
    reemplazo?: string | null;
    reemplazoId?: string | null;
    cantidad?: number;
    unidad?: Unidad;
  } = {},
): RecetaIngredienteConDetalle {
  return {
    receta_id: recetaId,
    ingrediente_id: ingrediente.id,
    cantidad_base: opciones.cantidad ?? 1,
    unidad: opciones.unidad ?? "unidad",
    texto_principiante: null,
    es_opcional: opciones.opcional ?? false,
    reemplazo_sugerido: opciones.reemplazo ?? null,
    reemplazo_ingrediente_id: opciones.reemplazoId ?? null,
    ingrediente,
  };
}

function receta(
  id: string,
  opciones: {
    tiempo?: number;
    dificultad?: Dificultad;
    etiquetas?: EtiquetaDieta[];
    ingredientes?: RecetaIngredienteConDetalle[];
  } = {},
): RecetaConIngredientes {
  return {
    id,
    titulo: id,
    descripcion_corta: "",
    tiempo_minutos: opciones.tiempo ?? 10,
    dificultad: opciones.dificultad ?? "facil",
    porciones_base: 2,
    pasos: [],
    tip_principiante: null,
    etiquetas_dieta: opciones.etiquetas ?? [],
    macros_generales: { calorias: 0, perfil: "", proteinas: 0, carbohidratos: 0, grasas: 0 },
    imagen_url: null,
    ingredientes: opciones.ingredientes ?? [],
  };
}

const papa = ing("papa", "Papa");
const huevo = ing("huevo", "Huevos", { alergenos: ["huevo"] });
const cebolla = ing("cebolla", "Cebolla");
const sal = ing("sal", "Sal", { basico: true });
const queso = ing("queso", "Queso rallado", { alergenos: ["lactosa"] });
const quesoCremoso = ing("queso-cremoso", "Queso cremoso", { alergenos: ["lactosa"] });
const pan = ing("pan", "Pan", { alergenos: ["gluten"] });
const palta = ing("palta", "Palta");
const tomate = ing("tomate", "Tomate");
const atun = ing("atun", "Atún", { alergenos: ["pescado"] });
const arroz = ing("arroz", "Arroz");
const pollo = ing("pollo", "Pollo");
const morron = ing("morron", "Morrón");
const zanahoria = ing("zanahoria", "Zanahoria");

const CATALOGO: RecetaConIngredientes[] = [
  receta("tortilla", {
    tiempo: 30,
    etiquetas: ["vegetariano", "sin_tacc", "sin_lactosa", "sin_frutos_secos"],
    ingredientes: [
      rel("tortilla", papa, { cantidad: 600, unidad: "g" }),
      rel("tortilla", huevo, { cantidad: 4 }),
      rel("tortilla", cebolla),
      rel("tortilla", sal),
    ],
  }),
  receta("omelette", {
    tiempo: 10,
    dificultad: "cero_cocina",
    etiquetas: ["vegetariano", "sin_tacc", "sin_frutos_secos"],
    ingredientes: [
      rel("omelette", huevo, { cantidad: 2 }),
      rel("omelette", queso, {
        reemplazo: "queso cremoso",
        reemplazoId: quesoCremoso.id,
      }),
    ],
  }),
  // Etiqueta mentirosa a propósito: el alérgeno del pan debe descartarla.
  receta("palta", {
    etiquetas: ["vegetariano", "sin_tacc"],
    ingredientes: [rel("palta", pan), rel("palta", palta), rel("palta", tomate)],
  }),
  receta("atun", {
    etiquetas: ["sin_tacc", "sin_lactosa", "sin_frutos_secos"],
    ingredientes: [
      rel("atun", atun),
      rel("atun", tomate, { cantidad: 2 }),
      rel("atun", huevo, { opcional: true, cantidad: 2 }),
    ],
  }),
  receta("guiso", {
    tiempo: 35,
    etiquetas: ["sin_tacc", "sin_lactosa", "sin_frutos_secos"],
    ingredientes: [arroz, pollo, tomate, morron, zanahoria].map((i) => rel("guiso", i)),
  }),
];

const filtros = (ingredientes: string[], extra: Partial<Parameters<typeof buscarRecetas>[1]> = {}) =>
  ({ ingredientes, restricciones: [], tiempo_maximo: null, ...extra }) as Parameters<
    typeof buscarRecetas
  >[1];

describe("motor de búsqueda", () => {
  it("descarta por alérgeno aunque la etiqueta diga lo contrario", () => {
    const resultados = buscarRecetas(CATALOGO, filtros([], { restricciones: ["sin_tacc"] }));
    expect(resultados.some((r) => r.receta.id === "palta")).toBe(false);
  });

  it("excluye recetas que no declaran la restricción pedida", () => {
    const resultados = buscarRecetas(CATALOGO, filtros([], { restricciones: ["vegetariano"] }));
    expect(resultados.some((r) => r.receta.id === "guiso")).toBe(false);
    expect(resultados.some((r) => r.receta.id === "atun")).toBe(false);
  });

  it("ignora ingredientes básicos y opcionales al calcular coincidencia", () => {
    expect(ingredientesObligatorios(CATALOGO[0])).toHaveLength(3);
    expect(ingredientesObligatorios(CATALOGO[3])).toHaveLength(2);

    const completo = buscarRecetas(CATALOGO, filtros(["atun", "tomate"])).find(
      (r) => r.receta.id === "atun",
    );
    expect(completo?.nivel).toBe("tenes_todo");
    expect(completo?.faltantes).toEqual([]);

    const faltaAtun = buscarRecetas(CATALOGO, filtros(["huevo", "tomate"])).find(
      (r) => r.receta.id === "atun",
    );
    expect(faltaAtun?.nivel).toBe("falta_uno");
    expect(faltaAtun?.faltantes[0].nombre).toBe("Atún");
  });

  it("cuenta un reemplazo que el usuario tiene como ingrediente cubierto", () => {
    const conReemplazo = evaluarCoincidencia(CATALOGO[1], ["huevo", "queso-cremoso"]);
    expect(conReemplazo?.nivel).toBe("tenes_todo");
    expect(conReemplazo?.coincidentes).toBe(2);
    expect(conReemplazo?.reemplazos_usados).toEqual([
      { nombre: "Queso rallado", reemplazo: "queso cremoso" },
    ]);

    const sinReemplazo = evaluarCoincidencia(CATALOGO[1], ["huevo"]);
    expect(sinReemplazo?.nivel).toBe("falta_uno");
    expect(sinReemplazo?.reemplazos_usados).toEqual([]);
  });

  it("no marca reemplazo si el usuario tiene el ingrediente original", () => {
    const resultado = evaluarCoincidencia(CATALOGO[1], ["huevo", "queso", "queso-cremoso"]);
    expect(resultado?.nivel).toBe("tenes_todo");
    expect(resultado?.reemplazos_usados).toEqual([]);
  });

  it("ordena por tiempo y dificultad dentro del mismo nivel", () => {
    const resultados = buscarRecetas(
      CATALOGO,
      filtros(["papa", "huevo", "cebolla", "queso", "sal"]),
    );
    expect(resultados[0].receta.id).toBe("omelette");
    expect(resultados.findIndex((r) => r.receta.id === "tortilla")).toBeGreaterThan(0);
  });

  it("solo muestra nivel 3 si los niveles 1 y 2 no alcanzan", () => {
    const conMuchos = buscarRecetas(
      CATALOGO,
      filtros(["papa", "huevo", "cebolla", "queso", "atun", "tomate"]),
    );
    expect(conMuchos.length).toBeGreaterThanOrEqual(3);
    expect(conMuchos.some((r) => r.nivel === "falta_dos")).toBe(false);

    const vacio = buscarRecetas(CATALOGO, filtros([]));
    expect(vacio.some((r) => r.receta.id === "guiso")).toBe(false);
  });

  it("respeta el tiempo máximo", () => {
    const quince = buscarRecetas(CATALOGO, filtros(["papa", "huevo", "cebolla"], { tiempo_maximo: 15 }));
    expect(quince.some((r) => r.receta.id === "tortilla")).toBe(false);
  });

  it("el modo indeciso es reproducible con la misma semilla", () => {
    const base = {
      ingredientes: [],
      restricciones: ["sin_tacc" as const],
      tiempo_maximo: null,
      modo_indeciso: true,
    };
    const a = buscarRecetas(CATALOGO, { ...base, semilla: 42 }).map((r) => r.receta.id);
    const b = buscarRecetas(CATALOGO, { ...base, semilla: 42 }).map((r) => r.receta.id);
    const c = buscarRecetas(CATALOGO, { ...base, semilla: 99 }).map((r) => r.receta.id);

    expect(a).toEqual(b);
    expect(a.length).toBeLessThanOrEqual(3);
    expect(c).not.toEqual(a);
  });
});
