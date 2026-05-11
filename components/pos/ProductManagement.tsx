"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  MoreVertical,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  Tag,
  Archive,
  RefreshCw,
  X,
  Check,
  ChevronDown,
  LayoutGrid,
  Zap,
  Target,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProducts } from "@/app/actions/products";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string | { name: string };
  image: string | null;
  isActive: boolean;
  stock: number;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    category: "Layanan",
    isActive: true,
    stock: "0",
    image: ""
  });

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, [isModalOpen]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await getProducts(true);
      if (res.success) {
        setProducts((res.data as any) || []);
      } else {
        // Fallback ke Supabase jika server action gagal (misal koneksi lokal mati)
        const { data: rawData, error } = await supabase.from("products").select("*, category:categories(name)").order("name");
        if (!error) {
           const transformed = (rawData as any[]).map(p => ({
             ...p,
             category: Array.isArray(p.category) ? p.category[0] : (p.category || { name: "Umum" })
           }));
           setProducts(transformed);
        }
      }
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formData.name,
      sku: formData.sku || `PROD-${Date.now()}`,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: formData.image || null,
      isActive: formData.isActive
    };

    if (editingProduct) {
      await supabase.from("products").update(payload).eq("id", editingProduct.id);
    } else {
      // For insert, we also need to handle category association usually,
      // but for fallback we assume simple mapping or existing categoryId
      await supabase.from("products").insert([payload]);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: "", sku: "", price: "", category: "Layanan", isActive: true, stock: "0", image: "" });
    fetchProducts();
  }

  const handleDelete = async (id: string) => {
    if (confirm("Hapus produk ini?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => {
    const categoryName = typeof p.category === 'string' ? p.category : p.category?.name || "";
    return p.name.toLowerCase().includes(search.toLowerCase()) || 
           categoryName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-6 lg:p-12 relative overflow-hidden">
      {/* ── Background Protocol ── */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3B2211]/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#3B2211]/3 blur-[120px] rounded-full pointer-events-none" />

      {/* ── Header System ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-[22px] bg-[#3B2211] flex items-center justify-center text-white shadow-2xl shadow-[#3B2211]/20">
               <Package size={28} />
             </div>
             <div>
                <h1 className="text-4xl font-bold text-[#3B2211] tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                  Manajemen Produk
                </h1>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#3B2211]/40">Katalog Layanan & Inventaris Studio</p>
             </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-6"
        >
           <button 
             onClick={fetchProducts}
             className="p-4 bg-white border border-[#3B2211]/5 rounded-[20px] text-[#3B2211]/40 hover:text-[#3B2211] hover:shadow-xl transition-all active:scale-90"
           >
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
           </button>

           <button 
            onClick={() => {
              setEditingProduct(null);
              setFormData({ name: "", sku: "", price: "", category: "Layanan", isActive: true, stock: "0", image: "" });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-4 px-8 py-5 bg-[#3B2211] !text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#3B2211]/20 hover:scale-105 active:scale-95 transition-all select-none"
          >
            <Plus size={20} />
            Tambah Produk Baru
          </button>
        </motion.div>
      </div>

      {/* ── Control Bar ── */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 relative z-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3B2211]/20 group-focus-within:text-[#3B2211] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari produk, kategori, atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white border border-[#3B2211]/5 rounded-[28px] text-sm focus:outline-none focus:ring-4 focus:ring-[#3B2211]/2 shadow-2xl shadow-[#3B2211]/5 transition-all"
          />
        </div>
        
        <div className="flex bg-white p-2 rounded-[24px] border border-[#3B2211]/5 shadow-xl shadow-[#3B2211]/5">
           {["Semua", "Layanan", "Produk", "Paket"].map(cat => (
             <button 
              key={cat}
              onClick={() => setSearch(cat === "Semua" ? "" : cat)}
              className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
                (search === cat || (cat === "Semua" && search === "")) 
                ? "bg-[#3B2211] !text-white shadow-lg shadow-[#3B2211]/20" 
                : "text-[#3B2211]/40 hover:text-[#3B2211]"
              }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {/* ── Product Matrix ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-white/60 animate-pulse rounded-[40px] border border-white shadow-xl" />
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-8 rounded-[48px] border border-white shadow-2xl shadow-[#3B2211]/5 hover:shadow-[#3B2211]/15 transition-all duration-700 group relative overflow-hidden flex flex-col justify-between"
              >
                {/* Status Badge */}
                <div className={`absolute top-8 right-8 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                  p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {p.isActive ? 'Tersedia' : 'Dinonaktifkan'}
                </div>

                <div className="space-y-6">
                   <div className="w-full aspect-square bg-[#FAFAF8] rounded-[36px] flex items-center justify-center border border-[#3B2211]/2 overflow-hidden group-hover:scale-105 transition-transform duration-700">
                     {p.image ? (
                       <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                     ) : (
                       <div className="flex flex-col items-center gap-3 text-[#3B2211]/10">
                         <Package size={48} strokeWidth={1} />
                         <span className="text-[8px] font-black uppercase tracking-widest">No Image</span>
                       </div>
                     )}
                   </div>
                   
                   <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-[#3B2211]/30 uppercase tracking-[0.2em]">
                            {typeof p.category === 'string' ? p.category : p.category?.name || "Umum"}
                          </span>
                          <div className="h-px flex-1 bg-[#3B2211]/5" />
                       </div>
                      <h3 className="text-xl font-bold text-[#3B2211] leading-tight line-clamp-2">{p.name}</h3>
                      <p className="text-2xl font-black text-[#3B2211]" style={{ fontFamily: "var(--font-playfair)" }}>
                        Rp {p.price.toLocaleString('id-ID')}
                      </p>
                   </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[#3B2211]/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-[10px] font-bold text-[#3B2211]/60">STOK: {p.stock}</span>
                   </div>
                   <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setEditingProduct(p);
                          setFormData({
                            name: p.name,
                            sku: p.sku || "",
                            price: p.price.toString(),
                            category: typeof p.category === 'string' ? p.category : p.category?.name || "Layanan",
                            isActive: p.isActive,
                            stock: p.stock.toString(),
                            image: p.image || ""
                          });
                          setIsModalOpen(true);
                        }}
                        className="w-11 h-11 flex items-center justify-center bg-white border border-[#3B2211]/5 text-[#3B2211]/30 hover:text-[#3B2211] hover:border-[#3B2211]/20 rounded-2xl transition-all shadow-xl shadow-black/5"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="w-11 h-11 flex items-center justify-center bg-rose-50 text-rose-300 hover:text-rose-600 border border-rose-100 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center space-y-8">
               <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center text-[#3B2211]/5 mx-auto border border-[#3B2211]/2 shadow-2xl shadow-[#3B2211]/5">
                 <Search size={64} strokeWidth={1} />
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-[#3B2211]">Produk tidak ditemukan</h3>
                  <p className="text-sm text-[#3B2211]/40 mt-2 tracking-widest uppercase font-black text-[10px]">Coba sesuaikan kata kunci atau filter Anda</p>
               </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#3B2211]/20 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-md bg-white rounded-[40px] shadow-5xl relative z-10 overflow-hidden border border-white"
            >
               <form onSubmit={handleSubmit} className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-[#3B2211]" style={{ fontFamily: "var(--font-playfair)" }}>
                        {editingProduct ? 'Modifikasi Produk' : 'Entri Produk Baru'}
                      </h2>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#3B2211]/30">Isi detail katalog dengan presisi</p>
                    </div>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-[#FAFAF8] hover:bg-[#3B2211] hover:text-white rounded-2xl text-[#3B2211]/30 transition-all">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-5">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
                          <Tag size={12} /> SKU Produk
                        </label>
                        <input 
                         type="text" 
                         value={formData.sku}
                         onChange={(e) => setFormData({...formData, sku: e.target.value})}
                         className="w-full px-8 py-5 bg-[#FAFAF8] border border-transparent focus:border-[#3B2211]/10 focus:bg-white rounded-[24px] text-sm font-bold outline-none transition-all shadow-inner" 
                         placeholder="SKU-12345"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
                          <Tag size={12} /> Nama Layanan/Produk
                        </label>
                        <input 
                         type="text" 
                         required
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="w-full px-8 py-5 bg-[#FAFAF8] border border-transparent focus:border-[#3B2211]/10 focus:bg-white rounded-[24px] text-sm font-bold outline-none transition-all shadow-inner" 
                         placeholder="Contoh: Studio Portrait Session"
                        />
                     </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] ml-2">Harga (Rp)</label>
                        <input 
                          type="number" 
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full px-6 py-4 bg-[#FAFAF8] border border-transparent focus:border-[#3B2211]/10 focus:bg-white rounded-[20px] text-sm font-bold outline-none transition-all shadow-inner" 
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] ml-2">Kategori</label>
                        <div className="relative group">
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full px-6 py-4 bg-[#FAFAF8] border border-transparent focus:border-[#3B2211]/10 focus:bg-white rounded-[20px] text-sm font-bold outline-none appearance-none cursor-pointer shadow-inner"
                          >
                            <option value="Layanan">Layanan</option>
                            <option value="Produk">Produk</option>
                            <option value="Paket">Paket</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#3B2211]/20 pointer-events-none" size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] ml-2">Stok Inventaris</label>
                        <input 
                          type="number" 
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          className="w-full px-6 py-4 bg-[#FAFAF8] border border-transparent focus:border-[#3B2211]/10 focus:bg-white rounded-[20px] text-sm font-bold outline-none transition-all shadow-inner" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] ml-2">Status Ketersediaan</label>
                        <div className="relative group">
                          <select 
                            value={formData.isActive ? "Tersedia" : "Kosong"}
                            onChange={(e) => setFormData({...formData, isActive: e.target.value === "Tersedia"})}
                            className="w-full px-6 py-4 bg-[#FAFAF8] border border-transparent focus:border-[#3B2211]/10 focus:bg-white rounded-[20px] text-sm font-bold outline-none appearance-none cursor-pointer shadow-inner"
                          >
                            <option value="Tersedia">Tersedia</option>
                            <option value="Kosong">Nonaktif</option>
                          </select>
                          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#3B2211]/20 pointer-events-none" size={18} />
                        </div>
                      </div>
                    </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
                          <ImageIcon size={12} /> URL Gambar Katalog
                        </label>
                        <input 
                         type="text" 
                         value={formData.image}
                         onChange={(e) => setFormData({...formData, image: e.target.value})}
                         className="w-full px-6 py-4 bg-[#FAFAF8] border border-transparent focus:border-[#3B2211]/10 focus:bg-white rounded-[20px] text-sm font-bold outline-none transition-all shadow-inner" 
                         placeholder="https://images.unsplash.com/..."
                        />
                     </div>

                    <button 
                      type="submit"
                      className="w-full py-5 bg-[#3B2211] !text-white rounded-[22px] font-black text-[11px] uppercase tracking-[0.3em] shadow-3xl shadow-[#3B2211]/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 select-none"
                    >
                      {editingProduct ? 'Perbarui Katalog' : 'Simpan Produk Baru'}
                    </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
