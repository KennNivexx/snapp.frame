"use client";

import React, { useState, useEffect } from "react";
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
  ShoppingCart,
  Menu,
  X,
  Package,
  History
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Kasir POS", icon: ShoppingCart, href: "/kasir" },
  { label: "Manajemen Produk", icon: Package, href: "/admin/products" },
  { label: "Booking", icon: Calendar, href: "/admin/bookings" },
  { label: "Pelanggan", icon: Users, href: "/admin/customers" },
  { label: "Promo & Referral", icon: Ticket, href: "/admin/referrals" },
  { label: "Laporan", icon: History, href: "/admin/reports" },
];

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isPOSPage, setIsPOSPage] = useState(false);
  
  useEffect(() => {
    setIsPOSPage(!!pathname && /kasir|katalog/.test(pathname));
    setIsSidebarOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo Section */}
      <div className="px-6 py-8 flex items-center justify-center border-b border-gray-50">
         <Logo height={60} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Menu Utama</p>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                isActive 
                ? "bg-[#3B2211] text-white shadow-lg shadow-[#3B2211]/10" 
                : "text-gray-500 hover:bg-gray-50 hover:text-[#3B2211]"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-50 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
           <div className="w-10 h-10 rounded-lg bg-[#3B2211] flex items-center justify-center font-bold text-xs text-white">
             AD
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-xs font-bold text-gray-900 truncate">Administrator</p>
             <p className="text-[10px] text-gray-500 uppercase font-medium">Sneapici Studio</p>
           </div>
        </div>
        
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold text-xs"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-gray-900 font-sans flex overflow-hidden h-screen">
      {/* Desktop Sidebar - Sembunyikan di halaman POS */}
      {!isPOSPage && (
        <aside className="hidden lg:flex w-64 flex-col z-50">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-[70] lg:hidden shadow-2xl"
            >
              <div className="absolute right-4 top-4">
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Header - Tampilkan di semua halaman kecuali Kasir karena Kasir punya Header custom */}
        {!isPOSPage && (
          <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg"
                >
                  <Menu size={20} />
                </button>
                <div className="flex flex-col">
                  <h1 className="text-sm font-bold text-gray-900">
                    {navItems.find(i => i.href === pathname)?.label || "Dashboard"}
                  </h1>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-green-700 uppercase">Sistem Online</span>
                </div>
                <div className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <Settings size={18} />
                </div>
             </div>
          </header>
        )}

        <main className="flex-1 overflow-hidden relative">
          <div className="h-full overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
