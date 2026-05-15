"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Smartphone,
  Sparkles,
  ReceiptText,
  User,
  Phone,
  Calendar,
  Clock,
  Tag,
  AlertCircle
} from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { saveTransaction } from "@/app/actions/transactions";
import { validateReferral } from "@/app/actions/referrals";
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
    label: "QRIS",
    desc: "Scan QR Code",
    icon: Smartphone,
    accent: "#3B82F6",
    bg: "bg-blue-50",
    text: "text-blue-600"
  },
  {
    id: "E-Wallet",
    label: "E-Wallet",
    desc: "GoPay, OVO, Dana, ShopeePay",
    icon: Smartphone,
    accent: "#F59E0B",
    bg: "bg-amber-50",
    text: "text-amber-600"
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
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    items,
    clearCart,
    customerName,
    customerPhone,
    bookingDate,
    bookingTime,
    referralCode,
    setCustomerInfo,
    setReferral
  } = useCartStore();

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (scrollContainer) scrollContainer.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      if (scrollContainer) scrollContainer.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "unset";
      if (scrollContainer) scrollContainer.style.overflow = "auto";
    };
  }, [isOpen]);

  const [method, setMethod] = useState("Tunai");
  const [paymentRef, setPaymentRef] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [isCheckingReferral, setIsCheckingReferral] = useState(false);
  const [referralMessage, setReferralMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);

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
        setDiscount(disc);
        setReferral(res.data.code, res.data.value, res.data.type as any);
        setReferralMessage({ type: "success", text: `Diskon Rp ${disc.toLocaleString()} berhasil diterapkan` });
      } else {
        setDiscount(0);
        setReferral(null, 0);
        setReferralMessage({ type: "error", text: res.error || "Kode tidak valid atau kadaluarsa" });
      }
    } catch {
      setReferralMessage({ type: "error", text: "Terjadi kesalahan sistem" });
    } finally {
      setIsCheckingReferral(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - discount);

  const handleCheckout = async () => {
    setIsProcessing(true);
    const methodMap: Record<string, "CASH" | "QRIS" | "TRANSFER" | "EWALLET"> = {
      Tunai: "CASH",
      QRIS: "QRIS",
      "E-Wallet": "EWALLET",
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
        paymentRef,
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
          className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl relative z-10 border border-white/20 max-h-[95vh] overflow-y-auto custom-scrollbar flex flex-col"
        >
          <AnimatePresence mode="wait">
            {/* ── SUCCESS STATE ── */}
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 md:p-8 text-center space-y-4"
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-white shadow-xl flex items-center justify-center">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#C88A58] rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles size={12} className="text-white" />
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-[#3B2211]" style={{ fontFamily: "var(--font-playfair)" }}>
                    {method === "QRIS" ? "Scan QRIS" : "Pembayaran Berhasil!"}
                  </h2>
                  <p className="text-[10px] font-medium text-gray-400">
                    {method === "QRIS" 
                      ? "Silakan scan QR code berikut menggunakan aplikasi E-Wallet atau M-Banking Anda." 
                      : "Transaksi berhasil dicatat ke sistem Sneapici Studio."}
                  </p>
                </div>

                {/* QRIS Code Display */}
                {method === "QRIS" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="mx-auto w-36 h-36 bg-white p-2.5 rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-50 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=QRIS_PAYMENT_${invoiceNumber}_AMOUNT_${finalTotal}`} 
                      alt="QRIS Code" 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </motion.div>
                )}

                {/* Summary Card */}
                <div className="bg-[#FAFAF8] rounded-2xl border border-[#3B2211]/5 p-4 space-y-2.5 text-left">
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
                  <div className="flex justify-between items-center pt-2.5 border-t border-[#3B2211]/5 mt-1">
                    <span className="text-[11px] font-black text-[#3B2211] uppercase tracking-widest">Total Akhir</span>
                    <span className="text-lg font-black text-[#3B2211]">Rp {finalTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
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
                    className="flex-1 py-3.5 bg-[#3B2211] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] shadow-lg shadow-[#3B2211]/20 hover:bg-[#C88A58] transition-all"
                  >
                    Selesai
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── PAYMENT SELECTION STATE ── */
              <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#3B2211]/5">
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

                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                  
                  {/* Informasi Sesi */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.25em] ml-1">
                      Informasi Sesi
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B2211]/25" size={13} />
                        <input
                          type="text"
                          placeholder="Nama pelanggan"
                          value={customerName}
                          onChange={(e) => setCustomerInfo({ customerName: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-[#FAFAF8] border border-[#3B2211]/8 rounded-xl text-[11px] font-medium text-[#3B2211] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C88A58]/20 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B2211]/25" size={13} />
                        <input
                          type="text"
                          placeholder="No. HP"
                          value={customerPhone}
                          onChange={(e) => setCustomerInfo({ customerPhone: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-[#FAFAF8] border border-[#3B2211]/8 rounded-xl text-[11px] font-medium text-[#3B2211] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C88A58]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B2211]/25" size={13} />
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setCustomerInfo({ bookingDate: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-[#FAFAF8] border border-[#3B2211]/8 rounded-xl text-[11px] font-medium text-[#3B2211] focus:outline-none focus:ring-2 focus:ring-[#C88A58]/20 transition-all"
                        />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B2211]/25" size={13} />
                        <input
                          type="time"
                          value={bookingTime}
                          onChange={(e) => setCustomerInfo({ bookingTime: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-[#FAFAF8] border border-[#3B2211]/8 rounded-xl text-[11px] font-medium text-[#3B2211] focus:outline-none focus:ring-2 focus:ring-[#C88A58]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3B2211]/25" size={13} />
                          <input
                            type="text"
                            placeholder="Kode promo / referral"
                            value={referralCode || ""}
                            onChange={(e) => setReferral(e.target.value, 0)}
                            className="w-full pl-9 pr-3 py-2 bg-[#FAFAF8] border border-[#3B2211]/8 rounded-xl text-[11px] font-medium text-[#3B2211] placeholder:text-gray-300 uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C88A58]/20 transition-all"
                          />
                        </div>
                        <button
                          onClick={handleCheckReferral}
                          disabled={isCheckingReferral || !referralCode}
                          className="px-4 py-2 bg-[#3B2211] text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-40 hover:bg-[#C88A58] active:scale-[0.97] transition-all"
                        >
                          {isCheckingReferral ? "..." : "Cek"}
                        </button>
                      </div>
                      <AnimatePresence>
                        {referralMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border ${
                              referralMessage.type === "success"
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-red-50 text-red-600 border-red-100"
                            }`}
                          >
                            {referralMessage.type === "success" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {referralMessage.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Total Banner */}
                  <div className="bg-[#1A110B] rounded-2xl p-5 text-white relative overflow-hidden shadow-xl shadow-[#1A110B]/30">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C88A58]/10 blur-[40px] rounded-full -mr-10 -mt-10" />
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Total Tagihan</p>
                    <p className="text-3xl font-black tracking-tight">
                      Rp {finalTotal.toLocaleString("id-ID")}
                    </p>
                    {discount > 0 && (
                      <div className="mt-2 flex items-center gap-2">
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
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.25em] ml-1">
                      Pilih Metode Pembayaran
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((pm) => (
                        <button
                          key={pm.id}
                          onClick={() => setMethod(pm.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                            method === pm.id
                              ? "bg-[#3B2211]/[0.03] border-[#3B2211]/20 shadow-sm"
                              : "bg-white border-[#3B2211]/5 hover:border-[#3B2211]/10 hover:bg-[#FAFAF8]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                                method === pm.id ? "bg-[#3B2211] shadow-md shadow-[#3B2211]/20" : pm.bg
                              }`}
                            >
                              <pm.icon
                                size={16}
                                className={method === pm.id ? "text-white" : pm.text}
                              />
                            </div>
                            <div className="text-left">
                              <p className={`text-[11px] font-bold ${method === pm.id ? "text-[#3B2211]" : "text-[#3B2211]/70"}`}>
                                {pm.label}
                              </p>
                              <p className="text-[8px] font-medium text-gray-400 line-clamp-1">{pm.desc}</p>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                              method === pm.id ? "border-[#3B2211] bg-[#3B2211]" : "border-gray-200"
                            }`}
                          >
                            {method === pm.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-1.5 h-1.5 bg-white rounded-full"
                              />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {(method === "E-Wallet" || method === "Transfer") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 overflow-hidden"
                        >
                          <p className="text-[9px] font-black text-[#3B2211]/40 uppercase tracking-[0.25em] ml-1 mb-2">
                            {method === "E-Wallet" ? "Nomor Pembayaran" : "Nomor Rekening"}
                          </p>
                          <input
                            type="text"
                            placeholder={method === "E-Wallet" ? "Contoh: 081234567890" : "Contoh: 1234567890 (BCA)"}
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                            className="w-full px-3 py-2 bg-[#FAFAF8] border border-[#3B2211]/8 rounded-xl text-[11px] font-bold text-[#3B2211] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C88A58]/20 transition-all"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="relative w-full py-4 bg-[#3B2211] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-[#3B2211]/20 flex items-center justify-center hover:bg-[#C88A58] hover:shadow-[#C88A58]/20 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Memproses...
                      </span>
                    ) : (
                      <>
                        <span className="text-center">Konfirmasi & Bayar</span>
                        <ChevronRight size={16} className="absolute right-6" />
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
