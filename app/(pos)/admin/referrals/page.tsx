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
  ArrowLeft,
  X,
  Search,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

interface ReferralCode {
  id: string;
  code: string;
  type: string;
  value: number;
  usageCount: number;
  usageLimit: number | null;
  isActive: boolean;
  createdAt: string;
}

export default function ReferralManagement() {
  const [referrals, setReferrals] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "DISCOUNT_PERCENT",
    value: 10,
    usageLimit: "",
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await fetch("/api/referrals");
      const data = await res.json();
      setReferrals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          value: Number(formData.value),
          usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ code: "", type: "DISCOUNT_PERCENT", value: 10, usageLimit: "" });
        fetchReferrals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-[#1A1A1A] mb-4 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Buat Referral
          </h2>
          <p className="text-[#5A5A5A] mt-2">Buat dan pantau kode referral untuk meningkatkan loyalitas pelanggan.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] rounded-2xl text-sm font-bold text-white hover:bg-[#333333] transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          Buat Kode Baru
        </button>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Total Codes</p>
          <h4 className="text-3xl font-bold text-[#1A1A1A]">{referrals.length}</h4>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Active Codes</p>
          <h4 className="text-3xl font-bold text-[#1A1A1A]">{referrals.filter(r => r.isActive).length}</h4>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Total Usage</p>
          <h4 className="text-3xl font-bold text-[#1A1A1A]">{referrals.reduce((acc, r) => acc + r.usageCount, 0)}</h4>
        </div>
      </div>

      {/* ── Referral Table ── */}
      <div className="bg-white rounded-3xl border border-[#E0E0DA] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#E0E0DA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]" size={18} />
             <input 
               type="text" 
               placeholder="Cari kode..." 
               className="w-full pl-12 pr-4 py-3 bg-[#F0EFE9] border-transparent rounded-xl text-sm focus:bg-white focus:border-[#E0E0DA] focus:ring-0 transition-all"
             />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#5A5A5A] hover:text-[#1A1A1A]">
             Filter: Terbaru <ChevronDown size={16} />
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAF8] text-[10px] text-[#888888] uppercase tracking-[0.2em]">
                <th className="px-8 py-5 font-bold">Kode</th>
                <th className="px-8 py-5 font-bold">Tipe</th>
                <th className="px-8 py-5 font-bold">Nilai</th>
                <th className="px-8 py-5 font-bold">Penggunaan</th>
                <th className="px-8 py-5 font-bold">Status</th>
                <th className="px-8 py-5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFE9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-[#888888]">Memuat data...</td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-[#888888]">Belum ada kode referral.</td>
                </tr>
              ) : referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F0EFE9] flex items-center justify-center">
                        <Ticket size={20} className="text-[#1A1A1A]" />
                      </div>
                      <span className="text-base font-bold text-[#1A1A1A] tracking-wider">{ref.code}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-[#5A5A5A]">
                    {ref.type === "DISCOUNT_PERCENT" ? "Diskon Persen" : ref.type === "CASHBACK" ? "Cashback" : "Item Gratis"}
                  </td>
                  <td className="px-8 py-6 font-bold text-[#1A1A1A]">
                    {ref.type === "DISCOUNT_PERCENT" ? `${ref.value}%` : `Rp ${ref.value.toLocaleString()}`}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[#1A1A1A]">{ref.usageCount} / {ref.usageLimit || "∞"}</span>
                      <div className="w-24 h-1.5 bg-[#F0EFE9] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#1A1A1A]" 
                          style={{ width: `${ref.usageLimit ? (ref.usageCount / ref.usageLimit) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      ref.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                      {ref.isActive ? "Aktif" : "Non-aktif"}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-[#888888] hover:text-[#1A1A1A] hover:bg-white rounded-lg border border-transparent hover:border-[#E0E0DA] transition-all">
                         <Copy size={18} />
                       </button>
                       <button className="p-2 text-[#888888] hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all">
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Create Referral ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => setIsModalOpen(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
             >
                <div className="p-10">
                   <div className="flex items-center justify-between mb-8">
                     <h3 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>Buat Referral Baru</h3>
                     <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#888888] hover:text-[#1A1A1A] rounded-full hover:bg-[#F0EFE9]">
                       <X size={20} />
                     </button>
                   </div>

                   <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#888888] uppercase tracking-widest">Kode Referral</label>
                        <input 
                          type="text" 
                          required
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                          placeholder="CONTOH: PROMO2025" 
                          className="w-full px-6 py-4 bg-[#F0EFE9] border-none rounded-2xl text-sm font-bold tracking-widest focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#888888] uppercase tracking-widest">Tipe</label>
                          <select 
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="w-full px-4 py-4 bg-[#F0EFE9] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                          >
                            <option value="DISCOUNT_PERCENT">Diskon (%)</option>
                            <option value="CASHBACK">Cashback (Rp)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[#888888] uppercase tracking-widest">Nilai</label>
                          <input 
                            type="number" 
                            required
                            value={formData.value}
                            onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                            className="w-full px-4 py-4 bg-[#F0EFE9] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#888888] uppercase tracking-widest">Limit Penggunaan (Opsional)</label>
                        <input 
                          type="number" 
                          value={formData.usageLimit}
                          onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                          placeholder="Biarkan kosong untuk tanpa batas" 
                          className="w-full px-6 py-4 bg-[#F0EFE9] border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                        />
                      </div>

                      <div className="pt-4">
                        <button type="submit" className="w-full py-5 bg-[#1A1A1A] text-white font-bold rounded-2xl hover:bg-[#333333] transition-all shadow-xl">
                          Simpan Kode Referral
                        </button>
                      </div>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
