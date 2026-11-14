/*
 * Service worker mínimo, sin dependencias.
 *
 * Estrategia:
 * - Navegaciones: red primero; si falla, última copia de la página o /offline.
 * - Recetas visitadas: se guardan para poder releerlas sin conexión.
 * - Assets estáticos (/_next/static, /icons): caché primero.
 *
 * No cachea /api ni pedidos a Supabase.
 */
const VERSION = "recetas-v1";
const CACHE_SHELL = `${VERSION}-shell`;
const CACHE_PAGINAS = `${VERSION}-paginas`;
const CACHE_ASSETS = `${VERSION}-assets`;
const SHELL = ["/offline", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const vigentes = new Set([CACHE_SHELL, CACHE_PAGINAS, CACHE_ASSETS]);
  event.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((clave) => !vigentes.has(clave)).map((clave) => caches.delete(clave))),
      )
      .then(() => self.clients.claim()),
  );
});

async function redPrimero(request, event) {
  try {
    const respuesta = await fetch(request);
    const url = new URL(request.url);

    if (respuesta.ok && url.pathname.startsWith("/receta/")) {
      const copia = respuesta.clone();
      event.waitUntil(
        caches.open(CACHE_PAGINAS).then((cache) => cache.put(request, copia)),
      );
    }
    return respuesta;
  } catch {
    const guardada = await caches.match(request);
    if (guardada) return guardada;

    const shell = await caches.open(CACHE_SHELL);
    const offline = await shell.match("/offline");
    return (
      offline ??
      new Response(
        '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión</title><body style="font-family:system-ui;padding:2rem;color:#21201c"><h1>Sin conexión</h1><p>Cuando recuperes internet, todo vuelve a estar disponible.</p></body>',
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
      )
    );
  }
}

async function cachePrimero(request) {
  const guardada = await caches.match(request);
  if (guardada) return guardada;

  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) {
      const cache = await caches.open(CACHE_ASSETS);
      cache.put(request, respuesta.clone());
    }
    return respuesta;
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(redPrimero(request, event));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cachePrimero(request));
  }
});
