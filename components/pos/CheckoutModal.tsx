"use client";

import React, { useState } from "react";
import { X, CreditCard, Banknote, QrCode, CheckCircle2, Printer, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
}

export default function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { items, referralCode, discount, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER" | "QRIS">("CASH");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.11;
  const totalDiscount = (subtotal * discount) / 100;
  const total = subtotal + tax - totalDiscount;

  const handleConfirm = async () => {
    setLoading(true);
    // Mock API Call
    setTimeout(() => {
      setLoading(false);
      onSuccess("TRX-" + Math.random().toString(36).substring(7).toUpperCase());
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Summary */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Total Payable</p>
              <h3 className="text-3xl font-bold mt-1">Rp {total.toLocaleString("id-ID")}</h3>
            </div>
            <div className="text-right text-xs text-white/40 space-y-1">
              <p>Items: {items.length}</p>
              <p>Tax Incl.</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Select Payment Method</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "CASH", label: "Cash", icon: Banknote },
                { id: "TRANSFER", label: "Transfer", icon: CreditCard },
                { id: "QRIS", label: "QRIS", icon: QrCode },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                    paymentMethod === method.id 
                    ? "bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/10 text-purple-400" 
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  }`}
                >
                  <method.icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-4 rounded-2xl font-bold text-white shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 group transition-all"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Finalize Transaction</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
