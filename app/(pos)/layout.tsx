import React from "react";

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-purple-500/30">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Snapp.frame</h1>
            <p className="text-xs text-white/50">Point of Sale System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">Terminal #01</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">Cashier Name</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Session: 08:32 AM</p>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full border border-white/20" />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
