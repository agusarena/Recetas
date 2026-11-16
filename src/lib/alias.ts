/**
 * Alias de búsqueda: la gente escribe "fresa", "maíz", "aguacate" o
 * "churrasco" y el catálogo dice "Frutillas", "Choclo en lata", "Palta"
 * y "Bifes de carne". Es una lib pura y testeable: nada de lógica dentro
 * del componente.
 */
import type { Ingrediente } from "@/types";

/** Normaliza para comparar: minúsculas y sin tildes. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Palabra que suele escribirse → palabra del catálogo (normalizada). */
const ALIAS: Record<string, string> = {
  fresa: "frutilla",
  maiz: "choclo",
  aguacate: "palta",
  churrasco: "bife",
  nalga: "bife",
  asado: "bife",
  molida: "picada",
  "carne molida": "picada",
  calabacin: "zapallito",
  pimiento: "morron",
  platano: "banana",
};

/** Resuelve el alias de una consulta ya normalizada (null si no hay). */
export function resolverAlias(consultaNormalizada: string): string | null {
  if (consultaNormalizada in ALIAS) return ALIAS[consultaNormalizada];
  // Prefijos: "churra" ya sugiere bife. Primer alias que arranca igual.
  for (const [clave, valor] of Object.entries(ALIAS)) {
    if (clave.startsWith(consultaNormalizada)) return valor;
  }
  return null;
}

/** Una coincidencia del texto con un ingrediente del catálogo. */
export interface CoincidenciaTexto {
  ingrediente: Ingrediente;
  /** true si entró por alias (ej. "fresa" → Frutillas). */
  porAlias: boolean;
}

/**
 * Busca ingredientes por texto, con alias. Ordena por qué tan directo es
 * el match: nombre exacto, prefijo, contiene; los alias van al final.
 */
export function buscarPorTexto(
  consulta: string,
  ingredientes: Ingrediente[],
): CoincidenciaTexto[] {
  const q = normalizar(consulta.trim());
  if (q.length === 0) return [];

  const alias = resolverAlias(q);

  const exactas: CoincidenciaTexto[] = [];
  const porPrefijo: CoincidenciaTexto[] = [];
  const porContenido: CoincidenciaTexto[] = [];

  for (const ingrediente of ingredientes) {
    const nombre = normalizar(ingrediente.nombre);

    let porAlias = false;
    let afinidad: -1 | 0 | 1 | 2; // 2 exacto, 1 prefijo, 0 contiene, -1 nada
    if (nombre === q) {
      afinidad = 2;
    } else if (nombre.startsWith(q)) {
      afinidad = 1;
    } else if (nombre.includes(q)) {
      afinidad = 0;
    } else if (alias !== null && nombre.includes(alias)) {
      afinidad = 0;
      porAlias = true;
    } else {
      afinidad = -1;
    }

    if (afinidad === -1) continue;
    const coincidencia = { ingrediente, porAlias };
    if (afinidad === 2) exactas.push(coincidencia);
    else if (afinidad === 1) porPrefijo.push(coincidencia);
    else porContenido.push(coincidencia);
  }

  const porNombre = (a: CoincidenciaTexto, b: CoincidenciaTexto) =>
    a.ingrediente.nombre.localeCompare(b.ingrediente.nombre, "es");

  return [
    ...exactas.sort(porNombre),
    ...porPrefijo.sort(porNombre),
    ...porContenido.sort(porNombre),
  ];
}
