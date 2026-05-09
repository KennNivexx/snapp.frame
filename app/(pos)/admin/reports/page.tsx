"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Download, 
  Search, 
  Calendar as CalendarIcon, 
  ArrowLeft,
  Filter,
  RefreshCw,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  FilterX,
  Zap,
  Target,
  ShieldCheck,
  BarChart3,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { getTransactionReports } from "@/app/actions/reports";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    type: "ALL" as "POS" | "BOOKING" | "ALL"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTransactionReports(filters);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const exportToExcel = () => {
    if (!data?.transactions) return;
    
    const exportData = data.transactions.map((t: any) => ({
      "Invoice": t.invoiceNumber,
      "Tanggal": new Date(t.createdAt).toLocaleString("id-ID"),
      "Pelanggan": t.customer,
      "WhatsApp": t.phone,
      "Tipe": t.type,
      "Layanan": t.details,
      "Metode Bayar": t.paymentMethod,
      "Total": t.total,
      "Status": t.status,
      "Referral": t.referral
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Transaksi");
    XLSX.writeFile(wb, `Sneapici_Report_${filters.startDate}_to_${filters.endDate}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] selection:bg-[#3B2211] selection:text-white pb-24">
      {/* ── Background Elements ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-[#3B2211]/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] bg-[#A0A096]/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 p-6 md:p-12 space-y-12 max-w-[1700px] mx-auto">
        
        {/* ── Header ── */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Link href="/admin" className="group flex items-center gap-3 px-5 py-2.5 bg-white rounded-full border border-[#3B2211]/10 text-[9px] font-black uppercase tracking-[0.2em] text-[#3B2211]/40 hover:text-[#3B2211] hover:border-[#3B2211]/20 transition-all shadow-sm active:scale-95">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                Pusat Administrasi
              </Link>
              <div className="h-px w-8 bg-[#3B2211]/10" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3B2211]/40">Audit Keuangan</span>
              </div>
            </div>
            <h1 className="text-5xl lg:text-8xl font-bold text-[#3B2211] tracking-tighter mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Wawasan Keuangan
            </h1>
            <p className="text-lg text-[#3B2211]/60 font-medium italic max-w-xl border-l-2 border-[#3B2211]/10 pl-6">
              Metrik presisi untuk pengembangan studio strategis. Rekonsiliasi aset, analisis kecepatan konversi, dan optimalkan arus pendapatan.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
            className="flex items-center gap-6"
          >
            <button 
              onClick={exportToExcel}
              className="group relative inline-flex items-center justify-center gap-4 px-10 py-6 bg-[#3B2211] text-white rounded-[28px] text-[11px] font-black hover:bg-[#2A180C] transition-all shadow-2xl active:scale-95 uppercase tracking-[0.3em] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Download size={20} className="group-hover:translate-y-1 transition-transform duration-500" />
              Ekspor Audit Aset
            </button>
          </motion.div>
        </header>

        {/* ── Summary Matrix ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Total Pendapatan", value: `Rp ${data?.summary?.totalRevenue.toLocaleString("id-ID") || 0}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12.4%", isPrimary: true },
            { label: "Volume Transaksi", value: data?.summary?.totalCount || 0, icon: ShoppingBag, color: "text-[#3B2211]", bg: "bg-[#F0EFE9]", trend: "Stabil" },
            { label: "Penjualan Studio", value: data?.summary?.posCount || 0, icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50", trend: "Matriks POS" },
            { label: "Konversi Online", value: data?.summary?.bookingCount || 0, icon: CalendarDays, color: "text-indigo-600", bg: "bg-indigo-50", trend: "Reservasi" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + (i * 0.1) }}
              className={`rounded-[56px] p-10 relative overflow-hidden group shadow-2xl transition-all duration-700 ${
                stat.isPrimary ? "bg-[#3B2211] text-white shadow-[#3B2211]/30" : "bg-white text-[#3B2211] border border-white shadow-[#3B2211]/5"
              }`}
            >
              <div className={`absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 ${stat.isPrimary ? "text-white" : "text-[#3B2211]"}`}>
                <stat.icon size={140} strokeWidth={1} />
              </div>
              <div className="relative z-10 space-y-8">
                <div className={`w-14 h-14 ${stat.isPrimary ? "bg-white/10" : stat.bg} ${stat.isPrimary ? "text-white" : stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                  <stat.icon size={28} />
                </div>
                <div className="space-y-2">
                  <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${stat.isPrimary ? "opacity-40" : "text-[#3B2211]/40"}`}>{stat.label}</p>
                  <h4 className="text-3xl font-bold tracking-tighter">{stat.value}</h4>
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${stat.isPrimary ? "text-emerald-300" : "text-[#3B2211]/40"}`}>
                  {stat.trend.includes("+") ? <ArrowUpRight size={14} /> : <Zap size={14} />}
                  {stat.trend}
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ── Filter Parameters ── */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white/40 backdrop-blur-2xl p-8 md:p-10 rounded-[64px] border border-white shadow-2xl shadow-[#3B2211]/5 flex flex-col xl:flex-row items-center gap-10 ring-1 ring-[#3B2211]/5"
        >
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] flex items-center gap-3 ml-2">
                <CalendarIcon size={14} /> Rentang Waktu - Mulai
              </label>
              <div className="relative group">
                <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={e => setFilters({...filters, startDate: e.target.value})}
                  className="w-full px-8 py-6 bg-[#FAFAF8] border-2 border-transparent group-hover:border-[#3B2211]/10 focus:border-[#3B2211] focus:bg-white rounded-[28px] text-sm font-bold outline-none transition-all shadow-inner"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] flex items-center gap-3 ml-2">
                <CalendarIcon size={14} /> Rentang Waktu - Selesai
              </label>
              <div className="relative group">
                <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={e => setFilters({...filters, endDate: e.target.value})}
                  className="w-full px-8 py-6 bg-[#FAFAF8] border-2 border-transparent group-hover:border-[#3B2211]/10 focus:border-[#3B2211] focus:bg-white rounded-[28px] text-sm font-bold outline-none transition-all shadow-inner"
                />
              </div>
            </div>
          </div>
          
          <div className="w-full xl:w-80 space-y-4">
            <label className="text-[10px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] flex items-center gap-3 ml-2">
              <Filter size={14} /> Protokol Sumber Data
            </label>
            <div className="relative group">
              <select 
                value={filters.type}
                onChange={e => setFilters({...filters, type: e.target.value as any})}
                className="w-full px-8 py-6 bg-[#FAFAF8] border-2 border-transparent group-hover:border-[#3B2211]/10 focus:border-[#3B2211] focus:bg-white rounded-[28px] text-sm font-bold outline-none transition-all shadow-inner appearance-none cursor-pointer"
              >
                <option value="ALL">Semua Sumber</option>
                <option value="POS">Penjualan Langsung (POS)</option>
                <option value="BOOKING">Reservasi Online</option>
              </select>
              <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-[#3B2211]/20 group-hover:text-[#3B2211] transition-colors pointer-events-none" size={20} />
            </div>
          </div>

          <div className="pt-8">
            <button 
              onClick={fetchData}
              disabled={loading}
              className="w-20 h-20 bg-[#3B2211] text-white rounded-[30px] flex items-center justify-center hover:bg-[#2A180C] transition-all shadow-2xl disabled:opacity-50 active:scale-90 group"
            >
              <RefreshCw size={32} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"}`} />
            </button>
          </div>
        </motion.section>

        {/* ── Transaction Ledger ── */}
        <motion.section 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="bg-white/60 backdrop-blur-3xl rounded-[64px] border border-white shadow-2xl shadow-[#3B2211]/10 overflow-hidden ring-1 ring-[#3B2211]/5"
        >
          <div className="p-12 border-b border-[#F0EFE9] flex items-center justify-between bg-white/40">
             <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-[#3B2211] rounded-2xl flex items-center justify-center text-white shadow-xl">
                 <BarChart3 size={28} />
               </div>
               <div>
                 <h3 className="text-2xl font-bold text-[#3B2211] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>Buku Besar Transaksi</h3>
                 <p className="text-[10px] font-black text-[#3B2211]/40 uppercase tracking-[0.3em] mt-1">Rekonsiliasi Aset Real-time</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="px-5 py-2 bg-[#F0EFE9] rounded-full flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-[#3B2211]/60 uppercase tracking-widest">Aliran Aktif</span>
               </div>
             </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFAF8] text-[9px] text-[#3B2211]/40 uppercase tracking-[0.4em] font-black border-b border-[#F0EFE9]">
                  <th className="px-12 py-10 font-black">ID Transaksi</th>
                  <th className="px-12 py-10 font-black">Profil Pelanggan</th>
                  <th className="px-12 py-10 font-black">Detail Layanan</th>
                  <th className="px-12 py-10 text-right font-black">Nilai Aset</th>
                  <th className="px-12 py-10 font-black">Status Pembayaran</th>
                  <th className="px-12 py-10 text-right font-black">Atribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFE9]">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <tr><td colSpan={6} className="px-12 py-40 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <RefreshCw size={48} className="animate-spin text-[#3B2211] opacity-20" />
                        <p className="text-[10px] font-black text-[#3B2211]/40 uppercase tracking-[0.3em]">Merekonsiliasi Buku Besar...</p>
                      </div>
                    </td></tr>
                  ) : data?.transactions?.length === 0 ? (
                    <tr><td colSpan={6} className="px-12 py-40 text-center">
                      <div className="flex flex-col items-center gap-8 opacity-20">
                         <div className="w-24 h-24 bg-[#3B2211]/5 rounded-[40px] flex items-center justify-center">
                           <FilterX size={48} className="text-[#3B2211]" />
                         </div>
                         <p className="text-[10px] font-black text-[#3B2211] uppercase tracking-[0.3em]">No Temporal Matches in Archive</p>
                      </div>
                    </td></tr>
                  ) : data.transactions.map((t: any, idx: number) => (
                    <motion.tr 
                      key={t.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group/row hover:bg-[#FAFAF8]/80 transition-all duration-500"
                    >
                      <td className="px-12 py-10">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F0EFE9] text-[#3B2211]/20 group-hover/row:scale-110 transition-transform">
                            <Target size={20} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[14px] font-bold text-[#3B2211] font-mono group-hover/row:text-[#3B2211] transition-colors tracking-widest uppercase">
                              <span className="opacity-20">SNF-</span>{t.invoiceNumber}
                            </span>
                            <div className="flex items-center gap-2 text-[9px] font-black text-[#3B2211]/30 uppercase tracking-widest">
                              <CalendarIcon size={10} />
                              {new Date(t.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-bold text-[#3B2211] tracking-tight">{t.customer}</span>
                          <span className="text-[9px] font-black text-[#3B2211]/30 uppercase tracking-widest flex items-center gap-2">
                             <ShieldCheck size={10} /> Identitas Terverifikasi
                          </span>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className="flex flex-col max-w-xs gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full w-fit shadow-sm border ${
                            t.type === "BOOKING" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {t.type} Channel
                          </span>
                          <span className="text-xs font-bold text-[#3B2211] truncate tracking-tight">{t.details}</span>
                        </div>
                      </td>
                      <td className="px-12 py-10 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-xl font-bold text-[#3B2211] tracking-tighter">Rp {t.total.toLocaleString("id-ID")}</span>
                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.4em] bg-emerald-500/5 px-3 py-1 rounded-lg">Protokol {t.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-12 py-10">
                        <div className={`inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-full border shadow-sm ${
                          t.status === "COMPLETED" || t.status === "SUCCESS" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" 
                          : "bg-amber-500/10 text-amber-600 border-amber-500/10"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${t.status === "COMPLETED" || t.status === "SUCCESS" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                          {t.status}
                        </div>
                      </td>
                      <td className="px-12 py-10 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[11px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em]">{t.referral || "Akses Langsung"}</span>
                          <ChevronRight size={16} className="text-[#3B2211]/10 group-hover/row:text-[#3B2211] group-hover/row:translate-x-1 transition-all duration-500" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
