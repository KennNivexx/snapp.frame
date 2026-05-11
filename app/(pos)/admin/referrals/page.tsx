"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  X,
  Search,
  ChevronDown,
  Calendar,
  Sparkles,
  Power,
  PowerOff,
  RefreshCw,
  Gift,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  ShieldCheck,
  Command,
  Scissors
} from "lucide-react";
import { getReferrals, createReferral, toggleReferralStatus, deleteReferral } from "@/app/actions/referrals";
import { createClient } from "@/lib/supabase/client";
import { ReferralType } from "@/prisma/generated/client";

interface ReferralCode {
  id: string;
  code: string;
  label: string;
  type: ReferralType;
  value: number;
  usageCount: number;
  usageLimit: number | null;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    label: "",
    type: "PERCENTAGE" as ReferralType,
    value: 10,
    usageLimit: "",
    expiryDate: ""
  });

  const supabase = createClient();

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  useEffect(() => {
    fetchReferrals();

    const channel = supabase
      .channel("referral-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "referral_codes" },
        () => fetchReferrals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const result = await getReferrals();
      if (result.success) {
        setReferrals(result.data as any[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createReferral({
        ...formData,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        expiryDate: formData.expiryDate || null
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          code: "",
          label: "",
          type: "PERCENTAGE",
          value: 10,
          usageLimit: "",
          expiryDate: ""
        });
        fetchReferrals();
      } else {
        alert("Gagal membuat kode: " + res.error);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleReferralStatus(id, !currentStatus);
      if (res.success) fetchReferrals();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kode referral ini secara permanen?")) return;
    try {
      const res = await deleteReferral(id);
      if (res.success) fetchReferrals();
    } catch (error) {
      console.error(error);
    }
  };

  const generateCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, code: `PROMO-${random}` }));
  };

  const filteredReferrals = referrals.filter(r => 
    r.code.toLowerCase().includes(search.toLowerCase()) || 
    r.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-6 lg:p-12 relative overflow-hidden">
      {/* Dekorasi Latar */}
      <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
        <Ticket size={400} className="text-[#3B2211]" />
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-[20px] bg-[#3B2211] flex items-center justify-center text-white shadow-2xl shadow-[#3B2211]/20">
               <Ticket size={24} />
             </div>
             <div>
                <h1 className="text-4xl font-bold text-[#3B2211] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                  Manajemen Kode Promo
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/40">Sistem Referral & Diskon Sneapici</p>
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-4"
        >
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#3B2211]/30 group-focus-within:text-[#3B2211] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Cari kode promo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-[#3B2211]/5 rounded-[22px] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B2211]/5 w-full md:w-80 shadow-2xl shadow-[#3B2211]/5"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 bg-[#3B2211] !text-white rounded-[22px] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#3B2211]/30 hover:scale-105 active:scale-95 transition-all select-none"
          >
            <Plus size={16} />
            Buat Kode Baru
          </button>
        </motion.div>
      </div>

      {/* ── Ringkasan Performa ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 relative z-10">
        {[
          { label: "Kode Aktif", val: referrals.filter(r => r.isActive).length, icon: Zap, color: "#10B981" },
          { label: "Total Penggunaan", val: referrals.reduce((acc, r) => acc + r.usageCount, 0), icon: Target, color: "#3B2211" },
          { label: "Total Database", val: referrals.length, icon: ShieldCheck, color: "#3B82F6" },
          { label: "High Impact (>50)", val: referrals.filter(r => r.usageCount > 50).length, icon: Sparkles, color: "#F59E0B" }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 bg-white rounded-[32px] border border-[#3B2211]/5 shadow-2xl shadow-[#3B2211]/5 relative overflow-hidden group"
          >
             <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
               <stat.icon size={100} style={{ color: stat.color }} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B2211]/40 mb-3">{stat.label}</p>
             <div className="flex items-end gap-3">
               <span className="text-4xl font-bold text-[#3B2211]" style={{ fontFamily: "var(--font-playfair)" }}>{stat.val}</span>
               <TrendingUp size={14} className="text-emerald-500 mb-2" />
             </div>
          </motion.div>
        ))}
      </div>

      {/* ── Tabel Registry ── */}
      <div className="bg-white rounded-[40px] border border-[#3B2211]/5 shadow-4xl overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#3B2211]/5 bg-[#FAFAF8]/50">
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#3B2211]/30">Kode Promo</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#3B2211]/30">Nilai Diskon</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#3B2211]/30">Info Penggunaan</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#3B2211]/30 text-center">Status</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#3B2211]/30 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3B2211]/2">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="p-8"><div className="h-12 bg-[#FAFAF8] rounded-2xl w-full" /></td>
                    </tr>
                  ))
                ) : filteredReferrals.length > 0 ? (
                  filteredReferrals.map((r, idx) => (
                    <motion.tr 
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-[#FAFAF8]/50 transition-colors"
                    >
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#3B2211]/5 flex items-center justify-center font-black text-xs text-[#3B2211] group-hover:scale-110 transition-transform">
                             {r.code.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#3B2211] tracking-wider">{r.code}</p>
                            <p className="text-[10px] text-[#3B2211]/40 uppercase tracking-widest mt-0.5">{r.label}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-3">
                           <div className="px-4 py-2 rounded-xl bg-[#3B2211] text-white text-[10px] font-black shadow-lg shadow-[#3B2211]/20">
                             {r.type === "PERCENTAGE" ? `${r.value}%` : `Rp ${r.value.toLocaleString()}`}
                           </div>
                           <span className="text-[9px] font-black uppercase tracking-widest text-[#3B2211]/30">Diskon</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Target size={12} className="text-[#3B2211]/20" />
                            <span className="text-xs font-bold text-[#3B2211]">{r.usageCount} / {r.usageLimit || "∞"} Dipakai</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-[#3B2211]/20" />
                            <span className="text-[10px] text-[#3B2211]/40 uppercase font-black tracking-widest">
                              Berakhir: {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('id-ID') : "Selamanya"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => handleToggle(r.id, r.isActive)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${r.isActive ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 border-red-100 text-red-600 hover:bg-red-100"}`}
                          >
                             <div className={`w-1.5 h-1.5 rounded-full ${r.isActive ? "bg-emerald-600 animate-pulse" : "bg-red-600"}`} />
                             <span className="text-[9px] font-black uppercase tracking-widest">{r.isActive ? "Aktif" : "Nonaktif"}</span>
                          </button>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(r.code);
                              alert("Kode disalin ke clipboard!");
                            }}
                            className="w-10 h-10 rounded-xl bg-white border border-[#3B2211]/5 flex items-center justify-center text-[#3B2211]/30 hover:text-[#3B2211] hover:border-[#3B2211]/20 transition-all shadow-xl shadow-black/5"
                            title="Salin Kode"
                          >
                            <Copy size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(r.id)}
                            className="w-10 h-10 rounded-xl bg-white border border-[#3B2211]/5 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-100 transition-all shadow-xl shadow-black/5"
                            title="Hapus Kode"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-32 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 rounded-[30px] bg-[#FAFAF8] flex items-center justify-center border border-[#3B2211]/5">
                          <Ticket size={32} className="text-[#3B2211]/10" />
                        </div>
                        <p className="text-sm text-[#3B2211]/40 font-bold">Belum ada kode promo terdaftar</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Tambah Kode ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#3B2211]/40 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-xl bg-white rounded-[48px] shadow-5xl relative z-10 overflow-hidden border border-white/20"
            >
               <form onSubmit={handleCreate} className="p-12">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-[#3B2211]/5 flex items-center justify-center text-[#3B2211]">
                         <Sparkles size={28} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold text-[#3B2211]" style={{ fontFamily: "var(--font-playfair)" }}>Buat Kode Baru</h2>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">Konfigurasi Promo Sneapici</p>
                       </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-12 h-12 rounded-full bg-[#FAFAF8] border border-[#3B2211]/5 flex items-center justify-center text-[#3B2211]/40 hover:text-[#3B2211] transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B2211]/40 ml-2">Kode Akses</label>
                        <div className="relative">
                          <input 
                            required
                            type="text" 
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                            className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#3B2211]/5 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#3B2211]/10 font-black tracking-widest text-[#3B2211]"
                            placeholder="Contoh: MERDEKA20"
                          />
                          <button 
                            type="button"
                            onClick={generateCode}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-xl border border-[#3B2211]/5 text-[#3B2211]/40 hover:text-[#3B2211] transition-all shadow-lg"
                          >
                            <RefreshCw size={14} />
                          </button>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B2211]/40 ml-2">Nama Promo / Label</label>
                        <input 
                          required
                          type="text" 
                          value={formData.label}
                          onChange={(e) => setFormData({...formData, label: e.target.value})}
                          className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#3B2211]/5 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-[#3B2211]/10 font-bold text-[#3B2211]" 
                          placeholder="Contoh: Diskon Grand Opening" 
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B2211]/40 ml-2">Tipe Diskon</label>
                           <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as ReferralType})}
                            className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#3B2211]/5 rounded-[24px] focus:outline-none font-bold text-[#3B2211] appearance-none"
                           >
                             <option value="PERCENTAGE">Persentase (%)</option>
                             <option value="FIXED">Nominal (Rp)</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B2211]/40 ml-2">Nilai</label>
                           <input 
                            required
                            type="number" 
                            value={formData.value}
                            onChange={(e) => setFormData({...formData, value: parseInt(e.target.value)})}
                            className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#3B2211]/5 rounded-[24px] focus:outline-none font-bold text-[#3B2211]" 
                            placeholder="Contoh: 10 atau 5000" 
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B2211]/40 ml-2">Limit Penggunaan</label>
                           <input 
                            type="number" 
                            value={formData.usageLimit}
                            onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                            className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#3B2211]/5 rounded-[24px] focus:outline-none font-bold text-[#3B2211]" 
                            placeholder="Kosongkan jika tak terbatas" 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B2211]/40 ml-2">Tanggal Berakhir</label>
                           <input 
                            type="date" 
                            value={formData.expiryDate}
                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                            className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#3B2211]/5 rounded-[24px] focus:outline-none font-bold text-[#3B2211]" 
                           />
                        </div>
                     </div>

                     <button 
                      disabled={isSubmitting}
                      className="w-full py-6 bg-[#3B2211] text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.5em] shadow-2xl shadow-[#3B2211]/40 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 disabled:opacity-50"
                     >
                       {isSubmitting ? "Memproses..." : "Simpan & Aktifkan"}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
