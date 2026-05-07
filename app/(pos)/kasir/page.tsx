"use client";

import React from "react";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";

export default function CashierPage() {
  return (
    <div className="flex h-full overflow-hidden bg-white rounded-[40px] border border-[#E0E0DA] shadow-sm">
      {/* Left Section: Product Management */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#E0E0DA]">
        <ProductGrid />
      </div>

      {/* Right Section: Cart & Summary */}
      <Cart />
    </div>
  );
}

