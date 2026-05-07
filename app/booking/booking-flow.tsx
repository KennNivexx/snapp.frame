"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { Package } from "@/data/packages";
import { ReferralCode } from "@/lib/referral";
import { BookingFormData } from "./step2-personal";
import { PaymentMethod } from "./step4-payment";
import Step1Package from "./step1-package";
import Step2PersonalData from "./step2-personal";
import Step3Summary from "./step3-summary";
import Step4Payment from "./step4-payment";
import Step5Receipt from "./step5-receipt";

const STEPS = ["Paket", "Data Diri", "Ringkasan", "Bayar", "Selesai"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10 sm:mb-14 px-4 overflow-x-auto">
      {STEPS.map((label, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div className={[
                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0",
                isDone
                  ? "bg-[#1A1A1A] text-[#FAFAF8]"
                  : isActive
                    ? "bg-[#1A1A1A] text-[#FAFAF8] ring-4 ring-[#1A1A1A]/20"
                    : "bg-[#E0E0DA] text-[#888888]"
              ].join(" ")}>
                {isDone ? <Check size={14} /> : <span>{i + 1}</span>}
              </div>
              {/* Label */}
              <span className={[
                "text-[9px] sm:text-[10px] font-medium whitespace-nowrap tracking-wide",
                isActive ? "text-[#1A1A1A]" : isDone ? "text-[#5A5A5A]" : "text-[#C0C0BC]"
              ].join(" ")}>
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className={[
                "h-px w-8 sm:w-12 mx-1 mb-4 flex-shrink-0 transition-colors duration-300",
                isDone ? "bg-[#1A1A1A]" : "bg-[#E0E0DA]"
              ].join(" ")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function BookingFlow() {
  // suppress unused warning — searchParams used in Step1
  useSearchParams();

  const [step, setStep] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    name: "", whatsapp: "", date: "", time: "", notes: ""
  });
  const [referral, setReferral] = useState<ReferralCode | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  function reset() {
    setStep(0);
    setSelectedPkg(null);
    setFormData({ name: "", whatsapp: "", date: "", time: "", notes: "" });
    setReferral(null);
    setPaymentMethod(null);
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="pt-28 pb-20 lg:pt-36 max-w-2xl mx-auto px-5 sm:px-8">
        {/* Page header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-medium tracking-[0.15em] text-[#888888] uppercase mb-2">
            Booking Sesi Foto
          </p>
          <h1
            className="text-3xl sm:text-4xl font-semibold text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Snapp.frame Studio
          </h1>
        </div>

        <StepIndicator current={step} />

        {/* Step panels */}
        {step === 0 && (
          <Step1Package
            selected={selectedPkg}
            onSelect={setSelectedPkg}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <Step2PersonalData
            data={formData}
            onChange={setFormData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && selectedPkg && (
          <Step3Summary
            pkg={selectedPkg}
            formData={formData}
            referral={referral}
            onReferralChange={setReferral}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step4Payment
            selected={paymentMethod}
            onSelect={setPaymentMethod}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && selectedPkg && paymentMethod && (
          <Step5Receipt
            pkg={selectedPkg}
            formData={formData}
            referral={referral}
            paymentMethod={paymentMethod}
            onReset={reset}
          />
        )}
      </div>
    </main>
  );
}
