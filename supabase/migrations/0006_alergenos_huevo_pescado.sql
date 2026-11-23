-- =============================================================
-- 0006_alergenos_huevo_pescado.sql — Filtros explícitos de alergia
--
-- Extiende las etiquetas permitidas y normaliza el catálogo existente.
-- El seed repite la normalización para instalaciones nuevas y para mantener
-- el proceso idempotente cuando se vuelve a cargar el catálogo.
-- =============================================================

alter table public.recetas
  drop constraint if exists recetas_etiquetas_dieta_check;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ck_recetas_etiquetas_dieta'
      and conrelid = 'public.recetas'::regclass
  ) then
    alter table public.recetas
      add constraint ck_recetas_etiquetas_dieta
      check (
        etiquetas_dieta <@ array[
          'vegetariano',
          'vegano',
          'sin_tacc',
          'sin_lactosa',
          'sin_frutos_secos',
          'sin_huevo',
          'sin_pescado'
        ]::text[]
      );
  end if;
end $$;

-- Quita declaraciones contradictorias y agrega las que se deducen de los
-- alérgenos de los ingredientes (incluidos los opcionales).
update public.recetas r
set etiquetas_dieta = array_remove(r.etiquetas_dieta, 'sin_huevo')
where 'sin_huevo' = any(r.etiquetas_dieta)
  and exists (
    select 1
    from public.receta_ingredientes ri
    join public.ingredientes i on i.id = ri.ingrediente_id
    where ri.receta_id = r.id
      and i.alergenos @> array['huevo']::text[]
  );

update public.recetas r
set etiquetas_dieta = array_append(r.etiquetas_dieta, 'sin_huevo')
where not ('sin_huevo' = any(r.etiquetas_dieta))
  and not exists (
    select 1
    from public.receta_ingredientes ri
    join public.ingredientes i on i.id = ri.ingrediente_id
    where ri.receta_id = r.id
      and i.alergenos @> array['huevo']::text[]
  );

update public.recetas r
set etiquetas_dieta = array_remove(r.etiquetas_dieta, 'sin_pescado')
where 'sin_pescado' = any(r.etiquetas_dieta)
  and exists (
    select 1
    from public.receta_ingredientes ri
    join public.ingredientes i on i.id = ri.ingrediente_id
    where ri.receta_id = r.id
      and i.alergenos @> array['pescado']::text[]
  );

update public.recetas r
set etiquetas_dieta = array_append(r.etiquetas_dieta, 'sin_pescado')
where not ('sin_pescado' = any(r.etiquetas_dieta))
  and not exists (
    select 1
    from public.receta_ingredientes ri
    join public.ingredientes i on i.id = ri.ingrediente_id
    where ri.receta_id = r.id
      and i.alergenos @> array['pescado']::text[]
  );
