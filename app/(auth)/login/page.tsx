"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, Loader2, Zap, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email atau password salah. Silakan coba lagi.");
      } else {
        router.push("/kasir");
      }
    } catch {
      setError("Terjadi kesalahan sistem. Coba lagi sebentar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0905] flex items-center justify-center p-6 relative overflow-hidden">

      {/* ── Ambient Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#C88A58]/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#3B2211]/40 rounded-full blur-[100px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#C88A58]/4 rounded-full blur-[80px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,138,88,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,138,88,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-[36px] bg-[#1A110B] border border-[#C88A58]/20 flex items-center justify-center shadow-2xl shadow-black/40">
                <Logo height={72} className="brightness-0 invert opacity-90" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#C88A58] rounded-full flex items-center justify-center shadow-lg">
                <Zap size={14} className="text-white fill-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Sneapici Studio
          </h1>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.35em] mt-2">
            Admin System — Secure Access
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/8 rounded-[32px] p-8 shadow-2xl shadow-black/40">
          
          {/* Card Header */}
          <div className="mb-8">
            <p className="text-[10px] font-black text-[#C88A58] uppercase tracking-[0.35em] mb-1">Selamat Datang</p>
            <h2 className="text-xl font-black text-white">Masuk ke Dashboard</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] ml-1">
                Alamat Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C88A58] transition-colors"
                  size={16}
                />
                <input
                  type="email"
                  required
                  placeholder="admin@sneapici.studio"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#C88A58]/30 focus:border-[#C88A58]/40 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] ml-1">
                Kata Sandi
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C88A58] transition-colors"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#C88A58]/30 focus:border-[#C88A58]/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 text-red-400 text-[11px] font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-[#C88A58] hover:bg-[#D99A68] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-[#C88A58]/20 flex items-center justify-center gap-3 disabled:opacity-60 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Masuk Sekarang
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-white/20 text-[10px] font-bold uppercase tracking-[0.25em]">
          Snapp.Frame Studio — Secured Access Only
        </p>
      </motion.div>
    </div>
  );
}
