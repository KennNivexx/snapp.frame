// lib/referral.ts — Sistem Kode Referral Snapp.frame Studio
// validateReferral adalah async — mengambil data dari Supabase referral_codes.
// Fallback ke array lokal jika Supabase belum dikonfigurasi (dev environment).

export type ReferralCode = {
  code: string;
  discountPct: number;
  ownerName: string;
  isActive: boolean;
};

// ─── Fallback data lokal ──────────────────────────────────────────────────────
// Admin dapat menambah kode di sini sebagai fallback, atau lewat tabel Supabase.
const FALLBACK_CODES: ReferralCode[] = [
  { code: "SNAPP10",   discountPct: 10, ownerName: "Snapp.frame Official",  isActive: true },
  { code: "TEMAN15",   discountPct: 15, ownerName: "Partner Referral",      isActive: true },
  { code: "SPESIAL20", discountPct: 20, ownerName: "VIP Member",            isActive: true },
  { code: "FOTO10",    discountPct: 10, ownerName: "Influencer Kolaborasi", isActive: true },
];

/**
 * Validasi kode referral — async, mengambil dari Supabase jika dikonfigurasi.
 * Fallback ke array lokal jika Supabase belum di-set.
 * Case-insensitive.
 */
export async function validateReferral(input: string): Promise<ReferralCode | null> {
  if (!input?.trim()) return null;

  const normalized = input.trim().toUpperCase();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  // Jika Supabase belum dikonfigurasi, pakai fallback
  if (!supabaseUrl || supabaseUrl.includes("your-project-ref")) {
    return FALLBACK_CODES.find((rc) => rc.code.toUpperCase() === normalized && rc.isActive) ?? null;
  }

  try {
    // Dynamic import agar file ini tidak menarik browser client di saat tidak diperlukan
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("referral_codes")
      .select("code, discount_pct, owner_name, is_active")
      .ilike("code", normalized)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;

    // Cast to known shape
    const row = data as { code: string; discount_pct: number; owner_name: string; is_active: boolean };

    return {
      code: row.code,
      discountPct: row.discount_pct,
      ownerName: row.owner_name,
      isActive: row.is_active,
    };
  } catch {
    // Fallback jika query gagal
    return FALLBACK_CODES.find((rc) => rc.code.toUpperCase() === normalized && rc.isActive) ?? null;
  }
}

/**
 * Hitung harga setelah diskon.
 * @param originalPrice - Harga asli dalam Rupiah
 * @param discountPct   - Persentase diskon (0–100)
 */
export function applyDiscount(originalPrice: number, discountPct: number): number {
  if (discountPct <= 0) return originalPrice;
  if (discountPct >= 100) return 0;
  return Math.floor(originalPrice * (1 - discountPct / 100));
}
