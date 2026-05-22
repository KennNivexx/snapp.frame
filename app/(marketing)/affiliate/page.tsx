"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee, Camera, Presentation, Recycle, MonitorPlay,
  GraduationCap, Users, Building, ShoppingBag, Handshake,
  BadgeDollarSign, TrendingUp, Award, CheckCircle2,
  ChevronRight, Gift, ArrowRight, X, MessageCircle,
  Heart, Copy, Check, Share2, Calendar, Sparkles,
} from "lucide-react";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getAffiliatePosts } from "@/app/actions/affiliate-posts";
import { toast } from "sonner";

const products = [
  { name: "Rata Coffee", fee: "1.000", unit: "gelas", icon: Coffee },
  { name: "Snapp Frame", fee: "3.500", unit: "foto", icon: Camera },
  { name: "Pelatihan Dibimbing", fee: "200.000", unit: "peserta", icon: Presentation },
  { name: "Produk Daur Ulang", fee: "5.000", unit: "produk", icon: Recycle },
  { name: "Webinar Siap Kerja", fee: "10.000", unit: "peserta", icon: MonitorPlay },
  { name: "Pendampingan TA", fee: "200.000", unit: "klien", icon: GraduationCap },
  { name: "Sewa Meeting Room", fee: "30.000", unit: "room", icon: Users },
  { name: "Virtual Office", fee: "30.000", unit: "jasa", icon: Building },
  { name: "Produk UMKM", fee: "2.000", unit: "produk", icon: ShoppingBag },
];

const discountData = [
  { name: "Rata Coffee", maxDiscount: "Rp2.000", fee: "Rp1.000" },
  { name: "Snapp Frame", maxDiscount: "Rp5.000", fee: "Rp3.500" },
  { name: "Webinar Siap Kerja", maxDiscount: "Rp10.000", fee: "Rp10.000" },
  { name: "Pelatihan Dibimbing", maxDiscount: "Rp100.000", fee: "Rp200.000" },
  { name: "Pendampingan TA", maxDiscount: "Rp100.000", fee: "Rp200.000" },
  { name: "Produk Daur Ulang", maxDiscount: "Rp5.000", fee: "Rp5.000" },
  { name: "Sewa Meeting Room", maxDiscount: "Rp20.000", fee: "Rp30.000" },
  { name: "Virtual Office", maxDiscount: "Rp50.000", fee: "Rp30.000" },
  { name: "Produk UMKM", maxDiscount: "Menyesuaikan", fee: "Rp2.000" },
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
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-near-black px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">Daftar Affiliate</h2>
              <p className="text-[10px] text-white/50 font-bold mt-0.5">Isi data singkat, lanjut via WhatsApp</p>
            </div>
            <button onClick={onClose} className="p-2 text-white/30 hover:text-white transition-colors rounded-xl">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="p-8 space-y-5">
            {[
              { label: "Nama Lengkap *", key: "name", placeholder: "Nama lengkapmu" },
              { label: "Nomor WhatsApp *", key: "phone", placeholder: "08xxxxxxxxxx" },
              { label: "Instagram", key: "instagram", placeholder: "@username (opsional)" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-[10px] font-black text-near-black uppercase tracking-widest mb-2">{label}</label>
                <input
                  type="text"
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-5 py-3.5 bg-warm-white border border-transparent rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-near-black/10 transition-all"
                />
              </div>
            ))}

            <p className="text-[10px] text-near-black/40 font-bold">
              Data ini akan dikirim otomatis ke WhatsApp kami sebagai pesan pendaftaran.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-8 pb-8">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-near-black/10 text-[11px] font-black uppercase tracking-widest text-near-black/40 hover:text-near-black transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name || !form.phone}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl shadow-green-500/20"
            >
              <MessageCircle size={16} />
              Lanjut ke WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function AffiliatePage() {
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"semua" | "kegiatan" | "promo">("semua");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

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
    <main className="min-h-screen bg-warm-white overflow-x-hidden w-full">
      <AnimatePresence>{showModal && <RegisterModal onClose={() => setShowModal(false)} />}</AnimatePresence>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden bg-near-black text-white border-b border-near-black/5 w-full">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gold/20 border border-gold/40">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-gold uppercase">Lowongan Kerja</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tighter uppercase break-words" style={{ fontFamily: "var(--font-heading)" }}>
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
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-near-black font-black uppercase tracking-widest text-sm rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gold/30"
              >
                Daftar Sekarang — Gratis!
                <ArrowRight size={18} />
              </button>
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

      {/* ── Products ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-near-black uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-heading)" }}>
              Promosikan Semua Produk <br /><span className="text-gold">Snapp.frame</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((prod, i) => (
              <div key={i} className="group p-5 rounded-2xl border border-near-black/5 bg-warm-white/30 hover:bg-white hover:border-gold/30 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform">
                  <prod.icon size={28} />
                </div>
                <h3 className="text-xs font-black text-near-black uppercase mb-3 line-clamp-2">{prod.name}</h3>
                <div className="mt-auto w-full pt-3 border-t border-near-black/10">
                  <span className="block text-[10px] text-near-black/50 font-bold uppercase mb-0.5">Fee</span>
                  <span className="block text-sm font-black text-gold">Rp{prod.fee}</span>
                  <span className="block text-[10px] text-near-black/50 font-bold uppercase">/{prod.unit}</span>
                </div>
              </div>
            ))}
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

          {/* Grid Container */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-border/30 overflow-hidden shadow-sm p-4 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full skeleton" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-24 skeleton" />
                      <div className="h-2 w-16 skeleton" />
                    </div>
                  </div>
                  <div className="aspect-square w-full rounded-2xl skeleton" />
                  <div className="space-y-2">
                    <div className="h-3 w-1/3 skeleton" />
                    <div className="h-3 w-full skeleton" />
                    <div className="h-3 w-3/4 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-border/30">
              <Camera size={48} className="text-near-black/20 mx-auto mb-4" />
              <h3 className="text-lg font-black text-near-black uppercase mb-1">Belum Ada Postingan</h3>
              <p className="text-xs text-near-black/50 font-bold">Kategori ini belum memiliki postingan materi promosi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
                const isLiked = !!likedPosts[post.id];
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
  );
}
