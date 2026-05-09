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
  Command
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
  final_price: number;
  status: string;
  payment_method: string;
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
    <div className="min-h-screen bg-[#FAFAF8] p-6 lg:p-12">
      {/* ── Header Protocol ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-[#3B2211] flex items-center justify-center text-white shadow-xl shadow-[#3B2211]/20">
               <CalendarDays size={20} />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-[#3B2211] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                  Manajemen Reservasi
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3B2211]/40">Sistem Kelola Pesanan & Jadwal</p>
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
              placeholder="Cari Data Pesanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-[#3B2211]/5 rounded-[22px] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B2211]/5 w-full md:w-80 shadow-2xl shadow-[#3B2211]/5 placeholder:text-[#3B2211]/20"
            />
          </div>
          
          <div className="flex bg-white p-1.5 rounded-[22px] border border-[#3B2211]/5 shadow-xl shadow-[#3B2211]/5">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-3 rounded-[18px] transition-all ${viewMode === "list" ? "bg-[#3B2211] text-white shadow-lg shadow-[#3B2211]/20" : "text-[#3B2211]/40 hover:text-[#3B2211]"}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode("calendar")}
              className={`p-3 rounded-[18px] transition-all ${viewMode === "calendar" ? "bg-[#3B2211] text-white shadow-lg shadow-[#3B2211]/20" : "text-[#3B2211]/40 hover:text-[#3B2211]"}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Status Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {["Total", "Konfirmasi", "Selesai", "Tertunda"].map((label, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 bg-white rounded-[32px] border border-[#3B2211]/5 shadow-2xl shadow-[#3B2211]/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Command size={60} className="text-[#3B2211]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B2211]/40 mb-3">{label}</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-[#3B2211]" style={{ fontFamily: "var(--font-playfair)" }}>
                {label === "Total" ? bookings.length : bookings.filter(b => b.status === label).length}
              </span>
              <div className="flex items-center gap-1 mb-2">
                 <TrendingUp size={12} className="text-emerald-500" />
                 <span className="text-[9px] font-bold text-emerald-500 uppercase">+12%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filter Strip ── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 custom-scrollbar">
        {["all", "Konfirmasi", "Selesai", "Tertunda", "Dibatalkan"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap ${
              filter === f 
              ? "bg-[#3B2211] text-white border-transparent shadow-xl shadow-[#3B2211]/20" 
              : "bg-white text-[#3B2211]/40 border-[#3B2211]/5 hover:border-[#3B2211]/20 hover:text-[#3B2211]"
            }`}
          >
            {f === "all" ? "Semua Pesanan" : f}
          </button>
        ))}
      </div>

      {/* ── Main Manifest Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-white/50 animate-pulse rounded-[32px] border border-[#3B2211]/5" />
            ))
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-[32px] border border-[#3B2211]/5 shadow-2xl shadow-[#3B2211]/5 hover:shadow-[#3B2211]/10 transition-all duration-700 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div 
                  className="absolute top-0 left-0 w-1.5 h-full transition-all duration-700" 
                  style={{ backgroundColor: statusStyles[booking.status]?.color || "#E0E0DA" }}
                />

                <div className="p-8">
                   <div className="flex items-start justify-between mb-8">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B2211]/30 mb-1">
                          #{booking.invoice_no}
                        </p>
                        <h3 className="text-lg font-bold text-[#3B2211] truncate max-w-[180px]">
                          {booking.customer_name}
                        </h3>
                      </div>
                      <div 
                        className="px-4 py-2 rounded-xl flex items-center gap-2"
                        style={{ backgroundColor: statusStyles[booking.status]?.bg || "#F5F5F0" }}
                      >
                         {statusStyles[booking.status] && React.createElement(statusStyles[booking.status].icon, { size: 12, style: { color: statusStyles[booking.status].color } })}
                         <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: statusStyles[booking.status]?.color || "#5A5A5A" }}>
                           {booking.status}
                         </span>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-5 p-4 bg-[#FAFAF8] rounded-[22px] border border-[#3B2211]/2">
                         <div className="w-12 h-12 rounded-2xl bg-white border border-[#3B2211]/5 flex items-center justify-center shadow-lg">
                            <Clock size={20} className="text-[#3B2211]/40" />
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#3B2211]/30">Jadwal Sesi</p>
                            <p className="text-sm font-bold text-[#3B2211]">
                               {new Date(booking.session_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {booking.session_time}
                            </p>
                         </div>
                      </div>

                      <div className="flex items-center justify-between px-2">
                         <div className="flex items-center gap-3">
                            <Package size={14} className="text-[#3B2211]/20" />
                            <span className="text-[11px] font-bold text-[#3B2211]/60">{booking.package_name}</span>
                         </div>
                         <div className="flex items-center gap-3">
                            <CreditCard size={14} className="text-[#3B2211]/20" />
                            <span className="text-sm font-black text-[#3B2211]">Rp {booking.final_price.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>

                   <div className="mt-8 pt-6 border-t border-[#3B2211]/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-[#3B2211]/30" />
                        <span className="text-[10px] font-bold text-[#3B2211]/40">{booking.customer_phone}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="w-10 h-10 rounded-xl bg-[#3B2211]/5 text-[#3B2211] flex items-center justify-center hover:bg-[#3B2211] hover:text-white transition-all group-hover:scale-110"
                      >
                        <ChevronRight size={18} />
                      </button>
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6 text-center">
               <div className="w-24 h-24 rounded-[40px] bg-white border border-[#3B2211]/5 flex items-center justify-center shadow-2xl shadow-[#3B2211]/5">
                 <AlertCircle size={40} className="text-[#3B2211]/10" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-[#3B2211]">Data Tidak Ditemukan</h3>
                  <p className="text-sm text-[#3B2211]/40 max-w-xs mt-2">Sistem tidak menemukan data pesanan yang sesuai dengan kriteria Anda.</p>
               </div>
               <button 
                 onClick={() => { setSearch(""); setFilter("all"); }}
                 className="px-8 py-4 bg-[#3B2211] text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#3B2211]/20 hover:scale-105 transition-all"
               >
                 Reset Filter
               </button>
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
              className="absolute inset-0 bg-[#3B2211]/40 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[48px] shadow-4xl relative z-10 overflow-hidden border border-white/20"
            >
              <div className="p-12">
                 <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-[#3B2211]/5 flex items-center justify-center text-[#3B2211]">
                         <ShieldCheck size={28} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold text-[#3B2211]" style={{ fontFamily: "var(--font-playfair)" }}>Detail Pesanan</h2>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/30">Akses Data Aman</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedBooking(null)}
                      className="w-14 h-14 rounded-full bg-[#FAFAF8] border border-[#3B2211]/5 flex items-center justify-center text-[#3B2211]/40 hover:text-[#3B2211] transition-all"
                    >
                      <XCircle size={24} />
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-10 mb-12">
                    <div className="space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-widest text-[#3B2211]/30">Identitas Pelanggan</p>
                       <p className="text-lg font-bold text-[#3B2211]">{selectedBooking.customer_name}</p>
                       <p className="text-xs text-[#3B2211]/50">{selectedBooking.customer_phone}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-widest text-[#3B2211]/30">Catatan Keuangan</p>
                       <p className="text-lg font-bold text-[#3B2211]">Rp {selectedBooking.final_price.toLocaleString()}</p>
                       <p className="text-xs text-[#3B2211]/50">{selectedBooking.payment_method}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-widest text-[#3B2211]/30">Status Pesanan</p>
                       <div 
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-xl"
                        style={{ backgroundColor: statusStyles[selectedBooking.status]?.bg || "#F5F5F0" }}
                       >
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusStyles[selectedBooking.status]?.color || "#5A5A5A" }} />
                         <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: statusStyles[selectedBooking.status]?.color || "#5A5A5A" }}>
                           {selectedBooking.status}
                         </span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-widest text-[#3B2211]/30">ID Referensi</p>
                       <p className="text-sm font-bold text-[#3B2211]">INVOICE-{selectedBooking.invoice_no}</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button className="flex-1 py-5 bg-[#3B2211] text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-[#3B2211]/30 hover:scale-[1.02] transition-all">
                      Konfirmasi Pesanan
                    </button>
                    <button className="flex-1 py-5 bg-[#FAFAF8] text-[#3B2211]/40 border border-[#3B2211]/5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-[#3B2211] transition-all">
                      Arsipkan Data
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
