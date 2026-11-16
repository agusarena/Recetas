import { describe, expect, it } from "vitest";
import { imagenGratisParaReceta } from "@/lib/imagenes-recetas";

describe("imagenes gratuitas de recetas", () => {
  it("elige una foto de carne para bifes", () => {
    expect(imagenGratisParaReceta("Bifes a la criolla")).toContain("images.unsplash.com");
    expect(imagenGratisParaReceta("Bifes a la criolla")).toContain("1544025162");
  });

  it("elige una foto de postre para una receta dulce genérica", () => {
    expect(imagenGratisParaReceta("Compota exprés de pera", "dulce")).toContain("1563729784");
  });

  it("mantiene una selección estable para el mismo título", () => {
    expect(imagenGratisParaReceta("Ensalada de atún")).toBe(
      imagenGratisParaReceta("Ensalada de atún"),
    );
  });
});
