import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Global Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="flex-grow w-full max-w-full overflow-x-hidden">{children}</div>

      {/* Global Footer */}
      <Footer />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </>
  );
}
