"use client";

/**
 * Registra el service worker solo en producción. En desarrollo se evita a
 * propósito: cachear assets con hash de Turbopack genera recargas raras.
 */
import { useEffect } from "react";

export function ServiceWorkerRegistro() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const registrar = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch((error: unknown) => {
          console.warn("[pwa] no se pudo registrar el service worker", error);
        });
    };

    if (document.readyState === "complete") {
      registrar();
      return;
    }

    window.addEventListener("load", registrar, { once: true });
    return () => window.removeEventListener("load", registrar);
  }, []);

  return null;
}
