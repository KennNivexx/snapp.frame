// components/ui/logo.tsx
// Logo Snappeachy Studio sebagai inline SVG React component
// Menggunakan SVG path agar tidak tergantung pada font eksternal

interface LogoProps {
  className?: string;
  height?: number;
  textColor?: string;
}

export function Logo({ className = "", height = 36, textColor = "#1A1A1A" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ height, width: "auto" }}
      className={className}
      aria-label="Snappeachy Studio"
      role="img"
    >
      {/* Camera aperture icon */}
      <circle cx="20" cy="20" r="14" stroke="#1A1A1A" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="8" stroke="#1A1A1A" strokeWidth="1" strokeOpacity="0.6" />
      {/* Aperture blades */}
      <line x1="20" y1="6" x2="20" y2="12" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="28" x2="20" y2="34" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7.9" y1="13" x2="13.1" y2="16" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26.9" y1="24" x2="32.1" y2="27" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32.1" y1="13" x2="26.9" y2="16" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13.1" y1="24" x2="7.9" y2="27" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
      {/* Center */}
      <circle cx="20" cy="20" r="2.5" fill="#1A1A1A" />

      {/* Brand name: SNAPPEACHY using text with embedded font fallback */}
      <text
        x="44"
        y="16"
        fontFamily="'Syne', 'Inter', system-ui, -apple-system, sans-serif"
        fontSize="11.5"
        fontWeight="700"
        fill={textColor}
        letterSpacing="0.8"
      >
        SNAPPEACHY
      </text>
      <text
        x="44"
        y="30"
        fontFamily="'Syne', 'Inter', system-ui, -apple-system, sans-serif"
        fontSize="8.5"
        fontWeight="400"
        fill="#C9A84C"
        letterSpacing="3.5"
      >
        STUDIO
      </text>
    </svg>
  );
}
