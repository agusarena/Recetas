-- =============================================================
-- 0002_seguridad_e_indices.sql — Refinamientos del esquema
-- Ejecutar DESPUÉS de 0001_init.sql (y antes o después del seed).
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- No se editó 0001_init.sql porque una migración ya aplicada es
-- inmutable: los cambios van siempre como archivo nuevo.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Mínimo privilegio (defensa en profundidad)
--
-- Supabase otorga INSERT/UPDATE/DELETE a anon y authenticated por
-- defecto. Hoy la escritura se bloquea solo porque no existen
-- políticas RLS de escritura; el revoke la bloquea además a nivel
-- de privilegios. El service_role (backend) conserva acceso total.
-- ─────────────────────────────────────────────────────────────
revoke insert, update, delete, truncate on ingredientes from anon, authenticated;
revoke insert, update, delete, truncate on recetas from anon, authenticated;
revoke insert, update, delete, truncate on receta_ingredientes from anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. Índice redundante
--
-- `ingredientes.nombre unique` ya crea un índice b-tree único;
-- `idx_ingredientes_nombre` duplicaba ese trabajo (más escritura y
-- almacenamiento, cero beneficio). Se dropea con guardia para que
-- la migración sea re-ejecutable.
-- ─────────────────────────────────────────────────────────────
do $$
begin
  if exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and indexname = 'idx_ingredientes_nombre'
  ) then
    drop index public.idx_ingredientes_nombre;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Notas de auditoría (sin cambios requeridos):
--
-- · FK receta_ingredientes.receta_id: cubierta por la PK compuesta
--   (receta_id, ingrediente_id), cuya primera columna sirve para
--   buscar por receta. No necesita índice extra.
-- · FK receta_ingredientes.ingrediente_id: tiene idx propio
--   (idx_receta_ingredientes_ingrediente), necesario para los
--   CASCADE al borrar un ingrediente.
-- · Políticas RLS `using (true)`: no evalúan funciones por fila,
--   así que la optimización `(select auth.uid())` no aplica.
-- · GIN sobre etiquetas_dieta y alergenos: correcto para filtros
--   por contenido de array (@>, &&) si el filtrado migra a SQL.
-- ─────────────────────────────────────────────────────────────
