// data/faq.ts — Frequently asked questions + types

export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "Apakah perlu booking terlebih dahulu?",
    answer:
      "Ya, kami menerima booking via WhatsApp atau Instagram DM. Booking diperlukan untuk memastikan studio dan fotografer tersedia di waktu yang Anda inginkan. Kami sarankan booking minimal 2–3 hari sebelumnya.",
  },
  {
    question: "Berapa lama hasil foto siap?",
    answer:
      "Hasil foto soft file biasanya siap dalam 2–3 hari kerja setelah sesi foto. File akan dikirim via Google Drive ke email atau WhatsApp Anda.",
  },
  {
    question: "Apakah bisa ganti latar belakang saat sesi?",
    answer:
      "Bisa! Jumlah pergantian latar belakang tergantung paket yang dipilih. Paket Solo 1 latar, Couple 2 latar, dan Keluarga 3 latar. Kami memiliki berbagai pilihan warna dan tekstur backdrop.",
  },
  {
    question: "Bolehkah membawa properti sendiri?",
    answer:
      "Tentu boleh! Kami juga menyediakan berbagai properti studio (kursi, tanaman, aksesoris) yang bisa digunakan secara gratis. Properti pribadi seperti boneka, bunga, atau atribut khusus sangat diperbolehkan.",
  },
  {
    question: "Berapa jumlah orang yang bisa masuk untuk Paket Keluarga?",
    answer:
      "Paket Keluarga cocok untuk 3–8 orang. Jika lebih dari 8 orang, silakan hubungi kami via WhatsApp untuk penawaran khusus grup.",
  },
  {
    question: "Apakah foto langsung diedit atau raw?",
    answer:
      "Semua foto yang kami kirimkan sudah melalui proses editing/retouching dasar — color grading, exposure, dan skin retouching ringan. Hasilnya adalah foto yang siap cetak atau share ke sosial media.",
  },
  {
    question: "Metode pembayaran apa saja yang diterima?",
    answer:
      "Kami menerima transfer bank (semua bank), GoPay, OVO, QRIS, dan tunai. Pembayaran dilakukan saat konfirmasi booking (DP 50%) dan sisanya sebelum sesi dimulai.",
  },
];
