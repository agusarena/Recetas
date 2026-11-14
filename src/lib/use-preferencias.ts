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
  const [hidratado, setHidratado] = useState(false);

  // Sincroniza con localStorage al montar y con otras pestañas (evento storage).
  useEffect(
    () =>
      suscribirsePreferencias((nuevas) => {
        setPreferencias(nuevas);
        setHidratado(true);
      }),
    [],
  );

  /** Aplica un cambio y lo persiste. */
  const actualizar = useCallback(
    (cambio: (prev: Preferencias) => Preferencias) => {
      setPreferencias((prev) => {
        const nuevas = cambio(prev);
        guardarPreferencias(nuevas);
        return nuevas;
      });
    },
    [],
  );

  /** Agrega o quita una restricción/alergia y persiste. */
  const toggleRestriccion = useCallback(
    (valor: EtiquetaDieta) => {
      actualizar((prev) => {
        const restricciones = prev.restricciones.includes(valor)
          ? prev.restricciones.filter((r) => r !== valor)
          : [...prev.restricciones, valor];
        return { ...prev, restricciones };
      });
    },
    [actualizar],
  );

  /** Marca o desmarca una receta como favorita y persiste. */
  const toggleFavorito = useCallback(
    (recetaId: string) => {
      actualizar((prev) => {
        const favoritos = prev.favoritos.includes(recetaId)
          ? prev.favoritos.filter((f) => f !== recetaId)
          : [...prev.favoritos, recetaId];
        return { ...prev, favoritos };
      });
    },
    [actualizar],
  );

  /** Reemplaza la heladera completa (chips del buscador). */
  const setHeladera = useCallback(
    (heladera: string[]) => {
      actualizar((prev) => ({ ...prev, heladera }));
    },
    [actualizar],
  );

  /** Guarda la query de la última búsqueda para volver desde una receta. */
  const guardarUltimaBusqueda = useCallback(
    (query: string | null) => {
      actualizar((prev) => ({ ...prev, ultima_busqueda: query }));
    },
    [actualizar],
  );

  return {
    preferencias,
    /** false hasta la primera lectura de localStorage (evita parpadeos). */
    hidratado,
    toggleRestriccion,
    toggleFavorito,
    setHeladera,
    guardarUltimaBusqueda,
  };
}
