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
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      {/* ── Header Section ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#3B2211]/5 pb-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-[#C88A58] uppercase tracking-[0.4em]">Analytics Engine</p>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-[#3B2211] flex items-center justify-center text-white shadow-xl shadow-[#3B2211]/20">
               <Activity size={24} />
             </div>
             <h1 className="text-4xl font-black text-[#3B2211] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>Data Pelanggan</h1>
          </div>
          <p className="text-sm text-gray-400 font-medium max-w-md">Analisis metrik perilaku pelanggan dan retensi pendapatan studio.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setView("customers")}
              className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === "customers" ? "bg-white text-[#3B2211] shadow-sm" : "text-gray-400 hover:text-[#3B2211]"}`}
            >
              Pelanggan
            </button>
            <button 
              onClick={() => setView("revenue")}
              className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === "revenue" ? "bg-white text-[#3B2211] shadow-sm" : "text-gray-400 hover:text-[#3B2211]"}`}
            >
              Pendapatan
            </button>
          </div>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-3 px-8 py-4 bg-[#3B2211] !text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#3B2211]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download size={16} />
            Ekspor
          </button>
        </div>
      </div>

      {/* ── Metric Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: `Rp ${transactions.reduce((acc, t) => acc + t.total, 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Clients", value: customers.length, icon: Users, color: "text-[#3B2211]", bg: "bg-gray-100" },
          { label: "Avg Ticket", value: `Rp ${customers.length ? Math.floor(transactions.reduce((acc, t) => acc + t.total, 0) / transactions.length).toLocaleString() : 0}`, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Conversion Rate", value: "74.2%", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-7 bg-white rounded-2xl border border-white shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-[#3B2211]/5 transition-all duration-500"
          >
             <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-[#3B2211] tracking-tighter">{stat.value}</span>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari Pelanggan / ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B2211]/5 shadow-sm transition-all"
            />
         </div>
         
         <div className="flex bg-gray-100 p-1 rounded-xl">
            {["today", "week", "month"].map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all ${dateFilter === f ? "bg-[#3B2211] !text-white shadow-sm" : "text-gray-400 hover:text-[#3B2211]"}`}
              >
                {f === "today" ? "Hari Ini" : f === "week" ? "7 Hari" : "30 Hari"}
              </button>
            ))}
         </div>
      </div>

      {/* ── Table Ledger ── */}
      <div className="bg-white rounded-2xl border border-white shadow-sm overflow-hidden flex-1">
        {error ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-sm font-black text-[#3B2211] uppercase tracking-widest">Koneksi Bermasalah</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">{error}</p>
            <button onClick={fetchData} className="px-6 py-3 bg-[#3B2211] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#3B2211]/20">Refresh Data</button>
          </div>
        ) : view === "customers" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8F6F4]/50 text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 font-black">Pelanggan</th>
                  <th className="px-8 py-5 font-black">Aktivitas</th>
                  <th className="px-8 py-5 font-black">Total Transaksi</th>
                  <th className="px-8 py-5 font-black">Terakhir Kunjungan</th>
                  <th className="px-8 py-5 text-right font-black">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F6F4] text-sm">
                <AnimatePresence mode="popLayout">
                  {filteredCustomers.map((c, idx) => (
                    <motion.tr 
                      key={c.phone || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group hover:bg-[#F8F6F4]/30 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[#3B2211]/5 flex items-center justify-center text-[#3B2211] font-black text-xs">
                             {c.name.slice(0, 2).toUpperCase()}
                           </div>
                           <div>
                              <p className="font-bold text-[#3B2211]">{c.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">{c.phone}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">
                           {c.totalBookings} Transaksi
                         </span>
                      </td>
                      <td className="px-8 py-6 font-black text-[#3B2211]">
                        Rp {c.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-gray-400 text-xs font-bold">
                        {new Date(c.lastBooking).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 hover:bg-[#3B2211] hover:text-white rounded-lg transition-all text-gray-300">
                          <ArrowRight size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8F6F4]/50 text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5 font-black">ID Transaksi</th>
                  <th className="px-8 py-5 font-black">Pelanggan</th>
                  <th className="px-8 py-5 font-black">Metode</th>
                  <th className="px-8 py-5 text-right font-black">Jumlah</th>
                  <th className="px-8 py-5 text-center font-black">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F6F4] text-sm">
                {transactions.map((t, idx) => (
                  <tr key={t.id || idx} className="group hover:bg-[#F8F6F4]/30 transition-colors">
                     <td className="px-8 py-6">
                        <p className="font-black text-[#3B2211] tracking-widest">#{t.id}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(t.date).toLocaleDateString()}</p>
                     </td>
                     <td className="px-8 py-6">
                        <p className="font-bold text-[#3B2211]">{t.customer}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{t.phone}</p>
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <Wallet size={14} className="text-gray-300" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.method}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6 text-right font-black text-[#3B2211]">
                        Rp {t.total.toLocaleString()}
                     </td>
                     <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                            {t.status}
                          </div>
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
  );
}
