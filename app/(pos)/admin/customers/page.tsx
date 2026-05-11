"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  Search, 
  Calendar,
  Download,
  Filter,
  DollarSign,
  Wallet,
  ArrowRight,
  UserPlus,
  Star,
  Award,
  Crown,
  History,
  Phone,
  Target,
  AlertCircle,
  Zap,
  RefreshCw,
  ChevronDown,
  ShieldCheck,
  Command,
  Activity,
  Layers
} from "lucide-react";
import { getTransactionReports } from "@/app/actions/reports";

// Custom script loader for SheetJS
const loadSheetJS = () => {
  return new Promise((resolve) => {
    if ((window as any).XLSX) return resolve((window as any).XLSX);
    const script = document.createElement("script");
    script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
    script.onload = () => resolve((window as any).XLSX);
    document.head.appendChild(script);
  });
};

interface CustomerStats {
  name: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
}

interface Transaction {
  id: string;
  date: string;
  customer: string;
  phone: string;
  service: string;
  method: string;
  referral: string;
  discount: number;
  total: number;
  status: string;
  type: string;
}

export default function CustomersAndRevenue() {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("month");
  const [view, setView] = useState<"customers" | "revenue">("customers");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      let start = "";
      if (dateFilter === "today") {
        start = new Date().toISOString().split("T")[0];
      } else if (dateFilter === "week") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toISOString().split("T")[0];
      } else if (dateFilter === "month") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        start = d.toISOString().split("T")[0];
      }

      const res = await getTransactionReports({ startDate: start });
      if (!res.success) {
        setError(res.error || "Gagal mengambil data dari database");
        return;
      }
      
      const combinedData = res.data?.transactions || [];
      
      setTransactions(combinedData.map((t: any) => ({
        id: t.invoiceNumber,
        date: t.createdAt,
        customer: t.customer,
        phone: t.phone,
        service: t.service,
        method: t.method,
        referral: t.referral,
        discount: t.discount,
        total: t.total,
        status: t.status,
        type: t.type
      })));

      // Aggregate customers
      const customerMap = new Map();
      combinedData.forEach((t: any) => {
        const key = t.phone || t.customer;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            name: t.customer,
            phone: t.phone,
            totalBookings: 0,
            totalSpent: 0,
            lastBooking: t.createdAt
          });
        }
        const c = customerMap.get(key);
        c.totalBookings += 1;
        c.totalSpent += t.total;
        if (new Date(t.createdAt) > new Date(c.lastBooking)) {
          c.lastBooking = t.createdAt;
        }
      });
      setCustomers(Array.from(customerMap.values()));
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan sistem saat memproses data");
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = async () => {
    const XLSX = await loadSheetJS() as any;
    const ws = XLSX.utils.json_to_sheet(view === "customers" ? customers : transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, view === "customers" ? "Pelanggan" : "Pendapatan");
    XLSX.writeFile(wb, `Sneapici_${view === "customers" ? "Pelanggan" : "Pendapatan"}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-6 lg:p-12 relative overflow-hidden">
      {/* ── Background Protocol ── */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3B2211]/5 to-transparent pointer-events-none" />

      {/* ── Header System ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 rounded-[28px] bg-[#3B2211] flex items-center justify-center text-white shadow-3xl shadow-[#3B2211]/20">
               <Activity size={32} />
             </div>
             <div>
                <h1 className="text-5xl font-bold text-[#3B2211] tracking-tight leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                  Analytics & Revenue
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#3B2211]/30">Studio Performance Insights Matrix</p>
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4"
        >
          <div className="flex bg-[#FAFAF8] p-1.5 rounded-[22px] border border-[#3B2211]/5 shadow-inner">
            <button 
              onClick={() => setView("customers")}
              className={`px-8 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all select-none ${view === "customers" ? "bg-[#3B2211] !text-white shadow-xl shadow-[#3B2211]/20" : "text-[#3B2211]/30 hover:text-[#3B2211]"}`}
            >
              Pelanggan
            </button>
            <button 
              onClick={() => setView("revenue")}
              className={`px-8 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all select-none ${view === "revenue" ? "bg-[#3B2211] !text-white shadow-xl shadow-[#3B2211]/20" : "text-[#3B2211]/30 hover:text-[#3B2211]"}`}
            >
              Pendapatan
            </button>
          </div>

          <button 
            onClick={exportToExcel}
            className="flex items-center gap-3 px-8 py-4.5 bg-white border border-[#3B2211]/10 text-[#3B2211] rounded-[22px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#3B2211]/5 hover:bg-[#3B2211] hover:!text-white transition-all select-none"
          >
            <Download size={16} />
            Ekspor Laporan
          </button>
        </motion.div>
      </div>

      {/* ── Analytical Insights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative z-10">
        {[
          { label: "Total Revenue", val: `Rp ${transactions.reduce((acc, t) => acc + t.total, 0).toLocaleString()}`, icon: DollarSign, color: "#10B981" },
          { label: "Active Clients", val: customers.length, icon: Users, color: "#3B2211" },
          { label: "Avg Ticket", val: `Rp ${customers.length ? Math.floor(transactions.reduce((acc, t) => acc + t.total, 0) / transactions.length).toLocaleString() : 0}`, icon: Target, color: "#3B82F6" },
          { label: "Growth Rate", val: "74.2%", icon: Zap, color: "#F59E0B" }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-10 bg-white rounded-[48px] border border-white shadow-5xl relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-8 opacity-[0.04] group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000">
               <stat.icon size={88} style={{ color: stat.color }} />
             </div>
             <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#3B2211]/30 mb-5 flex items-center gap-2">
               <div className="w-1 h-1 rounded-full bg-[#3B2211]/20" /> {stat.label}
             </div>
             <div className="space-y-1">
               <span className="text-4xl font-bold text-[#3B2211] block tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>{stat.val}</span>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#3B2211]/20">Updated just now</p>
               </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Data Matrix ── */}
      <div className="space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="relative group w-full md:w-[400px]">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-[#3B2211]/20 group-focus-within:text-[#3B2211] transition-all" size={20} />
              <input 
                type="text" 
                placeholder="Search Clients / Records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-16 pr-8 py-5.5 bg-white border border-[#3B2211]/5 rounded-[32px] text-sm font-medium focus:outline-none focus:ring-8 focus:ring-[#3B2211]/2 w-full shadow-5xl transition-all"
              />
           </div>
           
           <div className="flex gap-3 bg-white p-2 rounded-[28px] border border-[#3B2211]/5 shadow-5xl">
              {["today", "week", "month"].map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className={`px-8 py-3.5 rounded-[20px] text-[9px] font-black uppercase tracking-[0.2em] transition-all select-none ${dateFilter === f ? "bg-[#3B2211] !text-white shadow-xl shadow-[#3B2211]/20" : "text-[#3B2211]/30 hover:text-[#3B2211]"}`}
                >
                  {f === "today" ? "24 Hours" : f === "week" ? "Last 7D" : "Last 30D"}
                </button>
              ))}
           </div>
        </div>

        <div className="bg-white rounded-[48px] border border-[#3B2211]/5 shadow-5xl overflow-hidden min-h-[500px] flex flex-col">
           {error ? (
             <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                <div className="w-24 h-24 rounded-[32px] bg-rose-50 flex items-center justify-center text-rose-500">
                  <AlertCircle size={48} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-[#3B2211]">Koneksi Database Terputus</h3>
                   <p className="text-sm text-[#3B2211]/40 mt-2 max-w-md mx-auto">
                     Aplikasi tidak dapat terhubung ke database. Pastikan database lokal sudah menyala atau gunakan koneksi Supabase.
                   </p>
                </div>
                <button 
                  onClick={fetchData}
                  className="px-8 py-4 bg-[#3B2211] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#3B2211]/20 hover:scale-105 transition-all"
                >
                  Coba Hubungkan Kembali
                </button>
             </div>
           ) : view === "customers" ? (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-[#FAFAF8]/80 border-b border-[#3B2211]/5">
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">Identitas Pelanggan</th>
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">Interaksi</th>
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">Total Belanja</th>
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">Kunjungan Terakhir</th>
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30 text-right">Detail</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#3B2211]/2">
                   <AnimatePresence mode="popLayout">
                     {filteredCustomers.length > 0 ? (
                       filteredCustomers.map((c, idx) => (
                         <motion.tr 
                           key={c.phone || idx}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="group hover:bg-[#FAFAF8]/50 transition-all"
                         >
                           <td className="p-10">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 rounded-[20px] bg-[#3B2211]/5 flex items-center justify-center text-[#3B2211] font-black text-xs shadow-xl group-hover:bg-[#3B2211] group-hover:text-white transition-all duration-700">
                                   {c.name.slice(0, 2).toUpperCase()}
                                 </div>
                                 <div>
                                    <p className="text-base font-bold text-[#3B2211] tracking-tight">{c.name}</p>
                                    <p className="text-[10px] text-[#3B2211]/40 uppercase tracking-[0.2em] mt-1">{c.phone}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-10">
                              <div className="flex items-center gap-4">
                                 <div className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black tracking-widest border border-emerald-100">
                                   {c.totalBookings} PESANAN
                                 </div>
                              </div>
                           </td>
                           <td className="p-10">
                              <p className="text-lg font-black text-[#3B2211]">Rp {c.totalSpent.toLocaleString()}</p>
                           </td>
                           <td className="p-10">
                              <div className="flex items-center gap-3">
                                 <History size={14} className="text-[#3B2211]/20" />
                                 <span className="text-[11px] font-bold text-[#3B2211]/60">
                                   {new Date(c.lastBooking).toLocaleDateString()}
                                 </span>
                              </div>
                           </td>
                           <td className="p-10 text-right">
                              <button className="w-12 h-12 rounded-2xl bg-white border border-[#3B2211]/5 flex items-center justify-center text-[#3B2211]/30 hover:text-[#3B2211] hover:border-[#3B2211]/20 transition-all shadow-xl shadow-black/5">
                                 <ArrowRight size={20} />
                              </button>
                           </td>
                         </motion.tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={5} className="p-32 text-center text-[#3B2211]/20 font-black uppercase tracking-widest">Tidak ada data pelanggan ditemukan</td>
                       </tr>
                     )}
                   </AnimatePresence>
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-[#FAFAF8]/80 border-b border-[#3B2211]/5">
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">ID Transaksi</th>
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">Nama Pelanggan</th>
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">Pembayaran</th>
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">Jumlah</th>
                     <th className="p-10 text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30 text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#3B2211]/2">
                   {transactions.map((t, idx) => (
                     <tr key={t.id || idx} className="group hover:bg-[#FAFAF8]/50 transition-all">
                        <td className="p-10">
                           <p className="text-[11px] font-black text-[#3B2211] tracking-[0.2em]">#{t.id}</p>
                           <p className="text-[9px] text-[#3B2211]/40 uppercase tracking-[0.1em] mt-1">{new Date(t.date).toLocaleString()}</p>
                        </td>
                        <td className="p-10">
                           <p className="text-sm font-bold text-[#3B2211]">{t.customer}</p>
                           <p className="text-[9px] text-[#3B2211]/40 uppercase mt-0.5">{t.phone}</p>
                        </td>
                        <td className="p-10">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#3B2211]/5 flex items-center justify-center text-[#3B2211]/60">
                                <Wallet size={14} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-[#3B2211]/60">{t.method}</span>
                           </div>
                        </td>
                        <td className="p-10">
                           <p className="text-base font-black text-[#3B2211]">Rp {t.total.toLocaleString()}</p>
                        </td>
                        <td className="p-10 text-right">
                           <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                             <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                             <span className="text-[9px] font-black uppercase tracking-widest">{t.status}</span>
                           </div>
                        </td>
                     </tr>
                   ))}
                 </tbody>
                </table>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
