# ¿Qué cocino hoy? — Recetas para resolver la comida

App web de cocina práctica para principiantes, gente sin tiempo o indecisa:
decís qué tenés en la heladera y qué restricciones alimentarias respetás,
y te muestra qué podés cocinar ya, con cronómetros integrados por paso.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4, Cache Components)
- **PostgreSQL en Supabase** (RLS: lectura pública, escritura bloqueada)
- **Sin login**: preferencias y favoritos en `localStorage`
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
   2. `supabase/seed.sql` — 24 ingredientes y 9 recetas de ejemplo.
3. Copiá `.env.local.example` a `.env.local` y completá:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project Settings → API → URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API → anon public)
4. Reiniciá `npm run dev`.

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

## Arquitectura

```
src/
├── app/
│   ├── page.tsx              # Pantalla 1: Inicio / Buscador
│   ├── resultados/page.tsx   # Pantalla 2: Resultados (server + searchParams)
│   ├── receta/[id]/page.tsx  # Pantalla 3: Modo Cocina
│   └── api/buscar/route.ts   # Motor como endpoint JSON (app móvil futura)
├── components/               # UI modular (buscador, resultados, receta, timers)
├── lib/
│   ├── motor-busqueda.ts     # Reglas de negocio (pura, testeable, sin I/O)
│   ├── porciones.ts          # Escalado de cantidades y macros
│   ├── preferencias.ts       # localStorage validado (sin login)
│   ├── filtros.ts            # Validación de query params
│   ├── datos.ts              # Supabase con `use cache` (caché servidor/CDN)
│   └── supabase.ts           # Cliente de solo lectura
└── types/                    # Tipado estricto espejando el esquema SQL
supabase/
├── migrations/0001_init.sql  # Tablas + índices GIN + RLS solo lectura
└── seed.sql                  # Contenido inicial
```

### Reglas del motor de búsqueda

1. **Filtro estricto de seguridad**: descarta recetas que no cumplan las
   restricciones (por etiqueta **y** por alérgenos en ingredientes) o superen
   el tiempo máximo.
2. **Coincidencia**: solo cuentan ingredientes obligatorios (se ignoran
   `es_basico` y `es_opcional`).
3. **Ranking**: Nivel 1 "Tenés todo" (desempata menor tiempo → menor
   dificultad) → Nivel 2 "Te falta 1" (con reemplazo sugerido) → Nivel 3
   "Te faltan 2" (solo si los niveles 1 y 2 devuelven menos de 3 resultados).

### Escalado futuro (previsto en el diseño)

- **IA**: el motor es una función pura; una capa generativa puede producir
  `RecetaConIngredientes` y entrar al mismo pipeline.
- **App móvil**: consume `/api/buscar` y `/api/receta` sin duplicar lógica.
- **Escritura**: agregar políticas RLS de INSERT con rol autorizado; hoy la
  anon key solo lee.
