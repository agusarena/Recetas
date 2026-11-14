-- =============================================================
-- 0003_reemplazos.sql — Reemplazos que el motor puede verificar
--
-- Hasta ahora `reemplazo_sugerido` era solo texto para mostrar. Esta
-- columna vincula el reemplazo con un ingrediente real del catálogo,
-- para que el motor cuente la receta como completa si el usuario lo
-- tiene en la heladera.
--
-- Ejecutar DESPUÉS de 0002. Es idempotente.
-- Después de aplicarla, volver a correr `seed.sql` para completar los
-- IDs de los reemplazos existentes (el seed es idempotente).
-- =============================================================

alter table public.receta_ingredientes
  add column if not exists reemplazo_ingrediente_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_receta_ingredientes_reemplazo'
      and conrelid = 'public.receta_ingredientes'::regclass
  ) then
    alter table public.receta_ingredientes
      add constraint fk_receta_ingredientes_reemplazo
      foreign key (reemplazo_ingrediente_id)
      references public.ingredientes (id)
      on delete set null;
  end if;
end $$;

-- Índice para el ON DELETE SET NULL y para futuras consultas por reemplazo.
create index if not exists idx_receta_ingredientes_reemplazo
  on public.receta_ingredientes (reemplazo_ingrediente_id);

comment on column public.receta_ingredientes.reemplazo_ingrediente_id is
  'Ingrediente del catálogo que puede sustituir a ingrediente_id. NULL = solo texto libre.';
