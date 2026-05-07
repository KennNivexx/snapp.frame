"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  UserCheck, 
  Search, 
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { getBookings } from "@/app/actions/bookings";

interface CustomerStats {
  name: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
}

export default function CustomersAndRevenue() {
  const [customers, setCustomers] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await getBookings();
      if (error) throw new Error(error);
      
      // Aggregate data by phone number
      const agg: Record<string, CustomerStats> = {};
      data?.forEach((b: any) => {
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
        if (b.status === "success") {
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

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-[#1A1A1A] mb-4 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Pelanggan & Pendapatan
          </h2>
          <p className="text-[#5A5A5A] mt-2">Analisis data pelanggan dan total pendapatan studio Anda.</p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Total Pendapatan</p>
          <h4 className="text-4xl font-bold text-[#1A1A1A]">Rp {totalRevenue.toLocaleString("id-ID")}</h4>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600">
            <TrendingUp size={14} /> +12% dari bulan lalu
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Total Pelanggan</p>
          <h4 className="text-4xl font-bold text-[#1A1A1A]">{customers.length}</h4>
          <p className="mt-4 text-xs text-[#888888]">Pelanggan unik terdaftar</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Rata-rata Transaksi</p>
          <h4 className="text-4xl font-bold text-[#1A1A1A]">
            Rp {customers.length > 0 ? (totalRevenue / customers.length).toLocaleString("id-ID", { maximumFractionDigits: 0 }) : 0}
          </h4>
          <p className="mt-4 text-xs text-[#888888]">Per pelanggan</p>
        </div>
      </div>

      {/* ── Customer List ── */}
      <div className="bg-white rounded-[40px] border border-[#E0E0DA] shadow-sm overflow-hidden">
        <div className="p-10 border-b border-[#E0E0DA] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888]" size={20} />
            <input 
              type="text" 
              placeholder="Cari pelanggan..." 
              className="w-full pl-14 pr-6 py-4 bg-[#F0EFE9] border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#1A1A1A] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="px-6 py-4 bg-[#1A1A1A] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#333333] transition-all shadow-lg">
            Ekspor Laporan (CSV)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAF8] text-[10px] text-[#888888] uppercase tracking-[0.2em]">
                <th className="px-10 py-6 font-bold">Pelanggan</th>
                <th className="px-10 py-6 font-bold text-center">Total Booking</th>
                <th className="px-10 py-6 font-bold">Booking Terakhir</th>
                <th className="px-10 py-6 font-bold text-right">Total Kontribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFE9]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-[#888888] font-bold uppercase tracking-widest text-xs">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-[#888888] font-bold uppercase tracking-widest text-xs">
                    Belum ada data pelanggan.
                  </td>
                </tr>
              ) : filtered.map((c, idx) => (
                <tr key={c.phone} className="group hover:bg-[#FAFAF8] transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-2xl bg-[#F0EFE9] text-[#1A1A1A] flex items-center justify-center font-bold text-lg">
                         {c.name.charAt(0)}
                       </div>
                       <div>
                         <p className="text-base font-bold text-[#1A1A1A]">{c.name}</p>
                         <p className="text-xs text-[#888888]">{c.phone}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E0E0DA] text-sm font-bold text-[#1A1A1A]">
                      {c.totalBookings}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-sm text-[#5A5A5A] font-medium">
                      <Calendar size={14} className="text-[#888888]" />
                      {new Date(c.lastBooking).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-[#1A1A1A]">Rp {c.totalSpent.toLocaleString("id-ID")}</span>
                      <div className="w-24 h-1.5 bg-[#F0EFE9] rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-[#1A1A1A]" 
                          style={{ width: `${Math.min((c.totalSpent / (totalRevenue / customers.length)) * 50, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
