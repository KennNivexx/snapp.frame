"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  ArrowLeft,
  RefreshCw,
  Eye
} from "lucide-react";
import Link from "next/link";
import { getBookings, updateBookingStatus } from "@/app/actions/bookings";

interface Booking {
  id: string;
  invoice_no: string;
  customer_name: string;
  customer_phone: string;
  package_name: string;
  session_date: string;
  session_time: string;
  final_price: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const { data, error } = await getBookings();
      if (error) throw new Error(error);
      setBookings(data || []);
    } catch (err: any) {
      console.error("Gagal mengambil data booking:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const { success, error } = await updateBookingStatus(id, newStatus);
      if (!success) throw new Error(error);
      fetchBookings(); // Refresh data
    } catch (err: any) {
      alert("Gagal memperbarui status: " + err.message);
    }
  }

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(search.toLowerCase()) || b.invoice_no.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#888888] hover:text-[#1A1A1A] mb-4 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Jadwal Booking
          </h2>
          <p className="text-[#5A5A5A] mt-2">Daftar reservasi sesi foto dari pelanggan.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchBookings}
            className="p-4 bg-white border border-[#E0E0DA] rounded-2xl text-[#1A1A1A] hover:bg-[#F0EFE9] transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] rounded-2xl text-sm font-bold text-white hover:bg-[#333333] transition-all shadow-xl">
            <Calendar size={20} />
            Lihat Kalender
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Hari Ini</p>
          <h4 className="text-3xl font-bold text-[#1A1A1A]">
            {bookings.filter(b => b.session_date === new Date().toISOString().split('T')[0]).length}
          </h4>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm text-orange-600">
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Pending</p>
          <h4 className="text-3xl font-bold">{bookings.filter(b => b.status === "pending").length}</h4>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm text-green-600">
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Sukses</p>
          <h4 className="text-3xl font-bold">{bookings.filter(b => b.status === "success").length}</h4>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm">
          <p className="text-[10px] text-[#888888] font-bold uppercase tracking-[0.2em] mb-2">Total</p>
          <h4 className="text-3xl font-bold text-[#1A1A1A]">{bookings.length}</h4>
        </div>
      </div>

      {/* ── Booking Table ── */}
      <div className="bg-white rounded-[40px] border border-[#E0E0DA] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#E0E0DA] flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#FAFAF8]/50">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888]" size={20} />
             <input 
               type="text" 
               placeholder="Cari nama atau nomor invoice..." 
               className="w-full pl-14 pr-6 py-4 bg-white border-[#E0E0DA] rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#1A1A1A] transition-all shadow-sm"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-3">
             {["all", "pending", "success", "cancelled"].map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                   filter === f 
                   ? "bg-[#1A1A1A] text-white shadow-lg" 
                   : "bg-white text-[#888888] border border-[#E0E0DA] hover:border-[#1A1A1A]"
                 }`}
               >
                 {f === "all" ? "Semua" : f.charAt(0).toUpperCase() + f.slice(1)}
               </button>
             ))}
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAF8] text-[10px] text-[#888888] uppercase tracking-[0.2em]">
                <th className="px-10 py-6 font-bold">Pelanggan</th>
                <th className="px-10 py-6 font-bold">Jadwal</th>
                <th className="px-10 py-6 font-bold">Paket</th>
                <th className="px-10 py-6 font-bold">Total</th>
                <th className="px-10 py-6 font-bold">Status</th>
                <th className="px-10 py-6 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFE9]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={32} className="animate-spin text-[#1A1A1A]" />
                      <p className="text-sm font-bold text-[#888888] uppercase tracking-widest">Memuat data booking...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <AlertCircle size={48} className="text-[#888888]" />
                      <p className="text-sm font-bold text-[#888888] uppercase tracking-widest">Tidak ada data booking ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.map((booking) => (
                <tr key={booking.id} className="group hover:bg-[#FAFAF8] transition-all">
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-bold text-[#1A1A1A]">{booking.customer_name}</span>
                      <span className="text-xs text-[#888888] font-mono">{booking.invoice_no}</span>
                      <div className="flex items-center gap-1.5 mt-1 text-[#5A5A5A]">
                        <Phone size={12} />
                        <span className="text-xs font-medium">{booking.customer_phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                        <Calendar size={14} className="text-[#888888]" />
                        {new Date(booking.session_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#5A5A5A]">
                        <Clock size={14} className="text-[#888888]" />
                        {booking.session_time} WIB
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-sm font-bold text-[#1A1A1A]">{booking.package_name}</span>
                    <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-1">{booking.payment_method}</p>
                  </td>
                  <td className="px-10 py-8 font-bold text-[#1A1A1A]">
                    Rp {booking.final_price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-10 py-8">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full ${
                      booking.status === "success" ? "bg-green-50 text-green-600" : 
                      booking.status === "pending" ? "bg-orange-50 text-orange-600" : 
                      "bg-red-50 text-red-600"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => updateStatus(booking.id, "success")}
                        className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Konfirmasi"
                      >
                        <CheckCircle2 size={20} />
                      </button>
                      <button 
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Batalkan"
                      >
                        <XCircle size={20} />
                      </button>
                      <button className="p-3 text-[#888888] hover:bg-white border border-transparent hover:border-[#E0E0DA] rounded-xl transition-all shadow-sm">
                        <Eye size={20} />
                      </button>
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

function Loader2({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
