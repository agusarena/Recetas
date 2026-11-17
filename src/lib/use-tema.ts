"use client";

/** Hook de React para leer y cambiar el tema de la página. */
import { useSyncExternalStore } from "react";
import { TEMA_DEFAULT, establecerTema, leerTema, suscribirseTema, type Tema } from "@/lib/tema";

export function useTema() {
  const tema = useSyncExternalStore(suscribirseTema, leerTema, () => TEMA_DEFAULT);
  return { tema, cambiarTema: (nuevo: Tema) => establecerTema(nuevo) };
}
