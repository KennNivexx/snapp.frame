"use client";

import { QrCode, Landmark, Check } from "lucide-react";
import { btn } from "@/lib/button-classes";

export type PaymentMethod = "qris" | "transfer";

interface Step4Props {
  selected: PaymentMethod | null;
  onSelect: (m: PaymentMethod) => void;
  onNext: () => void;
  onBack: () => void;
}

const METHODS: { id: PaymentMethod; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "qris",
    label: "QRIS",
    desc: "Bayar via aplikasi dompet digital atau m-banking manapun",
    icon: <QrCode size={28} />,
  },
  {
    id: "transfer",
    label: "Transfer Bank",
    desc: "Transfer langsung ke rekening studio kami",
    icon: <Landmark size={28} />,
  },
];

export default function Step4Payment({ selected, onSelect, onNext, onBack }: Step4Props) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-medium tracking-[0.15em] text-[#888888] uppercase mb-2">Langkah 4 dari 5</p>
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#1A1A1A]" style={{ fontFamily: "var(--font-heading)" }}>
          Pilih Metode Bayar
        </h2>
        <p className="text-[#5A5A5A] text-sm mt-2">Pembayaran dikonfirmasi manual via WhatsApp setelah booking.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {METHODS.map((m) => {
          const isSelected = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={[
                "relative flex flex-col items-start text-left rounded-2xl border p-6 transition-all duration-200 w-full",
                isSelected
                  ? "bg-[#1A1A1A] border-[#1A1A1A] text-[#FAFAF8]"
                  : "bg-white border-[#E0E0DA] hover:border-[#1A1A1A]/30 hover:shadow-sm hover:-translate-y-0.5",
              ].join(" ")}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check size={14} className="text-[#FAFAF8]" />
                </div>
              )}
              <div className={[
                "mb-4 p-3 rounded-xl",
                isSelected ? "bg-white/10" : "bg-[#F0EFE9]"
              ].join(" ")}>
                <span className={isSelected ? "text-[#FAFAF8]" : "text-[#5A5A5A]"}>{m.icon}</span>
              </div>
              <h3 className={[
                "text-base font-semibold mb-1",
                isSelected ? "text-[#FAFAF8]" : "text-[#1A1A1A]"
              ].join(" ")} style={{ fontFamily: "var(--font-heading)" }}>
                {m.label}
              </h3>
              <p className={["text-xs leading-relaxed", isSelected ? "text-[#FAFAF8]/70" : "text-[#888888]"].join(" ")}>
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between gap-3">
        <button onClick={onBack} className={[btn.secondary, "rounded-xl"].join(" ")}>Kembali</button>
        <button
          onClick={onNext}
          disabled={!selected}
          className={[btn.primary, "rounded-xl px-8 disabled:opacity-40 disabled:cursor-not-allowed"].join(" ")}
        >
          Lihat Struk
        </button>
      </div>
    </div>
  );
}
