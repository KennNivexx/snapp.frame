"use client";

import React, { useState, useRef } from "react";
import { Trash2, Minus, Plus, Ticket, ArrowRight, X, Printer } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import CheckoutModal from "./CheckoutModal";
import { Receipt } from "./Receipt";
import { useReactToPrint } from "react-to-print";
import { motion } from "framer-motion";

export default function Cart() {
  const { items, removeItem, updateQty, referralCode, discount, setReferral, clearCart } = useCartStore();
  const [promoInput, setPromoInput] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: "Receipt",
  });

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.11;
  const totalDiscount = (subtotal * discount) / 100;
  const total = subtotal + tax - totalDiscount;

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    
    try {
      const res = await fetch(`/api/referrals/validate?code=${promoInput.toUpperCase()}`);
      if (res.ok) {
        const data = await res.json();
        setReferral(data.code, data.value);
        setPromoInput("");
      } else {
        alert("Kode promo tidak valid atau sudah kadaluarsa");
      }
    } catch (err) {
      alert("Gagal memvalidasi kode promo");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-[#E0E0DA] w-[400px] hidden lg:flex shadow-2xl">
      <div className="p-8 border-b border-[#E0E0DA] flex items-center justify-between bg-[#FAFAF8]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Ticket className="w-5 h-5 text-[#1A1A1A]" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#1A1A1A] text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {items.length}
              </span>
            )}
          </div>
          <h2 className="font-bold text-lg text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>Current Order</h2>
        </div>
        <button 
          onClick={clearCart}
          className="text-[10px] text-[#888888] hover:text-red-500 transition-colors uppercase tracking-[0.2em] font-bold"
        >
          Clear
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-[#E0E0DA]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 bg-[#F0EFE9] rounded-3xl flex items-center justify-center">
              <Plus className="w-8 h-8 rotate-45 text-[#888888]" />
            </div>
            <p className="text-sm font-bold text-[#5A5A5A]">Keranjang masih kosong.<br/>Pilih produk untuk memulai.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center group">
              <div className="w-20 h-20 bg-[#F0EFE9] rounded-2xl overflow-hidden border border-[#E0E0DA] flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#888888]">
                    <Plus className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#1A1A1A] truncate">{item.name}</h4>
                <p className="text-xs font-bold text-[#5A5A5A] mb-3">Rp {item.price.toLocaleString("id-ID")}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#F0EFE9] rounded-xl border border-[#E0E0DA] p-1">
                    <button 
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all text-[#1A1A1A]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-[#1A1A1A]">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all text-[#1A1A1A]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1A1A1A]">Rp {(item.price * item.qty).toLocaleString("id-ID")}</p>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-[#888888] hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="p-8 bg-[#FAFAF8] border-t border-[#E0E0DA] space-y-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input 
              type="text" 
              placeholder="KODE PROMO"
              className="w-full bg-white border border-[#E0E0DA] rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] transition-all placeholder:text-[#C0C0BB]"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            />
          </div>
          <button 
            onClick={handleApplyPromo}
            className="px-6 py-2 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold hover:bg-[#333333] transition-all shadow-md"
          >
            Apply
          </button>
        </div>

        {referralCode && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl p-4"
          >
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-green-700">Promo Berhasil: {referralCode}</span>
             </div>
             <button onClick={() => setReferral(null, 0)}>
                <X className="w-4 h-4 text-green-700/50 hover:text-green-700" />
             </button>
          </motion.div>
        )}

        <div className="space-y-3 border-b border-[#E0E0DA] pb-6">
          <div className="flex justify-between text-xs font-bold text-[#5A5A5A]">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-[#5A5A5A]">
            <span>Pajak (11%)</span>
            <span>Rp {tax.toLocaleString("id-ID")}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs font-bold text-green-600">
              <span>Diskon ({discount}%)</span>
              <span>- Rp {totalDiscount.toLocaleString("id-ID")}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="font-bold text-[#5A5A5A] uppercase text-[10px] tracking-widest">Total Bayar</span>
          <span className="text-3xl font-bold text-[#1A1A1A]">Rp {total.toLocaleString("id-ID")}</span>
        </div>

        <button 
          onClick={() => setIsCheckoutOpen(true)}
          disabled={items.length === 0}
          className="w-full bg-[#1A1A1A] hover:bg-[#333333] disabled:opacity-30 disabled:grayscale py-5 rounded-2xl font-bold text-white shadow-xl shadow-black/5 flex items-center justify-center gap-3 group transition-all"
        >
          <span>Konfirmasi Pembayaran</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>


      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(id) => {
          setLastTransaction({
            id,
            items: [...items],
            subtotal,
            tax,
            discount: totalDiscount,
            total,
            paymentMethod: "CASH" // Default or passed from modal
          });
          setIsCheckoutOpen(false);
          // Wait for state update then print
          setTimeout(() => handlePrint(), 500);
          clearCart();
        }}
      />

      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        {lastTransaction && (
          <Receipt 
            ref={receiptRef}
            transactionId={lastTransaction.id}
            items={lastTransaction.items}
            subtotal={lastTransaction.subtotal}
            tax={lastTransaction.tax}
            discount={lastTransaction.discount}
            total={lastTransaction.total}
            paymentMethod={lastTransaction.paymentMethod}
          />
        )}
      </div>
    </div>
  );
}
