"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Plus, 
  Package, 
  RefreshCw,
  Tag,
  Zap,
  Check
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { createClient } from "@/lib/supabase/client";
import { getProducts } from "@/app/actions/products";

interface Product {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  image: string | null;
  stock: number;
  category: {
    name: string;
  };
}

export default function ProductGrid({ onSelect }: { onSelect?: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const { addItem, items } = useCartStore();
  
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();

    // Tetap gunakan real-time untuk sinkronisasi
    const channel = supabase
      .channel("products-grid")
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

  async function fetchProducts() {
    setLoading(true);
    try {
      // Gunakan Server Action sebagai sumber utama (lebih aman & handle join otomatis)
      const res = await getProducts(false);
      
      if (res.success && res.data) {
        // Transform data agar sesuai interface local jika perlu
        const transformed: Product[] = res.data.map((p: any) => ({
          ...p,
          isActive: true,
          stock: p.stock || 0,
          category: { name: p.category }
        }));
        setProducts(transformed);
      } else {
        console.error("Gagal memuat produk via Server Action:", res.error);
        // Fallback ke Supabase query jika Server Action gagal
        // Gunakan nama tabel sesuai schema (products & categories)
        const { data: rawData, error } = await supabase
          .from("products")
          .select(`id, name, price, isActive, image, stock, category:categories(name)`)
          .eq("isActive", true);
          
        if (error) {
           console.error("Fallback Supabase Error:", error);
           throw error;
        }

        const transformed: Product[] = (rawData as any[] || []).map(p => ({
          ...p,
          category: Array.isArray(p.category) ? p.category[0] : (p.category || { name: "Umum" })
        }));

        setProducts(transformed);
      }
    } catch (err: any) {
      console.error("Error fetch products (Full Error):", err);
    } finally {
      setLoading(false);
    }
  }

  const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category?.name).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "Semua" || p.category?.name === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3B2211] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B2211]/10 focus:border-[#3B2211] transition-all"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat as string)}
              className={`px-6 py-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                category === cat 
                ? "bg-[#3B2211] text-white border-transparent shadow-md" 
                : "bg-white text-gray-500 border-gray-200 hover:border-[#3B2211]/30 hover:text-[#3B2211]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Produk */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-2xl" />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const inCart = items.find(item => item.id === product.id);
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    addItem({ id: product.id, name: product.name, price: product.price, qty: 1 });
                    if (onSelect) onSelect();
                  }}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#3B2211]/20 transition-all cursor-pointer overflow-hidden relative"
                >
                  {/* Status di Keranjang */}
                  {inCart && (
                    <div className="absolute top-3 right-3 z-10 w-6 h-6 bg-[#3B2211] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}

                  {/* Gambar Produk */}
                  <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <Package size={40} className="text-gray-200 group-hover:text-[#3B2211]/10 transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>

                  {/* Info Produk */}
                  <div className="p-4 space-y-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#3B2211]/40 uppercase tracking-widest">{product.category?.name || "Tanpa Kategori"}</span>
                      <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#3B2211] transition-colors">{product.name}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-[#3B2211]">Rp {product.price.toLocaleString('id-ID')}</p>
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#3B2211] group-hover:text-white transition-all shadow-sm">
                        <Plus size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-200">
                <Search size={32} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">Produk Tidak Ditemukan</p>
                <p className="text-sm text-gray-400">Coba cari dengan kata kunci lain</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
