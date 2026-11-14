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
| 3 | `migrations/0003_reemplazos.sql` | Columna `reemplazo_ingrediente_id` + FK + índice |
| 4 | `seed.sql` | Catálogo: 54 ingredientes + 37 recetas |

Desde el dashboard de Supabase: pegar cada archivo en el SQL Editor, en
ese orden. Con CLI: `supabase db push` (migraciones) y luego ejecutar
`seed.sql` en el SQL Editor.

`seed.sql` es **idempotente** y transaccional: se puede volver a correr
sin duplicar filas ni dejar el catálogo a medias.

> **Si ya tenías el catálogo cargado:** aplicá `0003` y volvé a correr
> `seed.sql`. La migración agrega la columna y el seed completa los IDs de
> los reemplazos. Correr el seed antes de `0003` falla porque la columna
> todavía no existe.

## Convenciones

- **Migraciones inmutables**: nunca se edita un archivo ya aplicado; los
  cambios van como `NNNN_nombre.sql` nuevo y secuencial.
- **Idempotencia**: los `revoke`/`drop` de `0002` y el `alter`/`update` de
  `0003` usan guardias para poder re-ejecutarse sin error.
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

Reemplazos verificables (debe devolver 20 filas tras el seed):

```sql
select count(*) as reemplazos_vinculados
from receta_ingredientes
where reemplazo_ingrediente_id is not null;
```

Integridad de los reemplazos (debe devolver 0 filas: nadie se reemplaza a
sí mismo y todos apuntan a un ingrediente existente):

```sql
select ri.receta_id, ri.ingrediente_id, ri.reemplazo_ingrediente_id
from receta_ingredientes ri
left join ingredientes i on i.id = ri.reemplazo_ingrediente_id
where ri.reemplazo_ingrediente_id is not null
  and (ri.reemplazo_ingrediente_id = ri.ingrediente_id or i.id is null);
```
