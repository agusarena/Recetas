/**
 * Aviso mostrado cuando Supabase no está configurado todavía (degradación
 * grácil: la app se ve y entiende qué falta, en vez de romperse).
 */
export function AvisoConfiguracion({ detalle }: { detalle?: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm leading-relaxed text-amber-900">
      <h2 className="mb-2 text-lg font-bold">Falta conectar la base de datos</h2>
      <p className="mb-3">
        La app funciona, pero todavía no puede leer recetas. Para activarla:
      </p>
      <ol className="mb-3 list-decimal space-y-1 pl-5">
        <li>Creá un proyecto gratis en <strong>supabase.com</strong>.</li>
        <li>
          Copiá <code className="rounded bg-amber-100 px-1">.env.local.example</code> a{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code> y completá{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </li>
        <li>
          Ejecutá <code className="rounded bg-amber-100 px-1">supabase/migrations/0001_init.sql</code>{" "}
          y luego <code className="rounded bg-amber-100 px-1">supabase/seed.sql</code> en el SQL
          Editor del dashboard.
        </li>
        <li>Reiniciá el servidor de desarrollo.</li>
      </ol>
      {detalle ? <p className="font-mono text-xs">{detalle}</p> : null}
    </div>
  );
}
