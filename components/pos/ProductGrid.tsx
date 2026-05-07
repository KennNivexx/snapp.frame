"use client";

import React, { useState } from "react";
import { Search, Filter, ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image?: string;
  category: string;
}

const mockProducts: Product[] = [
  { id: "1", name: "Premium Portrait", sku: "SKU-001", price: 150000, category: "Studio", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" },
  { id: "2", name: "Group Session", sku: "SKU-002", price: 250000, category: "Studio", image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=200&auto=format&fit=crop" },
  { id: "3", name: "Digital Prints 4x6", sku: "SKU-003", price: 5000, category: "Prints" },
  { id: "4", name: "Classic Frame 8x10", sku: "SKU-004", price: 85000, category: "Frames" },
  { id: "5", name: "Wedding Package A", sku: "SKU-005", price: 1500000, category: "Wedding" },
  { id: "6", name: "Polaroid Pack", sku: "SKU-006", price: 45000, category: "Prints" },
];

export default function ProductGrid() {
  const addItem = useCartStore((state) => state.addItem);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(mockProducts.map(p => p.category)))];
  
  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search products or scan SKU..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" 
                : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-thumb-white/10">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => addItem(product)}
              className="group relative bg-white/5 border border-white/10 rounded-3xl p-4 cursor-pointer hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="aspect-square rounded-2xl bg-black/40 overflow-hidden mb-4 relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                   <div className="bg-purple-600 p-2 rounded-full shadow-xl">
                      <Plus className="w-5 h-5" />
                   </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">{product.category}</p>
                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                <p className="text-lg font-bold text-white">Rp {product.price.toLocaleString("id-ID")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
