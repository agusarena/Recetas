import { describe, expect, it } from "vitest";
import { creditoDeFoto } from "../src/lib/creditos-fotos";

describe("créditos de fotos", () => {
  it("devuelve autor, licencia y página de una receta con foto", () => {
    const credito = creditoDeFoto("00000000-0000-4000-8000-000000000101");
    expect(credito).not.toBeNull();
    expect(credito?.licencia).toMatch(/^CC|Public domain/);
    expect(credito?.pagina).toContain("commons.wikimedia.org");
    expect(credito?.autor.length).toBeGreaterThan(0);
  });

  it("devuelve null para una receta sin foto revisada", () => {
    expect(creditoDeFoto("00000000-0000-4000-8000-000000000103")).toBeNull();
  });
});
