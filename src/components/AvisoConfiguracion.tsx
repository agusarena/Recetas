/**
 * Aviso mostrado cuando Supabase no está configurado todavía (degradación
 * grácil: la app se ve y entiende qué falta, en vez de romperse).
 */
export function AvisoConfiguracion({ detalle }: { detalle?: string }) {
  return (
    <div className="border-l-2 border-tomate bg-tomate-tenue p-6 text-sm leading-relaxed text-tomate-oscuro">
      <h2 className="mb-2 text-base font-semibold">Falta conectar la base de datos</h2>
      <p className="mb-3">
        La app funciona, pero todavía no puede leer recetas. Para activarla:
      </p>
      <ol className="mb-3 list-decimal space-y-1 pl-5">
        <li>Creá un proyecto gratis en <strong>supabase.com</strong>.</li>
        <li>
          Copiá <code className="rounded bg-papel px-1">.env.local.example</code> a{" "}
          <code className="rounded bg-papel px-1">.env.local</code> y completá{" "}
          <code className="rounded bg-papel px-1">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code className="rounded bg-papel px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </li>
        <li>
          Ejecutá, en orden, las migraciones <code className="rounded bg-papel px-1">0001</code> a{" "}
          <code className="rounded bg-papel px-1">0006</code> de{" "}
          <code className="rounded bg-papel px-1">supabase/migrations/</code> y después{" "}
          <code className="rounded bg-papel px-1">supabase/seed.sql</code> (guía completa en{" "}
          <code className="rounded bg-papel px-1">supabase/README.md</code>).
        </li>
        <li>Reiniciá el servidor de desarrollo.</li>
      </ol>
      {detalle ? <p className="text-xs">{detalle}</p> : null}
    </div>
  );
}
