"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  User, 
  Phone, 
  Ticket,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  ShoppingCart,
  Calendar,
  Clock
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import CheckoutModal from "./CheckoutModal";
import { validateReferral } from "@/app/actions/referrals";

export default function Cart() {
  const { 
    items, 
    removeItem, 
    updateQty, 
    clearCart, 
    customerName, 
    customerPhone, 
    bookingDate,
    bookingTime,
    setCustomerInfo,
    referralCode, 
    setReferral 
  } = useCartStore();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckingReferral, setIsCheckingReferral] = useState(false);
  const [referralMessage, setReferralMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleCheckReferral = async () => {
    if (!referralCode) return;
    setIsCheckingReferral(true);
    setReferralMessage(null);
    
    try {
      const res = await validateReferral(referralCode);
      if (res.success && res.data) {
        let disc = 0;
        if (res.data.type === "PERCENTAGE") {
          disc = Math.floor(subtotal * (res.data.value / 100));
        } else {
          disc = res.data.value;
        }
        setDiscountAmount(disc);
        setReferral(res.data.code, res.data.value, res.data.type as any);
        setReferralMessage({ type: "success", text: `Diskon Rp ${disc.toLocaleString()} berhasil dipasang` });
      } else {
        setDiscountAmount(0);
        setReferral(null, 0);
        setReferralMessage({ type: "error", text: res.error || "Kode tidak valid" });
      }
    } catch (err) {
      setReferralMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setIsCheckingReferral(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100">
      {/* Header Keranjang */}
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#3B2211]">
            <ShoppingCart size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Pesanan</h2>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{items.length} Item terpilih</p>
          </div>
        </div>
        {items.length > 0 && (
          <button 
            onClick={clearCart}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Kosongkan Keranjang"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* List Item */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {items.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                  <span className="text-xs font-black text-[#3B2211]">{item.name.slice(0, 1)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                  <p className="text-xs font-black text-[#3B2211]">Rp {item.price.toLocaleString('id-ID')}</p>
                </div>

                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-1">
                  <button 
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#3B2211] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-[#3B2211]">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-[#3B2211] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 py-20">
             <ShoppingCart size={48} />
             <p className="text-sm font-bold">Keranjang Kosong</p>
          </div>
        )}
      </div>

      {/* Input Pelanggan & Promo */}
      <div className="p-6 border-t border-gray-50 bg-gray-50/50 space-y-3 shrink-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Informasi Pelanggan</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Pelanggan"
              value={customerName}
              onChange={(e) => setCustomerInfo({ customerName: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3B2211]/5"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="No. HP"
              value={customerPhone}
              onChange={(e) => setCustomerInfo({ customerPhone: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3B2211]/5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="date" 
              value={bookingDate}
              onChange={(e) => setCustomerInfo({ bookingDate: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3B2211]/5"
            />
          </div>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="time" 
              value={bookingTime}
              onChange={(e) => setCustomerInfo({ bookingTime: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3B2211]/5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Kode Promo / Referral"
                value={referralCode || ""}
                onChange={(e) => setReferral(e.target.value, 0)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#3B2211]/5"
              />
            </div>
            <button 
              onClick={handleCheckReferral}
              disabled={isCheckingReferral || !referralCode}
              className="px-4 bg-[#3B2211] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
            >
              Cek
            </button>
          </div>
          {referralMessage && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold ${referralMessage.type === "success" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
              {referralMessage.type === "success" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {referralMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* Ringkasan & Tombol Bayar */}
      <div className="p-6 border-t border-gray-100 bg-white shrink-0">
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-green-600">
              <span>Diskon</span>
              <span className="font-bold">- Rp {discountAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-50">
            <span className="text-sm font-bold text-gray-900">Total Akhir</span>
            <span className="text-xl font-black text-[#3B2211]">Rp {finalTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <button 
          onClick={() => setIsCheckoutOpen(true)}
          disabled={items.length === 0}
          className="w-full py-4 bg-[#3B2211] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#3B2211]/10 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
        >
          <CreditCard size={18} />
          Bayar Sekarang
        </button>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        discount={discountAmount}
      />
    </div>
  );
}
