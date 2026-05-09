"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  CreditCard, 
  Wallet, 
  Banknote, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Printer,
  Smartphone
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import Receipt from "./Receipt";

const paymentMethods = [
  { id: "Tunai", label: "Tunai / Cash", icon: Banknote, color: "#10B981" },
  { id: "QRIS", label: "QRIS / E-Wallet", icon: Smartphone, color: "#3B82F6" },
  { id: "Transfer", label: "Transfer Bank", icon: CreditCard, color: "#6366F1" },
];

import { saveTransaction } from "@/app/actions/transactions";

export default function CheckoutModal({ isOpen, onClose, discount }: { isOpen: boolean, onClose: () => void, discount: number }) {
  const { items, clearCart, customerName, customerPhone, bookingDate, bookingTime, referralCode } = useCartStore();
  const [method, setMethod] = useState("Tunai");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const finalTotal = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Map payment method to database enum
    const methodMap: Record<string, "CASH" | "QRIS" | "TRANSFER"> = {
      "Tunai": "CASH",
      "QRIS": "QRIS",
      "Transfer": "TRANSFER"
    };

    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

    try {
      const res = await saveTransaction({
        invoiceNumber,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty
        })),
        paymentMethod: methodMap[method] || "CASH",
        referralCode: referralCode,
        total: finalTotal,
        discount: discount,
        tax: 0,
        customerName,
        customerPhone,
        bookingDate,
        bookingTime,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        alert("Gagal menyimpan transaksi: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem saat memproses pembayaran.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDone = () => {
    clearCart();
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl relative z-10 overflow-hidden"
        >
          {isSuccess ? (
            <div className="p-10 text-center space-y-8">
               <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center border-4 border-white shadow-xl">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </div>
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900">Pembayaran Berhasil!</h2>
                  <p className="text-sm text-gray-500 mt-2">Transaksi telah dicatat dan struk siap dicetak.</p>
               </div>

               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Pelanggan</span>
                    <span className="font-bold text-gray-900">{customerName || "Umum"}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Metode</span>
                    <span className="font-bold text-gray-900">{method}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-900">Total Akhir</span>
                    <span className="text-xl font-black text-[#3B2211]">Rp {finalTotal.toLocaleString('id-ID')}</span>
                  </div>
               </div>

               <div className="flex gap-4">
                  <Receipt 
                    customerName={customerName}
                    customerPhone={customerPhone}
                    items={items}
                    discount={discount}
                    total={finalTotal}
                    paymentMethod={method}
                  />
                  <button 
                    onClick={handleDone}
                    className="flex-1 py-4 bg-[#3B2211] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#3B2211]/10"
                  >
                    Selesai
                  </button>
               </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Pilih Pembayaran</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Total Summary */}
                <div className="bg-[#3B2211] p-6 rounded-2xl text-white shadow-xl shadow-[#3B2211]/20">
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tagihan Total</p>
                   <p className="text-3xl font-black mt-1">Rp {finalTotal.toLocaleString('id-ID')}</p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Metode Pembayaran</p>
                  <div className="grid grid-cols-1 gap-3">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setMethod(pm.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          method === pm.id 
                          ? "bg-[#3B2211]/5 border-[#3B2211] shadow-sm" 
                          : "bg-white border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: method === pm.id ? '#3B2211' : '#F9F9F9', color: method === pm.id ? 'white' : pm.color }}>
                            <pm.icon size={20} />
                          </div>
                          <span className={`text-sm font-bold ${method === pm.id ? 'text-[#3B2211]' : 'text-gray-600'}`}>{pm.label}</span>
                        </div>
                        {method === pm.id && <CheckCircle2 size={18} className="text-[#3B2211]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#3B2211] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#3B2211]/10 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? "Memproses..." : "Konfirmasi & Bayar"}
                  {!isProcessing && <ChevronRight size={18} />}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
