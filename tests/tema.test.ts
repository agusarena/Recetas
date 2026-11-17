import { describe, expect, it } from "vitest";
import { SCRIPT_TEMA_INICIAL, TEMA_DEFAULT, esTema, resolverTema } from "@/lib/tema";

describe("tema de la página", () => {
  it("por defecto sigue el sistema", () => {
    expect(TEMA_DEFAULT).toBe("sistema");
  });

  it("acepta solo los tres temas válidos", () => {
    expect(esTema("sistema")).toBe(true);
    expect(esTema("claro")).toBe(true);
    expect(esTema("oscuro")).toBe(true);
    expect(esTema("azul")).toBe(false);
    expect(esTema(null)).toBe(false);
    expect(esTema(3)).toBe(false);
  });

  it("resuelve 'sistema' según el esquema del sistema operativo", () => {
    expect(resolverTema("sistema", true)).toBe("oscuro");
    expect(resolverTema("sistema", false)).toBe("claro");
  });

  it("ignora el sistema cuando el usuario elige un tema fijo", () => {
    expect(resolverTema("claro", true)).toBe("claro");
    expect(resolverTema("oscuro", false)).toBe("oscuro");
  });

  it("el script inicial es JavaScript válido", () => {
    expect(() => new Function(SCRIPT_TEMA_INICIAL)).not.toThrow();
  });
});
