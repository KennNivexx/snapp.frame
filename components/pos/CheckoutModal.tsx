"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Smartphone,
  Sparkles,
  ReceiptText
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { saveTransaction } from "@/app/actions/transactions";
import Receipt from "./Receipt";

const paymentMethods = [
  {
    id: "Tunai",
    label: "Tunai / Cash",
    desc: "Bayar langsung di kasir",
    icon: Banknote,
    accent: "#10B981",
    bg: "bg-emerald-50",
    text: "text-emerald-600"
  },
  {
    id: "QRIS",
    label: "QRIS / E-Wallet",
    desc: "GoPay, OVO, Dana, Shopee",
    icon: Smartphone,
    accent: "#3B82F6",
    bg: "bg-blue-50",
    text: "text-blue-600"
  },
  {
    id: "Transfer",
    label: "Transfer Bank",
    desc: "BCA, BRI, Mandiri, BNI",
    icon: CreditCard,
    accent: "#8B5CF6",
    bg: "bg-violet-50",
    text: "text-violet-600"
  },
];

export default function CheckoutModal({
  isOpen,
  onClose,
  discount,
}: {
  isOpen: boolean;
  onClose: () => void;
  discount: number;
}) {
  const {
    items,
    clearCart,
    customerName,
    customerPhone,
    bookingDate,
    bookingTime,
    referralCode,
  } = useCartStore();

  const [method, setMethod] = useState("Tunai");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const finalTotal = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    setIsProcessing(true);
    const methodMap: Record<string, "CASH" | "QRIS" | "TRANSFER"> = {
      Tunai: "CASH",
      QRIS: "QRIS",
      Transfer: "TRANSFER",
    };
    const inv = `INV-${Date.now().toString().slice(-8)}`;

    try {
      const res = await saveTransaction({
        invoiceNumber: inv,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        paymentMethod: methodMap[method] || "CASH",
        referralCode,
        total: finalTotal,
        discount,
        tax: 0,
        customerName,
        customerPhone,
        bookingDate,
        bookingTime,
      });

      if (res.success) {
        setInvoiceNumber(inv);
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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isSuccess ? onClose : undefined}
          className="absolute inset-0 bg-[#1A110B]/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="w-full max-w-md bg-white rounded-[32px] shadow-2xl relative z-10 overflow-hidden border border-white/20"
        >
          <AnimatePresence mode="wait">
            {/* ── SUCCESS STATE ── */}
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 text-center space-y-7"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-white shadow-2xl flex items-center justify-center">
                      <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#C88A58] rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles size={14} className="text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black text-[#3B2211]" style={{ fontFamily: "var(--font-playfair)" }}>
                    Pembayaran Berhasil!
                  </h2>
                  <p className="text-[11px] font-medium text-gray-400">
                    Transaksi berhasil dicatat ke sistem Sneapici Studio.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-[#FAFAF8] rounded-2xl border border-[#3B2211]/5 p-5 space-y-3 text-left">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400 font-medium">No. Invoice</span>
                    <span className="font-black text-[#3B2211] font-mono">{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400 font-medium">Pelanggan</span>
                    <span className="font-bold text-[#3B2211]">{customerName || "Pelanggan Umum"}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400 font-medium">Metode Bayar</span>
                    <span className="font-bold text-[#3B2211]">{method}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400 font-medium">Diskon</span>
                      <span className="font-bold text-emerald-600">- Rp {discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-[#3B2211]/5">
                    <span className="text-[11px] font-black text-[#3B2211] uppercase tracking-widest">Total Akhir</span>
                    <span className="text-xl font-black text-[#3B2211]">Rp {finalTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
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
                    className="flex-1 py-4 bg-[#3B2211] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] shadow-xl shadow-[#3B2211]/20 hover:bg-[#C88A58] transition-all"
                  >
                    Selesai
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── PAYMENT SELECTION STATE ── */
              <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-[#3B2211]/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3B2211] flex items-center justify-center shadow-lg shadow-[#3B2211]/20">
                      <ReceiptText size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#3B2211]">Konfirmasi Bayar</h2>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        {items.length} item · Sneapici Studio
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl bg-[#FAFAF8] border border-[#3B2211]/5 flex items-center justify-center text-[#3B2211]/30 hover:text-[#3B2211] hover:bg-[#F0EDE9] transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  {/* Total Banner */}
                  <div className="bg-[#1A110B] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-[#1A110B]/30">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88A58]/10 blur-[40px] rounded-full -mr-10 -mt-10" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Total Tagihan</p>
                    <p className="text-4xl font-black tracking-tight">
                      Rp {finalTotal.toLocaleString("id-ID")}
                    </p>
                    {discount > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">
                          Subtotal Rp {subtotal.toLocaleString("id-ID")} •
                        </span>
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                          Hemat Rp {discount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <p className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.25em] ml-1">
                      Pilih Metode Pembayaran
                    </p>
                    <div className="space-y-2.5">
                      {paymentMethods.map((pm) => (
                        <button
                          key={pm.id}
                          onClick={() => setMethod(pm.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            method === pm.id
                              ? "bg-[#3B2211]/[0.03] border-[#3B2211]/20 shadow-sm"
                              : "bg-white border-[#3B2211]/5 hover:border-[#3B2211]/10 hover:bg-[#FAFAF8]"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                                method === pm.id ? "bg-[#3B2211] shadow-lg shadow-[#3B2211]/20" : pm.bg
                              }`}
                            >
                              <pm.icon
                                size={20}
                                className={method === pm.id ? "text-white" : pm.text}
                              />
                            </div>
                            <div className="text-left">
                              <p className={`text-sm font-bold ${method === pm.id ? "text-[#3B2211]" : "text-[#3B2211]/70"}`}>
                                {pm.label}
                              </p>
                              <p className="text-[9px] font-medium text-gray-400 mt-0.5">{pm.desc}</p>
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              method === pm.id ? "border-[#3B2211] bg-[#3B2211]" : "border-gray-200"
                            }`}
                          >
                            {method === pm.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2 h-2 bg-white rounded-full"
                              />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-4 bg-[#3B2211] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-[#3B2211]/20 flex items-center justify-center gap-3 hover:bg-[#C88A58] hover:shadow-[#C88A58]/20 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Konfirmasi & Bayar
                        <ChevronRight size={16} className="ml-auto" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
