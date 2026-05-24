"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Camera, Presentation, Recycle, MonitorPlay,
  GraduationCap, Users, Building, ShoppingBag, Handshake,
  BadgeDollarSign, TrendingUp, Award, CheckCircle2,
  ChevronRight, Gift, ArrowRight, X,
  ExternalLink, Search, ArrowLeft, MessageCircle,
  Heart, Copy, Check, Share2, Calendar, Sparkles,
} from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getAffiliatePosts } from "@/app/actions/affiliate-posts";
import { toast } from "sonner";

// ─── AFFILIATE DETAIL DATA ────────────────────────────────────────────────────
const affiliateDetails: Record<string, { subtitle: string; intro: string; packages: { name: string; price: string; discount: string; afterDiscount?: string; commission: string }[]; whyInteresting: string[]; targetMarket: string[]; disclaimer: string }> = {
  "LP Academic Partner": {
    subtitle: "Pendamping Konsultan Tugas Akhir Mahasiswa",
    intro: "Bangun peluang penghasilan tambahan sambil membantu mahasiswa menyelesaikan Tugas Akhir lebih terarah & profesional 🎓\n\nSebagai Affiliate Partner, kamu akan mendapatkan:\n✅ Kode Referral Affiliate Khusus\n✅ Komisi Cash setiap transaksi berhasil\n✅ Customer mendapatkan potongan harga spesial\n✅ Bisa dijalankan online & fleksibel\n✅ Cocok untuk mahasiswa, alumni, mentor, komunitas, dan creator edukasi",
    packages: [
      { name: "🥉 Paket Starter Consultation", price: "Rp 799.000", discount: "Rp 250.000", commission: "Rp 100.000 / transaksi" },
      { name: "🥈 Paket Regular Academic Partner", price: "Rp 2.499.000", discount: "Rp 600.000", commission: "Rp 150.000 / transaksi" },
      { name: "🥇 Paket Premium Academic Partner", price: "Rp 4.999.000", discount: "Rp 1.300.000", commission: "Rp 250.000 / transaksi" },
      { name: "🚀 Paket Intensive Sidang & Revisi", price: "Rp 1.499.000", discount: "Rp 400.000", commission: "Rp 100.000 / transaksi" },
    ],
    whyInteresting: [
      "Produk edukasi yang sangat dibutuhkan mahasiswa",
      "Membantu mahasiswa lebih siap sidang & karier",
      "Pendampingan berbasis kasus nyata",
      "Didukung AI & ekosistem mitra industri",
      "Potensi repeat referral tinggi",
      "Sistem mudah dijalankan",
    ],
    targetMarket: ["🎓 Mahasiswa", "👨‍🏫 Dosen & mentor", "📚 Komunitas akademik", "📱 Content creator edukasi", "🤝 Partner komunitas kampus"],
    disclaimer: "Program promo, diskon, fee referral, bonus, maupun skema penawaran dalam Program Affiliate Partner Link Productive dapat berubah sewaktu-waktu pada setiap periode promo yang berlaku.",
  },
  "LP Career Ready": {
    subtitle: "Program Perencanaan Karier Mahasiswa Menuju Dunia Kerja",
    intro: "LP Career Ready membuka kesempatan untuk kamu menjadi Affiliate Partner resmi Link Productive dan mendapatkan komisi dari setiap mahasiswa yang bergabung menggunakan kode referral milikmu.\n\nProgram ini sangat mudah dipasarkan karena:\n✔ Dibutuhkan banyak mahasiswa\n✔ Masalahnya nyata & relevan\n✔ Memiliki banyak success story\n✔ Harga promo sangat menarik\n✔ Ada webinar & mentoring karier profesional",
    packages: [
      { name: "📌 Pembelian H-1 Minggu Sebelum Acara", price: "Rp 699.000", discount: "-", afterDiscount: "Rp 699.000", commission: "Rp 50.000 / peserta" },
      { name: "🚀 Promo H-7 s/d H-20", price: "Rp 699.000", discount: "Rp 400.000", afterDiscount: "Rp 299.000", commission: "Rp 50.000 / peserta" },
      { name: "🚀 Promo H-21 dan Seterusnya", price: "Rp 699.000", discount: "Rp 500.000", afterDiscount: "Rp 199.000", commission: "Rp 50.000 / peserta" },
    ],
    whyInteresting: [
      "Roadmap karier personal yang dibutuhkan mahasiswa",
      "CV & LinkedIn profesional",
      "Persiapan interview & psikotest",
      "Strategi magang & project nyata",
      "Alumni berkarier di BCA, BI, Paragon Corp, Krakatau Steel, dan lainnya",
    ],
    targetMarket: ["🎓 Mahasiswa semester awal hingga akhir", "🎓 Fresh graduate", "🎓 Organisasi kampus", "🎓 Komunitas mahasiswa", "🎓 Career center kampus"],
    disclaimer: "Program promo, diskon, fee referral, bonus, maupun skema penawaran dalam Program Affiliate Partner Link Productive dapat berubah sewaktu-waktu pada setiap periode promo yang berlaku.",
  },
  "LP Entrepreneur Launchpad": {
    subtitle: "Program Perencanaan Bisnis untuk Siswa SMA/SMK & Mahasiswa",
    intro: "Bantu Anak Muda Belajar Bisnis — Sekaligus Bangun Penghasilan Tambahan 🚀\n\nLP Business Planning Bootcamp hadir sebagai solusi praktis bagi pelajar & mahasiswa yang:\n❌ Bingung memulai bisnis\n❌ Takut gagal usaha\n❌ Punya ide tapi tidak tahu langkahnya\n❌ Ingin belajar bisnis dengan cara sederhana",
    packages: [
      { name: "⏳ Pembelian 1 Minggu Sebelum Acara", price: "Rp 750.000", discount: "-", commission: "Rp 75.000 / peserta" },
      { name: "⏳ Pembelian H-7 s/d H-20", price: "Rp 750.000", discount: "Rp 400.000", afterDiscount: "Rp 350.000", commission: "Rp 75.000 / peserta" },
      { name: "⏳ Pembelian H-21 dan Seterusnya", price: "Rp 750.000", discount: "Rp 500.000", afterDiscount: "Rp 250.000", commission: "Rp 75.000 / peserta" },
    ],
    whyInteresting: [
      "Produk edukasi yang relevan & mudah dipasarkan",
      "Banyak pelajar & mahasiswa butuh panduan bisnis",
      "Sistem referral sederhana",
      "Komisi cash per transaksi",
      "Bisa dikerjakan dari mana saja",
      "Potensi networking & kolaborasi",
    ],
    targetMarket: ["🏫 Siswa SMA/SMK", "🎓 Mahasiswa", "🚀 Komunitas entrepreneur muda", "👨‍💻 Organisasi kampus", "📚 Program kewirausahaan sekolah"],
    disclaimer: "Program promo, diskon, fee referral, bonus, maupun skema penawaran dalam Program Affiliate Partner Link Productive dapat berubah sewaktu-waktu pada setiap periode promo yang berlaku.",
  },
  "Bisapreneur Academy": {
    subtitle: "Kelas Wirausaha Pemula — Mulai Usaha Dari Nol",
    intro: "Punya relasi, komunitas, audience, atau aktif di media sosial? Sekarang kamu bisa bantu lebih banyak orang belajar bisnis sambil mendapatkan penghasilan tambahan 💰\n\nProgram pembelajaran bisnis berbasis praktik untuk pemula, UMKM, koperasi, dan calon entrepreneur agar lebih berani memulai usaha, meningkatkan penjualan, dan mengembangkan bisnis secara bertahap.",
    packages: [
      { name: "💼 Kelas Wirausaha Pemula", price: "Rp 1.250.000", discount: "Rp 250.000", afterDiscount: "Rp 1.000.000", commission: "Rp 100.000 / peserta" },
    ],
    whyInteresting: [
      "Tidak perlu membuat produk sendiri",
      "Materi promosi disediakan",
      "Program mudah dipromosikan",
      "Dibutuhkan banyak orang",
      "Sistem referral sederhana",
      "Bisa dijalankan dari mana saja",
    ],
    targetMarket: ["📱 Content creator", "🎓 Mahasiswa", "💻 Freelancer", "👥 Admin komunitas", "🏪 Pegiat UMKM", "🧑‍🏫 Trainer / mentor"],
    disclaimer: "Program promo, diskon, fee referral, bonus, maupun skema penawaran dalam Program Affiliate Partner Link Productive dapat berubah sewaktu-waktu pada setiap periode promo yang berlaku.",
  },
  "Baristara Academy": {
    subtitle: "Sekolah Barista & Bisnis Kopi by Link Productive",
    intro: "Punya audience? Suka dunia kopi? Atau mau punya penghasilan tambahan?\n\nSekarang kamu bisa dapat income dari promosi program pelatihan barista & bisnis kopi! Program mencakup skill barista, bisnis kopi, sampai punya peluang menghasilkan penghasilan dari dunia coffee shop.",
    packages: [
      { name: "☕ Program Barista Profesional", price: "Rp 2.500.000", discount: "Rp 800.000", afterDiscount: "Rp 1.700.000", commission: "Rp 150.000 / peserta" },
      { name: "☕ Program Barista & Bisnis Kopi", price: "Rp 3.500.000", discount: "Rp 1.200.000", afterDiscount: "Rp 2.300.000", commission: "Rp 200.000 / peserta" },
    ],
    whyInteresting: [
      "Produk mudah dijual (skill + kerja + bisnis kopi)",
      "Banyak peminat (anak muda & pecinta kopi)",
      "Sudah terbukti (ada alumni magang & kerja)",
      "Disediakan materi promosi",
      "Bisa jualan tanpa stok & tanpa modal",
    ],
    targetMarket: ["☕ Pecinta kopi", "🎓 Mahasiswa", "👨‍🍳 Calon barista profesional", "🏪 Calon pemilik kedai kopi", "📱 Content creator kuliner"],
    disclaimer: "Program promo, diskon, fee referral, bonus, maupun skema penawaran dalam Program Affiliate Partner Link Productive dapat berubah sewaktu-waktu pada setiap periode promo yang berlaku.",
  },
  "Cuan Creator Academy": {
    subtitle: "Sekolah Digital Marketing — Belajar dari Nol Hingga Bisa Menghasilkan",
    intro: "Link Productive membuka kesempatan bagi Anda untuk menjadi Affiliate Partner Cuan Creator Academy, program pelatihan digital marketing berbasis project nyata yang membantu peserta memiliki skill, pengalaman, portofolio, hingga peluang income dari dunia digital.\n\nSebagai Affiliate Partner, Anda tidak hanya membantu orang berkembang, tetapi juga mendapatkan komisi dari setiap peserta yang berhasil bergabung.",
    packages: [
      { name: "🎓 Cuan Creator Academy", price: "Rp 3.500.000", discount: "Rp 1.200.000", afterDiscount: "Rp 2.300.000", commission: "Rp 200.000 / peserta" },
    ],
    whyInteresting: [
      "Banyak orang ingin punya skill digital yang menghasilkan",
      "Solusi nyata berbasis praktik & project langsung",
      "Komisi fee cash setiap closing",
      "Materi promosi siap pakai",
      "Support tim & pendampingan promosi",
      "Potensi income Rp10.000.000 dari 50 peserta",
    ],
    targetMarket: ["👨‍🎓 Mahasiswa", "📱 Content creator", "💻 Freelancer", "🏢 Komunitas kampus", "📈 Digital enthusiast", "🚀 Anak muda produktif"],
    disclaimer: "Program promo, diskon, fee referral, bonus, maupun skema penawaran dalam Program Affiliate Partner Link Productive dapat berubah sewaktu-waktu pada setiap periode promo yang berlaku. Periode promo: 25 Mei 2026 – 22 Juni 2026.",
  },
  "Tekno AI Academy": {
    subtitle: "Sekolah Coding & AI Business — Skill Digital untuk Dunia Kerja & Bisnis",
    intro: "Sekarang banyak orang mulai belajar AI, coding, dan skill digital untuk kebutuhan kerja maupun bisnis. Melalui Program Affiliate Partner Link Productive, kamu bisa membantu mempromosikan program pelatihan sekaligus mendapatkan komisi dari setiap pendaftaran.",
    packages: [
      { name: "🤖 AI Business Productivity Class", price: "Rp 2.700.000", discount: "Rp 1.000.000", afterDiscount: "Rp 1.700.000", commission: "Rp 150.000 / transaksi" },
      { name: "🌐 Web Developer for Business", price: "Rp 3.500.000", discount: "Rp 1.200.000", afterDiscount: "Rp 2.300.000", commission: "Rp 200.000 / transaksi" },
      { name: "🏢 AI for Office & Administration", price: "Rp 2.500.000", discount: "Rp 800.000", afterDiscount: "Rp 1.700.000", commission: "Rp 150.000 / transaksi" },
      { name: "🏭 AI Industry & Smart Manufacturing", price: "Rp 2.800.000", discount: "Rp 900.000", afterDiscount: "Rp 1.900.000", commission: "Rp 150.000 / transaksi" },
    ],
    whyInteresting: [
      "AI & digital skill sedang trending",
      "Banyak orang takut tertinggal teknologi",
      "Cocok untuk mahasiswa, pekerja & UMKM",
      "Program berbasis praktik & project nyata",
      "Bisa dipromosikan lewat TikTok, Instagram & WhatsApp",
    ],
    targetMarket: ["🎓 Mahasiswa & fresh graduate", "🏢 Staff kantor", "💻 Freelancer", "🏪 UMKM & pebisnis", "📱 Content creator", "🏭 Profesional industri"],
    disclaimer: "Harga layanan sewaktu-waktu dapat berubah mengikuti paket promo yang sedang berjalan. Komisi affiliate diberikan untuk setiap transaksi valid menggunakan kode referral affiliate partner yang terdaftar.",
  },
  "Mental Bahasa Academy": {
    subtitle: "Sekolah Bahasa & Mental Health — Bangun Kepercayaan Diri",
    intro: "Bangun Penghasilan Sambil Membantu Banyak Orang Lebih Percaya Diri, Jago Komunikasi, dan Bertumbuh.\n\nProgram pengembangan diri yang menggabungkan pembelajaran bahasa Inggris, public speaking, komunikasi interpersonal, dan penguatan mental melalui praktik langsung dan pengalaman berbasis project.",
    packages: [
      { name: "🎤 Public Speaking & Confidence Project Class", price: "Rp 1.500.000", discount: "Rp 700.000", afterDiscount: "Rp 800.000", commission: "Rp 50.000 / peserta" },
      { name: "🌏 English Speaking & Confidence Experience", price: "Rp 2.000.000", discount: "Rp 1.000.000", afterDiscount: "Rp 1.000.000", commission: "Rp 100.000 / peserta" },
      { name: "🧠 Self Growth, Mental Health & Social Confidence", price: "Rp 1.500.000", discount: "Rp 700.000", afterDiscount: "Rp 800.000", commission: "Rp 50.000 / peserta" },
    ],
    whyInteresting: [
      "Mendapatkan komisi fee cash",
      "Bisa dijalankan hanya melalui HP & media sosial",
      "Mendapatkan kode referral affiliate pribadi",
      "Mendapatkan materi promosi siap pakai",
      "Mendapatkan support tim & mentor",
      "Cocok untuk tambahan penghasilan mahasiswa & fresh graduate",
    ],
    targetMarket: ["🎓 Mahasiswa", "👔 Fresh Graduate", "📱 Content Creator", "💻 Freelancer", "👥 Organisasi & Komunitas", "🚀 Entrepreneur Muda"],
    disclaimer: "Harga layanan sewaktu-waktu dapat berubah sesuai promo yang sedang berjalan. Komisi affiliate dihitung dari transaksi yang valid & terdata menggunakan kode referral affiliate.",
  },
};

