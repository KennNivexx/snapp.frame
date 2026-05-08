"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  Search, 
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  DollarSign,
  Wallet,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { getBookings } from "@/app/actions/bookings";

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
  service: string;
  method: string;
  referral: string;
  discount: number;
  total: number;
  status: string;
}

export default function CustomersAndRevenue() {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("month");
  const [view, setView] = useState<"customers" | "revenue">("revenue");

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await getBookings();
      if (error) throw new Error(error);
      
      const rawData = data || [];
      
      // Filter by date for Revenue view
      const now = new Date(2026, 4, 7); // Simulation date
      const filteredData = rawData.filter((b: any) => {
        const bDate = new Date(b.session_date);
        if (dateFilter === "today") return b.session_date === "2026-05-07";
        if (dateFilter === "week") {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return bDate >= weekAgo;
        }
        if (dateFilter === "month") return b.session_date.startsWith("2026-05");
        return true;
      });

      // Transactions for Revenue
      setTransactions(filteredData.map((b: any) => ({
        id: b.invoice_no,
        date: b.session_date + " " + b.session_time,
        customer: b.customer_name,
        service: b.package_name,
        method: b.payment_method || "Transfer",
        referral: b.referral_code || "-",
        discount: 0, // Placeholder
        total: b.final_price,
        status: b.status
      })));

      // Aggregate for Customers
      const agg: Record<string, CustomerStats> = {};
      rawData.forEach((b: any) => {
        const key = b.customer_phone;
        if (!agg[key]) {
          agg[key] = {
            name: b.customer_name,
            phone: b.customer_phone,
            totalBookings: 0,
            totalSpent: 0,
            lastBooking: b.session_date
          };
        }
        agg[key].totalBookings += 1;
        if (b.status === "success" || b.status === "Selesai") {
          agg[key].totalSpent += b.final_price;
        }
        if (new Date(b.session_date) > new Date(agg[key].lastBooking)) {
          agg[key].lastBooking = b.session_date;
        }
      });
      setCustomers(Object.values(agg).sort((a, b) => b.totalSpent - a.totalSpent));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = async () => {
    const XLSX: any = await loadSheetJS();
    const dataToExport = transactions.map((t, i) => ({
      "No": i + 1,
      "Tanggal": t.date,
      "Pelanggan": t.customer,
      "Layanan": t.service,
      "Metode Bayar": t.method,
      "Kode Referral": t.referral,
      "Diskon": t.discount,
      "Total": t.total,
      "Status": t.status
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Pendapatan");
    
    // Auto-width columns
    const max_width = dataToExport.reduce((w, r) => Math.max(w, r.Pelanggan.length), 10);
    ws['!cols'] = [ { wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 } ];

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Laporan-Pendapatan-${dateStr}.xlsx`);
  };

  const totalRevenue = transactions.filter(t => t.status === "success" || t.status === "Selesai").reduce((acc, t) => acc + t.total, 0);
  const avgTransaction = transactions.length > 0 ? totalRevenue / transactions.length : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-[#888888] hover:text-[#1A1A1A] mb-4 transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Financial Reports
          </h2>
          <p className="text-[#5A5A5A] mt-2 italic font-medium">Analisis pendapatan dan loyalitas pelanggan studio Anda.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex bg-white border border-[#E0E0DA] p-1 rounded-2xl shadow-sm">
             <button 
               onClick={() => setView("revenue")}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "revenue" ? "bg-[#3B2211] !text-white" : "text-[#888888] hover:bg-[#F0EFE9]"}`}
             >
               Pendapatan
             </button>
             <button 
               onClick={() => setView("customers")}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "customers" ? "bg-[#3B2211] !text-white" : "text-[#888888] hover:bg-[#F0EFE9]"}`}
             >
               Pelanggan
             </button>
           </div>
           <button 
             onClick={exportToExcel}
             className="inline-flex items-center gap-3 px-8 py-4 bg-[#3B2211] rounded-2xl text-[10px] font-black !text-white hover:bg-[#4d2d16] transition-all shadow-xl uppercase tracking-widest"
           >
             <Download size={18} />
             Export XLSX
           </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[32px] border border-[#E0E0DA] shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-8 text-[#1A1A1A] opacity-5 group-hover:scale-110 transition-transform">
            <Wallet size={120} />
          </div>
          <p className="text-[10px] text-[#888888] font-black uppercase tracking-[0.2em] mb-4">Total Pendapatan</p>
          <h4 className="text-3xl font-black text-[#1A1A1A]">Rp {totalRevenue.toLocaleString("id-ID")}</h4>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-green-600 uppercase tracking-widest">
            <TrendingUp size={14} /> +12% MoM
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[32px] border border-[#E0E0DA] shadow-sm group">
          <p className="text-[10px] text-[#888888] font-black uppercase tracking-[0.2em] mb-4">Jumlah Transaksi</p>
          <h4 className="text-3xl font-black text-[#1A1A1A]">{transactions.length}</h4>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#888888] uppercase tracking-widest">
            <Filter size={14} /> {dateFilter === "month" ? "Bulan ini" : dateFilter === "week" ? "Minggu ini" : "Hari ini"}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-[32px] border border-[#E0E0DA] shadow-sm group">
          <p className="text-[10px] text-[#888888] font-black uppercase tracking-[0.2em] mb-4">Rata-rata / Transaksi</p>
          <h4 className="text-3xl font-black text-[#1A1A1A]">Rp {Math.round(avgTransaction).toLocaleString("id-ID")}</h4>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#888888] uppercase tracking-widest">
            <DollarSign size={14} /> Efficiency Rate
          </div>
        </motion.div>
      </div>

      {/* ── Main List ── */}
      <div className="bg-white rounded-[40px] border border-[#E0E0DA] shadow-sm overflow-hidden">
        <div className="p-10 border-b border-[#E0E0DA] flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#FAFAF8]/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888]" size={20} />
            <input 
              type="text" 
              placeholder={view === "revenue" ? "Cari transaksi..." : "Cari pelanggan..."}
              className="w-full pl-14 pr-6 py-4 bg-white border border-[#E0E0DA] rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#1A1A1A] transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            {view === "revenue" && ["today", "week", "month", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  dateFilter === f 
                  ? "bg-[#1A1A1A] text-white shadow-lg" 
                  : "bg-white text-[#888888] border border-[#E0E0DA] hover:border-[#1A1A1A]"
                }`}
              >
                {f === "all" ? "Semua" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {view === "revenue" ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAFAF8] text-[10px] text-[#888888] uppercase tracking-[0.3em]">
                  <th className="px-10 py-6 font-black">Invoice</th>
                  <th className="px-10 py-6 font-black">Pelanggan</th>
                  <th className="px-10 py-6 font-black">Layanan</th>
                  <th className="px-10 py-6 font-black">Metode</th>
                  <th className="px-10 py-6 font-black text-right">Total</th>
                  <th className="px-10 py-6 font-black">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFE9]">
                {loading ? (
                   <tr><td colSpan={6} className="px-10 py-20 text-center text-[10px] font-black text-[#888888] uppercase tracking-widest">Memuat data...</td></tr>
                ) : transactions.length === 0 ? (
                   <tr><td colSpan={6} className="px-10 py-20 text-center text-[10px] font-black text-[#888888] uppercase tracking-widest">Tidak ada transaksi ditemukan</td></tr>
                ) : transactions.map((t) => (
                  <tr key={t.id} className="group hover:bg-[#FAFAF8] transition-all duration-300">
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[#1A1A1A]">{t.id}</span>
                        <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">{t.date}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-sm font-bold text-[#1A1A1A]">{t.customer}</span>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-xs font-bold text-[#5A5A5A]">{t.service}</span>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-black text-[#888888] uppercase tracking-widest">{t.method}</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <span className="text-sm font-black text-[#1A1A1A]">Rp {t.total.toLocaleString("id-ID")}</span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        t.status === "success" || t.status === "Selesai" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAFAF8] text-[10px] text-[#888888] uppercase tracking-[0.3em]">
                  <th className="px-10 py-6 font-black">Pelanggan</th>
                  <th className="px-10 py-6 font-black text-center">Total Booking</th>
                  <th className="px-10 py-6 font-black">Booking Terakhir</th>
                  <th className="px-10 py-6 font-black text-right">Kontribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFE9]">
                {customers.map((c) => (
                  <tr key={c.phone} className="group hover:bg-[#FAFAF8] transition-all duration-300">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-[#F0EFE9] text-[#1A1A1A] flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-base font-black text-[#1A1A1A]">{c.name}</p>
                            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">{c.phone}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-[#E0E0DA] text-sm font-black text-[#1A1A1A] shadow-sm">
                        {c.totalBookings}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-xs font-bold text-[#5A5A5A]">
                       {new Date(c.lastBooking).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-10 py-8 text-right">
                       <span className="text-base font-black text-[#1A1A1A]">Rp {c.totalSpent.toLocaleString("id-ID")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

