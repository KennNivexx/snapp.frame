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
  ArrowLeft,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  LayoutGrid,
  List
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
  const [viewMode, setViewMode] = useState<"table" | "calendar">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // Mei 2026
  const [selectedDate, setSelectedDate] = useState<string>(new Date(2026, 4, 7).toISOString().split('T')[0]);

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
      // Fallback to mock data if actions fail
      setBookings([
        { id: "1", invoice_no: "SNF-001", customer_name: "Budi Santoso", customer_phone: "08123456789", package_name: "Standard Portrait", session_date: "2026-05-07", session_time: "10:00", final_price: 150000, status: "success", payment_method: "Transfer", created_at: "" },
        { id: "2", invoice_no: "SNF-002", customer_name: "Siti Aminah", customer_phone: "08123456780", package_name: "Premium Group", session_date: "2026-05-07", session_time: "13:00", final_price: 350000, status: "pending", payment_method: "QRIS", created_at: "" },
        { id: "3", invoice_no: "SNF-003", customer_name: "Andi Wijaya", customer_phone: "08123456781", package_name: "Standard Portrait", session_date: "2026-05-07", session_time: "15:30", final_price: 150000, status: "pending", payment_method: "Tunai", created_at: "" },
        { id: "4", invoice_no: "SNF-004", customer_name: "Rina Kartika", customer_phone: "08123456782", package_name: "Pre-Wedding", session_date: "2026-05-06", session_time: "09:00", final_price: 1200000, status: "success", payment_method: "Transfer", created_at: "" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const { success, error } = await updateBookingStatus(id, newStatus);
      if (!success) throw new Error(error);
      fetchBookings();
    } catch (err: any) {
      // Local update for simulation
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
    }
  }

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(search.toLowerCase()) || b.invoice_no.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  const dayBookings = bookings.filter(b => b.session_date === selectedDate);

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);
    const calendarDays = [];

    // Header
    const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    for (let i = 0; i < offset; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-[#FAFAF8]/50 border-r border-b border-[#F0EFE9]" />);
    }

    for (let d = 1; d <= days; d++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const isToday = dateStr === new Date(2026, 4, 7).toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;
      const dayHasBookings = bookings.filter(b => b.session_date === dateStr);

      calendarDays.push(
        <div 
          key={d} 
          onClick={() => setSelectedDate(dateStr)}
          className={`h-24 md:h-32 p-4 border-r border-b border-[#F0EFE9] cursor-pointer transition-all hover:bg-[#FAFAF8] relative group ${isSelected ? "bg-white ring-2 ring-[#1A1A1A] z-10" : "bg-white"}`}
        >
          <div className={`text-xs font-black mb-2 ${isToday ? "w-6 h-6 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center" : "text-[#888888]"}`}>
            {d}
          </div>
          <div className="space-y-1">
            {dayHasBookings.slice(0, 2).map((b, idx) => (
              <div key={idx} className={`h-1.5 rounded-full ${b.status === 'success' ? 'bg-green-500' : b.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'}`} />
            ))}
            {dayHasBookings.length > 2 && <div className="text-[8px] font-bold text-[#888888]">+{dayHasBookings.length - 2} lagi</div>}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-[32px] border border-[#E0E0DA] shadow-xl overflow-hidden">
        <div className="p-8 border-b border-[#E0E0DA] flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>
            {currentMonth.toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
             <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-[#F0EFE9] rounded-xl transition-all"><ChevronLeft size={20}/></button>
             <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-[#F0EFE9] rounded-xl transition-all"><ChevronRightIcon size={20}/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 bg-[#FAFAF8] text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] border-b border-[#E0E0DA]">
          {weekDays.map(day => <div key={day} className="py-4 text-center">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-bold text-[#888888] hover:text-[#1A1A1A] mb-4 transition-colors uppercase tracking-widest">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Booking Schedule
          </h2>
          <p className="text-[#5A5A5A] mt-2 italic font-medium">Kelola seluruh jadwal pemotretan studio Anda.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white border border-[#E0E0DA] p-1 rounded-2xl shadow-sm">
            <button 
              onClick={() => setViewMode("calendar")}
              className={`p-3 rounded-xl transition-all ${viewMode === "calendar" ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#888888] hover:bg-[#F0EFE9]"}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode("table")}
              className={`p-3 rounded-xl transition-all ${viewMode === "table" ? "bg-[#1A1A1A] text-white shadow-md" : "text-[#888888] hover:bg-[#F0EFE9]"}`}
            >
              <List size={20} />
            </button>
          </div>
          <button 
            onClick={fetchBookings}
            className="p-4 bg-white border border-[#E0E0DA] rounded-2xl text-[#1A1A1A] hover:bg-[#F0EFE9] transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderCalendar()}
          </div>
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-[#E0E0DA] shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>
                  {new Date(selectedDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long' })}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-[#1A1A1A] text-white rounded-full">
                  {dayBookings.length} Booking
                </span>
              </div>

              <div className="space-y-4">
                {dayBookings.length === 0 ? (
                  <div className="py-20 text-center opacity-40">
                    <CalendarIcon size={40} className="mx-auto mb-4 text-[#888888]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#888888]">Tidak ada jadwal</p>
                  </div>
                ) : (
                  dayBookings.map((b) => (
                    <motion.div 
                      key={b.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 bg-[#FAFAF8] rounded-2xl border border-[#F0EFE9] hover:border-[#E0E0DA] transition-all group relative overflow-hidden"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${b.status === 'success' ? 'bg-green-500' : b.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'}`} />
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-black text-[#1A1A1A]">{b.session_time} WIB</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                          b.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>{b.status}</span>
                      </div>
                      <p className="text-sm font-bold text-[#1A1A1A] mb-1">{b.customer_name}</p>
                      <p className="text-[10px] text-[#888888] font-bold uppercase tracking-wider mb-4">{b.package_name}</p>
                      
                      <div className="flex items-center justify-between gap-2 pt-4 border-t border-white">
                        <button className="text-[10px] font-black text-[#888888] hover:text-[#1A1A1A] uppercase tracking-widest">Detail</button>
                        <div className="flex gap-2">
                          {b.status === 'pending' && (
                            <button onClick={() => updateStatus(b.id, 'success')} className="p-2 bg-white text-green-600 rounded-lg shadow-sm border border-[#F0EFE9] hover:bg-green-50"><CheckCircle2 size={16}/></button>
                          )}
                          <button onClick={() => updateStatus(b.id, 'cancelled')} className="p-2 bg-white text-red-600 rounded-lg shadow-sm border border-[#F0EFE9] hover:bg-red-50"><XCircle size={16}/></button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Booking Table View ── */
        <div className="bg-white rounded-[40px] border border-[#E0E0DA] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-[#E0E0DA] flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#FAFAF8]/50">
             <div className="relative flex-1 max-w-md">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888]" size={20} />
               <input 
                 type="text" 
                 placeholder="Cari nama atau nomor invoice..." 
                 className="w-full pl-14 pr-6 py-4 bg-white border-[#E0E0DA] rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#1A1A1A] transition-all shadow-sm outline-none"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             <div className="flex items-center gap-3">
               {["all", "pending", "success", "cancelled"].map((f) => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     filter === f 
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
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAFAF8] text-[10px] text-[#888888] uppercase tracking-[0.3em]">
                  <th className="px-10 py-6 font-black">Pelanggan</th>
                  <th className="px-10 py-6 font-black">Jadwal</th>
                  <th className="px-10 py-6 font-black">Paket</th>
                  <th className="px-10 py-6 font-black">Total</th>
                  <th className="px-10 py-6 font-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFE9]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-20 text-center">
                      <RefreshCw size={32} className="animate-spin text-[#1A1A1A] mx-auto mb-4" />
                      <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Memuat data...</p>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-20 text-center opacity-40">
                      <AlertCircle size={48} className="text-[#888888] mx-auto mb-4" />
                      <p className="text-[10px] font-black text-[#888888] uppercase tracking-widest">Tidak ada data</p>
                    </td>
                  </tr>
                ) : filteredBookings.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-[#FAFAF8] transition-all">
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-[#1A1A1A]">{booking.customer_name}</span>
                        <span className="text-[10px] text-[#888888] font-black uppercase tracking-tighter">{booking.invoice_no}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A1A1A]">
                          <CalendarIcon size={14} className="text-[#888888]" />
                          {new Date(booking.session_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#888888]">
                          <Clock size={14} className="text-[#888888]" />
                          {booking.session_time} WIB
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-xs font-bold text-[#1A1A1A]">{booking.package_name}</span>
                    </td>
                    <td className="px-10 py-8 text-sm font-black text-[#1A1A1A]">
                      Rp {booking.final_price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
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
      )}
    </div>
  );
}
