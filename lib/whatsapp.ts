// lib/whatsapp.ts — Helper untuk generate WhatsApp URL dengan pesan template

import { site } from "@/data/site";

export type WaContext = "general" | "package" | "gallery";

/**
 * Generate WhatsApp URL dengan pesan template sesuai konteks.
 *
 * @param context  - Konteks pesan: "general" | "package" | "gallery"
 * @param packageName - Nama paket (hanya untuk context "package")
 * @returns URL wa.me yang langsung membuka chat dengan pesan terisi,
 *          atau "#" jika nomor WA belum dikonfigurasi.
 *
 * @example
 * <a href={getWhatsAppUrl('package', 'Paket Couple')} target="_blank">
 *   Tanya via WhatsApp
 * </a>
 */
export function getWhatsAppUrl(
  context: WaContext,
  packageName?: string
): string {
  const WA = site.contact.whatsapp;

  // Validasi: jika nomor belum dikonfigurasi, kembalikan "#" sebagai fallback
  if (!WA || WA.length < 10) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Snappeachy] Nomor WhatsApp belum dikonfigurasi di data/site.ts"
      );
    }
    return "#";
  }

  const messages: Record<WaContext, string> = {
    general:
      "Halo Snappeachy Studio! Saya tertarik untuk sesi foto. Boleh tanya-tanya dulu?",
    gallery:
      "Halo Snappeachy Studio! Saya lihat galeri fotonya dan tertarik. Bisa info lebih lanjut?",
    package: `Halo Snappeachy Studio! Saya tertarik dengan ${
      packageName ?? "paket foto"
    } yang ada di website. Bisa info lebih lanjut?`,
  };

  const msg = encodeURIComponent(messages[context]);
  return `https://wa.me/${WA}?text=${msg}`;
}
