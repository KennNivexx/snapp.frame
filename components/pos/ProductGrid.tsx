"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image?: string;
  category: string;
}

import { getProducts } from "@/app/actions/products";
import { createClient } from "@/lib/supabase/client";

export default function ProductGrid() {
  const addItem = useCartStore((state) => state.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getProducts();
    if (res.success) {
      setProducts(res.data as any[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("product-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Product" },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full bg-[#FAFAF8]">
      <div className="p-8 space-y-8">
        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input 
              type="text" 
              placeholder="Cari produk atau scan SKU..."
              className="w-full bg-white border border-[#E0E0DA] rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="px-6 py-4 bg-white border border-[#E0E0DA] rounded-2xl flex items-center gap-3 hover:bg-[#F0EFE9] transition-all shadow-sm">
            <Filter className="w-4 h-4 text-[#1A1A1A]" />
            <span className="text-sm font-bold text-[#1A1A1A]">Filter</span>
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${
                activeCategory === cat 
                ? "bg-[#1A1A1A] text-white shadow-xl shadow-black/10" 
                : "bg-white text-[#888888] hover:text-[#1A1A1A] border border-[#E0E0DA] shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-thin scrollbar-thumb-[#E0E0DA]">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              whileHover={{ y: -5 }}
              onClick={() => addItem(product)}
              className="group relative bg-white border border-[#E0E0DA] rounded-[32px] p-5 cursor-pointer hover:shadow-2xl hover:shadow-black/5 transition-all duration-300"
            >
              <div className="aspect-square rounded-2xl bg-[#F0EFE9] overflow-hidden mb-5 relative border border-[#E0E0DA]/50">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-[#C0C0BB]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white p-4 rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-300">
                      <Plus className="w-6 h-6 text-[#1A1A1A]" />
                   </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-bold">{product.category}</p>
                <h3 className="font-bold text-sm text-[#1A1A1A] truncate">{product.name}</h3>
                <div className="flex items-center justify-between pt-1">
                   <p className="text-lg font-bold text-[#1A1A1A]">Rp {product.price.toLocaleString("id-ID")}</p>
                   <div className="w-8 h-8 rounded-full border border-[#E0E0DA] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Plus size={14} className="text-[#1A1A1A]" />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

