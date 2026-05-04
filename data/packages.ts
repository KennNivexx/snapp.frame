// data/packages.ts — Array paket & harga + types

export type Package = {
  id: string;
  name: string;
  price: number;        // Rupiah, tanpa desimal
  duration: string;     // e.g. "60 menit"
  photoCount: string;   // e.g. "30 foto soft file"
  features: string[];   // Daftar fitur yang termasuk
  isPopular?: boolean;  // Tampil dengan highlight gold + badge "Terpopuler"
  sortOrder: number;
};

export const packages: Package[] = [
  {
    id: "pkg-solo",
    name: "Paket Solo",
    price: 150000,
    duration: "60 menit",
    photoCount: "30 foto soft file",
    features: [
      "1 latar belakang",
      "Akses properti studio",
      "File resolusi tinggi",
      "Pengiriman via Google Drive",
    ],
    sortOrder: 1,
  },
  {
    id: "pkg-couple",
    name: "Paket Couple",
    price: 200000,
    duration: "90 menit",
    photoCount: "50 foto soft file",
    features: [
      "2 latar belakang",
      "Akses properti studio",
      "File resolusi tinggi",
      "Konsultasi outfit",
      "Pengiriman via Google Drive",
    ],
    isPopular: true,
    sortOrder: 2,
  },
  {
    id: "pkg-family",
    name: "Paket Keluarga",
    price: 300000,
    duration: "120 menit",
    photoCount: "75 foto soft file",
    features: [
      "3 latar belakang",
      "Akses properti studio penuh",
      "File resolusi tinggi",
      "Konsultasi outfit & properti",
      "Pengiriman via Google Drive",
      "Cetak 1 foto 10R",
    ],
    sortOrder: 3,
  },
  {
    id: "pkg-birthday",
    name: "Paket Birthday",
    price: 250000,
    duration: "90 menit",
    photoCount: "50 foto soft file",
    features: [
      "Dekorasi birthday studio",
      "2 latar belakang",
      "File resolusi tinggi",
      "Konsultasi tema",
      "Pengiriman via Google Drive",
    ],
    sortOrder: 4,
  },
];
