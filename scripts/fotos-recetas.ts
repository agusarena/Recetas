/**
 * Foto ilustrativa por receta, desde Wikimedia Commons (sin clave ni cuenta).
 *
 * Por cada receta busca su título, toma el primer resultado con licencia libre
 * (CC BY, CC BY-SA, CC0 o dominio público), lo convierte a WebP en
 * `public/recetas/` y guarda el crédito de autor en `src/lib/fotos-creditos.json`.
 *
 * Uso: npm run fotos:recetas
 * Para corregir una búsqueda, agregala a CONSULTAS; para descartar un archivo
 * que no corresponde, agregalo a OMITIR y volvé a correr el script.
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { leerSemilla } from "./parse-seed";

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const CARPETA = join(RAIZ, "public", "recetas");
const ARCHIVO_CREDITOS = join(RAIZ, "src", "lib", "fotos-creditos.json");
const API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "recetas-app/0.1 (fotos ilustrativas; https://recetas-xi-ten.vercel.app/)";
const ANCHO_WEBP = 640;

/** Consulta a usar en lugar del título, por id de receta. */
const CONSULTAS: Record<string, string> = {};

/** Archivos de Commons descartados a mano, por id de receta. */
const OMITIR: Record<string, string[]> = {};

/**
 * Recetas revisadas a mano sin foto adecuada: quedan con el placeholder de
 * letra en lugar de una foto que no corresponde. Son los 3 últimos dígitos del id.
 */
const SIN_FOTO = new Set([
  "103", "108", "114", "118", "119", "121", "122", "125", "128", "129", "141", "142",
  "151", "157", "164", "169", "178", "180", "187", "189", "190", "191", "198", "202",
  "203", "210", "212",
]);

interface Candidato {
  titulo: string;
  imagen: string;
  pagina: string;
  ancho: number;
  alto: number;
  licencia: string;
  autor: string;
}

export interface Credito {
  archivo: string;
  autor: string;
  licencia: string;
  pagina: string;
}

function limpiarHtml(texto: string): string {
  return texto.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function licenciaLibre(licencia: string): boolean {
  if (/NC|ND/.test(licencia)) return false;
  return /^(CC BY|CC BY-SA|CC0|Public domain)/i.test(licencia);
}

interface PaginaApi {
  title: string;
  index: number;
  imageinfo?: Array<{
    url: string;
    thumburl?: string;
    descriptionurl: string;
    width: number;
    height: number;
    mime: string;
    extmetadata?: Record<string, { value: string } | undefined>;
  }>;
}

async function buscar(consulta: string): Promise<Candidato[]> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: `filetype:bitmap ${consulta}`,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|extmetadata|size|mime",
    iiurlwidth: "800",
  });
  const respuesta = await fetch(`${API}?${params}`, { headers: { "User-Agent": USER_AGENT } });
  if (!respuesta.ok) throw new Error(`Commons respondió ${respuesta.status}`);
  const json = (await respuesta.json()) as { query?: { pages?: Record<string, PaginaApi> } };
  const paginas = Object.values(json.query?.pages ?? {}).sort((a, b) => a.index - b.index);

  const candidatos: Candidato[] = [];
  for (const pagina of paginas) {
    const info = pagina.imageinfo?.[0];
    if (!info?.thumburl) continue;
    if (info.mime !== "image/jpeg" && info.mime !== "image/png") continue;
    if (info.width < 640 || info.height < 400) continue;

    const meta = info.extmetadata ?? {};
    const licencia = meta.LicenseShortName?.value ?? "";
    if (!licenciaLibre(licencia)) continue;

    candidatos.push({
      titulo: pagina.title,
      imagen: info.thumburl,
      pagina: info.descriptionurl,
      ancho: info.width,
      alto: info.height,
      licencia,
      autor: limpiarHtml(meta.Artist?.value ?? "") || "Autor desconocido",
    });
  }
  return candidatos;
}

