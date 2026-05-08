"use client";

import React from "react";
import ProductGrid from "@/components/pos/ProductGrid";
import Cart from "@/components/pos/Cart";

export default function CashierPage() {
  return (
    <div className="flex h-full overflow-hidden bg-white relative">
      {/* Left Section: Product Management */}
      <div className="flex-1 flex flex-col min-w-0">
        <ProductGrid />
      </div>

      {/* Right Section: Cart & Summary */}
      <Cart />
    </div>
  );
}

