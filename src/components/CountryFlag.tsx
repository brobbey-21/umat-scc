import type { ReactNode } from 'react';

const star = (fill: string, cx: number, cy: number, r: number, opacity = 1) => (
  <path
    fill={fill}
    opacity={opacity}
    transform={`translate(${cx - r} ${cy - r}) scale(${(r * 2) / 24})`}
    d="M12 2.6l2.35 6.6 6.95.1-5.55 4.2 2.05 6.7L12 15.9l-5.8 4.3 2.05-6.7-5.55-4.2 6.95-.1z"
  />
);

const ghana: ReactNode = (
  <>
    <rect width="24" height="5.34" fill="#CE1126" />
    <rect y="5.33" width="24" height="5.34" fill="#FCD116" />
    <rect y="10.66" width="24" height="5.34" fill="#006B3F" />
    {star('#000', 12, 8, 4.2)}
  </>
);

const nigeria: ReactNode = (
  <>
    <rect width="8" height="16" fill="#008751" />
    <rect x="8" width="8" height="16" fill="#fff" />
    <rect x="16" width="8" height="16" fill="#008751" />
  </>
);

const ivoryCoast: ReactNode = (
  <>
    <rect width="8" height="16" fill="#F77F00" />
    <rect x="8" width="8" height="16" fill="#fff" />
    <rect x="16" width="8" height="16" fill="#009E60" />
  </>
);

const togo: ReactNode = (
  <>
    <rect width="24" height="3.2" fill="#FFCE00" />
    <rect y="3.2" width="24" height="3.2" fill="#006A4E" />
    <rect y="6.4" width="24" height="3.2" fill="#FFCE00" />
    <rect y="9.6" width="24" height="3.2" fill="#006A4E" />
    <rect y="12.8" width="24" height="3.2" fill="#FFCE00" />
    <rect width="10.5" height="9.6" fill="#D21034" />
    {star('#fff', 5.2, 4.8, 3.4)}
  </>
);

const burkina: ReactNode = (
  <>
    <rect width="24" height="8" fill="#EF2B2D" />
    <rect y="8" width="24" height="8" fill="#009E49" />
    {star('#FCD116', 12, 8, 4.4)}
  </>
);

const liberia: ReactNode = (
  <>
    <rect width="24" height="16" fill="#fff" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} y={i * 2.909} width="24" height="1.4545" fill="#BF0A30" />
    ))}
    <rect width="10" height="7.27" fill="#002868" />
    {star('#fff', 5, 3.6, 2.5)}
  </>
);

const sierraLeone: ReactNode = (
  <>
    <rect width="8" height="16" fill="#1EB53F" />
    <rect x="8" width="8" height="16" fill="#fff" />
    <rect x="16" width="8" height="16" fill="#0072C6" />
  </>
);

const usa: ReactNode = (
  <>
    <rect width="24" height="16" fill="#fff" />
    {Array.from({ length: 7 }).map((_, i) => (
      <rect key={i} y={i * 2.46} width="24" height="1.23" fill="#B22234" />
    ))}
    <rect width="10" height="8.54" fill="#3C3B6E" />
    {[1.6, 4, 6.4].flatMap((y) =>
      [1.4, 3.4, 5.4, 7.4].map((x) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.5" fill="#fff" />
      ))
    )}
  </>
);

const uk: ReactNode = (
  <>
    <rect width="24" height="16" fill="#012169" />
    <path
      d="M0 0l24 16M24 0L0 16"
      stroke="#fff"
      strokeWidth="3.2"
    />
    <path
      d="M0 0l24 16M24 0L0 16"
      stroke="#C8102E"
      strokeWidth="1.5"
    />
    <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="5" />
    <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="3" />
  </>
);

const FLAGS: Record<string, ReactNode> = {
  GH: ghana,
  NG: nigeria,
  CI: ivoryCoast,
  TG: togo,
  BF: burkina,
  LR: liberia,
  SL: sierraLeone,
  US: usa,
  GB: uk,
};

interface CountryFlagProps {
  iso: string;
  className?: string;
}

export const CountryFlag = ({ iso, className }: CountryFlagProps) => (
  <svg
    viewBox="0 0 24 16"
    className={className}
    aria-hidden="true"
    preserveAspectRatio="xMidYMid slice"
  >
    <rect width="24" height="16" fill="#deddd6" />
    {FLAGS[iso] ?? null}
  </svg>
);
