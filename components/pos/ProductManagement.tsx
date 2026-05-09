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
  Check
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  status: string;
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
    price: "",
    category: "Layanan",
    status: "Tersedia",
    stock: "0",
    image_url: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("Product").select("*").order("name");
    if (!error) setProducts(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category,
      status: formData.status,
      stock: parseInt(formData.stock),
      image_url: formData.image_url || null
    };

    if (editingProduct) {
      await supabase.from("Product").update(payload).eq("id", editingProduct.id);
    } else {
      await supabase.from("Product").insert([payload]);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: "", price: "", category: "Layanan", status: "Tersedia", stock: "0", image_url: "" });
    fetchProducts();
  }

  const handleDelete = async (id: string) => {
    if (confirm("Hapus produk ini?")) {
      await supabase.from("Product").delete().eq("id", id);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Kontrol Atas */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3B2211]" size={18} />
          <input 
            type="text" 
            placeholder="Cari produk atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B2211]/10 focus:border-[#3B2211]"
          />
        </div>
        
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: "", price: "", category: "Layanan", status: "Tersedia", stock: "0", image_url: "" });
            setIsModalOpen(true);
          }}
          className="w-full md:w-auto px-6 py-3 bg-[#3B2211] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#3B2211]/10 hover:scale-[1.02] transition-all"
        >
          <Plus size={18} />
          Tambah Produk Baru
        </button>
      </div>

      {/* Grid Produk Manajemen */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-2xl" />
            ))
          ) : filteredProducts.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex gap-4">
                 <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                   {p.image_url ? (
                     <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                   ) : (
                     <Package size={24} className="text-gray-200" />
                   )}
                 </div>
                 
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-bold text-[#3B2211]/40 uppercase tracking-widest">{p.category}</span>
                       <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Tersedia' ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 truncate mb-1">{p.name}</h3>
                    <p className="text-sm font-black text-[#3B2211]">Rp {p.price.toLocaleString('id-ID')}</p>
                 </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Archive size={14} className="text-gray-300" />
                    <span className="text-xs font-bold text-gray-500">Stok: {p.stock}</span>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingProduct(p);
                        setFormData({
                          name: p.name,
                          price: p.price.toString(),
                          category: p.category,
                          status: p.status,
                          stock: p.stock.toString(),
                          image_url: p.image_url || ""
                        });
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-[#3B2211] hover:bg-gray-50 rounded-lg transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Input/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            >
               <form onSubmit={handleSubmit} className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nama Produk</label>
                       <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B2211]/10" 
                        placeholder="Contoh: Cetak Foto 4R"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Harga (Rp)</label>
                        <input 
                          type="number" 
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" 
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Kategori</label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none appearance-none"
                        >
                          <option value="Layanan">Layanan</option>
                          <option value="Produk">Produk</option>
                          <option value="Paket">Paket</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Stok</label>
                        <input 
                          type="number" 
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Status</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none appearance-none"
                        >
                          <option value="Tersedia">Tersedia</option>
                          <option value="Kosong">Kosong</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">URL Gambar (Opsional)</label>
                       <input 
                        type="text" 
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none" 
                        placeholder="https://..."
                       />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 bg-[#3B2211] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#3B2211]/10 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                    >
                      {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
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
