import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { TimerProvider } from "@/components/timers/TimerProvider";
import { BarraTimers } from "@/components/timers/BarraTimers";
import { SitioHeader } from "@/components/SitioHeader";
import { ServiceWorkerRegistro } from "@/components/ServiceWorkerRegistro";
import "./globals.css";

/** Títulos y números destacados: serif editorial con carácter propio. */
const fraunces = Fraunces({
  variable: "--font-titulos",
  subsets: ["latin"],
  axes: ["opsz"],
});

/** Texto e interfaz: grotesca limpia, sin parecer la default de ningún stack. */
const instrumentSans = Instrument_Sans({
  variable: "--font-texto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "¿Qué cocino hoy? — Recetas para resolver la comida",
    template: "%s | ¿Qué cocino hoy?",
  },
  description:
    "Decinos qué tenés en la heladera y te mostramos qué cocinar: recetas simples para principiantes, con cronómetros y reemplazos sugeridos.",
  appleWebApp: {
    capable: true,
    title: "Qué cocino",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e5c45",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TimerProvider>
          <SitioHeader />
          <div className="flex-1">{children}</div>
          <BarraTimers />
        </TimerProvider>
        <ServiceWorkerRegistro />
      </body>
    </html>
  );
}
