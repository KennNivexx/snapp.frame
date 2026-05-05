// lib/button-classes.ts
// Sistem tombol standar Snapp.frame Studio — 3 varian saja
// Import di komponen manapun yang butuh tombol konsisten

export const btn = {
  // Tombol primer — aksi utama, gelap di atas background terang
  primary: [
    "inline-flex items-center justify-center gap-2",
    "px-7 py-3.5 bg-[#1A1A1A] text-[#FAFAF8]",
    "text-sm font-medium rounded tracking-wide",
    "transition-all duration-200",
    "hover:bg-[#2C2C2C]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-2",
  ].join(" "),

  // Tombol sekunder — outline hitam
  secondary: [
    "inline-flex items-center justify-center gap-2",
    "px-7 py-3.5 border border-[#1A1A1A] text-[#1A1A1A]",
    "text-sm font-medium rounded tracking-wide bg-transparent",
    "transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] focus-visible:ring-offset-2",
  ].join(" "),

  // Tombol WhatsApp — selalu hijau, brand WA
  whatsapp: [
    "inline-flex items-center justify-center gap-2",
    "px-7 py-3.5 bg-[#25D366] text-white",
    "text-sm font-semibold rounded tracking-wide",
    "transition-all duration-200",
    "hover:bg-[#20BC5A]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
  ].join(" "),
} as const;
