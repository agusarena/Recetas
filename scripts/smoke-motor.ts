/**
 * Prueba de humo del motor de búsqueda contra un catálogo espejo del seed.
 * Correr: npx tsx scripts/smoke-motor.ts
 */
import type { RecetaConIngredientes } from "@/types";
import { buscarRecetas, ingredientesObligatorios } from "@/lib/motor-busqueda";

const ing = (id: string, nombre: string, es_basico = false, alergenos: string[] = []) => ({
  id,
  nombre,
  categoria: "test",
  es_basico,
  alergenos: alergenos as never,
});

const CATALOGO: RecetaConIngredientes[] = [
  // Tortilla de papas (30 min) — vegetariano/sin_tacc
  {
    id: "tortilla",
    titulo: "Tortilla de papas",
    descripcion_corta: "",
    categoria: "salado",
    tiempo_minutos: 30,
    dificultad: "facil",
    porciones_base: 2,
    pasos: [],
    tip_principiante: null,
    etiquetas_dieta: ["vegetariano", "sin_tacc", "sin_lactosa", "sin_frutos_secos"],
    macros_generales: { calorias: 0, perfil: "", proteinas: 0, carbohidratos: 0, grasas: 0 },
    imagen_url: null,
    ingredientes: [
      { receta_id: "tortilla", ingrediente_id: "papa", cantidad_base: 600, unidad: "g", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("papa", "Papa") },
      { receta_id: "tortilla", ingrediente_id: "huevo", cantidad_base: 4, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("huevo", "Huevos", false, ["huevo"]) },
      { receta_id: "tortilla", ingrediente_id: "cebolla", cantidad_base: 1, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: "cebolla de verdeo", reemplazo_ingrediente_id: null, ingrediente: ing("cebolla", "Cebolla") },
      { receta_id: "tortilla", ingrediente_id: "sal", cantidad_base: 1, unidad: "pizca", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("sal", "Sal", true) },
    ],
  },
  // Omelette (10 min, cero cocina) — vegetariano/sin_tacc
  {
    id: "omelette",
    titulo: "Omelette de queso",
    descripcion_corta: "",
    categoria: "salado",
    tiempo_minutos: 10,
    dificultad: "cero_cocina",
    porciones_base: 1,
    pasos: [],
    tip_principiante: null,
    etiquetas_dieta: ["vegetariano", "sin_tacc", "sin_frutos_secos"],
    macros_generales: { calorias: 0, perfil: "", proteinas: 0, carbohidratos: 0, grasas: 0 },
    imagen_url: null,
    ingredientes: [
      { receta_id: "omelette", ingrediente_id: "huevo", cantidad_base: 2, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("huevo", "Huevos", false, ["huevo"]) },
      { receta_id: "omelette", ingrediente_id: "queso", cantidad_base: 2, unidad: "cda", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: "queso cremoso", reemplazo_ingrediente_id: null, ingrediente: ing("queso", "Queso rallado", false, ["lactosa"]) },
    ],
  },
  // Tostada de palta (10 min) — pan → gluten: NO apta sin_tacc
  {
    id: "palta",
    titulo: "Tostada de palta",
    descripcion_corta: "",
    categoria: "salado",
    tiempo_minutos: 10,
    dificultad: "cero_cocina",
    porciones_base: 2,
    pasos: [],
    tip_principiante: null,
    etiquetas_dieta: ["vegetariano", "sin_lactosa", "sin_frutos_secos"],
    macros_generales: { calorias: 0, perfil: "", proteinas: 0, carbohidratos: 0, grasas: 0 },
    imagen_url: null,
    ingredientes: [
      { receta_id: "palta", ingrediente_id: "pan", cantidad_base: 2, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("pan", "Pan", false, ["gluten"]) },
      { receta_id: "palta", ingrediente_id: "palta", cantidad_base: 1, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("palta", "Palta") },
      { receta_id: "palta", ingrediente_id: "tomate", cantidad_base: 1, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("tomate", "Tomate") },
    ],
  },
  // Ensalada de atún (10 min) — huevo OPCIONAL no cuenta
  {
    id: "atun",
    titulo: "Ensalada de atún",
    descripcion_corta: "",
    categoria: "salado",
    tiempo_minutos: 10,
    dificultad: "cero_cocina",
    porciones_base: 2,
    pasos: [],
    tip_principiante: null,
    etiquetas_dieta: ["sin_tacc", "sin_lactosa", "sin_frutos_secos"],
    macros_generales: { calorias: 0, perfil: "", proteinas: 0, carbohidratos: 0, grasas: 0 },
    imagen_url: null,
    ingredientes: [
      { receta_id: "atun", ingrediente_id: "atun", cantidad_base: 1, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("atun", "Atún en lata", false, ["pescado"]) },
      { receta_id: "atun", ingrediente_id: "tomate", cantidad_base: 2, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("tomate", "Tomate") },
      { receta_id: "atun", ingrediente_id: "huevo", cantidad_base: 2, unidad: "unidad", texto_principiante: null, es_opcional: true, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("huevo", "Huevos", false, ["huevo"]) },
    ],
  },
  // Guiso de arroz con pollo (35 min, 5 obligatorios) — para Nivel 3
  {
    id: "guiso",
    titulo: "Guiso de arroz con pollo",
    descripcion_corta: "",
    categoria: "salado",
    tiempo_minutos: 35,
    dificultad: "facil",
    porciones_base: 4,
    pasos: [],
    tip_principiante: null,
    etiquetas_dieta: ["sin_tacc", "sin_lactosa", "sin_frutos_secos"],
    macros_generales: { calorias: 0, perfil: "", proteinas: 0, carbohidratos: 0, grasas: 0 },
    imagen_url: null,
    ingredientes: [
      { receta_id: "guiso", ingrediente_id: "arroz", cantidad_base: 2, unidad: "taza", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("arroz", "Arroz") },
      { receta_id: "guiso", ingrediente_id: "pollo", cantidad_base: 2, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("pollo", "Pechuga de pollo") },
      { receta_id: "guiso", ingrediente_id: "tomate", cantidad_base: 3, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: "1 lata de tomate triturado", reemplazo_ingrediente_id: null, ingrediente: ing("tomate", "Tomate") },
      { receta_id: "guiso", ingrediente_id: "morrón", cantidad_base: 1, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("morrón", "Morrón rojo") },
      { receta_id: "guiso", ingrediente_id: "zanahoria", cantidad_base: 1, unidad: "unidad", texto_principiante: null, es_opcional: false, es_principal: false, reemplazo_sugerido: null, reemplazo_ingrediente_id: null, ingrediente: ing("zanahoria", "Zanahoria") },
    ],
  },
];

