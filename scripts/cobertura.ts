/**
 * Diagnóstico de cobertura del catálogo.
 *
 * Simula heladeras realistas contra el motor de búsqueda y reporta cuántas
 * encuentran 0, 1–2 o 3+ recetas. También muestra qué ingredientes
 * desbloquean más recetas: es el backlog de contenido, con datos.
 *
 * Uso: npm run cobertura
 */
import type { EtiquetaDieta } from "@/types";
import { buscarRecetas, ingredientesObligatorios } from "@/lib/motor-busqueda";
import { leerSemilla } from "./parse-seed";

interface HeladeraSimulada {
  nombre: string;
  ingredientes: string[];
  restricciones?: EtiquetaDieta[];
}

const HELADERAS: HeladeraSimulada[] = [
  { nombre: "Mínima", ingredientes: ["Huevos", "Papa"] },
  { nombre: "Estudiante", ingredientes: ["Fideos", "Queso rallado", "Manteca", "Huevos"] },
  { nombre: "Domingo", ingredientes: ["Papa", "Huevos", "Cebolla", "Morrón rojo"] },
  {
    nombre: "Vegetariana",
    ingredientes: ["Papa", "Huevos", "Cebolla", "Queso rallado", "Tomate", "Arroz", "Zanahoria"],
    restricciones: ["vegetariano"],
  },
  {
    nombre: "Sin TACC",
    ingredientes: ["Arroz", "Pechuga de pollo", "Tomate", "Cebolla", "Morrón rojo", "Zanahoria"],
    restricciones: ["sin_tacc"],
  },
  { nombre: "Tostado", ingredientes: ["Pan", "Queso cremoso / muzzarella", "Jamón cocido", "Tomate"] },
  { nombre: "Alacena", ingredientes: ["Lentejas en lata", "Garbanzos en lata", "Cebolla", "Ajo", "Tomate"] },
  { nombre: "Desayuno", ingredientes: ["Banana", "Avena", "Yogur natural", "Manzana", "Nueces", "Miel"] },
  { nombre: "Boloñesa", ingredientes: ["Carne picada", "Fideos", "Puré de tomate", "Cebolla", "Ajo"] },
  { nombre: "Verduras", ingredientes: ["Calabaza / Anco", "Zanahoria", "Cebolla", "Papa", "Espinaca"] },
  { nombre: "Atún", ingredientes: ["Atún en lata", "Tomate", "Cebolla", "Huevos", "Arroz"] },
  { nombre: "Wok", ingredientes: ["Arroz", "Pechuga de pollo", "Cebolla", "Arvejas en lata"] },
  { nombre: "Verde", ingredientes: ["Acelga", "Huevos", "Queso rallado", "Zapallito verde"] },
  { nombre: "Fruta", ingredientes: ["Pera", "Maní y almendras", "Yogur natural", "Miel"] },
  {
    nombre: "Completa",
    ingredientes: [
      "Papa",
      "Huevos",
      "Cebolla",
      "Arroz",
      "Pechuga de pollo",
      "Tomate",
      "Morrón rojo",
      "Zanahoria",
      "Queso rallado",
      "Fideos",
    ],
  },
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function pad(texto: string, ancho: number): string {
  return texto.length >= ancho ? texto : texto + " ".repeat(ancho - texto.length);
}

const semilla = leerSemilla();
const porNombre = new Map(semilla.ingredientes.map((i) => [normalizar(i.nombre), i.id]));

function resolverIds(nombres: string[], heladera: string): string[] {
  return nombres.map((nombre) => {
    const id = porNombre.get(normalizar(nombre));
    if (!id) {
      throw new Error(`La heladera "${heladera}" pide un ingrediente inexistente: ${nombre}`);
    }
    return id;
  });
}

let sinResultados = 0;
let pocos = 0;
let suficientes = 0;

console.log("\nCobertura de heladeras simuladas");
console.log("─────────────────────────────────────────────────────────────────────");
console.log(
  `${pad("Heladera", 18)} ${pad("Todo", 6)} ${pad("Falta 1", 8)} ${pad("Falta 2", 8)} ${pad("Útiles", 8)}`,
);
console.log("─────────────────────────────────────────────────────────────────────");

for (const heladera of HELADERAS) {
  const resultados = buscarRecetas(semilla.recetas, {
    ingredientes: resolverIds(heladera.ingredientes, heladera.nombre),
    restricciones: heladera.restricciones ?? [],
    tiempo_maximo: null,
  });
  const cuenta = { tenes_todo: 0, falta_uno: 0, falta_dos: 0 };
  for (const resultado of resultados) cuenta[resultado.nivel]++;

  // "Útiles" = recetas que podés cocinar ya o comprando una sola cosa.
  // El nivel "faltan 2" es una sugerencia, no una respuesta al problema.
  const utiles = cuenta.tenes_todo + cuenta.falta_uno;

  if (utiles === 0) sinResultados++;
  else if (utiles < 3) pocos++;
  else suficientes++;

  const marca = utiles === 0 ? " ←" : utiles < 3 ? " ·" : "";
  console.log(
    `${pad(heladera.nombre, 18)} ${pad(String(cuenta.tenes_todo), 6)} ${pad(
      String(cuenta.falta_uno),
      8,
    )} ${pad(String(cuenta.falta_dos), 8)} ${pad(String(utiles), 8)}${marca}`,
  );
}

console.log("─────────────────────────────────────────────────────────────────────");
const porcentaje = Math.round((suficientes / HELADERAS.length) * 100);
console.log(
  `${suficientes}/${HELADERAS.length} heladeras con 3+ recetas útiles (${porcentaje} %), ` +
    `${pocos} con 1–2 y ${sinResultados} sin recetas cocinables.`,
);
console.log("Objetivo de contenido: ≥ 80 % de heladeras con 3+ recetas útiles.\n");

// ─────────────────────────────────────────────────────────────────────────────
// Ingredientes palanca: los que más recetas obligatorias desbloquean.
// ─────────────────────────────────────────────────────────────────────────────

const uso = new Map<string, number>();
for (const receta of semilla.recetas) {
  for (const relacion of ingredientesObligatorios(receta)) {
    uso.set(relacion.ingrediente.nombre, (uso.get(relacion.ingrediente.nombre) ?? 0) + 1);
  }
}

const ranking = [...uso.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));

console.log("Ingredientes palanca (recetas que los piden como obligatorios)");
console.log("──────────────────────────────────────────────────────────────");
for (const [nombre, cantidad] of ranking.slice(0, 12)) {
  console.log(`${pad(nombre, 28)} ${String(cantidad).padStart(2)} receta${cantidad === 1 ? "" : "s"}`);
}

const sinUso = semilla.ingredientes
  .filter((i) => !i.es_basico && !uso.has(i.nombre))
  .map((i) => i.nombre)
  .sort((a, b) => a.localeCompare(b, "es"));

if (sinUso.length > 0) {
  console.log(`\nIngredientes sin receta obligatoria (${sinUso.length}): ${sinUso.join(", ")}`);
}

console.log(`\nCatálogo: ${semilla.ingredientes.length} ingredientes, ${semilla.recetas.length} recetas.`);
