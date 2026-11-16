# ¿Qué cocino hoy? — Recetas para resolver la comida

App web de cocina práctica para principiantes, gente sin tiempo o indecisa:
decís qué tenés en la heladera y qué restricciones alimentarias respetás,
y te muestra qué podés cocinar ya, con cronómetros integrados por paso.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4, Cache Components)
- **PostgreSQL en Supabase** (RLS: lectura pública, escritura bloqueada)
- **Sin login**: heladera, restricciones, favoritos y última búsqueda en `localStorage`
- **PWA instalable**: manifest, service worker y página offline (sin dependencias)
- **Sin IA en esta fase**: recetas cargadas manualmente en la base

## Puesta en marcha

```bash
npm install
npm run dev
```

### Conectar Supabase (5 minutos)

1. Creá un proyecto gratis en [supabase.com](https://supabase.com).
2. En el **SQL Editor** del dashboard, ejecutá en orden:
   1. `supabase/migrations/0001_init.sql` — tablas, índices y RLS.
   2. `supabase/migrations/0002_seguridad_e_indices.sql` — revoke de escrituras.
   3. `supabase/migrations/0003_reemplazos.sql` — reemplazos verificables por el motor.
   4. `supabase/migrations/0004_categoria.sql` — perfil de sabor (salado/dulce).
   4. `supabase/seed.sql` — 55 ingredientes y 60 recetas de ejemplo.
3. Copiá `.env.example` a `.env.local` y completá:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project Settings → API → URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API → anon public)
4. Reiniciá `npm run dev`.

> **Ojo con el orden:** `seed.sql` completa la columna `reemplazo_ingrediente_id`,
> que crea `0003`. Si corrés el seed antes de esa migración, el `update` final
> falla. El seed es idempotente: podés volver a correrlo cuando quieras.

Mientras no esté configurado, la app muestra un aviso claro en vez de romperse.

### Agregar recetas a mano

Desde el dashboard de Supabase (Table Editor) o con SQL. Recordá:

- `recetas.macros_generales` son estimaciones **por porción**.
- `recetas.pasos` es JSONB: `[{"orden":1,"texto":"...","tiempo_segundos":600}]`
  (`tiempo_segundos` no nulo habilita el cronómetro de ese paso).
- `receta_ingredientes.cantidad_base` corresponde a `recetas.porciones_base`.
- Los ingredientes con `es_basico = true` (sal, agua, aceite, pimienta) se
  asumen siempre disponibles y no cuentan para el matching.
- Los alérgenos de `ingredientes.alergenos` son la red de seguridad: si un
  ingrediente los contiene, la receta se descarta aunque su `etiquetas_dieta`
  diga lo contrario.
- `receta_ingredientes.reemplazo_ingrediente_id` vincula el reemplazo sugerido
  con un ingrediente del catálogo: si el usuario lo tiene, la receta cuenta
  como completa ("Tenés todo usando queso cremoso"). Requiere `0003`.
- Después de tocar el catálogo, corré `npm run cobertura` para ver si las
  heladeras típicas siguen encontrando recetas.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint (incluye reglas de Next) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Tests unitarios con Vitest |
| `npm run test:watch` | Tests en modo watch |
| `npm run check` | Lint + typecheck + tests (lo mismo que corre CI) |
| `npm run cobertura` | Diagnóstico de cobertura del catálogo por heladera simulada |
| `npm run smoke` | Smokes manuales del motor y del escalado de porciones |
| `npm run iconos` | Regenera los PNG de la PWA (requiere Windows/PowerShell) |

## Funcionalidad

- **Buscador con heladera persistida**: chips + autocompletado navegable por
  teclado (combobox ARIA). La heladera y la última búsqueda sobreviven a la
  recarga; "Volver a resultados" te devuelve al listado anterior. Con alias:
  «fresa», «maíz», «aguacate», «churrasco» o «molida» encuentran frutillas,
  choclo, palta, bifes y carne picada.
- **Matching con reemplazos**: si no tenés un ingrediente pero sí su reemplazo
  del catálogo, la receta cuenta como completa y la tarjeta lo aclara.
- **Cronómetros confiables**: varios simultáneos, persistidos en
  `localStorage` por deadline absoluto (no se atrasan en segundo plano),
  con Screen Wake Lock y alerta sonora/vibración al terminar.
- **Favoritos**: página propia, guardados en el navegador, sin login.
- **Lista de compras**: por receta o para todo el listado de resultados,
  agrupada por sección del supermercado (verdulería, carnicería…) con
  cantidades; se copia al portapapeles o se manda por WhatsApp (enlace
  `wa.me`, sin backend).
- **Nunca una pantalla vacía**: si nada coincide con lo que marcaste, la
  pantalla de resultados ofrece salidas con conteos verificados: quitar el
  filtro de sabor, quitar el límite de tiempo, "si comprás X sumás N
  recetas" y Sorprendeme. Nunca sugiere quitar restricciones alimentarias.
