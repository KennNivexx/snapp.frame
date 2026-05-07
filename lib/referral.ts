// lib/referral.ts — Sistem Kode Referral Snapp.frame Studio
// validateReferral adalah async — mengambil data dari Supabase referral_codes.
// Fallback ke array lokal jika Supabase belum dikonfigurasi (dev environment).

export type ReferralCode = {
  code: string;
  discountPct: number;
  type: "PERCENTAGE" | "FIXED";
  ownerName: string;
  isActive: boolean;
};

// ─── Fallback data lokal ──────────────────────────────────────────────────────
const FALLBACK_CODES: ReferralCode[] = [
  { code: "SNAPP10",   type: "PERCENTAGE", discountPct: 10, ownerName: "Snapp.frame Official",  isActive: true },
  { code: "TEMAN15",   type: "PERCENTAGE", discountPct: 15, ownerName: "Partner Referral",      isActive: true },
  { code: "SPESIAL20", type: "PERCENTAGE", discountPct: 20, ownerName: "VIP Member",            isActive: true },
  { code: "FOTO10",    type: "PERCENTAGE", discountPct: 10, ownerName: "Influencer Kolaborasi", isActive: true },
];

/**
 * Validasi kode referral — memanggil API route /api/referrals/validate.
 */
export async function validateReferral(input: string): Promise<ReferralCode | null> {
  if (!input?.trim()) return null;
  const normalized = input.trim().toUpperCase();

  try {
    const res = await fetch(`/api/referrals/validate?code=${encodeURIComponent(normalized)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        code: data.code,
        type: data.type as "PERCENTAGE" | "FIXED",
        discountPct: data.value, // value bisa % atau nominal
        ownerName: "Referral Partner",
        isActive: true,
      };
    }
    return FALLBACK_CODES.find((rc) => rc.code.toUpperCase() === normalized && rc.isActive) ?? null;
  } catch (error) {
    return FALLBACK_CODES.find((rc) => rc.code.toUpperCase() === normalized && rc.isActive) ?? null;
  }
}

/**
 * Hitung harga setelah diskon.
 */
export function applyDiscount(originalPrice: number, discountValue: number, type: "PERCENTAGE" | "FIXED" = "PERCENTAGE"): number {
  if (type === "PERCENTAGE") {
    if (discountValue <= 0) return originalPrice;
    if (discountValue >= 100) return 0;
    return Math.floor(originalPrice * (1 - discountValue / 100));
  } else {
    // Nominal discount
    return Math.max(0, originalPrice - discountValue);
  }
}