const products = [
  {
    name: "LP Academic Partner",
    fee: "Sesuai Ketentuan",
    unit: "pendaftaran",
    icon: GraduationCap,
    desc: "Program pendampingan dan akselerasi akademik premium bagi mahasiswa dan akademisi.",
    url: "https://www.linkproductive.com/services/lp-academic-partner/affiliate-lp-academic-partner",
  },
  {
    name: "LP Career Ready",
    fee: "Sesuai Ketentuan",
    unit: "pendaftaran",
    icon: Award,
    desc: "Program bimbingan karier profesional, optimasi CV/LinkedIn, dan simulasi interview kerja.",
    url: "https://www.linkproductive.com/services/lp-career-ready/affiliate-lp-career-ready",
  },
  {
    name: "LP Entrepreneur Launchpad",
    fee: "Sesuai Ketentuan",
    unit: "pendaftaran",
    icon: TrendingUp,
    desc: "Bootcamp intensif inkubasi ide bisnis baru dan penyusunan proposal bisnis profesional.",
    url: "https://www.linkproductive.com/services/lp-business-planning-bootcamp/affiliate-lp-business-planning-bootcamp",
  },
  {
    name: "Bisapreneur Academy",
    fee: "Sesuai Ketentuan",
    unit: "pendaftaran",
    icon: Building,
    desc: "Edukasi & pendampingan tata kelola serta digitalisasi bisnis untuk UMKM dan Koperasi.",
    url: "https://www.linkproductive.com/services/sekolah-bisnis-koperasi-umkm/affiliate-sekolah-bisnis-koperasi-umkm",
  },
  {
    name: "Baristara Academy",
    fee: "Sesuai Ketentuan",
    unit: "pendaftaran",
    icon: Coffee,
    desc: "Sekolah barista terlengkap untuk menguasai teknik pembuatan kopi dan manajemen bisnis kedai kopi.",
    url: "https://www.linkproductive.com/services/sekolah-barista-bisnis-kopi/affiliate-sekolah-barista-bisnis-kopi",
  },
  {
    name: "Cuan Creator Academy",
    fee: "Sesuai Ketentuan",
    unit: "pendaftaran",
    icon: MonitorPlay,
    desc: "Pusat belajar digital marketing, optimalisasi sosial media, dan keahlian content creation.",
    url: "https://www.linkproductive.com/services/sekolah-digital-marketing/affiliate-sekolah-digital-marketing",
  },
  {
    name: "Tekno AI Academy",
    fee: "Sesuai Ketentuan",
    unit: "pendaftaran",
    icon: Presentation,
    desc: "Sekolah coding terintegrasi dengan implementasi teknologi kecerdasan buatan (AI) untuk bisnis.",
    url: "https://www.linkproductive.com/services/sekolah-coding-ai-business/affiliate-sekolah-coding-ai-business",
  },
  {
    name: "Mental Bahasa Academy",
    fee: "Sesuai Ketentuan",
    unit: "pendaftaran",
    icon: Users,
    desc: "Program integrasi kelas bahasa asing premium dengan pendampingan kesehatan mental terarah.",
    url: "https://www.linkproductive.com/services/sekolah-bahasa-mental-health/affiliate-sekolah-bahasa-mental-health",
  },
  {
    name: "Green Productive Academy",
    fee: "Coming Soon",
    unit: "pendaftaran",
    icon: Recycle,
    desc: "Program edukasi dan akselerator produk inovatif berbasis kelestarian lingkungan hidup.",
    url: "",
  },
  {
    name: "Standara Consulting",
    fee: "Coming Soon",
    unit: "layanan",
    icon: Handshake,
    desc: "Konsultasi profesional penyusunan SOP standardisasi bisnis, legalitas usaha, dan sertifikasi.",
    url: "",
  },
  {
    name: "Brand Siap",
    fee: "Coming Soon",
    unit: "paket",
    icon: ShoppingBag,
    desc: "Layanan super cepat pembuatan identitas visual, logo, kemasan produk, dan kesiapan branding usaha.",
    url: "",
  },
  {
    name: "Snapp Frame",
    fee: "Rp3.500",
    unit: "foto",
    icon: Camera,
    desc: "Layanan fotografi studio modern, foto portrait, cetak kilat, dan dokumentasi visual premium.",
    url: "",
  },
  {
    name: "Rata Coffee",
    fee: "Rp1.000",
    unit: "gelas",
    icon: Coffee,
    desc: "Varian kopi susu kekinian berkualitas tinggi dengan racikan barista berpengalaman.",
    url: "",
  },
];