async function descargar(url: string): Promise<Buffer> {
  const respuesta = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!respuesta.ok) throw new Error(`Descarga fallida ${respuesta.status}: ${url}`);
  return Buffer.from(await respuesta.arrayBuffer());
}

const PALABRAS_VACIAS = new Set([
  "para", "con", "sin", "del", "las", "los", "una", "uno",
  "rapido", "rapida", "express", "exprés", "casero", "casera", "caseros", "caseras",
  "cremoso", "cremosa", "simple", "facil",
]);

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\s]/gu, " ");
}

/** Palabras del título que sirven para reconocer el plato (sin relleno). */
function palabrasClave(titulo: string): string[] {
  return normalizar(titulo)
    .split(/\s+/)
    .filter((p) => p.length >= 4 && !PALABRAS_VACIAS.has(p));
}

/** El nombre del archivo debe mencionar el plato; si no, la foto no sirve. */
function mencionaPlato(nombreArchivo: string, claves: string[]): boolean {
  const archivo = normalizar(nombreArchivo);
  return claves.some((clave) => archivo.includes(clave.slice(0, 5)));
}

/** Consultas de respaldo: título completo, luego versiones más cortas. */
function consultasPara(titulo: string): string[] {
  const palabras = palabrasClave(titulo);
  const consultas = [titulo, palabras.slice(0, 3).join(" "), palabras.slice(0, 2).join(" "), palabras[0] ?? ""];
  return [...new Set(consultas.filter((c) => c.length > 0))];
}

async function buscarConRespaldo(receta: { id: string; titulo: string }): Promise<{ consulta: string; candidatos: Candidato[] }> {
  const omitir = new Set(OMITIR[receta.id] ?? []);
  const claves = palabrasClave(receta.titulo);
  const primera = CONSULTAS[receta.id];
  const consultas = primera ? [primera] : consultasPara(receta.titulo);
  for (const consulta of consultas) {
    const candidatos = (await buscar(consulta)).filter(
      (c) => !omitir.has(c.titulo) && mencionaPlato(c.titulo, claves),
    );
    if (candidatos.length > 0) return { consulta, candidatos };
    await pausa(150);
  }
  return { consulta: consultas.join(" | "), candidatos: [] };
}

const pausa = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

async function main() {
  const { recetas } = leerSemilla();
  mkdirSync(CARPETA, { recursive: true });
  for (const archivo of readdirSync(CARPETA)) {
    if (archivo.startsWith("receta-") && archivo.endsWith(".webp")) rmSync(join(CARPETA, archivo));
  }

  const creditos: Record<string, Credito> = {};
  const sinFoto: string[] = [];

  for (const receta of recetas) {
    if (SIN_FOTO.has(receta.id.slice(-3))) {
      sinFoto.push(`${receta.titulo} (descartada a mano)`);
      continue;
    }
    const { consulta, candidatos } = await buscarConRespaldo(receta);
    const elegido = candidatos[0];

    if (!elegido) {
      sinFoto.push(`${receta.titulo} (buscado: "${consulta}")`);
      continue;
    }

    const archivo = `receta-${receta.id.slice(-3)}.webp`;
    const original = await descargar(elegido.imagen);
    await sharp(original)
      .rotate()
      .resize({ width: ANCHO_WEBP, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(CARPETA, archivo));

    creditos[receta.id] = {
      archivo: elegido.titulo.replace(/^File:/, ""),
      autor: elegido.autor,
      licencia: elegido.licencia,
      pagina: elegido.pagina,
    };
    console.log(`✅ ${receta.titulo} [${consulta}] → ${archivo} (${elegido.licencia})`);
    await pausa(300);
  }

  writeFileSync(ARCHIVO_CREDITOS, `${JSON.stringify(creditos, null, 2)}\n`);

  console.log(`\nFotos guardadas: ${Object.keys(creditos).length} de ${recetas.length}`);
  if (sinFoto.length > 0) {
    console.log("Sin foto con licencia libre:");
    for (const linea of sinFoto) console.log(`  - ${linea}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
