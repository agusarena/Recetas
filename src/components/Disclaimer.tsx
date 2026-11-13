/**
 * Aviso legal reutilizable. Discreto pero legible:
 * 1. los valores nutricionales son estimaciones orientativas;
 * 2. revisar siempre etiquetas de productos envasados por alérgenos
 *    o contaminación cruzada (trazas).
 */
export function DisclaimerNutricional({ compacto = false }: { compacto?: boolean }) {
  if (compacto) {
    return (
      <p className="text-[11px] leading-snug text-humo">
        Macros orientativos, no exactos. Revisá siempre la etiqueta de los productos
        envasados por alérgenos o trazas.
      </p>
    );
  }
  return (
    <div className="border-t border-linea pt-3 text-xs leading-relaxed text-humo">
      <strong className="text-tinta-suave">Aviso:</strong> los valores nutricionales son
      estimaciones orientativas calculadas por porción. Antes de cocinar para alguien con
      alergias, revisá siempre la etiqueta de cada producto envasado: puede contener
      alérgenos o trazas por contaminación cruzada.
    </div>
  );
}
