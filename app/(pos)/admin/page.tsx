"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  ShoppingBag, 
  Ticket, 
  TrendingUp, 
  ArrowRight,
  Plus,
  Calendar,
  Clock
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Today's Bookings", value: "8", icon: Calendar, trend: "+2", color: "bg-blue-50 text-blue-600" },
  { label: "Pending Payment", value: "12", icon: Clock, trend: "-3", color: "bg-orange-50 text-orange-600" },
  { label: "Total Revenue", value: "Rp 12.450.000", icon: TrendingUp, trend: "+12.5%", color: "bg-green-50 text-green-600" },
  { label: "Active Referrals", value: "12", icon: Ticket, trend: "+2", color: "bg-purple-50 text-purple-600" },
];

const recentBookings = [
  { id: "SNF-882192", customer: "Budi Santoso", package: "Basic Studio", date: "Hari ini, 14:00", status: "Paid" },
  { id: "SNF-882193", customer: "Siti Aminah", package: "Family Portrait", date: "Hari ini, 15:30", status: "Pending" },
  { id: "SNF-882194", customer: "Andi Wijaya", package: "Group Session", date: "Besok, 10:00", status: "Paid" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Admin Dashboard
          </h2>
          <p className="text-[#5A5A5A] mt-1">Selamat datang kembali, berikut ringkasan studio Anda hari ini.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/admin/bookings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E0E0DA] rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#F0EFE9] transition-all shadow-sm">
             <Calendar size={18} />
             Lihat Booking
           </Link>
           <Link href="/admin/referrals" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] rounded-xl text-sm font-bold text-white hover:bg-[#333333] transition-all shadow-md">
             <Ticket size={18} />
             Kelola Referral
           </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-[#E0E0DA] shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon size={24} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                {item.trend}
              </span>
            </div>
            <p className="text-xs text-[#888888] font-bold uppercase tracking-wider mb-1">{item.label}</p>
            <h3 className="text-2xl font-bold text-[#1A1A1A]">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Recent Bookings ── */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E0E0DA] shadow-sm overflow-hidden">
          <div className="p-8 border-b border-[#E0E0DA] flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>Booking Terbaru</h3>
            <Link href="/admin/bookings" className="text-sm font-bold text-[#5A5A5A] hover:text-[#1A1A1A] flex items-center gap-1">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAFAF8] text-[10px] text-[#888888] uppercase tracking-[0.2em]">
                  <th className="px-8 py-4 font-bold">ID</th>
                  <th className="px-8 py-4 font-bold">Customer</th>
                  <th className="px-8 py-4 font-bold">Package</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                  <th className="px-8 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFE9]">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-[#888888]">{booking.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1A1A1A]">{booking.customer}</span>
                        <span className="text-xs text-[#888888] flex items-center gap-1">
                          <Clock size={12} /> {booking.date}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-[#5A5A5A]">{booking.package}</td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        booking.status === "Paid" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-[#E0E0DA] text-[#888888] hover:text-[#1A1A1A] transition-all">
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Quick Actions / Summary ── */}
        <div className="space-y-6">
          <div className="bg-[#1A1A1A] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            
            <h3 className="text-xl font-bold mb-4 relative z-10" style={{ fontFamily: "var(--font-playfair)" }}>Quick Access</h3>
            <div className="grid grid-cols-1 gap-3 relative z-10">
               <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all text-left">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                     <ShoppingBag size={20} />
                   </div>
                   <span className="text-sm font-bold">Point of Sale (Kasir)</span>
                 </div>
                 <ArrowRight size={18} />
               </button>
               
               <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all text-left">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                     <Ticket size={20} />
                   </div>
                   <span className="text-sm font-bold">Buat Kode Referral</span>
                 </div>
                 <ArrowRight size={18} />
               </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E0E0DA] shadow-sm">
             <h3 className="text-xl font-bold text-[#1A1A1A] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>Tips Studio</h3>
             <div className="space-y-4">
               <div className="p-4 bg-[#F0EFE9] rounded-2xl">
                 <p className="text-xs font-bold text-[#1A1A1A] mb-1">Referral Boost</p>
                 <p className="text-xs text-[#5A5A5A] leading-relaxed">Berikan diskon 10% untuk kode referral baru guna meningkatkan jumlah pelanggan minggu ini.</p>
               </div>
               <div className="p-4 bg-[#F0EFE9] rounded-2xl">
                 <p className="text-xs font-bold text-[#1A1A1A] mb-1">Update Galeri</p>
                 <p className="text-xs text-[#5A5A5A] leading-relaxed">Halaman landing page Anda membutuhkan foto terbaru untuk menarik minat pelanggan.</p>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