const discountData = [
  { name: "LP Academic Partner", maxDiscount: "Menyesuaikan", fee: "Komisi Menarik" },
  { name: "LP Career Ready", maxDiscount: "Menyesuaikan", fee: "Komisi Menarik" },
  { name: "LP Entrepreneur Launchpad", maxDiscount: "Menyesuaikan", fee: "Komisi Menarik" },
  { name: "Bisapreneur Academy", maxDiscount: "Menyesuaikan", fee: "Komisi Menarik" },
  { name: "Baristara Academy", maxDiscount: "Menyesuaikan", fee: "Komisi Menarik" },
  { name: "Cuan Creator Academy", maxDiscount: "Menyesuaikan", fee: "Komisi Menarik" },
  { name: "Tekno AI Academy", maxDiscount: "Menyesuaikan", fee: "Komisi Menarik" },
  { name: "Mental Bahasa Academy", maxDiscount: "Menyesuaikan", fee: "Komisi Menarik" },
  { name: "Green Productive Academy", maxDiscount: "Menyesuaikan", fee: "Coming Soon" },
  { name: "Standara Consulting", maxDiscount: "Menyesuaikan", fee: "Coming Soon" },
  { name: "Brand Siap", maxDiscount: "Menyesuaikan", fee: "Coming Soon" },
  { name: "Snapp Frame", maxDiscount: "Rp5.000", fee: "Rp3.500" },
  { name: "Rata Coffee", maxDiscount: "Rp2.000", fee: "Rp1.000" },
];

