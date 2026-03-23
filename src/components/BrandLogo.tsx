import type { BrandLogoProps } from "@/types";

const SIZES = {
  sm: { width: 28, height: 28 },
  md: { width: 36, height: 36 },
  lg: { width: 48, height: 48 },
} as const;

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const { width, height } = SIZES[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Veractum logo"
      role="img"
    >
      <defs>
        <linearGradient id="amber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="beam-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="iris-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
      </defs>

      {/* Beam of light above the eye */}
      <path
        d="M24 2 L20 16 L28 16 Z"
        fill="url(#beam-gradient)"
        opacity="0.6"
      />

      {/* Outer eye shape */}
      <path
        d="M4 24 Q14 12 24 12 Q34 12 44 24 Q34 36 24 36 Q14 36 4 24 Z"
        fill="none"
        stroke="url(#amber-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Iris */}
      <circle cx="24" cy="24" r="8" fill="url(#iris-glow)" />

      {/* Pupil */}
      <circle cx="24" cy="24" r="3.5" fill="#0a0a0f" />

      {/* Light reflection */}
      <circle cx="26.5" cy="21.5" r="1.5" fill="white" opacity="0.8" />

      {/* Small beam accents */}
      <line
        x1="24"
        y1="4"
        x2="24"
        y2="10"
        stroke="#fbbf24"
        strokeWidth="1"
        opacity="0.4"
        strokeLinecap="round"
      />
      <line
        x1="19"
        y1="6"
        x2="21"
        y2="11"
        stroke="#fbbf24"
        strokeWidth="0.75"
        opacity="0.3"
        strokeLinecap="round"
      />
      <line
        x1="29"
        y1="6"
        x2="27"
        y2="11"
        stroke="#fbbf24"
        strokeWidth="0.75"
        opacity="0.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
