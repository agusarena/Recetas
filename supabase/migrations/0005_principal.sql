-- =============================================================
-- 0005_principal.sql — Ingrediente principal de cada receta
--
-- Hasta ahora todos los ingredientes de una receta pesaban igual: el huevo
-- de una omelette valía lo mismo que el pan rallado de una milanesa. Esta
-- columna marca los protagonistas (los que definen el plato), y el motor
-- les da más peso al calcular la relevancia.
--
-- Ejecutar DESPUÉS de 0004. Es idempotente.
-- Después de aplicarla, volver a correr `seed.sql` para cargar los flags
-- en las relaciones existentes (el seed actualiza es_principal).
-- =============================================================

alter table public.receta_ingredientes
  add column if not exists es_principal boolean not null default false;

comment on column public.receta_ingredientes.es_principal is
  'true = ingrediente protagonista del plato (pesa más en el ranking). false = acompañamiento o condimento.';
