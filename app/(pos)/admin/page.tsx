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
  Package,
  Plus,
  ArrowUpRight,
  Zap,
  Activity,
  LayoutDashboard,
  DollarSign,
  RefreshCw,
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
import {
  getDashboardStats,
  getRecentTransactions,
  getChartData,
  getUpcomingBookings,
} from "@/app/actions/dashboard";
import { createClient } from "@/lib/supabase/client";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-near-black p-4 rounded-xl shadow-xl border border-white/10 text-white">
        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">
          {label}
        </p>
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
    referrals: 0,
  });
  const [recentTrx, setRecentTrx] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{
    trends: any[];
    hasTrendData?: boolean;
  }>({
    trends: [],
    hasTrendData: false,
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
        getUpcomingBookings(),
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Transaction" },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [period]);

  if (!mounted) return null;

  return (
    <div className="p-8 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gold/10 rounded-lg">
              <LayoutDashboard size={20} className="text-gold" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Management Console</p>
          </div>
          <h1 className="text-4xl font-black text-near-black tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
            Ringkasan <span className="text-gold italic">Operasional</span>
          </h1>
          <p className="text-near-black/60 font-bold mt-2 max-w-md">Pantau performa studio, transaksi POS, dan jadwal booking secara real-time.</p>
        </div>

        <div className="flex bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-near-black/5 shadow-sm">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                period === p
                  ? "bg-near-black text-white shadow-lg shadow-near-black/20"
                  : "text-near-black/40 hover:text-near-black hover:bg-near-black/5"
              }`}
            >
              {p === "daily" ? "Hari Ini" : p === "weekly" ? "Minggu Ini" : "Bulan Ini"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Pendapatan",
            value: `Rp ${statsData.revenue.toLocaleString("id-ID")}`,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50",
            desc: "Total akumulasi omzet",
          },
          {
            label: "Transaksi POS",
            value: statsData.posToday,
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50",
            desc: "Pesanan masuk hari ini",
          },
          {
            label: "Booking Aktif",
            value: statsData.bookingsToday,
            icon: CalendarIcon,
            color: "text-gold",
            bg: "bg-gold/10",
            desc: "Sesi foto terjadwal",
          },
          {
            label: "Produk Aktif",
            value: statsData.activeProducts,
            icon: Package,
            color: "text-near-black",
            bg: "bg-near-black/5",
            desc: "Katalog produk tersedia",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-white p-6 rounded-[2.5rem] border border-near-black/5 shadow-sm hover:shadow-xl hover:shadow-near-black/5 transition-all duration-500 overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform duration-500 group-hover:scale-110`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} />
                +12%
              </div>
            </div>
            <p className="text-[10px] font-black text-near-black/40 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-near-black mb-1">{stat.value}</h3>
            <p className="text-[10px] font-bold text-near-black/20">{stat.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Revenue Chart ───────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-near-black/5 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-near-black">Analisis Tren</h3>
              <p className="text-[11px] font-bold text-near-black/40 uppercase tracking-widest mt-1">Laporan Grafik Pendapatan</p>
            </div>
            <button 
              onClick={fetchData}
              className={`p-3 rounded-2xl bg-near-black/5 text-near-black hover:bg-gold/20 hover:text-gold transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="h-[350px] w-full">
            {chartData.hasTrendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.trends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a373" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4a373" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(93, 64, 55, 0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#5d4037', opacity: 0.4 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#5d4037', opacity: 0.4 }}
                    tickFormatter={(val) => `Rp ${val/1000}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#d4a373"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-near-black/40 gap-4 bg-near-black/[0.02] rounded-[2rem] border-2 border-dashed border-near-black/5">
                <Activity size={48} className="opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest opacity-40">Belum ada data tren tersedia</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Upcoming Bookings ───────────────────────────── */}
        <div className="bg-near-black rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white">Booking <span className="text-gold italic">Segera</span></h3>
              <Link href="/admin/bookings" className="text-gold hover:text-white transition-colors">
                <ArrowRight size={20} />
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking, i) => (
                  <div key={i} className="group p-4 rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black text-gold uppercase tracking-widest">{booking.package_name}</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-white/40">
                        <Clock size={10} />
                        {booking.time}
                      </div>
                    </div>
                    <p className="text-sm font-black text-white mb-1">{booking.customer_name}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/40">
                      <CalendarIcon size={10} />
                      {new Date(booking.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4 opacity-30">
                  <CalendarIcon size={40} className="mx-auto text-white" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">Tidak ada jadwal terdekat</p>
                </div>
              )}
            </div>
            
            <Link 
              href="/admin/bookings" 
              className="mt-8 block w-full py-4 rounded-2xl bg-gold text-near-black text-center text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all duration-500 shadow-lg shadow-gold/20"
            >
              Lihat Kalender Lengkap
            </Link>
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ──────────────────────────── */}
      <div className="bg-white rounded-[3rem] p-10 border border-near-black/5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-2xl font-black text-near-black">Aktivitas Terbaru</h3>
            <p className="text-[11px] font-bold text-near-black/40 uppercase tracking-widest mt-1">Data Transaksi Real-time</p>
          </div>
          <Link 
            href="/admin/reports" 
            className="px-8 py-3 rounded-2xl bg-near-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all duration-500 shadow-lg shadow-near-black/20"
          >
            Lihat Laporan Detail
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-near-black/5">
                <th className="pb-6 text-[10px] font-black text-near-black/40 uppercase tracking-widest">ID Transaksi</th>
                <th className="pb-6 text-[10px] font-black text-near-black/40 uppercase tracking-widest">Waktu</th>
                <th className="pb-6 text-[10px] font-black text-near-black/40 uppercase tracking-widest">Layanan</th>
                <th className="pb-6 text-[10px] font-black text-near-black/40 uppercase tracking-widest text-right">Total</th>
                <th className="pb-6 text-[10px] font-black text-near-black/40 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-near-black/5">
              {recentTrx.length > 0 ? (
                recentTrx.map((trx, i) => (
                  <tr key={i} className="group hover:bg-near-black/[0.01] transition-colors">
                    <td className="py-6">
                      <p className="text-sm font-black text-near-black"># {trx.id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="py-6 text-[13px] font-bold text-near-black/40">
                      {new Date(trx.createdAt).toLocaleString("id-ID", { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                          <ShoppingBag size={14} className="text-gold" />
                        </div>
                        <span className="text-sm font-black text-near-black">Studio Session</span>
                      </div>
                    </td>
                    <td className="py-6 text-right">
                      <p className="text-sm font-black text-near-black">Rp {trx.total.toLocaleString("id-ID")}</p>
                    </td>
                    <td className="py-6">
                      <div className="flex justify-center">
                        <span className="px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={12} />
                          Berhasil
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <TrendingUp size={48} className="text-near-black" />
                      <p className="text-sm font-black uppercase tracking-widest">Belum ada transaksi</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