- **Básicos configurables**: sal, agua, aceite y especias se asumen siempre
  disponibles; si alguno no lo tenés, lo desmarcás en "Lo que siempre
  tenés" y pasa a faltar (y a la lista de compras).
- **Fotos sin costo**: cuando una receta no tiene `imagen_url`, muestra una
  foto ilustrativa del CDN de Unsplash sin API ni clave. Si no carga, vuelve
  automáticamente al placeholder; las fotos propias pueden agregarse después
  desde `imagen_url`.
- **Historial local**: desde una receta podés marcar "La cociné" y verla en
  `/historial`, sin login ni datos enviados a un servidor.
- **Feedback privado**: "¿Te sirvió?" guarda una opinión por receta solo en
  este navegador para ayudarte a recordar qué volverías a cocinar.
- **PWA**: instalable, con shell offline y recetas visitadas disponibles sin
  conexión. El service worker solo se registra en producción.

## Arquitectura

```
src/
├── app/
│   ├── page.tsx              # Pantalla 1: Inicio / Buscador
│   ├── resultados/page.tsx   # Pantalla 2: Resultados (server + searchParams)
│   ├── receta/[id]/page.tsx  # Pantalla 3: Modo Cocina
│   ├── favoritos/page.tsx    # Favoritos (catálogo server + IDs del cliente)
│   ├── offline/page.tsx      # Fallback del service worker
│   ├── manifest.ts           # Manifest de la PWA
│   └── api/buscar/route.ts   # Motor como endpoint JSON (app móvil futura)
├── components/               # UI modular (buscador, resultados, receta, timers)
├── lib/
│   ├── motor-busqueda.ts     # Reglas de negocio (pura, testeable, sin I/O)
│   ├── degradacion.ts        # Opciones de la pantalla vacía (conteos reales)
│   ├── lista-compras.ts      # Lista por sección del super + texto WhatsApp
│   ├── alias.ts              # Alias de búsqueda (fresa → frutilla)
│   ├── imagenes-recetas.ts   # Fotos ilustrativas gratuitas, sin API
│   ├── porciones.ts          # Escalado de cantidades y macros
│   ├── timers.ts             # Lógica pura de cronómetros (deadline + storage)
│   ├── preferencias.ts       # localStorage validado (sin login)
│   ├── filtros.ts            # Validación de query params
│   ├── datos.ts              # Supabase con `use cache` (caché servidor/CDN)
│   └── supabase.ts           # Cliente de solo lectura
└── types/                    # Tipado estricto espejando el esquema SQL
public/
├── sw.js                     # Service worker mínimo (sin dependencias)
└── icons/                    # Iconos de la PWA (generados)
scripts/                      # Cobertura, parser del seed, smokes, iconos
tests/                        # Vitest: motor, alias, degradación, lista-compras,
                              # porciones, timers, filtros, seed, preferencias
supabase/
├── migrations/               # 0001 init, 0002 seguridad, 0003 reemplazos, 0004 categoria
└── seed.sql                  # Contenido inicial
```

### Reglas del motor de búsqueda

1. **Filtro estricto de seguridad**: descarta recetas que no cumplan las
   restricciones (por etiqueta **y** por alérgenos en ingredientes), superen
   el tiempo máximo o no entren en el perfil de sabor pedido.
2. **Coincidencia**: solo cuentan ingredientes obligatorios (se ignoran
   `es_basico` y `es_opcional`). Un obligatorio también se cubre si el usuario
   tiene su `reemplazo_ingrediente_id`.
3. **Ranking por relevancia**: si marcaste ingredientes, solo se muestran
   recetas que usan algo de lo tuyo — de la más cercana a la más lejana,
   sin tope de faltantes (un postre con 2 faltantes ajenos no se cuela
   antes que un guiso con tus ingredientes). A igual cercanía, salado
   antes que dulce. Si ninguna receta usa lo que marcaste, el motor
   devuelve vacío y la pantalla de resultados ofrece degradaciones reales
   (quitar el filtro de sabor, quitar el límite de tiempo, "si comprás X
   sumás N recetas" y Sorprendeme); las ajenas solo aparecen con la
   heladera vacía. Nunca se sugiere quitar restricciones alimentarias.
4. **Perfil de sabor**: cada receta es `salado` o `dulce`; la pantalla de
   resultados permite filtrar con los chips Todo / Salado / Dulce. Marcar
   ingredientes salados (choclo, atún) no devuelve postres entre las primeras
   opciones.
5. **Básicos configurables**: sal, agua, aceite y especias se asumen
   disponibles (`es_basico`), pero el usuario puede desmarcarlos en "Lo que
   siempre tenés" (`Preferencias.sin_basicos` / query `sin_basicos=`): dejan
   de asumirse y pasan a faltar en las recetas que los piden.

### Escalado futuro (previsto en el diseño)

- **IA**: el motor es una función pura; una capa generativa puede producir
  `RecetaConIngredientes` y entrar al mismo pipeline.
- **App móvil**: consume `/api/buscar` y `/api/receta` sin duplicar lógica.
- **Escritura**: agregar políticas RLS de INSERT con rol autorizado; hoy la
  anon key solo lee.