let fallos = 0;
function verificar(nombre: string, condicion: boolean) {
  console.log(`${condicion ? "✅" : "❌"} ${nombre}`);
  if (!condicion) fallos++;
}

// 1. Filtro estricto: sin_tacc descarta la tostada (pan con gluten, aunque
//    la receta no declare sin_tacc... la etiqueta falta) — red de seguridad
//    doble: etiqueta ausente + alérgeno presente.
const sinTacc = buscarRecetas(CATALOGO, { ingredientes: [], restricciones: ["sin_tacc"], tiempo_maximo: null });
verificar(
  "sin_tacc descarta la tostada de palta",
  !sinTacc.some((r) => r.receta.id === "palta"),
);

// 2. Vegetariano: excluye el guiso de pollo y la ensalada de atún.
const vegetariano = buscarRecetas(CATALOGO, { ingredientes: [], restricciones: ["vegetariano"], tiempo_maximo: null });
verificar(
  "vegetariano excluye pollo y atún",
  !vegetariano.some((r) => ["guiso", "atun"].includes(r.receta.id)),
);

// 3. Matching: atún + tomate → atún es "tenés todo" (el huevo extra es opcional);
//    con huevo + tomate, la ensalada queda "falta 1" (el atún).
const pantry = buscarRecetas(CATALOGO, { ingredientes: ["atun", "tomate"], restricciones: [], tiempo_maximo: null });
const atun = pantry.find((r) => r.receta.id === "atun");
verificar("atún: tenés todo (huevo opcional ignorado)", atun?.nivel === "tenes_todo");
verificar("atún sin el ingrediente atún: falta 1", buscarRecetas(CATALOGO, { ingredientes: ["huevo", "tomate"], restricciones: [], tiempo_maximo: null }).find((r) => r.receta.id === "atun")?.nivel === "falta_uno");
const omelette = buscarRecetas(CATALOGO, { ingredientes: ["huevo"], restricciones: [], tiempo_maximo: null }).find((r) => r.receta.id === "omelette");
verificar("omelette: falta 1", omelette?.nivel === "falta_uno");
verificar(
  "omelette muestra reemplazo del queso",
  omelette?.faltantes[0]?.reemplazo_sugerido === "queso cremoso",
);

