/**
 * Tipado estricto del dominio. Espeja el esquema de PostgreSQL (Supabase)
 * definido en `supabase/migrations/0001_init.sql`.
 *
 * Convención: los nombres de campo coinciden con las columnas de la base
 * (snake_case) para poder pasar datos de Supabase a la UI sin mapear.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enumeraciones del dominio
// ─────────────────────────────────────────────────────────────────────────────

/** Nivel de dificultad de una receta. */
export type Dificultad = "cero_cocina" | "facil";

/** Unidades de medida soportadas para cantidades de ingredientes. */
export type Unidad = "g" | "ml" | "unidad" | "cda" | "taza" | "pizca";

/**
 * Etiquetas de dieta de una receta y, a su vez, las restricciones que un
 * usuario puede seleccionar. Una receta debe tener TODAS las etiquetas que
 * el usuario exige (ej. si exige "vegano", solo pasan recetas veganas).
 */
export type EtiquetaDieta =
  | "vegetariano"
  | "vegano"
  | "sin_tacc"
  | "sin_lactosa"
  | "sin_frutos_secos";

/** Alergenos codificados en `ingredientes.alergenos`. */
export type Alergeno = "gluten" | "lactosa" | "frutos_secos" | "huevo" | "pescado";

// ─────────────────────────────────────────────────────────────────────────────
// Ingredientes
// ─────────────────────────────────────────────────────────────────────────────

