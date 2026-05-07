"use client";

import React, { useState, useRef } from "react";
import { Trash2, Minus, Plus, Ticket, ArrowRight, X, Printer } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import CheckoutModal from "./CheckoutModal";
import { Receipt } from "./Receipt";
import { useReactToPrint } from "react-to-print";

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

  const handleApplyPromo = () => {
    // Mock validation
    if (promoInput.toUpperCase() === "SNAPP10") {
      setReferral("SNAPP10", 10);
      setPromoInput("");
    } else {
      alert("Invalid Promo Code");
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 border-l border-white/10 backdrop-blur-3xl w-[400px] hidden lg:flex">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Ticket className="w-5 h-5 text-purple-400" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-purple-600 text-[10px] flex items-center justify-center rounded-full font-bold">
                {items.length}
              </span>
            )}
          </div>
          <h2 className="font-bold text-lg">Current Order</h2>
        </div>
        <button 
          onClick={clearCart}
          className="text-xs text-white/30 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
        >
          Clear
        </button>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 rotate-45" />
            </div>
            <p className="text-sm font-medium">Your cart is empty.<br/>Add some products to start.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center group">
              <div className="w-16 h-16 bg-white/5 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10">
                    <Plus className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{item.name}</h4>
                <p className="text-xs text-white/40 mb-2">Rp {item.price.toLocaleString("id-ID")}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-1">
                    <button 
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">Rp {(item.price * item.qty).toLocaleString("id-ID")}</p>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="p-6 bg-white/5 border-t border-white/10 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Promo Code"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
            />
          </div>
          <button 
            onClick={handleApplyPromo}
            className="px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold hover:bg-purple-600/30 transition-all"
          >
            Apply
          </button>
        </div>

        {referralCode && (
          <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-3">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-green-400">Code applied: {referralCode}</span>
             </div>
             <button onClick={() => setReferral(null, 0)}>
                <X className="w-3 h-3 text-green-400/50 hover:text-green-400" />
             </button>
          </div>
        )}

        <div className="space-y-2 border-b border-white/5 pb-4">
          <div className="flex justify-between text-xs text-white/50">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-xs text-white/50">
            <span>Tax (11%)</span>
            <span>Rp {tax.toLocaleString("id-ID")}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs text-green-400 font-medium">
              <span>Discount ({discount}%)</span>
              <span>- Rp {totalDiscount.toLocaleString("id-ID")}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="font-medium text-white/60">Total Amount</span>
          <span className="text-2xl font-bold text-white">Rp {total.toLocaleString("id-ID")}</span>
        </div>

        <button 
          onClick={() => setIsCheckoutOpen(true)}
          disabled={items.length === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:grayscale py-4 rounded-2xl font-bold text-white shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 group transition-all"
        >
          <span>Confirm Checkout</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
