"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  ShoppingBag, 
  Ticket, 
  TrendingUp, 
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Package,
  Plus,
  ArrowUpRight,
  Zap,
  Activity,
  LayoutDashboard,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { getDashboardStats, getRecentTransactions, getChartData, getUpcomingBookings } from "@/app/actions/dashboard";
import { createClient } from "@/lib/supabase/client";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#3B2211] p-4 rounded-xl shadow-xl border border-white/10 text-white">
        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-base font-black">
          Rp {payload[0].value.toLocaleString("id-ID")}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [statsData, setStatsData] = useState({
    posToday: 0,
    bookingsToday: 0,
    revenue: 0,
    activeProducts: 0,
    referrals: 0
  });
  const [recentTrx, setRecentTrx] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{trends: any[], hasTrendData?: boolean}>({
    trends: [],
    hasTrendData: false
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, trxRes, chartRes, upcomingRes] = await Promise.all([
        getDashboardStats(),
        getRecentTransactions(),
        getChartData(period),
        getUpcomingBookings()
      ]);

      if (statsRes.success) setStatsData(statsRes.data as any);
      if (trxRes.success) setRecentTrx(trxRes.data as any);
      if (chartRes.success) setChartData(chartRes.data as any);
      if (upcomingRes.success) setUpcomingBookings(upcomingRes.data as any);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();

    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [period]);

  if (!mounted) return null;

  const quickStats = [
    { label: "Penjualan Kasir", value: statsData.posToday.toString(), icon: ShoppingBag, color: "bg-white", textColor: "text-gray-900" },
    { label: "Booking Hari Ini", value: statsData.bookingsToday.toString(), icon: CalendarIcon, color: "bg-white", textColor: "text-gray-900" },
    { label: "Pendapatan Bulan Ini", value: `Rp ${statsData.revenue.toLocaleString("id-ID")}`, icon: DollarSign, color: "bg-[#3B2211]", textColor: "text-white" },
    { label: "Referral Aktif", value: statsData.referrals.toString(), icon: Ticket, color: "bg-white", textColor: "text-gray-900" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair)" }}>Ringkasan Studio</h1>
          <p className="text-sm text-gray-500">Selamat datang kembali, berikut performa Sneapici hari ini.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/kasir" className="px-6 py-3 bg-[#3B2211] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#3B2211]/10">
            <ShoppingBag size={18} />
            Buka Kasir
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`${stat.color} p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.textColor === 'text-white' ? 'bg-white/10' : 'bg-gray-50'}`}>
              <stat.icon size={20} className={stat.textColor} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${stat.textColor}`}>{stat.label}</p>
              <h3 className={`text-xl font-black mt-1 ${stat.textColor}`}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Tren Pendapatan</h3>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${period === p ? "bg-white text-[#3B2211] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  {p === "daily" ? "7 Hari" : p === "weekly" ? "4 Minggu" : "6 Bulan"}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.trends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B2211" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B2211" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#3B2211" strokeWidth={3} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-base font-bold text-gray-900">Jadwal Terdekat</h3>
            <Link href="/admin/bookings" className="text-[10px] font-bold text-[#3B2211] hover:underline uppercase tracking-widest">Semua</Link>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {upcomingBookings.map((booking, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{booking.customerName}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase">{booking.packageName}</p>
                  </div>
                  <span className="text-[10px] font-black text-[#3B2211] bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                    {booking.sessionTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                  <Clock size={12} />
                  {new Date(booking.sessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
            {upcomingBookings.length === 0 && (
              <div className="text-center py-20 opacity-20">
                <CalendarIcon size={40} className="mx-auto mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Tidak ada jadwal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Aktivitas Terakhir</h3>
          <Link href="/admin/reports" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Lihat Semua Laporan</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-4 font-bold">No. Invoice</th>
                <th className="px-8 py-4 font-bold">Layanan/Produk</th>
                <th className="px-8 py-4 font-bold">Total</th>
                <th className="px-8 py-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {recentTrx.map((trx, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4 font-mono font-bold text-gray-400">#{trx.invoiceNumber}</td>
                  <td className="px-8 py-4">
                    <p className="font-bold text-gray-900">{trx.subject}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{trx.type}</p>
                  </td>
                  <td className="px-8 py-4 font-bold text-[#3B2211]">Rp {trx.total.toLocaleString("id-ID")}</td>
                  <td className="px-8 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase border border-green-100">
                      {trx.status}
                    </span>
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
