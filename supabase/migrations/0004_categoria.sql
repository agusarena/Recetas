-- =============================================================
-- 0004_categoria.sql — Recetas dulces vs. saladas
--
-- Diferencia postres y desayunos dulces de los platos salados, para
-- dos cosas:
--  1. Que el motor no mezcle un postre entre las primeras opciones
--     cuando el usuario marcó ingredientes salados (ej. choclo y atún).
--  2. Un filtro explícito "Salado / Dulce" en la pantalla de resultados.
--
-- Ejecutar DESPUÉS de 0003. Es idempotente. Después de aplicarla,
-- volver a correr `seed.sql` (es idempotente).
-- =============================================================

alter table public.recetas
  add column if not exists categoria text not null default 'salado';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_recetas_categoria'
      and conrelid = 'public.recetas'::regclass
  ) then
    alter table public.recetas
      add constraint ck_recetas_categoria
      check (categoria in ('salado', 'dulce'));
  end if;
end $$;

-- Marca las recetas dulces del catálogo (el resto queda 'salado'
-- por el default). Los IDs coinciden con seed.sql.
update public.recetas set categoria = 'dulce' where id in (
  '00000000-0000-4000-8000-000000000108', -- Bowl de banana, avena y yogur
  '00000000-0000-4000-8000-000000000117', -- Panqueques rápidos de avena y banana
  '00000000-0000-4000-8000-000000000120', -- Yogur con manzana, nueces y miel
  '00000000-0000-4000-8000-000000000128', -- Licuado de pera, yogur y miel
  '00000000-0000-4000-8000-000000000129', -- Tostadas de pera con miel
  '00000000-0000-4000-8000-000000000137', -- Ensalada de frutas con miel y yogur
  '00000000-0000-4000-8000-000000000144', -- Postre de banana con dulce de leche
  '00000000-0000-4000-8000-000000000145'  -- Ensalada de frutas con duraznos y frutillas
);

comment on column public.recetas.categoria is
  'Perfil de sabor del plato: "salado" (default) o "dulce" (postres y desayunos dulces).';
