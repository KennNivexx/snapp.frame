"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Copy, Check, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { Package } from "@/data/packages";
import { formatPrice } from "@/lib/utils";
import { applyDiscount, ReferralCode } from "@/lib/referral";
import { BookingFormData } from "./step2-personal";
import { PaymentMethod } from "./step4-payment";
import { site } from "@/data/site";
import { btn } from "@/lib/button-classes";
import { createClient } from "@/lib/supabase/client";

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

/* ─── QRIS SVG ─────────────────────────── */

function QRCodeSVG({ size = 200 }: { size?: number }) {
  const cell = Math.floor(size / 25);
  const S = cell * 25;

  const pattern: number[][] = [];
  for (let r = 0; r < 25; r++) {
    pattern.push([]);
    for (let c = 0; c < 25; c++) {
      if (r <= 6 && c <= 6) {
        const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const onInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        pattern[r].push(onBorder || onInner ? 1 : 0);
      } else if (r <= 6 && c >= 18) {
        const cc = c - 18;
        const onBorder = r === 0 || r === 6 || cc === 0 || cc === 6;
        const onInner = r >= 2 && r <= 4 && cc >= 2 && cc <= 4;
        pattern[r].push(onBorder || onInner ? 1 : 0);
      } else if (r >= 18 && c <= 6) {
        const rr = r - 18;
        const onBorder = rr === 0 || rr === 6 || c === 0 || c === 6;
        const onInner = rr >= 2 && rr <= 4 && c >= 2 && c <= 4;
        pattern[r].push(onBorder || onInner ? 1 : 0);
      } else if (r === 6) {
        pattern[r].push(c % 2 === 0 ? 1 : 0);
      } else if (c === 6) {
        pattern[r].push(r % 2 === 0 ? 1 : 0);
      } else {
        const seed = (r * 31 + c * 17 + r * c * 7) % 100;
        pattern[r].push(seed < 48 ? 1 : 0);
      }
    }
  }

  return (
    <svg
      width={S} height={S} viewBox={`0 0 ${S} ${S}`}
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-xl border-4 border-white shadow-md"
      style={{ background: "white" }}
      aria-label="QRIS Payment Code"
    >
      {pattern.map((row, r) =>
        row.map((val, c) =>
          val ? <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#1A1A1A" /> : null
        )
      )}
    </svg>
  );
}

/* ─── Bank Transfer ──────────────────── */

const BANK_ACCOUNTS = [
  { bank: "BCA",     number: "1234567890", name: "Snapp.frame Studio" },
  { bank: "Mandiri", number: "0987654321", name: "Snapp.frame Studio" },
  { bank: "BRI",     number: "1122334455", name: "Snapp.frame Studio" },
];

function BankCard({ account, total }: { account: typeof BANK_ACCOUNTS[0]; total: number }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(account.number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[#E0E0DA] bg-[#F0EFE9]">
      <div>
        <p className="text-xs font-bold text-[#888888] uppercase tracking-wider">{account.bank}</p>
        <p className="text-base font-bold text-[#1A1A1A] font-mono tracking-widest mt-0.5">{account.number}</p>
        <p className="text-xs text-[#5A5A5A] mt-0.5">a.n. {account.name}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={copy}
          className={["flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            copied ? "bg-[#1A1A1A] text-[#FAFAF8]" : "bg-white border border-[#E0E0DA] text-[#1A1A1A] hover:border-[#1A1A1A]/40"
          ].join(" ")}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Disalin!" : "Salin"}
        </button>
        <p className="text-xs text-[#888888]">Total: <span className="font-semibold text-[#1A1A1A]">{formatPrice(total)}</span></p>
      </div>
    </div>
  );
}

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
  const finalPrice = referral ? applyDiscount(pkg.price, referral.discountPct) : pkg.price;
  const discount = pkg.price - finalPrice;
  const [invoice] = useState(generateInvoice);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState("");
  const hasSaved = useRef(false);

  // Insert booking to Supabase exactly once when Step 5 mounts
  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    async function saveBooking() {
      setSaveState("saving");
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        // Skip DB insert if Supabase not configured
        if (!supabaseUrl || supabaseUrl.includes("your-project-ref")) {
          await new Promise((r) => setTimeout(r, 400)); // simulate
          setSaveState("saved");
          return;
        }

        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("bookings") as any).insert({
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
        });

        if (error) throw error;

        // Increment referral usage_count if a code was used
        if (referral?.code) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).rpc("increment_referral_usage", { p_code: referral.code }).maybeSingle();
          // rpc failure is non-critical — booking already saved
        }

        setSaveState("saved");
      } catch (err) {
        console.error("[Snapp.frame] Booking save failed:", err);
        setSaveError("Booking gagal disimpan ke database. Silakan konfirmasi manual via WhatsApp.");
        setSaveState("error");
      }
    }

    saveBooking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <span className="text-[#5A371F]">Diskon {referral.discountPct}%</span>
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
            <div className="flex flex-col items-center py-4">
              <QRCodeSVG size={180} />
              <p className="text-base font-bold text-[#1A1A1A] mt-4" style={{ fontFamily: "var(--font-heading)" }}>
                {formatPrice(finalPrice)}
              </p>
              <p className="text-xs text-[#888888] mt-1">Berlaku 15 menit · Semua bank &amp; e-wallet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {BANK_ACCOUNTS.map((acc) => (
                <BankCard key={acc.bank} account={acc} total={finalPrice} />
              ))}
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
          className={[btn.whatsapp, "w-full rounded-xl justify-center"].join(" ")}
        >
          <MessageCircle size={18} />
          Konfirmasi via WhatsApp
        </a>
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