const fallbackPosts = [
  {
    id: "fb-1",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
    caption: "Keseruan photobooth Snapp.frame di acara Rata Coffee! 📸 Temen-temen seneng banget bisa langsung cetak foto strip kece dengan warna sepia khas kita. Buruan share kode referral-mu biar temen-temen dapet diskon dan kamu dapet cuan!",
    hashtags: ["snappframe", "ratacoffee", "photoboothhits", "cuanbareng"],
    likeCount: 142,
    postedBy: "Snapp.frame Studio",
    category: "kegiatan",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "fb-2",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop",
    caption: "Affiliate Partners Gathering #1! 🤝 Tempat di mana kita bertukar ide, sharing tips cara promosi kreatif di Instagram & Tiktok, dan tentunya ngerayain bonus pencapaian bulanan. Ingin gabung komunitas seru ini? Daftar gratis sekarang!",
    hashtags: ["snappframe", "affiliatepartner", "gatheringseru", "belajardigital"],
    likeCount: 98,
    postedBy: "Snapp.frame Studio",
    category: "kegiatan",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: "fb-3",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop",
    caption: "📢 PROMO BUNDLING SPESIAL KELOMPOK! Buat kalian yang mau foto grup bareng sahabat, gunakan kode referral dari affiliate partner kami untuk mendapatkan potongan langsung Rp20.000 + cetakan tambahan gratis!",
    hashtags: ["promostudio", "fotogrup", "graduationphoto", "diskonspesial"],
    likeCount: 215,
    postedBy: "Marketing Snapp.frame",
    category: "promo",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", instagram: "" });

  const handleSubmit = () => {
    if (!form.name || !form.phone) return;
    const url = getWhatsAppUrl("affiliate", form);
    window.open(url, "_blank");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-near-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-warm-white rounded-t-3xl sm:rounded-3xl border border-near-black/10 overflow-hidden shadow-2xl p-6 text-near-black"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-near-black">Formulir Pendaftaran</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-near-black/5 flex items-center justify-center text-near-black/40 hover:text-near-black transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-near-black/60 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap Anda"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-near-black/10 rounded-xl text-xs font-bold text-near-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-near-black/60 mb-1.5">No. WhatsApp</label>
            <input
              type="tel"
              placeholder="Contoh: 081234567890"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-near-black/10 rounded-xl text-xs font-bold text-near-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-near-black/60 mb-1.5">Username Instagram (Opsional)</label>
            <input
              type="text"
              placeholder="@username"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-near-black/10 rounded-xl text-xs font-bold text-near-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!form.name || !form.phone}
            className="w-full py-3.5 bg-near-black hover:bg-near-black/90 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all mt-2 shadow-lg shadow-near-black/10 cursor-pointer"
          >
            Kirim via WhatsApp
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function AffiliateDetailModal({
  product,
  onClose,
}: {
  product: (typeof products)[0];
  onClose: () => void;
}) {
  const detail = affiliateDetails[product.name];
  const ProgramIcon = product.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-near-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-near-black rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold flex-shrink-0">
                <ProgramIcon size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wide leading-tight">{product.name}</h2>
                {detail && <p className="text-[10px] text-white/40 font-bold mt-0.5">{detail.subtitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {detail ? (
            <>
              {/* Intro */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[11px] text-white/70 leading-relaxed whitespace-pre-line">{detail.intro}</p>
              </div>

              {/* Packages */}
              <div>
                <h3 className="text-[10px] font-black text-gold uppercase tracking-widest mb-3">📦 Detail Program & Komisi</h3>
                <div className="space-y-3">
                  {detail.packages.map((pkg, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-[11px] font-black text-white mb-3">{pkg.name}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <p className="text-[8px] text-white/40 font-bold uppercase mb-1">Harga Normal</p>
                          <p className="text-[10px] font-black text-white/60 line-through">{pkg.price}</p>
                        </div>
                        <div className="bg-gold/10 border border-gold/20 rounded-lg p-2 text-center">
                          <p className="text-[8px] text-gold font-bold uppercase mb-1">Diskon Customer</p>
                          <p className="text-[10px] font-black text-gold">{pkg.discount}</p>
                          {pkg.afterDiscount && (
                            <p className="text-[9px] text-white/60 font-bold mt-0.5">→ {pkg.afterDiscount}</p>
                          )}
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-center">
                          <p className="text-[8px] text-emerald-400 font-bold uppercase mb-1">Komisi Affiliate</p>
                          <p className="text-[10px] font-black text-emerald-400">{pkg.commission}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Interesting */}
              <div>
                <h3 className="text-[10px] font-black text-gold uppercase tracking-widest mb-3">🎯 Kenapa Program Ini Menarik?</h3>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                  {detail.whyInteresting.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] text-white/70 font-medium">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Market */}
              <div>
                <h3 className="text-[10px] font-black text-gold uppercase tracking-widest mb-3">💼 Cocok Untuk</h3>
                <div className="flex flex-wrap gap-2">
                  {detail.targetMarket.map((target, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/60 font-bold">
                      {target}
                    </span>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-[9px] text-amber-400/80 font-bold uppercase tracking-widest mb-2">📢 Info Penting</p>
                <p className="text-[10px] text-white/50 leading-relaxed">{detail.disclaimer}</p>
              </div>
            </>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">Detail program belum tersedia.</p>
          )}
        </div>

        {/* Footer CTA */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
          >
            <ArrowLeft size={12} />
            Kembali
          </button>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold/90 text-near-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-gold/20"
          >
            Daftar Affiliate Sekarang
            <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AffiliatePage() {
  const [activeProduct, setActiveProduct] = useState<(typeof products)[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"semua" | "kegiatan" | "promo">("semua");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await getAffiliatePosts();
        if (res.success && res.data && res.data.length > 0) {
          const published = res.data.filter((p: any) => p.isPublished);
          const formatted = published.map((p: any) => {
            let category = "promo";
            const tagsLower = (p.hashtags || []).map((t: string) => t.toLowerCase());
            if (
              tagsLower.includes("kegiatan") ||
              tagsLower.includes("gathering") ||
              tagsLower.includes("event") ||
              p.caption.toLowerCase().includes("gathering") ||
              p.caption.toLowerCase().includes("kegiatan") ||
              p.caption.toLowerCase().includes("keseruan")
            ) {
              category = "kegiatan";
            }
            return {
              ...p,
              category,
            };
          });
          setPosts(formatted);
        } else {
          setPosts(fallbackPosts);
        }
      } catch (err) {
        console.error("Gagal memuat affiliate posts:", err);
        setPosts(fallbackPosts);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const isLiked = !prev[postId];
      setPosts((currentPosts) =>
        currentPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likeCount: isLiked ? p.likeCount + 1 : p.likeCount - 1,
            };
          }
          return p;
        })
      );
      return { ...prev, [postId]: isLiked };
    });
  };

  const handleCopyCaption = (post: any) => {
    const fullText = `${post.caption}\n\n${(post.hashtags || []).map((h: string) => `#${h}`).join(" ")}`;
    navigator.clipboard.writeText(fullText);
    setCopiedPostId(post.id);
    toast.success("Caption & Hashtags berhasil disalin!");
    setTimeout(() => {
      setCopiedPostId(null);
    }, 2000);
  };

  const handleShare = (post: any) => {
    const text = encodeURIComponent(
      `Yuk gabung Snapp.frame Affiliate! Lihat materi promosi ini:\n\n"${post.caption}"`
    );
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "semua") return true;
    return post.category === activeFilter;
  });

  return (
    <>
      {/* Detail Modal */}
      <AnimatePresence>
        {activeProduct && (
          <AffiliateDetailModal
            product={activeProduct}
            onClose={() => setActiveProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Register Modal */}
      <AnimatePresence>
        {showModal && <RegisterModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <main className="min-h-screen bg-warm-white overflow-x-hidden w-full">

        {/* ── Hero ── */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden bg-near-black text-white border-b border-near-black/5 w-full">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gold/20 border border-gold/40">
                <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.2em] text-gold uppercase">Lowongan Kerja</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tighter uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                Affiliate <br /><span className="text-gold">Partner</span>
              </h1>
              <p className="text-white/80 text-lg font-bold max-w-xl leading-relaxed mb-8">
                Bergabunglah bersama <span className="text-gold">Snapp.frame Studio</span> dan dapatkan penghasilan jutaan rupiah setiap bulan!
              </p>
              <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-white/60 font-black uppercase tracking-wider">Contoh Sukses</span>
                  <span className="text-sm font-bold text-white/90">Penghasilan per bulan hingga</span>
                  <span className="text-2xl font-black text-gold">Rp10.000.000</span>
                </div>
              </div>
              <div>
                <a
                  href="#program-affiliate"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-near-black font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/30"
                >
                  Lihat Program Affiliate
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>

            <div className="w-full md:w-[380px] grid grid-cols-2 gap-4">
              {[
                { icon: Handshake, title: "Kerja Fleksibel", desc: "Kapan saja, di mana saja" },
                { icon: BadgeDollarSign, title: "Penghasilan", desc: "Tanpa batas, makin banyak makin cuan!" },
                { icon: TrendingUp, title: "Pengembangan Diri", desc: "Bangun relasi & skill marketing" },
                { icon: Award, title: "Sertifikat Partner", desc: "Sertifikat resmi dari Snapp.frame" },
              ].map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold mb-3"><f.icon size={22} /></div>
                  <h3 className="font-black text-white text-sm mb-1">{f.title}</h3>
                  <p className="text-[10px] text-white/60 font-bold leading-tight">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Products Grid ── */}
        <section id="program-affiliate" className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-near-black uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                Pilihan Layanan & <span className="text-gold">Program Affiliate</span>
              </h2>
              <p className="text-near-black/50 font-bold max-w-xl mx-auto text-sm">
                Klik <span className="text-gold font-black">Lihat Detail</span> pada program untuk melihat informasi lengkap, paket, & komisi affiliate.
              </p>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-[#F8F6F4]/50 p-4 rounded-3xl border border-near-black/5">
              <div className="text-xs font-black uppercase tracking-widest text-[#3B2211]/50 pl-2">
                Daftar Program ({filteredProducts.length})
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-near-black/30" size={16} />
                <input
                  type="text"
                  placeholder="Cari layanan atau program..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border border-near-black/10 rounded-2xl text-xs font-bold text-near-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-near-black/30 hover:text-near-black"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center text-near-black/40 font-bold uppercase tracking-widest text-xs">
                  Tidak ada program partner ditemukan
                </div>
              ) : (
                filteredProducts.map((prod, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-6 rounded-[2rem] border border-near-black/5 bg-warm-white/30 hover:bg-white hover:border-gold/30 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                          <prod.icon size={22} />
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          prod.url
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-near-black/5 text-near-black/40"
                        }`}>
                          {prod.url ? "Link Aktif" : "Segera Hadir"}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-near-black uppercase mb-2 tracking-wide line-clamp-1">{prod.name}</h3>
                      <p className="text-[11px] text-near-black/60 font-medium leading-relaxed mb-6 line-clamp-3">{prod.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-near-black/5 flex items-center justify-between gap-4 mt-auto">
                      <div>
                        <span className="block text-[8px] text-near-black/40 font-black uppercase tracking-wider mb-0.5">ESTIMASI FEE</span>
                        <span className="block text-xs font-black text-gold uppercase">{prod.fee}</span>
                      </div>
                      {prod.url ? (
                        <button
                          id={`affiliate-btn-${i}`}
                          onClick={() => setActiveProduct(prod)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-near-black text-near-black hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-gold/10"
                        >
                          Lihat Detail
                          <ChevronRight size={12} />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-near-black/5 text-near-black/30 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-default">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ── Discount Table ── */}
        <section className="py-20 bg-near-black text-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-[#122e4d] rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold via-yellow-300 to-gold" />
              <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                <div className="w-20 h-20 flex-shrink-0 bg-gold rounded-full flex flex-col items-center justify-center text-near-black rotate-[-12deg] shadow-lg">
                  <Gift size={28} />
                  <span className="text-[8px] font-black uppercase mt-0.5 text-center leading-tight">Special<br />Discount</span>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-white mb-2 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                    Affiliate Partner Dapat Memberikan <span className="text-gold">Discount</span> Kepada Customer!
                  </h2>
                  <p className="text-white/70 text-sm font-bold">Discount khusus sesuai ketentuan — fee affiliate tetap diterima penuh.</p>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-white/90 font-black uppercase tracking-wider border-b border-white/10">
                      <th className="px-6 py-4">Produk / Jasa</th>
                      <th className="px-6 py-4 text-center">Maks. Discount<br /><span className="text-gold/70 font-normal text-[8px]">(untuk customer)</span></th>
                      <th className="px-6 py-4 text-center">Fee Affiliate<br /><span className="text-white/40 font-normal text-[8px]">(tetap diterima)</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {discountData.map((item, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3 font-bold text-white/90">{item.name}</td>
                        <td className="px-6 py-3 text-center text-gold font-black">{item.maxDiscount}</td>
                        <td className="px-6 py-3 text-center text-white font-bold">{item.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col items-center gap-4 mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
                <span className="text-[10px] text-white/50 font-bold uppercase">Contoh Cara Kerja:</span>
                <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-3 justify-center w-full">
                  <div className="bg-white/10 px-4 py-2 rounded-lg text-center">
                    <span className="block text-[9px] text-white/60">Harga Normal</span>
                    <span className="block text-sm font-bold line-through text-white/40">Rp99.000</span>
                  </div>
                  <ChevronRight className="text-gold/40 hidden sm:block" size={16} />
                  <div className="bg-gold/20 border border-gold/30 px-4 py-2 rounded-lg text-center">
                    <span className="block text-[9px] text-gold">Kode Referral</span>
                    <span className="block text-sm font-black text-gold">NAMA10</span>
                    <span className="block text-[9px] text-white/70">Diskon Rp10.000</span>
                  </div>
                  <ChevronRight className="text-gold/40 hidden sm:block" size={16} />
                  <div className="bg-white/10 px-4 py-2 rounded-lg text-center">
                    <span className="block text-[9px] text-white/60">Customer Bayar</span>
                    <span className="block text-sm font-black text-white">Rp89.000</span>
                  </div>
                  <ChevronRight className="text-gold/40 hidden sm:block" size={16} />
                  <div className="col-span-2 sm:col-span-1 bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-lg text-center">
                    <span className="block text-[9px] text-green-400">Affiliate Dapat</span>
                    <span className="block text-sm font-black text-green-400">Rp10.000 ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Galeri Kegiatan & Materi Promosi ── */}
        <section className="py-20 bg-warm-light/40 border-y border-border/40">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                <Sparkles size={12} className="animate-pulse" />
                <span>Galeri & Bahan Promosi</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-near-black uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Galeri Kegiatan <span className="text-gold">& Materi</span>
              </h2>
              <p className="text-near-black/60 text-sm font-bold max-w-xl leading-relaxed text-center">
                Lihat keseruan event kami atau langsung salin materi promosi (foto & caption) di bawah ini untuk dibagikan ke media sosial Anda!
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
              {[
                { id: "semua", label: "Semua Materi" },
                { id: "kegiatan", label: "Kegiatan Studio" },
                { id: "promo", label: "Materi Promo" },
              ].map((tabItem) => (
                <button
                  key={tabItem.id}
                  onClick={() => setActiveFilter(tabItem.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border ${
                    activeFilter === tabItem.id
                      ? "bg-near-black text-white border-near-black shadow-md scale-[1.02]"
                      : "bg-white text-near-black/60 border-near-black/10 hover:border-near-black/20 hover:text-near-black"
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            {/* Grid Materi Promosi */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 text-near-black/40 font-bold uppercase tracking-widest text-xs">
                Tidak ada materi promosi ditemukan
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => {
                  const isLiked = likedPosts[post.id];
                  const isCopied = copiedPostId === post.id;
                  const formattedDate = post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-3xl border border-border/30 shadow-sm hover:shadow-xl hover:shadow-near-black/5 transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      {/* Header Card */}
                      <div className="flex items-center justify-between px-5 py-4 border-b border-warm-white">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-near-black flex items-center justify-center text-white font-black text-xs shadow-sm">
                            SF
                          </div>
                          <div>
                            <p className="text-xs font-black text-near-black leading-none">snapp.frame</p>
                            <p className="text-[9px] text-near-black/40 font-bold mt-1 flex items-center gap-1">
                              <Calendar size={10} />
                              {formattedDate}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-[9px] font-black uppercase tracking-wider">
                          {post.category === "kegiatan" ? "Kegiatan" : "Materi Promo"}
                        </span>
                      </div>

                      {/* Image Area */}
                      <div className="relative aspect-square bg-warm-white overflow-hidden group">
                        <img
                          src={post.imageUrl}
                          alt="Materi Promosi"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleCopyCaption(post)}
                            className="bg-white text-near-black p-3 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
                            title="Salin Caption"
                          >
                            {isCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                          </button>
                          <button
                            onClick={() => handleShare(post)}
                            className="bg-white text-near-black p-3 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
                            title="Bagikan ke WhatsApp"
                          >
                            <Share2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-5 pt-4 pb-2 flex items-center justify-between border-t border-warm-white">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-1.5 group/like cursor-pointer"
                          >
                            <Heart
                              size={20}
                              className={`transition-all duration-300 group-hover/like:scale-110 ${
                                isLiked ? "fill-rose-500 text-rose-500" : "text-near-black/40 hover:text-rose-500"
                              }`}
                            />
                            <span className="text-xs font-black text-near-black/70">
                              {post.likeCount}
                            </span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleCopyCaption(post)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            isCopied
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gold/10 text-gold hover:bg-gold/20 border border-transparent"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} />
                              Tersalin
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              Salin Caption
                            </>
                          )}
                        </button>
                      </div>

                      {/* Caption / Content */}
                      <div className="px-5 pb-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-2 mt-2">
                          <p className="text-xs text-near-black/80 font-bold leading-relaxed line-clamp-3">
                            <span className="font-black text-near-black mr-1">snapp.frame</span>
                            {post.caption}
                          </p>
                          {post.hashtags && post.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.hashtags.map((tag: string) => (
                                <span key={tag} className="text-[10px] font-black text-gold/95">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Info Columns ── */}
        <section className="py-20 bg-warm-white">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Tugas Affiliate Partner", bg: "bg-near-black", textColor: "text-white",
                items: ["Promosikan semua produk & layanan", "Bagikan link / kode referral", "Dapatkan peserta / customer", "Capai target & raih komisi", "Buat konten promosi di medsos"],
              },
              {
                title: "Benefit Affiliate Partner", bg: "bg-gold", textColor: "text-near-black",
                items: ["Penghasilan tanpa batas", "Komisi dari setiap penjualan", "Bonus target bulanan & reward", "Materi promosi & support marketing", "Sertifikat resmi Affiliate Partner", "Komunitas partner aktif", "Peluang jadi Ambassador"],
              },
              {
                title: "Syarat Pendaftaran", bg: "bg-near-black", textColor: "text-white",
                items: ["Usia minimal 17 tahun", "Punya smartphone & internet", "Aktif di media sosial", "Komunikatif & semangat belajar", "Bersedia bekerja dengan target"],
              },
            ].map((col, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-near-black/10 shadow-sm">
                <span className={`${col.bg} ${col.textColor} px-4 py-2 rounded-lg inline-block font-black uppercase text-xs mb-6`}>{col.title}</span>
                <ul className="space-y-3">
                  {col.items.map((text, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-bold text-near-black/70">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <section className="bg-near-black text-white py-16 border-t-4 border-gold">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase" style={{ fontFamily: "var(--font-heading)" }}>
                Yuk, Gabung <span className="text-gold">Sekarang!</span>
              </h2>
              <p className="text-white/70 font-bold mb-8 max-w-md">Bangun penghasilan, relasi, dan masa depan bersama Snapp.frame Studio!</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-near-black font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/30"
              >
                Daftar Gratis! <ArrowRight size={18} />
              </button>
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-8 w-full">
              <div className="text-center mb-6">
                <span className="bg-gold text-near-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Cara Bergabung</span>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-between gap-4 sm:gap-2">
                {["Daftar via WhatsApp", "Dapatkan kode referral", "Promosikan produk", "Dapat komisi!"].map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center flex-1 relative">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-gold mb-3 text-lg">{i + 1}</div>
                    <span className="text-[10px] font-bold text-white/80 max-w-[90px]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
