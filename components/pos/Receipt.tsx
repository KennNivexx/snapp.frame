"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";

interface ReceiptProps {
  customerName: string;
  customerPhone: string;
  items: any[];
  discount: number;
  total: number;
  paymentMethod: string;
}

export default function Receipt({
  customerName,
  customerPhone,
  items,
  discount,
  total,
  paymentMethod,
}: ReceiptProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Struk_${new Date().getTime()}`,
  });

  return (
    <>
      <button
        onClick={() => handlePrint()}
        className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
      >
        <Printer size={18} />
        Cetak Struk
      </button>

      <div style={{ display: "none" }}>
        <div ref={componentRef} className="p-8 bg-white text-black font-mono text-[12px] w-[80mm]">
          <div className="text-center space-y-1 mb-6">
            <h1 className="text-lg font-bold uppercase">SNEAPICI STUDIO</h1>
            <p className="text-[10px]">Jl. Contoh No. 123, Kota Anda</p>
            <p className="text-[10px]">WhatsApp: 0812-3456-7890</p>
          </div>

          <div className="border-t border-b border-dashed border-black py-2 mb-4 space-y-1">
            <div className="flex justify-between">
              <span>No. Invoice:</span>
              <span className="font-bold">INV/{new Date().getTime().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{new Date().toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>Admin #01</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span>{customerName || "Umum"}</span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold">{item.name}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>{item.qty} x {item.price.toLocaleString('id-ID')}</span>
                  <span>{(item.qty * item.price).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-black pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{(total + discount).toLocaleString('id-ID')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span>Diskon:</span>
                <span>-{discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-1 border-t border-black mt-1">
              <span>TOTAL:</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-dashed border-black space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span>Metode Bayar:</span>
              <span>{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold">LUNAS</span>
            </div>
          </div>

          <div className="text-center mt-8 space-y-1 italic text-[10px]">
            <p>Terima kasih atas kunjungan Anda</p>
            <p>Hasil foto terbaik hanya di Sneapici</p>
            <p>Follow IG: @sneapici.studio</p>
          </div>
        </div>
      </div>
    </>
  );
}
