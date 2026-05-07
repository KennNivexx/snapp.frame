"use client";

import React, { forwardRef } from "react";

interface ReceiptProps {
  transactionId: string;
  items: any[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({
  transactionId,
  items,
  subtotal,
  tax,
  discount,
  total,
  paymentMethod
}, ref) => {
  const now = new Date();

  return (
    <div ref={ref} className="p-8 bg-white text-black font-mono text-[12px] w-[300px]">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold uppercase tracking-widest">SNAPP.FRAME</h1>
        <p className="text-[10px]">Studio & Digital Photography</p>
        <p className="text-[10px]">Jl. Contoh No. 123, Jakarta</p>
        <p className="text-[10px]">Tel: +62 812-3456-7890</p>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-4">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{now.toLocaleDateString()} {now.toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Inv:</span>
          <span>{transactionId}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span>Admin</span>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between">
              <span className="font-bold">{item.name}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>{item.qty} x {item.price.toLocaleString("id-ID")}</span>
              <span>{(item.qty * item.price).toLocaleString("id-ID")}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-black border-dashed pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{subtotal.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (11%):</span>
          <span>{tax.toLocaleString("id-ID")}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-{discount.toLocaleString("id-ID")}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t border-black pt-1 mt-1">
          <span>TOTAL:</span>
          <span>{total.toLocaleString("id-ID")}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between">
        <span>Payment:</span>
        <span className="font-bold">{paymentMethod}</span>
      </div>

      <div className="text-center mt-8 space-y-1">
        <p className="font-bold italic">Thank You!</p>
        <p className="text-[8px]">Please come back again.</p>
        <div className="pt-4 flex justify-center">
           <div className="w-16 h-16 bg-black flex items-center justify-center text-white text-[8px] font-bold">QR CODE</div>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";