/** Tabla `ingredientes`. */
export interface Ingrediente {
  id: string;
  nombre: string;
  categoria: string;
  /** true = sal, agua, aceite, pimienta... se asumen siempre disponibles. */
  es_basico: boolean;
  /** Alergenos declarados del ingrediente (sin contaminación cruzada). */
  alergenos: Alergeno[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Recetas
// ─────────────────────────────────────────────────────────────────────────────

/** Un paso dentro de `recetas.pasos` (JSONB). */
export interface Paso {
  orden: number;
  texto: string;
  /** Duración del paso en segundos; null = sin cronómetro. */
  tiempo_segundos: number | null;
}

/** Macros orientativos por porción, dentro de `recetas.macros_generales` (JSONB). */
export interface Macros {
  calorias: number;
  /** Perfil cualitativo: ej. "rico en proteínas", "balanceado". */
  perfil: string;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

/**
 * Perfil de sabor de una receta. Sirve para no mezclar un postre entre las
 * primeras opciones cuando el usuario marcó ingredientes salados, y para el
 * filtro "Salado / Dulce" de la pantalla de resultados.
 */
export type CategoriaReceta = "salado" | "dulce";

/** Tabla `recetas` (sin relación con ingredientes). */
export interface Receta {
  id: string;
  titulo: string;
  descripcion_corta: string;
  categoria: CategoriaReceta;
  tiempo_minutos: number;
  dificultad: Dificultad;
  porciones_base: number;
  pasos: Paso[];
  tip_principiante: string | null;
  etiquetas_dieta: EtiquetaDieta[];
  macros_generales: Macros;
  imagen_url: string | null;
}

/** Tabla `receta_ingredientes` (relación receta ↔ ingrediente). */
export interface RecetaIngrediente {
  receta_id: string;
  ingrediente_id: string;
  cantidad_base: number;
  unidad: Unidad;
  /** Texto orientado a principiantes: ej. "un puñado (más o menos 50 g)". */
  texto_principiante: string | null;
  es_opcional: boolean;
  /** Texto libre que se muestra como sugerencia de reemplazo. */
  reemplazo_sugerido: string | null;
  /**
   * Ingrediente del catálogo que puede cubrir a este. Si el usuario lo tiene
   * en la heladera, el motor cuenta la receta como completa (con reemplazo).
   */
  reemplazo_ingrediente_id: string | null;
}

/** Receta + su lista de ingredientes resuelta, tal como la consume la UI. */
export interface RecetaConIngredientes extends Receta {
  ingredientes: RecetaIngredienteConDetalle[];
}

export interface RecetaIngredienteConDetalle extends RecetaIngrediente {
  ingrediente: Ingrediente;
}

/**
 * Proyección liviana de una receta para listados que no necesitan pasos ni
 * ingredientes (ej. la página de favoritos).
 */
export interface ResumenReceta {
  id: string;
  titulo: string;
  descripcion_corta: string;
  categoria: CategoriaReceta;
  tiempo_minutos: number;
  dificultad: Dificultad;
  etiquetas_dieta: EtiquetaDieta[];
  imagen_url: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Motor de búsqueda
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Indicador de coincidencia que se muestra en la tarjeta:
 * - `tenes_todo`: 100 % de ingredientes obligatorios → "Cocinalo ya".
 * - `falta_uno` / `falta_dos` / `falta_varios`: cuántos obligatorios faltan.
 */
export type NivelCoincidencia = "tenes_todo" | "falta_uno" | "falta_dos" | "falta_varios";

/** Ingrediente faltante con su reemplazo sugerido, para la tarjeta. */
export interface IngredienteFaltante {
  nombre: string;
  reemplazo_sugerido: string | null;
}

/** Reemplazo que el usuario ya tiene y que cubre un ingrediente obligatorio. */
export interface ReemplazoUsado {
  /** Ingrediente que pide la receta. */
  nombre: string;
  /** Texto amable del reemplazo (ej. "queso cremoso"). */
  reemplazo: string | null;
}

/** Filtros que el cliente envía al motor de búsqueda. */
export interface FiltrosBusqueda {
  /** IDs de ingredientes que el usuario declara tener (además de los básicos). */
  ingredientes: string[];
  /** Restricciones/alergias seleccionadas (sincronizadas con localStorage). */
  restricciones: EtiquetaDieta[];
  /** Tiempo máximo de preparación en minutos; null = sin límite. */
  tiempo_maximo: number | null;
  /** Perfil de sabor pedido; undefined/null = todos (salados y dulces). */
  categoria?: CategoriaReceta | null;
  /**
   * IDs de básicos (sal, aceite, orégano…) que el usuario declaró NO tener:
   * dejan de asumirse y pasan a faltar en las recetas que los piden.
   */
  sin_basicos?: string[];
  /** "Sorprendeme": 3 recetas rápidas y fáciles, sin requerir ingredientes. */
  modo_indeciso?: boolean;
  /** Semilla para la elección aleatoria reproducible del Modo Indeciso. */
  semilla?: number;
}

/** Resultado ranking por receta, listo para renderizar una tarjeta. */
export interface ResultadoBusqueda {
  receta: RecetaConIngredientes;
  nivel: NivelCoincidencia;
  /** Cuántos ingredientes obligatorios tiene el usuario de los totales. */
  coincidentes: number;
  /** Total de ingredientes obligatorios de la receta (excluye básicos y opcionales). */
  obligatorios_totales: number;
  faltantes: IngredienteFaltante[];
  /** Ingredientes cubiertos por un reemplazo que el usuario ya tiene. */
  reemplazos_usados: ReemplazoUsado[];
}

/** Respuesta del endpoint /api/buscar (y del motor en general). */
export interface RespuestaBusqueda {
  resultados: ResultadoBusqueda[];
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Preferencias de usuario (localStorage, sin login)
// ─────────────────────────────────────────────────────────────────────────────

/** Versión del esquema de preferencias, para invalidar localStorage futuro. */
export const PREFERENCIAS_VERSION = 3 as const;

/** Registro local de una receta que la persona ya cocinó. */
export interface RecetaCocinada {
  receta_id: string;
  cocinada_en: string;
}

export type ValorFeedback = "sirvio" | "no_sirvio";

export interface Preferencias {
  version: typeof PREFERENCIAS_VERSION;
  restricciones: EtiquetaDieta[];
  /** IDs de recetas marcadas como favoritas. */
  favoritos: string[];
  /** IDs de ingredientes que el usuario dejó cargados en su heladera. */
  heladera: string[];
  /**
   * IDs de básicos que el usuario NO tiene (sal, orégano…): dejan de
   * asumirse disponibles y pasan a faltar en las recetas que los piden.
   */
  sin_basicos: string[];
  /** Historial local, ordenado por fecha de cocción. */
  cocinadas: RecetaCocinada[];
  /** Una opinión por receta, sin enviar datos a ningún servidor. */
  feedback: Record<string, ValorFeedback>;
  /** Query string de la última búsqueda, para volver desde una receta. */
  ultima_busqueda: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cronómetros (Modo Cocina)
// ─────────────────────────────────────────────────────────────────────────────

export type EstadoTimer = "corriendo" | "pausado" | "terminado";

export interface Timer {
  id: string;
  etiqueta: string;
  /** Segundos totales al iniciar. */
  duracion_segundos: number;
  /** Segundos restantes, recalculados desde `termina_en`. */
  restante_segundos: number;
  estado: EstadoTimer;
  /**
   * Momento exacto (epoch ms) en que termina el timer mientras corre.
   * null = pausado o terminado. Es la fuente de verdad para evitar el
   * desfasaje de los `setInterval` en pestañas en segundo plano.
   */
  termina_en: number | null;
}
