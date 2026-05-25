"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";
import {
  DollarSign, Gift, Copy, Check, Landmark, CreditCard,
  TrendingUp, Users, Share2, ExternalLink, Sparkles, Clock,
  CheckCircle2, Calendar, ImageIcon, BookOpen, AlertCircle, Phone
} from "lucide-react";
import { getSnapperDashboardData, updateSnapperReferralProduct } from "@/app/actions/snapper";
import { getAffiliatePosts } from "@/app/actions/affiliate-posts";
import { getProducts } from "@/app/actions/products";
import { toast } from "sonner";

interface Commission {
  id: string;
  bookingId: string;
  amount: number;
  status: string;
  createdAt: string;
  booking: {
    invoiceNo: string;
    customerName: string;
    packageName: string;
    sessionDate: string;
    finalPrice: number;
  };
}

interface AffiliatePost {
  id: string;
  imageUrl: string;
  caption: string;
  hashtags: string[];
  likeCount: number;
  isPublished: boolean;
  postedBy: string;
  createdAt: Date | string;
}

export default function SnapperDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "dashboard";

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [posts, setPosts] = useState<AffiliatePost[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Referral campaign States
  const [productsList, setProductsList] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [savingProduct, setSavingProduct] = useState(false);

  // Auto-redirect if not logged in or wrong role
  useEffect(() => {
    getSession().then((s) => {
      if (!s) {
        router.push("/login");
        return;
      }
      const role = (s.user as any)?.role;
      if (role !== "SNAPPER" && role !== "ADMIN") {
        router.push("/login");
        return;
      }
      setSession(s);
    });
  }, [router]);

  // Fetch dashboard data & affiliate posts & products
  useEffect(() => {
    if (!session) return;

    async function fetchData() {
      setLoading(true);
      try {
        const userId = session.user.id;
        const [dashRes, postsRes, prodRes] = await Promise.all([
          getSnapperDashboardData(userId),
          getAffiliatePosts(),
          getProducts()
        ]);

        if (dashRes.success && dashRes.data) {
          setDashboardData(dashRes.data);
          setSelectedProductId(dashRes.data.referralCode?.targetProductId || "");
        } else {
          toast.error(dashRes.error || "Gagal memuat data dashboard.");
        }

        if (postsRes.success && postsRes.data) {
          // Only show published posts to snappers
          const published = postsRes.data.filter((p: any) => p.isPublished);
          setPosts(published);
        }

        if (prodRes.success && prodRes.data) {
          setProductsList(prodRes.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!dashboardData || !dashboardData.commissions) {
      return { totalEarnings: 0, pendingPayout: 0, paidPayout: 0, count: 0 };
    }
    const commissions: Commission[] = dashboardData.commissions;
    const totalEarnings = commissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingPayout = commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.amount, 0);
    const paidPayout = commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.amount, 0);
    return {
      totalEarnings,
      pendingPayout,
      paidPayout,
      count: dashboardData.referralCode?.usageCount || 0
    };
  }, [dashboardData]);

  // Copy referral code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Kode referral berhasil disalin!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy referral link
  const handleCopyLink = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://snappframe.id";
    let shareUrl = `${origin}/booking?ref=${code}`;
    if (dashboardData?.referralCode?.targetProductId) {
      shareUrl += `&pkg=${dashboardData.referralCode.targetProductId}`;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Link referral berhasil disalin!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveTargetProduct = async () => {
    if (!session || !dashboardData?.referralCode) return;
    setSavingProduct(true);
    try {
      const res = await updateSnapperReferralProduct(session.user.id, selectedProductId || null);
      if (res.success) {
        toast.success("Target produk campaign berhasil diperbarui!");
        // Update local state
        setDashboardData((prev: any) => ({
          ...prev,
          referralCode: {
            ...prev.referralCode,
            targetProductId: selectedProductId || null
          }
        }));
      } else {
        toast.error(res.error || "Gagal memperbarui target campaign.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setSavingProduct(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#C88A58]/20 border-t-[#C88A58] animate-spin" />
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Memuat Dashboard Snapper...</p>
      </div>
    );
  }

  const referralCode = dashboardData.referralCode?.code || "";
  const discountPct = dashboardData.referralCode?.discountPct || 10;
  const feePercentage = dashboardData.referralCode?.feePercentage || 10;

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      
      {/* ── Heading ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#3B2211]/5 pb-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-[#C88A58] uppercase tracking-[0.4em]">Snapper Affiliate Partner</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C88A58] to-[#3B2211] flex items-center justify-center text-white shadow-xl shadow-[#C88A58]/20">
              <Gift size={24} />
            </div>
            <h1 className="text-4xl font-black text-[#3B2211] tracking-tight font-[family-name:var(--font-syne)]">
              Halo, {dashboardData.name}!
            </h1>
          </div>
          <p className="text-sm text-gray-400 font-medium">Selamat datang di portal kemitraan Snapp.frame Anda. Bagikan dan dapatkan penghasilan tambahan.</p>
        </div>

        {/* Info Box */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#3B2211]/5 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skema Komisi Anda</p>
            <p className="text-sm font-black text-[#3B2211]">
              Diskon {discountPct}% &bull; Fee {feePercentage}%
            </p>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* ── Tab Content Switcher ── */}
      {tabParam === "dashboard" && (
        <div className="space-y-10">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: "Total Pendapatan", val: `Rp ${stats.totalEarnings.toLocaleString("id-ID")}`, desc: "Akumulasi seluruh komisi", icon: DollarSign, color: "text-[#3B2211]", bg: "bg-gray-100" },
              { label: "Komisi Cair", val: `Rp ${stats.paidPayout.toLocaleString("id-ID")}`, desc: "Sudah ditransfer ke rekening", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Komisi Pending", val: `Rp ${stats.pendingPayout.toLocaleString("id-ID")}`, desc: "Menunggu pembayaran/verifikasi", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Total Referral", val: `${stats.count} Penggunaan`, desc: "Jumlah pemesanan selesai", icon: Users, color: "text-blue-600", bg: "bg-blue-50" }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-7 bg-white rounded-3xl border border-white shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-[#3B2211]/5 transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={22} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</p>
                  <span className="text-2xl font-black text-[#3B2211] tracking-tighter">{stat.val}</span>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">{stat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Referral Link Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-8 md:p-10 bg-gradient-to-br from-[#1E110A] to-[#120703] text-white rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
              {/* Background Orbs */}
              <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-[#C88A58]/20 blur-[80px] pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-xs font-bold text-[#E5AB7A]">
                  <Sparkles size={12} /> Link & Kode Referral
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>
                  Undang Teman & Dapatkan Komisinya!
                </h3>
                <p className="text-white/60 text-xs md:text-sm max-w-xl leading-relaxed">
                  Bagikan kode atau link referral Anda kepada calon pelanggan. Mereka akan mendapatkan potongan harga otomatis senilai <strong className="text-white font-bold">{discountPct}%</strong> ketika melakukan pemesanan, dan Anda akan langsung memperoleh komisi sebesar <strong className="text-white font-bold">{feePercentage}%</strong> dari nilai pesanan yang mereka bayar.
                </p>
              </div>

              {/* Target Campaign Selector */}
              <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#E5AB7A]">Target Produk Referral (Hanya 1 Produk)</span>
                  {selectedProductId && (
                    <button 
                      onClick={() => setSelectedProductId("")} 
                      className="text-[9px] font-bold text-rose-400 hover:underline"
                    >
                      Reset (General Link)
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#C88A58] transition-colors"
                  >
                    <option value="" className="bg-[#1E110A] text-white/50">Semua Produk/Layanan (General)</option>
                    {productsList.map((p) => (
                      <option key={p.id} value={p.sku} className="bg-[#1E110A] text-white">
                        {p.name} - Rp {p.price.toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveTargetProduct}
                    disabled={savingProduct || (dashboardData.referralCode?.targetProductId || "") === selectedProductId}
                    className="px-4 py-2.5 bg-gold hover:bg-gold/90 text-near-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-40"
                  >
                    {savingProduct ? "Menyimpan..." : "Simpan Target"}
                  </button>
                </div>
                <p className="text-[9px] text-white/40 leading-normal">
                  * Memilih produk di atas akan memodifikasi link rujukan Anda secara otomatis agar langsung memilih dan menargetkan produk tersebut saat pelanggan melakukan booking. Anda hanya bisa mengaktifkan 1 produk dalam satu waktu.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 relative z-10">
                {/* Code Card */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Kode Referral Anda</p>
                    <p className="text-lg font-black tracking-wider text-[#E5AB7A]">@{referralCode}</p>
                  </div>
                  <button
                    onClick={() => handleCopyCode(referralCode)}
                    className="p-2.5 bg-white/10 hover:bg-[#C88A58] rounded-xl transition-all"
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                {/* Link Card */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="truncate mr-2">
                    <p className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Link Tautan Otomatis</p>
                    <p className="text-xs font-bold text-white/80 truncate">
                      booking?ref={referralCode}
                      {dashboardData.referralCode?.targetProductId ? `&pkg=${dashboardData.referralCode.targetProductId}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyLink(referralCode)}
                    className="p-2.5 bg-white/10 hover:bg-[#C88A58] rounded-xl transition-all flex-shrink-0"
                  >
                    {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Rules / Tips */}
            <div className="bg-white p-8 rounded-[2rem] border border-[#3B2211]/5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#3B2211] flex items-center gap-2">
                  <BookOpen size={16} className="text-[#C88A58]" /> Panduan Singkat
                </h4>
                <ul className="space-y-3.5 text-xs text-gray-500 font-medium">
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C88A58] mt-1.5 flex-shrink-0" />
                    Pelanggan wajib menyelesaikan pembayaran agar komisi tercatat.
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C88A58] mt-1.5 flex-shrink-0" />
                    Komisi dihitung dari total harga setelah diskon referral.
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C88A58] mt-1.5 flex-shrink-0" />
                    Pencairan/payout diproses ke rekening Anda setiap akhir bulan.
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#3B2211]/5 flex items-center gap-4">
                <Landmark size={28} className="text-gray-300" />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Rekening Payout</p>
                  <p className="text-xs font-black text-[#3B2211]">{dashboardData.bankName} - {dashboardData.bankAccount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Commission Table */}
          <div className="bg-white rounded-[2rem] border border-[#3B2211]/5 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-[#3B2211]">Riwayat Penggunaan Referral & Komisi</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Daftar booking yang menggunakan kode Anda</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {dashboardData.commissions && dashboardData.commissions.length > 0 ? (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-black text-[9px]">
                      <th className="py-4">Invoice</th>
                      <th className="py-4">Customer</th>
                      <th className="py-4">Tanggal Sesi</th>
                      <th className="py-4">Paket</th>
                      <th className="py-4">Total Bayar</th>
                      <th className="py-4 text-right">Fee Komisi (10%)</th>
                      <th className="py-4 text-right pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.commissions.map((comm: Commission) => (
                      <tr key={comm.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-mono font-bold text-gray-400">#{comm.booking.invoiceNo}</td>
                        <td className="py-4 font-bold text-[#3B2211]">{comm.booking.customerName}</td>
                        <td className="py-4 text-gray-500 font-medium">
                          {new Date(comm.booking.sessionDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-4 text-gray-500 font-medium">{comm.booking.packageName}</td>
                        <td className="py-4 font-bold text-[#3B2211]">Rp {comm.booking.finalPrice.toLocaleString("id-ID")}</td>
                        <td className="py-4 font-black text-emerald-600 text-right">Rp {comm.amount.toLocaleString("id-ID")}</td>
                        <td className="py-4 text-right pr-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            comm.status === "paid"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}>
                            {comm.status === "paid" ? (
                              <><CheckCircle2 size={10} /> Cair</>
                            ) : (
                              <><Clock size={10} /> Pending</>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-300">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#3B2211]">Belum Ada Riwayat</h5>
                    <p className="text-gray-400 text-xs mt-1">Bagikan link referral Anda untuk mendapatkan transaksi pertama!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tabParam === "feed" && (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-black text-[#3B2211]" style={{ fontFamily: "var(--font-syne)" }}>Media Promosi Affiliator</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Salin bahan promosi (gambar, caption, hashtags) untuk media sosial Anda</p>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const textToCopy = `${post.caption}\n\n${post.hashtags.map((h) => `#${h}`).join(" ")}\n\nGunain kode referral saya untuk diskon tambahan: @${referralCode}`;
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl border border-[#F0EBE5] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#3B2211]/5 transition-all duration-500"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F8F6F4]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C88A58] to-[#3B2211] flex items-center justify-center text-white font-black text-[10px]">
                        SF
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-[#3B2211]">snapp.frame</p>
                        <p className="text-[8px] text-gray-400 font-bold">Materi Promosi Resmi</p>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="aspect-square bg-[#F8F6F4] relative overflow-hidden">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt="Promo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                          <ImageIcon size={40} />
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                          Siap Share ke Medsos
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(textToCopy);
                            toast.success("Caption & kode referral berhasil disalin ke clipboard!");
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#3B2211] hover:bg-[#C88A58] text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          <Copy size={11} /> Salin Caption
                        </button>
                      </div>

                      <div className="h-px bg-gray-100" />

                      <div className="space-y-1.5">
                        <p className="text-[11px] text-gray-700 leading-relaxed line-clamp-3">
                          {post.caption}
                        </p>
                        <p className="text-[10px] text-[#C88A58] font-bold">
                          {post.hashtags.map((h) => `#${h}`).join(" ")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-[#3B2211]/5 py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-300">
                <ImageIcon size={32} />
              </div>
              <div>
                <h5 className="font-bold text-[#3B2211]">Belum Ada Media Promosi</h5>
                <p className="text-gray-400 text-xs mt-1">Admin belum memposting bahan promosi. Silakan periksa kembali nanti.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {tabParam === "bank" && (
        <div className="space-y-8 max-w-2xl">
          <div>
            <h3 className="text-xl font-black text-[#3B2211]" style={{ fontFamily: "var(--font-syne)" }}>Rekening & Pembayaran Payout</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Kelola data perbankan Anda untuk pencairan komisi bulanan</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-[#3B2211]/5 p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center gap-4 bg-[#F8F6F4] p-5 rounded-2xl border border-[#3B2211]/5">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                <Landmark size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Akun Rekening Terdaftar</p>
                <h4 className="text-base font-black text-[#3B2211] mt-0.5">{dashboardData.bankName}</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase">Nama Pemegang Rekening</span>
                <span className="text-xs font-bold text-[#3B2211]">{dashboardData.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase">Nomor Rekening / E-Wallet</span>
                <span className="text-xs font-mono font-bold text-[#3B2211]">{dashboardData.bankAccount}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-bold uppercase">Nomor Telepon Partner</span>
                <span className="text-xs font-bold text-[#3B2211] flex items-center gap-1">
                  <Phone size={12} className="text-gray-400" />
                  {dashboardData.phone || "-"}
                </span>
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed font-medium">
                <strong>Ingin mengubah data rekening?</strong> Silakan hubungi admin studio melalui WhatsApp untuk melakukan perubahan data bank. Hal ini demi alasan keamanan pencairan komisi Anda.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
