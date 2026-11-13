-- =============================================================
-- 0001_init.sql — Esquema inicial de la app de recetas
-- Ejecutar con: supabase db push (o desde el SQL Editor del dashboard)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- Enumeraciones
-- ─────────────────────────────────────────────────────────────
create type dificultad as enum ('cero_cocina', 'facil');

create type unidad_medida as enum ('g', 'ml', 'unidad', 'cda', 'taza', 'pizca');

-- ─────────────────────────────────────────────────────────────
-- Tablas
-- ─────────────────────────────────────────────────────────────

-- Ingredientes del catálogo. `es_basico` = sal/agua/aceite/pimienta: se
-- asumen siempre disponibles y no cuentan para el matching.
create table ingredientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  categoria text not null default 'otros',
  es_basico boolean not null default false,
  -- Alérgenos declarados del producto. La contaminación cruzada se
  -- advierte por UI; aquí solo van alérgenos intrínsecos.
  alergenos text[] not null default '{}'
    check (alergenos <@ array['gluten','lactosa','frutos_secos','huevo','pescado']::text[]),
  created_at timestamptz not null default now()
);

-- Recetas cargadas manualmente (sin IA en esta fase). `pasos` es un array
-- de { orden, texto, tiempo_segundos } para habilitar cronómetros por paso.
create table recetas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null unique,
  descripcion_corta text not null,
  tiempo_minutos int not null check (tiempo_minutos > 0),
  dificultad dificultad not null default 'facil',
  porciones_base int not null default 2 check (porciones_base >= 1),
  pasos jsonb not null default '[]'::jsonb,
  tip_principiante text,
  -- Etiquetas de dieta DECLARADAS. La seguridad por alérgeno se refuerza
  -- en el motor de búsqueda con ingredientes.alergenos.
  etiquetas_dieta text[] not null default '{}'
    check (etiquetas_dieta <@ array['vegetariano','vegano','sin_tacc','sin_lactosa','sin_frutos_secos']::text[]),
  -- Macros orientativos POR PORCIÓN: { calorias, perfil, proteinas, carbohidratos, grasas }
  macros_generales jsonb not null default '{}'::jsonb,
  imagen_url text,
  created_at timestamptz not null default now()
);

-- Relación receta ↔ ingrediente con cantidades base por `porciones_base`.
create table receta_ingredientes (
  receta_id uuid not null references recetas (id) on delete cascade,
  ingrediente_id uuid not null references ingredientes (id) on delete cascade,
  cantidad_base numeric not null check (cantidad_base >= 0),
  unidad unidad_medida not null default 'unidad',
  -- Texto orientado a principiantes: "un puñado (más o menos 50 g)".
  texto_principiante text,
  es_opcional boolean not null default false,
  -- Sugerencia de reemplazo para principiantes: "queso cremoso", etc.
  reemplazo_sugerido text,
  primary key (receta_id, ingrediente_id)
);

-- ─────────────────────────────────────────────────────────────
-- Índices para el motor de búsqueda
-- ─────────────────────────────────────────────────────────────
create index idx_ingredientes_nombre on ingredientes (nombre);
create index idx_ingredientes_alergenos on ingredientes using gin (alergenos);
create index idx_recetas_tiempo on recetas (tiempo_minutos);
create index idx_recetas_dieta on recetas using gin (etiquetas_dieta);
create index idx_receta_ingredientes_ingrediente on receta_ingredientes (ingrediente_id);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- Fase 1: lectura pública, escritura bloqueada al público.
-- Las cargas se hacen desde el dashboard o con la service key
-- (solo servidor). NO hay políticas de INSERT/UPDATE/DELETE.
-- ─────────────────────────────────────────────────────────────
alter table ingredientes enable row level security;
alter table recetas enable row level security;
alter table receta_ingredientes enable row level security;

create policy "lectura_publica_ingredientes"
  on ingredientes for select
  to anon, authenticated
  using (true);

create policy "lectura_publica_recetas"
  on recetas for select
  to anon, authenticated
  using (true);

create policy "lectura_publica_receta_ingredientes"
  on receta_ingredientes for select
  to anon, authenticated
  using (true);
