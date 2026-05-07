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
  ChevronDown,
  Calendar,
  Sparkles,
  Power,
  PowerOff,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { getReferrals, createReferral, toggleReferralStatus, deleteReferral } from "@/app/actions/referrals";

interface ReferralCode {
  id: string;
  code: string;
  label: string;
  type: "PERCENTAGE" | "FIXED";
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
  const [formData, setFormData] = useState({
    code: "",
    label: "",
    type: "percentage",
    value: 10,
    usageLimit: "",
    expiry: ""
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const result = await getReferrals();
      if (result.success) {
        setReferrals(result.data as any[]);
      } else {
        console.error("Gagal mengambil data referral:", result.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createReferral({
        code: formData.code.toUpperCase(),
        label: formData.label,
        type: formData.type === "percentage" ? "PERCENTAGE" : "FIXED",
        value: Number(formData.value),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        expiryDate: formData.expiry || null,
      });

      if (result.success) {
        setIsModalOpen(false);
        setFormData({ code: "", label: "", type: "percentage", value: 10, usageLimit: "", expiry: "" });
        fetchReferrals();
      } else {
        alert("Gagal membuat kode: " + result.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleReferralStatus(id, !currentStatus);
      if (result.success) {
        fetchReferrals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus kode referral ini?")) {
      try {
        const result = await deleteReferral(id);
        if (result.success) {
          fetchReferrals();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredReferrals = referrals.filter(r => 
    r.code.toLowerCase().includes(search.toLowerCase()) || 
    r.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-[#888888] hover:text-[#1A1A1A] mb-4 transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Referral Manager
          </h2>
          <p className="text-[#5A5A5A] mt-2 italic font-medium">Buat dan kelola strategi promosi studio Anda.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] rounded-2xl text-xs font-black text-white hover:bg-[#333333] transition-all shadow-xl uppercase tracking-widest"
        >
          <Plus size={18} />
          Buat Kode Promo
        </button>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-black uppercase tracking-[0.2em] mb-4">Total Kode</p>
          <h4 className="text-3xl font-bold text-[#1A1A1A]">{referrals.length}</h4>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-black uppercase tracking-[0.2em] mb-4">Kode Aktif</p>
          <h4 className="text-3xl font-bold text-green-600">{referrals.filter(r => r.isActive).length}</h4>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-black uppercase tracking-[0.2em] mb-4">Total Penggunaan</p>
          <h4 className="text-3xl font-bold text-[#1A1A1A]">{referrals.reduce((acc, r) => acc + r.usageCount, 0)}</h4>
        </div>
      </div>

      {/* ── Referral Table ── */}
      <div className="bg-white rounded-[40px] border border-[#E0E0DA] shadow-sm overflow-hidden">
        <div className="p-10 border-b border-[#E0E0DA] flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#FAFAF8]/50">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888]" size={20} />
             <input 
               type="text" 
               placeholder="Cari kode atau label promo..." 
               className="w-full pl-14 pr-6 py-4 bg-white border-[#E0E0DA] rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#1A1A1A] transition-all shadow-sm outline-none"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Urutkan:</span>
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0DA] rounded-xl text-xs font-bold text-[#1A1A1A]">
               Terbaru <ChevronDown size={14} />
             </button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAF8] text-[10px] text-[#888888] uppercase tracking-[0.3em]">
                <th className="px-10 py-6 font-black">Kode & Label</th>
                <th className="px-10 py-6 font-black">Diskon</th>
                <th className="px-10 py-6 font-black">Penggunaan</th>
                <th className="px-10 py-6 font-black">Masa Berlaku</th>
                <th className="px-10 py-6 font-black">Status</th>
                <th className="px-10 py-6 font-black text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFE9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <RefreshCw size={32} className="animate-spin text-[#1A1A1A] mx-auto mb-4" />
                    <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Memuat data...</p>
                  </td>
                </tr>
              ) : filteredReferrals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center opacity-40">
                    <AlertCircle size={48} className="text-[#888888] mx-auto mb-4" />
                    <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Belum ada kode promo</p>
                  </td>
                </tr>
              ) : filteredReferrals.map((ref) => (
                <tr key={ref.id} className="group hover:bg-[#FAFAF8] transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#F0EFE9] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Ticket size={24} className="text-[#1A1A1A]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-black text-[#1A1A1A] tracking-widest">{ref.code}</span>
                        <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">{ref.label}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-sm font-black text-[#1A1A1A]">
                      {ref.type === "PERCENTAGE" ? `${ref.value}%` : `Rp ${ref.value.toLocaleString("id-ID")}`}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-bold text-[#1A1A1A]">{ref.usageCount} <span className="text-[#888888]">/ {ref.usageLimit || "∞"}</span></span>
                      <div className="w-24 h-1.5 bg-[#F0EFE9] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#1A1A1A]" 
                          style={{ width: `${ref.usageLimit ? (ref.usageCount / ref.usageLimit) * 100 : 20}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#5A5A5A]">
                      <Calendar size={14} className="text-[#888888]" />
                      {ref.expiryDate ? new Date(ref.expiryDate).toLocaleDateString("id-ID") : "Selamanya"}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-2 ${
                      ref.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${ref.isActive ? "bg-green-600" : "bg-red-600"}`} />
                      {ref.isActive ? "Aktif" : "Non-aktif"}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                         <button 
                           onClick={() => toggleStatus(ref.id, ref.isActive)}
                           className={`p-3 rounded-xl transition-all border ${
                             ref.isActive 
                             ? "text-orange-600 border-orange-100 hover:bg-orange-50" 
                             : "text-green-600 border-green-100 hover:bg-green-50"
                           }`}
                           title={ref.isActive ? "Nonaktifkan" : "Aktifkan"}
                         >
                           {ref.isActive ? <PowerOff size={18} /> : <Power size={18} />}
                         </button>
                         <button 
                           onClick={() => handleDelete(ref.id)}
                           className="p-3 text-[#888888] hover:text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all"
                         >
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
               className="absolute inset-0 bg-black/40 backdrop-blur-md"
               onClick={() => setIsModalOpen(false)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 40 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 40 }}
               className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
             >
                <div className="p-12">
                   <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#1A1A1A] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                           <Sparkles size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>Create New Promo</h3>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="p-3 text-[#888888] hover:text-[#1A1A1A] rounded-full hover:bg-[#F0EFE9] transition-all">
                       <X size={24} />
                     </button>
                   </div>

                   <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Label / Nama Promo</label>
                          <input 
                            type="text" 
                            required
                            value={formData.label}
                            onChange={(e) => setFormData({...formData, label: e.target.value})}
                            placeholder="Contoh: Promo Lebaran 2026" 
                            className="w-full px-8 py-5 bg-[#FAFAF8] border border-[#F0EFE9] rounded-[20px] text-sm font-bold focus:ring-2 focus:ring-[#1A1A1A] focus:bg-white transition-all outline-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Kode Referral</label>
                          <div className="relative group">
                            <input 
                              type="text" 
                              required
                              value={formData.code}
                              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                              placeholder="PROMO2026" 
                              className="w-full px-8 py-5 bg-[#FAFAF8] border border-[#F0EFE9] rounded-[20px] text-sm font-black tracking-[0.2em] focus:ring-2 focus:ring-[#1A1A1A] focus:bg-white transition-all outline-none"
                            />
                            <button 
                              type="button" 
                              onClick={generateCode}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-[#888888] hover:text-[#1A1A1A] hover:bg-[#F0EFE9] rounded-xl transition-all"
                            >
                              <RefreshCw size={20} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Tipe Diskon</label>
                            <select 
                              value={formData.type}
                              onChange={(e) => setFormData({...formData, type: e.target.value})}
                              className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#F0EFE9] rounded-[20px] text-sm font-bold focus:ring-2 focus:ring-[#1A1A1A] focus:bg-white transition-all outline-none"
                            >
                              <option value="percentage">Persentase (%)</option>
                              <option value="nominal">Nominal (Rp)</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Nilai Diskon</label>
                            <input 
                              type="number" 
                              required
                              value={formData.value}
                              onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                              className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#F0EFE9] rounded-[20px] text-sm font-bold focus:ring-2 focus:ring-[#1A1A1A] focus:bg-white transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Limit Kuota</label>
                            <input 
                              type="number" 
                              value={formData.usageLimit}
                              onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                              placeholder="Tanpa batas" 
                              className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#F0EFE9] rounded-[20px] text-sm font-bold focus:ring-2 focus:ring-[#1A1A1A] focus:bg-white transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em]">Tanggal Expired</label>
                            <input 
                              type="date" 
                              value={formData.expiry}
                              onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                              className="w-full px-6 py-5 bg-[#FAFAF8] border border-[#F0EFE9] rounded-[20px] text-sm font-bold focus:ring-2 focus:ring-[#1A1A1A] focus:bg-white transition-all outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button type="submit" className="w-full py-6 bg-[#1A1A1A] text-white font-black text-xs uppercase tracking-[0.3em] rounded-[24px] hover:bg-[#333333] transition-all shadow-2xl shadow-black/20 hover:-translate-y-1">
                          Simpan & Aktifkan Kode
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
