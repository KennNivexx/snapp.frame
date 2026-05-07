"use client";

import React from "react";
import { site } from "@/data/site";
import { Logo } from "@/components/ui/logo";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Ticket, 
  Settings, 
  LogOut,
  Users,
  ChevronRight,
  Calendar,
  ShoppingCart
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Jadwal Booking", icon: Calendar, href: "/admin/bookings" },
  { label: "Pelanggan & Pendapatan", icon: Users, href: "/admin/customers" },
  { label: "Buat Referral", icon: Ticket, href: "/admin/referrals" },
];

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A1A] font-sans selection:bg-[#E0E0DA] flex overflow-hidden h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-80 bg-white border-r border-[#E0E0DA] flex flex-col z-50">
        {/* Logo Section */}
        <div className="p-10 border-b border-[#E0E0DA] bg-white">
           <Logo height={160} />
           <div className="mt-4 flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full" />
             <span className="text-[10px] font-bold text-[#888888] uppercase tracking-[0.2em]">Management System</span>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
          <p className="px-4 text-[10px] font-bold text-[#C0C0BB] uppercase tracking-[0.3em] mb-4">Main Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`group flex items-center justify-between p-4 rounded-[20px] transition-all duration-300 ${
                  isActive 
                  ? "bg-[#1A1A1A] text-white shadow-xl shadow-black/10 translate-x-2" 
                  : "text-[#5A5A5A] hover:bg-[#F0EFE9] hover:text-[#1A1A1A]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={isActive ? "text-white" : "text-[#888888] group-hover:text-[#1A1A1A]"} />
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-8 border-t border-[#E0E0DA] space-y-4 bg-[#FAFAF8]/50">
          <div className="flex items-center gap-4 px-4 py-3 bg-white border border-[#E0E0DA] rounded-2xl shadow-sm">
             <div className="w-10 h-10 rounded-xl bg-[#F0EFE9] flex items-center justify-center font-bold text-sm text-[#1A1A1A]">
               AD
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-[#1A1A1A] truncate">Admin Studio</p>
               <p className="text-[10px] text-[#888888] uppercase tracking-widest">Administrator</p>
             </div>
          </div>
          <button className="w-full flex items-center gap-3 p-4 text-[#5A5A5A] hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm">
            <LogOut size={18} />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-[#E0E0DA] flex items-center justify-between px-10 sticky top-0 z-40">
           <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#888888] uppercase tracking-widest">
                {pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ")}
              </span>
           </div>
           <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-[#E0E0DA] shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider text-[#5A5A5A] uppercase">System Live</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A]">
                <Settings size={18} className="text-[#888888]" />
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-[#FAFAF8] custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}


