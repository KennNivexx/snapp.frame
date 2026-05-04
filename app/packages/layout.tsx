import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Paket Foto & Harga",
  description:
    "Lihat semua paket foto Snappeachy Studio — Paket Solo, Couple, Keluarga, dan Birthday. Harga terjangkau mulai dari Rp 150.000 dengan hasil foto premium dan editing profesional.",
  openGraph: {
    title: `Paket Foto & Harga | ${site.name}`,
    description:
      "Paket foto Snappeachy Studio mulai Rp 150.000. Solo, Couple, Keluarga, Birthday — semua termasuk editing profesional.",
    url: "https://snappeachystudio.id/packages",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://snappeachystudio.id/packages",
  },
};

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
