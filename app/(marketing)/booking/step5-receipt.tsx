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
import { createBooking } from "@/app/actions/bookings";

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
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function Step5Receipt({ pkg, formData, referral, paymentMethod, onReset }: Step5Props) {
  const finalPrice = referral ? applyDiscount(pkg.price, referral.discountPct, referral.maxDiscountAmount) : pkg.price;
  const discount = pkg.price - finalPrice;
  const [invoice] = useState(generateInvoice);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const hasSaved = useRef(false);

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
        <div className={["w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4",
          saveState === "saving" ? "bg-[#E0E0DA]" : "bg-[#1A1A1A]"
        ].join(" ")}>
          {saveState === "saving"
            ? <Loader2 size={24} className="text-[#888888] animate-spin" />
            : <Check size={26} className="text-[#FAFAF8]" />
          }
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A]" style={{ fontFamily: "var(--font-heading)" }}>
          {saveState === "saving" ? "Menyimpan Booking..." : "Booking Berhasil!"}
        </h2>
        <p className="text-[#5A5A5A] text-sm mt-2">
          {saveState === "saving"
            ? "Mohon tunggu sebentar."
            : "Silakan selesaikan pembayaran dan konfirmasi via WhatsApp."}
        </p>
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
            <div className="flex flex-col items-center py-4 bg-[#F0EFE9] rounded-xl mt-3">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Pembayaran via QRIS</p>
              <p className="text-xs text-[#5A5A5A] text-center max-w-[200px]">
                Mendukung Gopay, ShopeePay, Dana, LinkAja, dan bank transfer scan.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 bg-[#F0EFE9] rounded-xl mt-3">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Pembayaran via Transfer Bank</p>
              <p className="text-xs text-[#5A5A5A] text-center max-w-[200px]">
                Mendukung Virtual Account BCA, BNI, BRI, Permata, Mandiri, dll.
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
