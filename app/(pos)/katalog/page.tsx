"use client";

import React from "react";
import ProductManagement from "@/components/pos/ProductManagement";
import { motion } from "framer-motion";

export default function CatalogPage() {
  return (
    <div className="min-h-full bg-[#FAFAF8] p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1400px] mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair)" }}>Manajemen Produk</h1>
          <p className="text-sm text-gray-500">Kelola stok, harga, dan kategori produk Sneapici Studio</p>
        </div>
        
        <ProductManagement />
      </motion.div>
    </div>
  );
}
