"use client";

import React, { useState } from "react";
import { X, CreditCard, Banknote, QrCode, CheckCircle2, Printer, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { getWhatsAppUrl } from "@/lib/whatsapp";

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
    
    const transactionId = "TRX-" + Math.random().toString(36).substring(7).toUpperCase();
    
    // Generate WA URL
    const waUrl = getWhatsAppUrl("checkout", {
      id: transactionId,
      total,
      method: paymentMethod,
      items: items
    });

    setTimeout(() => {
      setLoading(false);
      window.open(waUrl, "_blank");
      onSuccess(transactionId);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white border border-[#E0E0DA] rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-[#E0E0DA] flex items-center justify-between bg-[#FAFAF8]">
          <h2 className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-playfair)" }}>Selesaikan Pembayaran</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F0EFE9] rounded-full transition-colors text-[#888888]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-10 space-y-10">
          {/* Summary */}
          <div className="bg-[#F0EFE9] rounded-3xl p-8 border border-[#E0E0DA] flex justify-between items-center shadow-inner">
            <div>
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-[0.2em]">Total yang harus dibayar</p>
              <h3 className="text-4xl font-bold mt-2 text-[#1A1A1A]">Rp {total.toLocaleString("id-ID")}</h3>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold text-[#888888] uppercase tracking-[0.2em] ml-1">Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: "CASH", label: "Tunai", icon: Banknote },
                { id: "TRANSFER", label: "Transfer", icon: CreditCard },
                { id: "QRIS", label: "QRIS", icon: QrCode },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex flex-col items-center justify-center gap-4 p-6 rounded-[24px] border transition-all ${
                    paymentMethod === method.id 
                    ? "bg-[#3B2211] border-[#3B2211] shadow-xl shadow-black/10 !text-white translate-y-[-4px]" 
                    : "bg-white border-[#E0E0DA] text-[#888888] hover:bg-[#F0EFE9] hover:text-[#3B2211]"
                  }`}
                >
                  <method.icon className="w-8 h-8" />
                  <span className="text-xs font-bold">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-[#3B2211] hover:bg-[#4d2d16] py-6 rounded-[24px] font-bold !text-white shadow-xl shadow-black/5 flex items-center justify-center gap-3 group transition-all"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg">Konfirmasi via WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

