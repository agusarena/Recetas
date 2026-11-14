import { escalarCantidad, factorPorciones, formatearCantidad, escalarMacros, formatearMinutos, formatearTiempo } from "@/lib/porciones";

const factor = factorPorciones(2, 3); // 1.5
const casos: [string, unknown, unknown][] = [
  ["600 g → 900 g", formatearCantidad(escalarCantidad(600, factor), "g"), "900 g"],
  ["1 unidad → 1 ½ unidades", formatearCantidad(escalarCantidad(1, factor), "unidad"), "1 ½ unidades"],
  ["30 g → 45 g", formatearCantidad(escalarCantidad(30, factor), "g"), "45 g"],
  ["0,5 unidad → 1 unidad (redondeo ¾→1)", formatearCantidad(escalarCantidad(0.5, 1.5), "unidad"), "1 unidad"],
  ["2 cda → 3 cdas", formatearCantidad(escalarCantidad(2, factor), "cda"), "3 cdas"],
  ["1 pizca → 2 pizcas", formatearCantidad(escalarCantidad(1, 2), "pizca"), "2 pizcas"],
  ["macros x3 porciones", escalarMacros({ calorias: 420, perfil: "x", proteinas: 16, carbohidratos: 44, grasas: 19 }, 3).calorias, 1260],
  ["45 min → '45 min'", formatearMinutos(45), "45 min"],
  ["90 min → '1 h 30 min'", formatearMinutos(90), "1 h 30 min"],
  ["600 s → '10:00'", formatearTiempo(600), "10:00"],
  ["-3 s → '00:00'", formatearTiempo(-3), "00:00"],
];

let fallos = 0;
for (const [nombre, real, esperado] of casos) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  console.log(`${ok ? "✅" : `❌ (real: ${JSON.stringify(real)})`} ${nombre}`);
  if (!ok) fallos++;
}
console.log(fallos === 0 ? "\n🎉 Porciones OK" : `\n💥 ${fallos} fallo(s)`);
process.exit(fallos === 0 ? 0 : 1);
