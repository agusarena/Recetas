/**
 * Cliente de Supabase SOLO para el servidor (Server Components / Route
 * Handlers). Con RLS activo, la anon key solo permite SELECT público;
 * toda escritura queda bloqueada.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** true si las variables de entorno de Supabase están presentes. */
export function supabaseConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Cliente de solo lectura. Devuelve `null` cuando falta configuración, para
 * que la UI degrade con gracia en vez de crashear.
 */
export function crearClienteSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
