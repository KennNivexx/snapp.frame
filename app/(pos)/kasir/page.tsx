"use client";

import React, { useState } from "react";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Menu, 
  ChevronLeft,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function CashierPage() {
  return (
    <div className="flex flex-col h-screen bg-[#FAFAF8] overflow-hidden">
      {/* Header Kasir Sederhana */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin"
            className="p-2 -ml-2 text-gray-400 hover:text-[#3B2211] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold hidden sm:inline">Kembali</span>
          </Link>
          <div className="w-px h-6 bg-gray-100 mx-2 hidden sm:block" />
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-gray-900 leading-tight">Kasir POS</h1>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Sneapici Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs font-bold text-gray-900">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-tight">Sistem Aktif</p>
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sisi Kiri: Grid Produk */}
        <main className="flex-1 overflow-hidden relative border-r border-gray-100">
          <div className="h-full overflow-y-auto custom-scrollbar p-6">
            <ProductGrid onSelect={() => {}} />
          </div>
        </main>

        {/* Sisi Kanan: Keranjang Belanja */}
        <aside className="w-[400px] bg-white hidden lg:flex flex-col shrink-0">
          <Cart />
        </aside>
      </div>

      {/* Tombol Keranjang Mobile (Tampil di Mobile Saja) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button className="w-16 h-16 bg-[#3B2211] text-white rounded-full shadow-2xl flex items-center justify-center relative">
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">
            0
          </span>
        </button>
      </div>
    </div>
  );
}
