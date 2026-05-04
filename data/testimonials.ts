// data/testimonials.ts — Array testimoni pelanggan + types

export type Testimonial = {
  id: string;
  name: string;           // Nama klien (bisa disingkat untuk privasi)
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;           // Teks testimoni
  sessionType?: string;   // e.g. "Couple", "Family"
  date?: string;          // e.g. "November 2024"
};

export const testimonials: Testimonial[] = [
  {
    id: "t-001",
    name: "Rina A.",
    rating: 5,
    text: "Hasilnya beyond expectation! Studio bersih, fotografer sabar, dan foto editannya cantik banget. Pasti balik lagi!",
    sessionType: "Solo",
    date: "Desember 2024",
  },
  {
    id: "t-002",
    name: "Budi & Sari",
    rating: 5,
    text: "Sesi foto couple kami sangat menyenangkan. Fotografernya profesional dan hasilnya luar biasa. Sangat recommended!",
    sessionType: "Couple",
    date: "November 2024",
  },
  {
    id: "t-003",
    name: "Keluarga Wijaya",
    rating: 5,
    text: "Anak-anak enjoy banget dan foto keluarga kami jadi kenangan yang sangat berharga. Terima kasih Snappeachy!",
    sessionType: "Family",
    date: "Oktober 2024",
  },
  {
    id: "t-004",
    name: "Dewi R.",
    rating: 5,
    text: "Foto wisuda saya jadi sangat spesial berkat Snappeachy. Konsep minimalisnya cocok banget sama selera saya.",
    sessionType: "Graduation",
    date: "September 2024",
  },
  {
    id: "t-005",
    name: "Maya K.",
    rating: 5,
    text: "Suasana studio nyaman, tim ramah, dan hasil foto premium. Harga juga sangat worth it untuk kualitasnya.",
    sessionType: "Birthday",
    date: "Agustus 2024",
  },
  {
    id: "t-006",
    name: "Andre S.",
    rating: 5,
    text: "Baru pertama kali foto studio tapi langsung nyaman. Fotografernya pandai arahan pose dan hasilnya natural.",
    sessionType: "Solo",
    date: "Juli 2024",
  },
];