// 4. En el mismo nivel, primero la receta que aprovecha más ingredientes
//    de la heladera; el tiempo solo desempata cuando la relevancia es igual.
const pantryCompleto = buscarRecetas(CATALOGO, {
  ingredientes: ["papa", "huevo", "cebolla", "queso", "sal"],
  restricciones: [],
  tiempo_maximo: null,
});
const ids = pantryCompleto.map((r) => r.receta.id);
verificar(
  "ranking: tortilla aprovecha más ingredientes que omelette",
  ids.indexOf("tortilla") < ids.indexOf("omelette"),
);

// 5. Nivel 3 solo si niveles 1+2 < 3: pantry vacío solo deja recetas con ≤2 obligatorios.
const pantryVacio = buscarRecetas(CATALOGO, { ingredientes: [], restricciones: [], tiempo_maximo: null });
verificar(
  "pantry vacío: solo recetas con ≤2 obligatorios (guiso queda fuera)",
  !pantryVacio.some((r) => r.receta.id === "guiso"),
);
verificar(
  "obligatorios del guiso = 5 (excluye básicos)",
  ingredientesObligatorios(CATALOGO.find((r) => r.id === "guiso")!).length === 5,
);

// 6. Filtro de tiempo: 15 min excluye la tortilla (30).
const quince = buscarRecetas(CATALOGO, { ingredientes: ["papa", "huevo", "cebolla"], restricciones: [], tiempo_maximo: 15 });
verificar("tiempo 15 min excluye la tortilla", !quince.some((r) => r.receta.id === "tortilla"));

// 7. Modo Indeciso: 3 resultados, respetando restricciones, reproducible con la semilla.
const indeciso1 = buscarRecetas(CATALOGO, { ingredientes: [], restricciones: ["sin_tacc"], tiempo_maximo: null, modo_indeciso: true, semilla: 42 });
const indeciso2 = buscarRecetas(CATALOGO, { ingredientes: [], restricciones: ["sin_tacc"], tiempo_maximo: null, modo_indeciso: true, semilla: 42 });
const indeciso3 = buscarRecetas(CATALOGO, { ingredientes: [], restricciones: ["sin_tacc"], tiempo_maximo: null, modo_indeciso: true, semilla: 99 });
verificar(`modo indeciso devuelve ≤3 (devolvió ${indeciso1.length})`, indeciso1.length <= 3);
verificar(
  "modo indeciso respeta sin_tacc",
  indeciso1.every((r) => !r.receta.ingredientes.some((ri) => ri.ingrediente.alergenos.includes("gluten"))),
);
verificar(
  "misma semilla → misma sugerencia",
  JSON.stringify(indeciso1.map((r) => r.receta.id)) === JSON.stringify(indeciso2.map((r) => r.receta.id)),
);
verificar(
  "semilla distinta puede variar (o no, si hay <4 aptas)",
  CATALOGO.filter((r) => !r.ingredientes.some((ri) => ri.ingrediente.alergenos.includes("gluten"))).length < 4 ||
    JSON.stringify(indeciso1.map((r) => r.receta.id)) !== JSON.stringify(indeciso3.map((r) => r.receta.id)),
);

console.log(fallos === 0 ? "\n🎉 Todo el motor pasa" : `\n💥 ${fallos} fallo(s)`);
process.exit(fallos === 0 ? 0 : 1);
