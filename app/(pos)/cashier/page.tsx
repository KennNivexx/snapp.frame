"use client";

import React from "react";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";

export default function CashierPage() {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Section: Product Management */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-900/50">
        <ProductGrid />
      </div>

      {/* Right Section: Cart & Summary */}
      <Cart />
      
      {/* Mobile Cart Trigger (Optional Improvement) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button className="bg-purple-600 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center">
             <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-white text-purple-600 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-purple-600">0</span>
             </div>
          </button>
      </div>
    </div>
  );
}
