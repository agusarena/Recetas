/**
 * Cliente de Supabase SOLO para el servidor (Server Components / Route
 * Handlers). Con RLS activo, la anon key solo permite SELECT público;
 * toda escritura queda bloqueada (RLS + revoke en 0002).
 *
 * El cliente se crea una única vez por proceso y se reutiliza en todos
 * los pedidos (pooling de conexiones): fabricar uno por llamada abre
 * conexiones HTTP nuevas innecesarias contra Supabase.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** true si las variables de entorno de Supabase están presentes. */
export function supabaseConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Cliente de solo lectura, cacheado por proceso. Devuelve `null` cuando
 * falta configuración, para que la UI degrade con gracia en vez de
 * crashear. Ese caso null NO se cachea: si el entorno se completa
 * (deploy con variables tardías), la próxima llamada lo detecta.
 */
let clienteCacheado: SupabaseClient | null = null;

export function crearClienteSupabase(): SupabaseClient | null {
  if (clienteCacheado) return clienteCacheado;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  clienteCacheado = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return clienteCacheado;
}
