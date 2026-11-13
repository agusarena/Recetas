# Base de datos (Supabase)

Esquema de la app de recetas: catálogo de ingredientes, recetas y su
relación (cantidades por porción base). Solo lectura pública; la carga
de contenido se hace con la service key o desde el dashboard.

## Orden de ejecución

Correr los archivos en este orden (cada migración asume las anteriores):

| Paso | Archivo | Qué hace |
|---|---|---|
| 1 | `migrations/0001_init.sql` | Tablas, enums, índices y RLS (lectura pública) |
| 2 | `migrations/0002_seguridad_e_indices.sql` | Revoke de escrituras + drop de índice redundante |
| 3 | `seed.sql` | Catálogo inicial: 40 ingredientes + 21 recetas |

Desde el dashboard de Supabase: pegar cada archivo en el SQL Editor, en
ese orden. Con CLI: `supabase db push` (migraciones) y luego ejecutar
`seed.sql` en el SQL Editor.

`seed.sql` es **idempotente** y transaccional: se puede volver a correr
sin duplicar filas ni dejar el catálogo a medias.

## Convenciones

- **Migraciones inmutables**: nunca se edita un archivo ya aplicado; los
  cambios van como `NNNN_nombre.sql` nuevo y secuencial.
- **Idempotencia**: los `revoke`/`drop` de `0002` usan guardias (`do $$`
  blocks) para poder re-ejecutarse sin error.
- **Nombres**: tablas, columnas e índices en `snake_case` minúsculo;
  índices con prefijo `idx_`; políticas RLS con nombre descriptivo de la
  operación que permiten (`lectura_publica_*`).
- **RLS en tres capas**: 1) RLS habilitado en todas las tablas,
  2) únicamente políticas `for select` (no existen de escritura),
  3) `revoke` de INSERT/UPDATE/DELETE/TRUNCATE a `anon`/`authenticated`.
  El `service_role` del backend conserva acceso total.

## Verificaciones útiles (SQL Editor)

Índices de FK faltantes (debe devolver 0 filas):

```sql
select conrelid::regclass as tabla, a.attname as columna_fk
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f'
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid and a.attnum = any(i.indkey)
  );
```

Privilegios de escritura vigentes (debe devolver solo `service_role`):

```sql
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and privilege_type in ('insert', 'update', 'delete')
order by table_name, grantee;
```

Datos cargados:

```sql
select
  (select count(*) from ingredientes) as ingredientes,
  (select count(*) from recetas) as recetas,
  (select count(*) from receta_ingredientes) as relaciones;
```
