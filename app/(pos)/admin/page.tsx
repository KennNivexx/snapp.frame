"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  ShoppingBag, 
  Ticket, 
  TrendingUp, 
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Plus
} from "lucide-react";
import Link from "next/link";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

const stats = [
  { label: "Booking Hari Ini", value: "8", icon: CalendarIcon, trend: "+25%", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Pendapatan Bulan Ini", value: "Rp 12.450.000", icon: TrendingUp, trend: "+12.5%", color: "text-green-600", bg: "bg-green-50" },
  { label: "Pelanggan Aktif", value: "142", icon: Users, trend: "+8", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Referral Aktif", value: "12", icon: Ticket, trend: "0", color: "text-orange-600", bg: "bg-orange-50" },
];

const bookingData = [
  { name: "1 Mei", value: 12 },
  { name: "2 Mei", value: 19 },
  { name: "3 Mei", value: 15 },
  { name: "4 Mei", value: 8 },
  { name: "5 Mei", value: 22 },
  { name: "6 Mei", value: 30 },
  { name: "7 Mei", value: 25 },
];

const serviceData = [
  { name: "Standard Portrait", value: 45, color: "#6366f1" },
  { name: "Premium Group", value: 30, color: "#10b981" },
  { name: "Pre-Wedding", value: 15, color: "#f59e0b" },
  { name: "Other", value: 10, color: "#3b82f6" },
];

const recentBookings = [
  { id: "SNF-882192", customer: "Budi Santoso", package: "Basic Studio", date: "Hari ini, 14:00", status: "Selesai", referral: "PROMO10" },
  { id: "SNF-882193", customer: "Siti Aminah", package: "Family Portrait", date: "Hari ini, 15:30", status: "Pending", referral: "-" },
  { id: "SNF-882194", customer: "Andi Wijaya", package: "Group Session", date: "Besok, 10:00", status: "Konfirmasi", referral: "NEWUSER" },
  { id: "SNF-882195", customer: "Rina Kartika", package: "Pre-Wedding", date: "6 Mei, 09:00", status: "Selesai", referral: "-" },
];

import { getDashboardStats, getRecentTransactions, getChartData } from "@/app/actions/dashboard";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [statsData, setStatsData] = useState({
    bookingsToday: 0,
    revenue: 0,
    customers: 0,
    referrals: 0
  });
  const [recentTrx, setRecentTrx] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{trends: any[], services: any[], hasTrendData?: boolean}>({
    trends: [],
    services: [],
    hasTrendData: false
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const [statsRes, trxRes, chartRes] = await Promise.all([
      getDashboardStats(),
      getRecentTransactions(),
      getChartData()
    ]);

    if (statsRes.success) setStatsData(statsRes.data as any);
    if (trxRes.success) setRecentTrx(trxRes.data as any);
    if (chartRes.success) setChartData(chartRes.data as any);
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchData();

    // Set up Realtime for Dashboard
    const channel = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "referral_codes" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!mounted) return null;

  const stats = [
    { label: "Booking Hari Ini", value: statsData.bookingsToday.toString(), icon: CalendarIcon, trend: "+0", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Pendapatan", value: `Rp ${statsData.revenue.toLocaleString("id-ID")}`, icon: TrendingUp, trend: "+0", color: "text-green-600", bg: "bg-green-50" },
    { label: "Staff Aktif", value: statsData.customers.toString(), icon: Users, trend: "+0", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Referral Aktif", value: statsData.referrals.toString(), icon: Ticket, trend: "0", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Overview Dashboard
          </h2>
          <p className="text-[#5A5A5A] mt-1 italic font-medium">Ringkasan performa studio Snapp.frame Anda hari ini.</p>
        </div>
        <div className="flex gap-3">
           <Link href="/admin/bookings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E0E0DA] rounded-2xl text-xs font-bold text-[#1A1A1A] hover:bg-[#F0EFE9] transition-all shadow-sm uppercase tracking-widest">
             <CalendarIcon size={16} />
             Jadwal
           </Link>
           <Link href="/admin/referrals" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B2211] rounded-2xl text-xs font-bold !text-white hover:bg-[#4d2d16] transition-all shadow-md uppercase tracking-widest">
             <Plus size={16} />
             Referral Baru
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
            className="bg-white p-6 rounded-[28px] border border-[#E0E0DA] shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg bg-[#FAFAF8] border border-[#F0EFE9] ${item.trend.startsWith("+") ? "text-green-600" : "text-gray-500"}`}>
                  {item.trend}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-[#888888] font-black uppercase tracking-[0.2em] mb-1">{item.label}</p>
            <h3 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-[#E0E0DA] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>Tren Pemesanan</h3>
            <select className="bg-[#F0EFE9] border-none text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-2 outline-none">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.trends}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartData.hasTrendData ? "#3B2211" : "#E0E0DA"} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={chartData.hasTrendData ? "#3B2211" : "#E0E0DA"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EFE9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 'bold', fill: '#888888'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 'bold', fill: '#888888'}}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid #E0E0DA', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={chartData.hasTrendData ? "#3B2211" : "#E0E0DA"} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-[#E0E0DA] shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-8" style={{ fontFamily: "var(--font-playfair)" }}>Layanan Terpopuler</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.services}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.services.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold text-[#1A1A1A]">
                {chartData.services.length > 0 && chartData.services[0].name === "Belum Ada Data" ? "0%" : "100%"}
              </span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {chartData.services.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-bold text-[#5A5A5A] uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-[#1A1A1A]">
                  {item.name === "Belum Ada Data" ? "0%" : `${item.value}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-[32px] border border-[#E0E0DA] shadow-sm overflow-hidden">
        <div className="p-10 border-b border-[#E0E0DA] flex items-center justify-between bg-white">
          <h3 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>Pemesanan Terbaru</h3>
          <Link href="/admin/bookings" className="text-xs font-black text-[#888888] hover:text-[#1A1A1A] flex items-center gap-2 transition-colors uppercase tracking-[0.2em]">
            Semua Booking <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAFAF8] text-[10px] text-[#888888] uppercase tracking-[0.3em]">
                <th className="px-10 py-6 font-black">ID Booking</th>
                <th className="px-10 py-6 font-black">Pelanggan</th>
                <th className="px-10 py-6 font-black">Layanan</th>
                <th className="px-10 py-6 font-black">Referral</th>
                <th className="px-10 py-6 font-black">Status</th>
                <th className="px-10 py-6 font-black text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFE9]">
              {recentTrx.map((trx) => (
                <tr key={trx.id} className="group hover:bg-[#FAFAF8] transition-all duration-300">
                  <td className="px-10 py-6 text-xs font-bold text-[#888888]">{trx.invoiceNumber}</td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1A1A1A]">{trx.cashier?.name || "Kasir"}</span>
                      <span className="text-[10px] text-[#888888] flex items-center gap-1 font-bold">
                        <Clock size={10} /> {new Date(trx.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-[#888888]" />
                      <span className="text-xs font-bold text-[#5A5A5A]">Transaksi {trx.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                      trx.referralCode ? "bg-purple-50 text-purple-600 border border-purple-100" : "text-[#888888]"
                    }`}>
                      {trx.referralCode?.code || "-"}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-4 py-1.5 rounded-full inline-flex items-center gap-2 ${
                      trx.status === "COMPLETED" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        trx.status === "COMPLETED" ? "bg-green-600" : "bg-orange-600"
                      }`} />
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E0E0DA] rounded-xl text-[10px] font-black text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all uppercase tracking-widest">
                      Detail
                    </button>
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

