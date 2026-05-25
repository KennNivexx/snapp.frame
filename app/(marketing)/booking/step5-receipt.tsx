"use client";

import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { MessageCircle, Copy, Check, RotateCcw, AlertCircle, Loader2, CreditCard } from "lucide-react";
import { Package } from "@/data/packages";
import { formatPrice } from "@/lib/utils";
import { applyDiscount, ReferralCode } from "@/lib/referral";
import { BookingFormData } from "./step2-personal";
import { PaymentMethod } from "./step4-payment";
import { site } from "@/data/site";
import { btn } from "@/lib/button-classes";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { createBooking, getBookingStatus } from "@/app/actions/bookings";
import { toast } from "sonner";

/* ─── Helpers ─────────────────────────── */

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function generateInvoice(): string {
  const ts = Date.now().toString();
  return "SNF-" + ts.slice(-6);
}

/* ─── Removed Fake SVG & Bank List ─── */

/* ─── Main Component ─────────────────── */

interface Step5Props {
  pkg: Package;
  formData: BookingFormData;
  referral: ReferralCode | null;
  paymentMethod: PaymentMethod;
  onReset: () => void;
  siteSettings?: Record<string, string>;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function Step5Receipt({ pkg, formData, referral, paymentMethod, onReset, siteSettings = {} }: Step5Props) {
  const finalPrice = referral ? applyDiscount(pkg.price, referral.discountPct, referral.maxDiscountAmount) : pkg.price;
  const discount = pkg.price - finalPrice;
  const [invoice] = useState(generateInvoice);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [dbStatus, setDbStatus] = useState<string>("pending");
  const hasSaved = useRef(false);

  // Listen to realtime status updates from database with a robust polling fallback
  useEffect(() => {
    if (saveState !== "saved") return;

    // 1. Supabase Realtime Listener
    const supabase = createClient();
    const channel = supabase
      .channel(`booking-status-${invoice}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `invoice_no=eq.${invoice}`,
        },
        (payload) => {
          console.log("Realtime status update received:", payload.new);
          if (payload.new && payload.new.status) {
            setDbStatus(payload.new.status);
            if (payload.new.status === "confirmed" || payload.new.status === "completed") {
              setPaymentStatus("success");
            }
          }
        }
      )
      .subscribe();

    // 2. Database Polling Fallback (runs every 3 seconds to guarantee updates)
    const interval = setInterval(async () => {
      try {
        const res = await getBookingStatus(invoice);
        if (res.success && res.status) {
          console.log("Polled booking status:", res.status);
          setDbStatus(res.status);
          if (res.status === "confirmed" || res.status === "completed") {
            setPaymentStatus("success");
          }
        }
      } catch (err) {
        console.error("Error polling booking status:", err);
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [saveState, invoice]);

  // Environment variables Midtrans client
  const midtransClientKey = env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  const isProd = env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION;
  const snapSrc = isProd ? "https://app.midtrans.com/snap/snap.js" : "https://app.sandbox.midtrans.com/snap/snap.js";

  // Insert booking to database exactly once when Step 5 mounts
  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    async function saveBooking() {
      setSaveState("saving");
      try {
        const payload = {
          invoice_no: invoice,
          package_id: pkg.id,
          package_name: pkg.name,
          customer_name: formData.name,
          customer_phone: formData.whatsapp,
          session_date: formData.date,
          session_time: formData.time,
          notes: formData.notes || null,
          referral_code: referral?.code ?? null,
          discount_pct: referral?.discountPct ?? 0,
          original_price: pkg.price,
          final_price: finalPrice,
          payment_method: paymentMethod,
          status: "pending",
        };

        const result = await createBooking(payload);

        if (!result.success) {
          throw new Error(result.error);
        }

        setSaveState("saved");
      } catch (err: any) {
        console.error("[Snapp.frame] Booking save failed:", err);
        setSaveError(err.message || "Booking gagal disimpan ke database. Silakan konfirmasi manual via WhatsApp.");
        setSaveState("error");
      }
    }

    saveBooking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePayment() {
    setIsPaying(true);

    // Deteksi jika key Midtrans masih berupa placeholder / mockup
    const isMock = !midtransClientKey || midtransClientKey.includes("xxx") || midtransClientKey.includes("client-xxx");

    if (isMock) {
      console.log("✨ [Midtrans Mock Mode] Menjalankan simulasi pembayaran...");
      setTimeout(() => {
        setPaymentStatus("success");
        setIsPaying(false);
        alert("✨ [Simulasi] Pembayaran Berhasil! (Menggunakan Midtrans Mockup Mode karena Kunci Asli belum dikonfigurasi di env)");
      }, 1500);
      return;
    }

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: invoice,
          grossAmount: finalPrice,
          customerName: formData.name,
          customerPhone: formData.whatsapp,
          itemName: pkg.name,
          itemId: pkg.id,
          paymentGroup: paymentMethod === "qris" ? "qris" : "bank_transfer",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendapatkan token pembayaran");

      // @ts-expect-error snap is injected by midtrans script
      window.snap.pay(data.snapToken, {
        onSuccess: function (result: any) {
          setPaymentStatus("success");
          console.log("payment success!", result);
        },
        onPending: function (result: any) {
          setPaymentStatus("pending");
          console.log("wating your payment!", result);
        },
        onError: function (result: any) {
          setPaymentStatus("failed");
          console.log("payment failed!", result);
        },
        onClose: function () {
          setIsPaying(false);
          console.log("you closed the popup without finishing the payment");
        },
      });
    } catch (err: any) {
      console.error("[Midtrans] Payment processing error:", err);
      
      // Fallback interaktif jika fetch / koneksi ke Midtrans gagal
      const useSimulation = confirm(
        `Gagal terhubung ke layanan pembayaran digital (${err.message || "Koneksi Terputus"}).\n\nApakah Anda ingin mensimulasikan pembayaran berhasil (Lunas) untuk keperluan uji coba booking?`
      );
      
      if (useSimulation) {
        setPaymentStatus("success");
        alert("✨ Simulasi pembayaran lunas berhasil diaktifkan!");
      }
      setIsPaying(false);
    }
  }

  function buildWhatsAppMsg(): string {
    const date = formatDate(formData.date);
    const lines = [
      `Halo Snapp.frame Studio! 👋`,
      ``,
      `Saya sudah melakukan booking sesi foto dan ingin konfirmasi pembayaran.`,
      ``,
      `📋 *Detail Booking*`,
      `• Nama: ${formData.name}`,
      `• Paket: ${pkg.name}`,
      `• Tanggal: ${date}`,
      `• Jam: ${formData.time} WIB`,
      `• Durasi: ${pkg.duration}`,
      formData.notes ? `• Catatan: ${formData.notes}` : "",
      ``,
      `💳 *Pembayaran*`,
      `• Metode: ${paymentMethod === "qris" ? "QRIS" : "Transfer Bank"}`,
      referral ? `• Kode Referral: ${referral.code} (diskon ${referral.discountPct}%)` : "",
      referral ? `• Diskon: - ${formatPrice(discount)}` : "",
      `• Total: ${formatPrice(finalPrice)}`,
      ``,
      `🧾 No. Invoice: ${invoice}`,
      ``,
      `Mohon konfirmasi booking saya ya, terima kasih! 🙏`,
    ].filter(Boolean).join("\n");

    return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(lines)}`;
  }

  const dottedDivider = <div className="border-t border-dashed border-[#E0E0DA] my-4" />;

  return (
    <div>
      <Script src={snapSrc} data-client-key={midtransClientKey} strategy="lazyOnload" />

      <div className="mb-8 text-center">
        <div className={["w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500",
          saveState === "saving"
            ? "bg-[#E0E0DA]"
            : dbStatus === "confirmed" || dbStatus === "completed"
            ? "bg-emerald-500"
            : dbStatus === "cancelled"
            ? "bg-red-500"
            : "bg-amber-500"
        ].join(" ")}>
          {saveState === "saving" ? (
            <Loader2 size={24} className="text-[#888888] animate-spin" />
          ) : dbStatus === "confirmed" || dbStatus === "completed" ? (
            <Check size={26} className="text-white" />
          ) : (
            <AlertCircle size={26} className="text-white" />
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A] tracking-tight transition-all duration-300" style={{ fontFamily: "var(--font-heading)" }}>
          {saveState === "saving"
            ? "Menyimpan Booking..."
            : dbStatus === "confirmed"
            ? "Booking Dikonfirmasi!"
            : dbStatus === "completed"
            ? "Sesi Foto Selesai!"
            : dbStatus === "cancelled"
            ? "Booking Dibatalkan"
            : "Pesanan Menunggu Konfirmasi"}
        </h2>
        <p className="text-[#5A5A5A] text-sm mt-2 transition-all duration-300">
          {saveState === "saving"
            ? "Mohon tunggu sebentar."
            : dbStatus === "confirmed"
            ? "Pembayaran Anda telah diverifikasi. Sampai jumpa di studio sesuai jadwal!"
            : dbStatus === "completed"
            ? "Terima kasih telah melakukan pemotretan di Snapp.frame Studio."
            : dbStatus === "cancelled"
            ? "Booking Anda telah dibatalkan. Silakan hubungi admin jika ada pertanyaan."
            : "Selesaikan pembayaran dan konfirmasi via WhatsApp. Admin akan memverifikasi pesanan Anda."}
        </p>
        {saveState === "saved" && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-500 bg-amber-50 border-amber-200">
            {dbStatus === "confirmed" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-700">Pembayaran Dikonfirmasi</span>
              </>
            ) : dbStatus === "completed" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-blue-700">Sesi Selesai</span>
              </>
            ) : dbStatus === "cancelled" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-red-700">Dibatalkan</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-semibold text-amber-700">Menunggu Konfirmasi Admin</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error banner — non-blocking */}
      {saveState === "error" && (
        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl border border-red-200 bg-red-50 max-w-md mx-auto">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700">{saveError}</p>
            <button
              onClick={() => { hasSaved.current = false; setSaveState("idle"); }}
              className="text-xs text-red-600 underline mt-1"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* Receipt Card */}
      <div className="rounded-2xl border border-[#E0E0DA] bg-white overflow-hidden mb-6 max-w-md mx-auto">
        {/* Header */}
        <div className="bg-[#1A1A1A] text-[#FAFAF8] px-6 py-5 text-center">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#FAFAF8]/60 mb-1">Struk Digital</p>
          <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>Snapp.frame Studio</h3>
          <p className="text-xs text-[#FAFAF8]/60 mt-0.5">{site.tagline}</p>
          <p className="text-xs font-mono text-[#FAFAF8]/50 mt-2">{invoice}</p>
        </div>

        <div className="px-6 py-5">
          {/* Booking Details */}
          {[
            { label: "Nama",     value: formData.name },
            { label: "WhatsApp", value: formData.whatsapp },
            { label: "Paket",    value: pkg.name },
            { label: "Durasi",   value: pkg.duration },
            { label: "Foto",     value: pkg.photoCount },
            { label: "Tanggal",  value: formatDate(formData.date) },
            { label: "Jam",      value: `${formData.time} WIB` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 py-1.5 text-xs">
              <span className="text-[#888888]">{label}</span>
              <span className="text-[#1A1A1A] font-medium text-right max-w-[55%]">{value}</span>
            </div>
          ))}
          {formData.notes && (
            <div className="flex justify-between gap-4 py-1.5 text-xs">
              <span className="text-[#888888]">Catatan</span>
              <span className="text-[#1A1A1A] font-medium text-right max-w-[55%]">{formData.notes}</span>
            </div>
          )}

          {dottedDivider}

          {/* Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#888888]">Harga normal</span>
              <span className="text-[#1A1A1A]">{formatPrice(pkg.price)}</span>
            </div>
            {referral && (
              <div className="flex justify-between text-xs">
                <span className="text-[#5A371F]">
                  Diskon {referral.discountPct}% ({referral.code})
                </span>
                <span className="text-[#5A371F]">- {formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-1">
              <span className="text-[#1A1A1A]">TOTAL</span>
              <span className="text-[#1A1A1A]" style={{ fontFamily: "var(--font-heading)" }}>{formatPrice(finalPrice)}</span>
            </div>
          </div>

          {dottedDivider}

          <p className="text-xs text-[#888888] mb-3">
            Metode: <span className="font-semibold text-[#1A1A1A]">{paymentMethod === "qris" ? "QRIS" : "Transfer Bank"}</span>
          </p>

          {paymentMethod === "qris" ? (
            <div className="flex flex-col items-center py-5 bg-[#FAF9F5] border border-[#E2CFBF] rounded-2xl mt-3 px-4 text-center shadow-inner relative overflow-hidden">
              {/* QRIS Header branding */}
              <div className="flex justify-between items-center w-full px-2 mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black text-red-600 italic tracking-tighter">QR</span>
                  <span className="text-[10px] font-black text-blue-800 italic tracking-tighter">IS</span>
                </div>
                <div className="text-[7px] font-black text-[#5D4037]/40 uppercase tracking-widest">
                  GPN / Indonesian QR Code
                </div>
              </div>

              {/* Dynamic or Uploaded QR Code Image */}
              <div className="p-3 bg-white rounded-2xl shadow-md border border-[#E2CFBF]/50 mb-3 relative group">
                {siteSettings.payment_qris_image ? (
                  <img
                    src={siteSettings.payment_qris_image}
                    alt="QRIS Merchant"
                    className="w-40 h-40 object-contain"
                  />
                ) : (
                  <>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=5D4037&data=QRIS_DUMMY_SNEAPICI_STUDIO_INVOICE_${invoice}_TOTAL_${finalPrice}`}
                      alt="QRIS Code Dummy"
                      className="w-40 h-40 object-contain mix-blend-multiply"
                    />
                    <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 rounded-2xl">
                      <p className="text-[10px] font-black text-[#5D4037]">QRIS DUMMY</p>
                      <p className="text-[8px] text-[#5D4037]/60 mt-1">Hanya untuk simulasi uji coba</p>
                    </div>
                  </>
                )}
              </div>

              {/* Merchant Details */}
              <p className="text-xs font-black text-[#3B2211] uppercase tracking-wider mb-1">
                {siteSettings.payment_bank_owner || "SNAPP.FRAME STUDIO"}
              </p>
              {!siteSettings.payment_qris_image && (
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-3">NMID: ID1020304050</p>
              )}
              
              <div className="w-full border-t border-dashed border-[#E2CFBF] my-2" />

              <p className="text-[11px] font-bold text-[#3B2211] mb-3">
                Total Transfer: <span className="text-[#C88A58] font-mono text-xs">{formatPrice(finalPrice)}</span>
              </p>

              {/* DEV SIMULATOR BUTTON */}
              {dbStatus === "pending" && (
                <button
                  type="button"
                  onClick={async () => {
                    const confirmSim = confirm("✨ [SIMULASI DEV] Apakah Anda ingin menyimulasikan pembayaran QRIS ini berhasil (Lunas)?\n\nTindakan ini akan langsung mengonfirmasi booking di database.");
                    if (!confirmSim) return;
                    
                    try {
                      const { updateBookingStatusByInvoice } = await import("@/app/actions/bookings");
                      const res = await updateBookingStatusByInvoice(invoice, "confirmed");
                      if (res.success) {
                        toast.success("✨ Simulasi Pembayaran QRIS Lunas Berhasil!");
                      } else {
                        toast.error("Gagal menjalankan simulasi: " + res.error);
                      }
                    } catch (err: any) {
                      toast.error("Error simulasi: " + err.message);
                    }
                  }}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300"
                >
                  ⚡ Simulasikan Pembayaran Lunas (Dev)
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 bg-[#F0EFE9] rounded-xl mt-3 px-4 text-center space-y-2">
              <p className="text-sm font-semibold text-[#1A1A1A]">Pembayaran via Transfer Bank</p>
              <p className="text-xs text-[#5A5A5A] max-w-[250px]">
                Silakan lakukan transfer ke rekening pemilik Snapp.frame berikut sebesar:
              </p>
              <p className="text-lg font-black text-[#C88A58] my-1 font-mono">
                {formatPrice(finalPrice)}
              </p>
              <div className="w-full border-t border-[#E0E0DA]/60 my-1" />
              <div className="text-xs text-left w-full space-y-1 py-2 px-3 bg-white/50 rounded-lg font-medium">
                <div className="flex justify-between">
                  <span className="text-[#888888]">Bank:</span>
                  <span className="text-[#1A1A1A] font-bold">{siteSettings.payment_bank_name || site.payment.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#888888]">No. Rekening:</span>
                  <span className="text-[#1A1A1A] font-bold font-mono flex items-center gap-1">
                    {siteSettings.payment_bank_account || site.payment.bankAccount}
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(siteSettings.payment_bank_account || site.payment.bankAccount);
                        toast.success("Nomor rekening disalin!");
                      }}
                      className="p-1 hover:bg-[#F0EFE9] rounded text-[#C88A58] transition-colors"
                      title="Salin No. Rekening"
                    >
                      <Copy size={10} />
                    </button>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888888]">Atas Nama:</span>
                  <span className="text-[#1A1A1A] font-bold">{siteSettings.payment_bank_owner || site.payment.bankOwner}</span>
                </div>
              </div>
              <p className="text-[9px] text-[#A0A0A0] italic">
                * Harap transfer dengan nominal yang tepat untuk mempermudah verifikasi.
              </p>
            </div>
          )}

          {dottedDivider}
          <p className="text-center text-[10px] text-[#C0C0BC]">Terima kasih telah memilih Snapp.frame Studio ✦</p>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-md mx-auto space-y-3">
        <a
          href={buildWhatsAppMsg()}
          target="_blank"
          rel="noopener noreferrer"
          className={[btn.whatsapp, "w-full rounded-xl justify-center py-4 text-base"].join(" ")}
        >
          <MessageCircle size={20} />
          Konfirmasi via WhatsApp
        </a>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#E0E0DA]"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest text-[#888888]">
            <span className="bg-[#FAFAF8] px-2 font-black">Atau Bayar Sekarang</span>
          </div>
        </div>

        {paymentStatus === "success" ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-green-800 font-semibold">Lunas via Midtrans ✓</p>
          </div>
        ) : (
          <button
            onClick={handlePayment}
            disabled={saveState !== "saved" || isPaying}
            className={[
              btn.secondary, 
              "w-full rounded-xl justify-center font-bold text-sm",
              (saveState !== "saved" || isPaying) ? "opacity-50 cursor-not-allowed" : ""
            ].join(" ")}
          >
            {isPaying ? (
              <><Loader2 size={16} className="animate-spin" /> Membuka Snap...</>
            ) : (
              <><CreditCard size={16} /> Bayar Digital (Midtrans)</>
            )}
          </button>
        )}
        <button
          onClick={onReset}
          className={[btn.secondary, "w-full rounded-xl justify-center gap-2"].join(" ")}
        >
          <RotateCcw size={15} />
          Booking Lagi
        </button>
      </div>
    </div>
  );
}
