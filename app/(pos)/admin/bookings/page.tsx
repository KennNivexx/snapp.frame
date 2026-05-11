"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  ChevronLeft,
  LayoutGrid,
  List,
  User,
  Package,
  CreditCard,
  Check,
  Zap,
  ArrowRight,
  TrendingUp,
  MoreVertical,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  Command,
  Ticket
} from "lucide-react";
import { getBookings, updateBookingStatus } from "@/app/actions/bookings";
import { createClient } from "@/lib/supabase/client";

interface Booking {
  id: string;
  invoice_no: string;
  customer_name: string;
  customer_phone: string;
  package_name: string;
  session_date: string;
  session_time: string;
  original_price: number;
  final_price: number;
  status: string;
  payment_method: string;
  referral_code?: string;
  discount_pct?: number;
  notes?: string;
  created_at: string;
}

const statusStyles: Record<string, { color: string, bg: string, icon: any }> = {
  "Selesai": { color: "#10B981", bg: "rgba(16, 185, 129, 0.1)", icon: CheckCircle2 },
  "Dibatalkan": { color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)", icon: XCircle },
  "Tertunda": { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.1)", icon: AlertCircle },
  "Konfirmasi": { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.1)", icon: Zap },
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (selectedBooking) {
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
  }, [selectedBooking]);

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel("booking-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(search.toLowerCase()) || 
                          b.invoice_no.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      {/* ── Header Section ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#3B2211]/5 pb-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-[#C88A58] uppercase tracking-[0.4em]">Studio Operations</p>
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-[#3B2211] flex items-center justify-center text-white shadow-xl shadow-[#3B2211]/20">
               <CalendarDays size={24} />
             </div>
             <h1 className="text-4xl font-black text-[#3B2211] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>Reservasi</h1>
          </div>
          <p className="text-sm text-gray-400 font-medium max-w-md">Pantau dan kelola jadwal pemotretan pelanggan secara real-time.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#3B2211] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Cari invoice / nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-6 py-3.5 bg-white border border-[#3B2211]/5 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#3B2211]/2 w-full md:w-64 transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button 
               onClick={() => setViewMode("list")}
               className={`p-2.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-[#3B2211] shadow-sm" : "text-gray-400 hover:text-[#3B2211]"}`}
             >
               <List size={18} />
             </button>
             <button 
               onClick={() => setViewMode("calendar")}
               className={`p-2.5 rounded-lg transition-all ${viewMode === "calendar" ? "bg-white text-[#3B2211] shadow-sm" : "text-gray-400 hover:text-[#3B2211]"}`}
             >
               <LayoutGrid size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* ── Metric Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Pesanan", val: bookings.length, icon: CalendarIcon, color: "text-[#3B2211]", bg: "bg-gray-100" },
          { label: "Menunggu Konfirmasi", val: bookings.filter(b => b.status === "Konfirmasi").length, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Sesi Selesai", val: bookings.filter(b => b.status === "Selesai").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Sesi Tertunda", val: bookings.filter(b => b.status === "Tertunda").length, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" }
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
                  <span className="text-3xl font-black text-[#3B2211] tracking-tighter">{stat.val}</span>
                  <div className="mb-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "Konfirmasi", "Selesai", "Tertunda", "Dibatalkan"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
              filter === f 
              ? "bg-[#3B2211] text-white border-transparent shadow-lg shadow-[#3B2211]/20" 
              : "bg-white text-gray-400 border-gray-100 hover:border-[#3B2211]/20 hover:text-[#3B2211]"
            }`}
          >
            {f === "all" ? "Semua Reservasi" : f}
          </button>
        ))}
      </div>

      {/* ── Booking Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-white/50 animate-pulse rounded-2xl border border-gray-100" />
            ))
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-3xl border border-white shadow-sm hover:shadow-2xl hover:shadow-[#3B2211]/10 transition-all duration-500 relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 w-1 h-full opacity-50" 
                  style={{ backgroundColor: statusStyles[booking.status]?.color || "#E0E0DA" }}
                />

                <div className="p-8 space-y-6">
                   <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                          #{booking.invoice_no}
                        </p>
                        <h3 className="text-lg font-black text-[#3B2211] leading-tight">
                          {booking.customer_name}
                        </h3>
                      </div>
                      <div 
                        className="px-3 py-1.5 rounded-lg flex items-center gap-2"
                        style={{ backgroundColor: statusStyles[booking.status]?.bg || "#F5F5F0" }}
                      >
                         <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyles[booking.status]?.color }} />
                         <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: statusStyles[booking.status]?.color }}>
                           {booking.status}
                         </span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#F8F6F4]/50 rounded-2xl border border-white">
                         <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Tanggal Sesi</p>
                         <p className="text-xs font-bold text-[#3B2211]">
                            {new Date(booking.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                         </p>
                      </div>
                      <div className="p-4 bg-[#F8F6F4]/50 rounded-2xl border border-white">
                         <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Waktu Sesi</p>
                         <p className="text-xs font-bold text-[#3B2211]">{booking.session_time}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                         <Package size={12} className="text-gray-300" />
                         <span className="text-[10px] font-bold text-gray-400">{booking.package_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-black text-[#3B2211]">Rp {booking.final_price.toLocaleString()}</span>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-[#F8F6F4] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone size={10} className="text-gray-300" />
                        <span className="text-[10px] font-medium text-gray-400">{booking.customer_phone}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#3B2211] !text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#3B2211]/20"
                      >
                        Detail <ChevronRight size={14} />
                      </button>
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6 text-center">
               <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200">
                 <CalendarDays size={40} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-[#3B2211]">Tidak Ada Reservasi</h3>
                  <p className="text-sm text-gray-400 max-w-xs mt-1">Gunakan kata kunci lain atau ubah filter untuk mencari data.</p>
               </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-[#3B2211]/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl relative z-10 overflow-hidden border border-white"
            >
              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-[#3B2211]/5 flex items-center justify-center text-[#3B2211]">
                         <ShieldCheck size={24} />
                       </div>
                       <div>
                          <h2 className="text-xl font-black text-[#3B2211]" style={{ fontFamily: "var(--font-playfair)" }}>Detail Reservasi</h2>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Invoice: #{selectedBooking.invoice_no}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedBooking(null)}
                      className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all"
                    >
                      <XCircle size={20} />
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Customer</p>
                       <p className="text-base font-bold text-[#3B2211]">{selectedBooking.customer_name}</p>
                       <p className="text-xs text-gray-400">{selectedBooking.customer_phone}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Payment</p>
                       <p className="text-base font-bold text-[#3B2211]">Rp {selectedBooking.final_price.toLocaleString()}</p>
                       <p className="text-xs text-gray-400">{selectedBooking.payment_method}</p>
                    </div>
                 </div>

                 <div className="p-6 bg-[#F8F6F4] rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Paket Layanan</p>
                       <p className="text-xs font-bold text-[#3B2211]">{selectedBooking.package_name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                       <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Jadwal Sesi</p>
                       <p className="text-xs font-bold text-[#3B2211]">
                         {new Date(selectedBooking.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} @ {selectedBooking.session_time}
                       </p>
                    </div>
                 </div>

                 {selectedBooking.notes && (
                   <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Catatan Khusus</p>
                      <p className="text-xs text-[#3B2211]/70 leading-relaxed italic">"{selectedBooking.notes}"</p>
                   </div>
                 )}

                 <div className="flex gap-3 pt-4">
                    <button className="flex-1 py-4 bg-[#3B2211] !text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#3B2211]/20 hover:scale-[1.02] transition-all">
                      Update Status
                    </button>
                    <button className="px-6 py-4 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                      Cetak Struk
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
