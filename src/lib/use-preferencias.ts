"use client";

/** Hook de React para leer y actualizar las preferencias del usuario. */
import { useCallback, useEffect, useState } from "react";
import type { EtiquetaDieta, Preferencias } from "@/types";
import {
  PREFERENCIAS_DEFAULT,
  guardarPreferencias,
  suscribirsePreferencias,
} from "@/lib/preferencias";

export function usePreferencias() {
  const [preferencias, setPreferencias] = useState<Preferencias>(PREFERENCIAS_DEFAULT);

  // Sincroniza con localStorage al montar y con otras pestañas (evento storage).
  useEffect(() => suscribirsePreferencias(setPreferencias), []);

  /** Agrega o quita una restricción/alergia y persiste. */
  const toggleRestriccion = useCallback((valor: EtiquetaDieta) => {
    setPreferencias((prev) => {
      const restricciones = prev.restricciones.includes(valor)
        ? prev.restricciones.filter((r) => r !== valor)
        : [...prev.restricciones, valor];
      const nuevas = { ...prev, restricciones };
      guardarPreferencias(nuevas);
      return nuevas;
    });
  }, []);

  /** Marca o desmarca una receta como favorita y persiste. */
  const toggleFavorito = useCallback((recetaId: string) => {
    setPreferencias((prev) => {
      const favoritos = prev.favoritos.includes(recetaId)
        ? prev.favoritos.filter((f) => f !== recetaId)
        : [...prev.favoritos, recetaId];
      const nuevas = { ...prev, favoritos };
      guardarPreferencias(nuevas);
      return nuevas;
    });
  }, []);

  return { preferencias, toggleRestriccion, toggleFavorito };
}
