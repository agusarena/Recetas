/**
 * Set de iconos propio: SVG de trazo 1.75 en un solo lenguaje visual.
 * Todos heredan el color del texto (`currentColor`) y se dimensionan con
 * las utilidades de Tailwind (ej: `h-4 w-4`). Son decorativos: llevan
 * `aria-hidden` y el significado va en el texto acompañante.
 */
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconoReloj(props: Props) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Base>
  );
}

export function IconoSombrero(props: Props) {
  return (
    <Base {...props}>
      <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.46.32-.84.73-1.04a4 4 0 0 0-2.13-7.59 5 5 0 0 0-9.19 0 4 4 0 0 0-2.13 7.59c.41.2.72.58.72 1.04V20a1 1 0 0 0 1 1Z" />
      <path d="M6 17h12" />
    </Base>
  );
}

export function IconoCesta(props: Props) {
  return (
    <Base {...props}>
      <path d="m5 11 3-6" />
      <path d="m19 11-3-6" />
      <path d="M2.5 11h19" />
      <path d="M4 11l1.6 7.1a2 2 0 0 0 1.95 1.55h10.9a2 2 0 0 0 1.95-1.55L20 11" />
      <path d="M9.5 14.5v2" />
      <path d="M14.5 14.5v2" />
    </Base>
  );
}

export function IconoDado(props: Props) {
  return (
    <Base {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <circle cx="8.75" cy="8.75" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.25" cy="15.25" r="1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function IconoCorazon({ relleno, ...props }: Props & { relleno?: boolean }) {
  return (
    <Base {...props} fill={relleno ? "currentColor" : "none"} stroke={relleno ? "none" : "currentColor"}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </Base>
  );
}

export function IconoFlechaIzquierda(props: Props) {
  return (
    <Base {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Base>
  );
}

export function IconoCheck(props: Props) {
  return (
    <Base {...props} strokeWidth={2.5}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  );
}

export function IconoCruz(props: Props) {
  return (
    <Base {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Base>
  );
}

export function IconoCampana(props: Props) {
  return (
    <Base {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Base>
  );
}

export function IconoPlay(props: Props) {
  return (
    <Base {...props} fill="currentColor" stroke="none">
      <path d="M8 5.5v13a.5.5 0 0 0 .76.43l10.5-6.5a.5.5 0 0 0 0-.86L8.76 5.07a.5.5 0 0 0-.76.43Z" />
    </Base>
  );
}

export function IconoPausa(props: Props) {
  return (
    <Base {...props} strokeWidth={2.5}>
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </Base>
  );
}

export function IconoChispa(props: Props) {
  return (
    <Base {...props}>
      <path d="M12 2.5 13.9 10l7.6 1.9-7.6 1.9L12 21.4 10.1 13.8 2.5 11.9 10.1 10Z" />
    </Base>
  );
}
