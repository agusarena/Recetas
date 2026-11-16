# 🍳 ¿Qué cocino hoy? — Recetas para resolver la comida

Una aplicación web práctica, rápida y pensada para resolver la comida diaria con lo que tenés a mano en la heladera y la alacena. Ideal para principiantes, gente con poco tiempo o indecisos frente al fuego.

🌐 **Web en producción:** [recetas-xi-ten.vercel.app](https://recetas-xi-ten.vercel.app/)

---

## 🌟 Características Principales

* 🧊 **Búsqueda por Heladera:** Elegí los ingredientes que tenés en casa (con autocompletado y alias cotidianos como *palta/aguacate*, *frutilla/fresa*, *carne picada/molida*).
* 🛡️ **Seguridad Alimentaria Estricta:** Filtros confiables para dietas y alérgenos (*Vegetariano*, *Vegano*, *Sin TACC*, *Sin Lactosa*, *Sin Huevo*, *Sin Frutos Secos*, *Sin Pescado*). La exclusión se verifica tanto por etiquetas de la receta como por los ingredientes reales.
* 🔄 **Matching con Reemplazos Inteligentes:** Si una receta pide queso rallado pero tenés queso cremoso (o atún en lugar de pollo), el motor lo detecta y te muestra la receta como lista para cocinar.
* ⏱️ **Modo Cocina con Cronómetros Reales:** Timers por paso basados en hora absoluta (`Date.now()`), por lo que **no se atrasan ni se pausan** si la pantalla se bloquea o la pestaña queda de fondo. Incluye alertas sonoras con Web Audio API y Screen Wake Lock.
* ⚖️ **Escalado Dinámico de Porciones:** Ajustá las porciones deseadas (1, 2, 4 o más) y las cantidades de ingredientes y macros orientativos se recalculan automáticamente.
* 🛒 **Lista de Compras Integrada:** ¿Te falta un ingrediente? Podés copiar la lista organizada por góndola (verdulería, carnicería, lácteos) o enviártela a tu WhatsApp con un solo clic.
* 🚫 **Sin Bloqueos ni Pantallas Vacías:** Si tu combinación de ingredientes no tiene coincidencia exacta, el motor sugiere alternativas cercanas (*"Si comprás X sumás N recetas"* o *"Quitar límite de tiempo"*).
* 🔒 **100% Privado y Sin Login:** Tu heladera, recetas favoritas y preferencias se guardan de forma local en tu navegador mediante `localStorage`. Cero fricción, sin cuentas ni contraseñas.
* 📱 **PWA Instalable (Progressive Web App):** Instalable en escritorio o celular con soporte offline mediante Service Worker.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components & Cache Components con Turbopack) |
| **Lenguaje** | [TypeScript 5](https://www.typescriptlang.org/) (Tipado estricto de punta a punta) |
| **Estilos** | [Tailwind CSS 4](https://tailwindcss.com/) (Diseño responsivo, accesible y ligero) |
| **Base de Datos** | [PostgreSQL en Supabase](https://supabase.com/) con **Row Level Security (RLS)** estricto (solo lectura pública) |
| **Testing** | [Vitest](https://vitest.dev/) con suite completa de pruebas unitarias |
| **Hosting & CI/CD** | [Vercel](https://vercel.com/) + GitHub Actions |

---

## 🚀 Instalación y Puesta en Marcha Local

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/TU_USUARIO/recetas.git
cd recetas
npm install
```

### 2. Configurar Supabase

1. Creá un proyecto gratuito en [supabase.com](https://supabase.com).
2. En el panel lateral, abrí el **SQL Editor** y ejecutá en orden las migraciones ubicadas en `supabase/migrations/`:
   1. `0001_init.sql` — Tablas base (`ingredientes`, `recetas`, `receta_ingredientes`), tipos ENUM y políticas RLS iniciales.
   2. `0002_seguridad_e_indices.sql` — Endurecimiento de seguridad (revoke de escrituras públicas) e índices de búsqueda.
   3. `0003_reemplazos.sql` — Clave foránea para vincular reemplazos con ingredientes del catálogo.
   4. `0004_categoria.sql` — Clasificación por perfil de sabor (`salado` / `dulce`).
   5. `0005_principal.sql` — Ingrediente protagonista de cada receta (`es_principal`), que pesa más en el ranking.
3. Ejecutá `supabase/seed.sql` para cargar el catálogo inicial de recetas e ingredientes (68 ingredientes y 100 recetas).
4. Creá tu archivo `.env.local` a partir de `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
5. Completá tus claves (las encontrás en **Project Settings → API** de Supabase):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_publica
   ```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación funcionando.

---

## 🧪 Comandos Útiles

El proyecto cuenta con scripts de validación y diagnóstico:

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el entorno de desarrollo local con recarga rápida. |
| `npm run build` | Compila y optimiza la aplicación para producción. |
| `npm test` | Ejecuta la suite de pruebas unitarias con Vitest. |
| `npm run test:watch` | Ejecuta los tests en modo observador interactivo. |
| `npm run check` | Corre el pipeline completo: `lint` + `typecheck` + `test` (igual que en CI). |
| `npm run cobertura` | Diagnostica el % de heladeras típicas que encuentran al menos 3 recetas. |
| `npm run smoke` | Pruebas manuales de consistencia del motor y cálculo de porciones. |

---

## 📂 Estructura del Proyecto

```text
recetas/
├── .github/workflows/        # Pipeline de Integración Continua (CI con GitHub Actions)
├── public/                   # Manifiesto PWA, iconos y Service Worker
├── scripts/                  # Scripts de cobertura, diagnóstico y validación
├── src/
│   ├── app/                  # Rutas y páginas de Next.js (App Router)
│   │   ├── page.tsx          # Inicio / Buscador de heladera
│   │   ├── resultados/       # Listado de recetas encontradas
│   │   ├── receta/[id]/      # Modo Cocina interactivo
│   │   ├── favoritos/        # Recetas guardadas en el navegador
│   │   └── api/buscar/       # Endpoint API para búsqueda
│   ├── components/           # Componentes modulares de UI (Timers, Buscador, Receta, etc.)
│   ├── lib/                  # Lógica pura desacoplada
│   │   ├── motor-busqueda.ts # Algoritmo de ranking y matching de ingredientes
│   │   ├── timers.ts         # Motor de cronómetros inmune a suspensión de pestaña
│   │   ├── porciones.ts      # Cálculo proporcional de ingredientes y macros
│   │   ├── lista-compras.ts  # Generación de listas y exportación a WhatsApp
│   │   ├── degradacion.ts    # Sugerencias cuando no hay coincidencia exacta
│   │   └── datos.ts          # Conexión optimizada a Supabase con caché de servidor
│   └── types/                # Definiciones de tipos TypeScript
├── supabase/
│   ├── migrations/           # Scripts SQL versionados
│   └── seed.sql              # Catálogo de datos inicial
└── tests/                    # Tests unitarios automatizados (Vitest)
```

---

## 🔒 Privacidad y Seguridad

* **Sin rastreo:** No se almacenan datos personales, cookies invasivas ni sesiones de usuario en servidores remotos.
* **Seguridad de Base de Datos:** Supabase opera bajo estrictas políticas RLS donde la clave pública (`anon`) solo tiene permisos de lectura (`SELECT`), impidiendo cualquier intento de inserción o alteración indebida de datos.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Podés utilizarlo, modificarlo y desplegarlo libremente.
