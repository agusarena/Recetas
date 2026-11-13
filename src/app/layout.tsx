import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TimerProvider } from "@/components/timers/TimerProvider";
import { BarraTimers } from "@/components/timers/BarraTimers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "¿Qué cocino hoy? — Recetas para resolver la comida",
    template: "%s | ¿Qué cocino hoy?",
  },
  description:
    "Decinos qué tenés en la heladera y te mostramos qué cocinar: recetas simples para principiantes, con cronómetros y reemplazos sugeridos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TimerProvider>
          <div className="flex-1">{children}</div>
          <BarraTimers />
        </TimerProvider>
      </body>
    </html>
  );
}
