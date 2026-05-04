// components/ui/logo.tsx
// Logo Snapp.frame Studio sebagai inline SVG React component
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
      aria-label="Snapp.frame Studio"
      role="img"
    >
      {/* Camera aperture icon */}
      <circle cx="20" cy="20" r="14" stroke={textColor} strokeWidth="1.5" />
      <circle cx="20" cy="20" r="8" stroke={textColor} strokeWidth="1" strokeOpacity="0.6" />
      {/* Aperture blades */}
      <line x1="20" y1="6" x2="20" y2="12" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="28" x2="20" y2="34" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7.9" y1="13" x2="13.1" y2="16" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26.9" y1="24" x2="32.1" y2="27" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32.1" y1="13" x2="26.9" y2="16" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13.1" y1="24" x2="7.9" y2="27" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" />
      {/* Center */}
      <circle cx="20" cy="20" r="2.5" fill={textColor} />

      {/* Brand name: SNAPP.FRAME using text with embedded font fallback */}
      <text
        x="44"
        y="16"
        fontFamily="'Outfit', 'Inter', system-ui, -apple-system, sans-serif"
        fontSize="12.5"
        fontWeight="800"
        fill={textColor}
        letterSpacing="1.2"
      >
        SNAPP.FRAME
      </text>
      <text
        x="44"
        y="30"
        fontFamily="'Outfit', 'Inter', system-ui, -apple-system, sans-serif"
        fontSize="9.5"
        fontWeight="600"
        fill={textColor}
        letterSpacing="3.5"
      >
        STUDIO
      </text>
    </svg>
  );
}
