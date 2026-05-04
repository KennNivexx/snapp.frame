import type { Metadata } from "next";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Galeri Foto",
  description:
    "Jelajahi koleksi foto terbaik Snappeachy Studio — sesi solo, couple, keluarga, ulang tahun, dan wisuda. Studio foto minimalis dengan hasil premium.",
  openGraph: {
    title: `Galeri Foto | ${site.name}`,
    description:
      "Jelajahi koleksi foto terbaik Snappeachy Studio — sesi solo, couple, keluarga, ulang tahun, dan wisuda.",
    url: "https://snappeachystudio.id/gallery",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://snappeachystudio.id/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
