"use client";

// app/(pos)/admin/affiliators/page.tsx
// Manage Affiliate Partners - Admin Panel

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartHandshake,
  Search,
  Plus,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  AtSign,
  Users,
  DollarSign,
  Edit2,
  Trash2,
  X,
  Save,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

interface Affiliator {
  id: string;
  name: string;
  phone: string;
  instagram: string;
  email: string;
  joinDate: string;
  referralCode: string;
  status: "active" | "pending" | "inactive";
  totalReferrals: number;
  totalEarnings: number;
  notes: string;
}

const MOCK_DATA: Affiliator[] = [
  {
    id: "AFF-001",
    name: "Ridwan Maulana",
    phone: "08123456789",
    instagram: "@ridwan.m",
    email: "ridwan@gmail.com",
    joinDate: "2025-01-15",
    referralCode: "RIDWAN10",
    status: "active",
    totalReferrals: 24,
    totalEarnings: 840000,
    notes: "Top performer bulan ini",
  },
  {
    id: "AFF-002",
    name: "Siti Rahma",
    phone: "08234567890",
    instagram: "@siti.rahma_",
    email: "siti@gmail.com",
    joinDate: "2025-02-01",
    referralCode: "SITI10",
    status: "active",
    totalReferrals: 12,
    totalEarnings: 420000,
    notes: "",
  },
  {
    id: "AFF-003",
    name: "Budi Santoso",
    phone: "08345678901",
    instagram: "@budisantoso",
    email: "budi@gmail.com",
    joinDate: "2025-03-10",
    referralCode: "BUDI10",
    status: "pending",
    totalReferrals: 0,
    totalEarnings: 0,
    notes: "Menunggu verifikasi data",
  },
];

const STATUS_CONFIG = {
  active: {
    label: "Aktif",
    icon: CheckCircle2,
    className: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "text-amber-600 bg-amber-50 border-amber-200",
  },
  inactive: {
    label: "Nonaktif",
    icon: XCircle,
    className: "text-rose-600 bg-rose-50 border-rose-200",
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 text-gray-300 hover:text-[#3B2211] transition-colors"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  );
}

export default function AffiliatorsPage() {
  const [affiliators, setAffiliators] = useState<Affiliator[]>(MOCK_DATA);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "inactive">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Affiliator | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Affiliator>>({
    name: "",
    phone: "",
    instagram: "",
    email: "",
    referralCode: "",
    status: "pending",
    notes: "",
  });

  const filtered = affiliators.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search) ||
      a.referralCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: affiliators.length,
    active: affiliators.filter((a) => a.status === "active").length,
    pending: affiliators.filter((a) => a.status === "pending").length,
    totalEarnings: affiliators.reduce((s, a) => s + a.totalEarnings, 0),
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm({ name: "", phone: "", instagram: "", email: "", referralCode: "", status: "pending", notes: "" });
    setShowModal(true);
  };

  const openEdit = (a: Affiliator) => {
    setEditingItem(a);
    setForm({ ...a });
    setShowModal(true);
    setActiveMenu(null);
  };

  const handleDelete = (id: string) => {
    setAffiliators((prev) => prev.filter((a) => a.id !== id));
    setActiveMenu(null);
  };

  const handleStatusChange = (id: string, status: Affiliator["status"]) => {
    setAffiliators((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setActiveMenu(null);
  };

  const handleSave = () => {
    if (!form.name || !form.phone || !form.referralCode) return;
    if (editingItem) {
      setAffiliators((prev) =>
        prev.map((a) => (a.id === editingItem.id ? { ...a, ...form } : a))
      );
    } else {
      const newAff: Affiliator = {
        id: `AFF-${String(affiliators.length + 1).padStart(3, "0")}`,
        name: form.name!,
        phone: form.phone!,
        instagram: form.instagram || "",
        email: form.email || "",
        joinDate: new Date().toISOString().split("T")[0],
        referralCode: form.referralCode!.toUpperCase(),
        status: (form.status as Affiliator["status"]) || "pending",
        totalReferrals: 0,
        totalEarnings: 0,
        notes: form.notes || "",
      };
      setAffiliators((prev) => [newAff, ...prev]);
    }
    setShowModal(false);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  return (
    <div className="p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#3B2211]/5 pb-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-[#C88A58] uppercase tracking-[0.4em]">
            Partnership Engine
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3B2211] flex items-center justify-center text-white shadow-xl shadow-[#3B2211]/20">
              <HeartHandshake size={24} />
            </div>
            <h1
              className="text-4xl font-black text-[#3B2211] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Kelola Affiliator
            </h1>
          </div>
          <p className="text-sm text-gray-400 font-medium">
            Kelola partner affiliate, kode referral, dan pantau performa mereka.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="flex items-center gap-3 px-8 py-4 bg-[#3B2211] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-[#3B2211]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={16} />
            Tambah Affiliator
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Affiliator", value: stats.total, icon: Users, color: "text-[#3B2211]", bg: "bg-gray-100" },
          { label: "Aktif", value: stats.active, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          {
            label: "Total Komisi Dibayar",
            value: `Rp ${stats.totalEarnings.toLocaleString("id-ID")}`,
            icon: DollarSign,
            color: "text-[#C88A58]",
            bg: "bg-[#C88A58]/10",
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="p-7 bg-white rounded-2xl border border-white shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-[#3B2211]/5 transition-all duration-500"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-4`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                {stat.label}
              </p>
              <span className="text-3xl font-black text-[#3B2211] tracking-tighter">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-[380px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama, nomor, atau kode referral..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3B2211]/5 shadow-sm"
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(["all", "active", "pending", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-5 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s
                  ? "bg-[#3B2211] text-white shadow-sm"
                  : "text-gray-400 hover:text-[#3B2211]"
              }`}
            >
              {s === "all" ? "Semua" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8F6F4]/50 text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5 font-black">Affiliator</th>
                <th className="px-8 py-5 font-black">Kontak</th>
                <th className="px-8 py-5 font-black">Kode Referral</th>
                <th className="px-8 py-5 font-black text-center">Referrals</th>
                <th className="px-8 py-5 font-black text-right">Total Komisi</th>
                <th className="px-8 py-5 font-black text-center">Status</th>
                <th className="px-8 py-5 font-black text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F6F4] text-sm">
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={32} className="text-gray-200" />
                        <p className="text-sm font-black text-gray-300 uppercase tracking-widest">
                          Tidak ada data affiliator
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, idx) => {
                    const status = STATUS_CONFIG[a.status];
                    const StatusIcon = status.icon;
                    return (
                      <motion.tr
                        key={a.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-[#F8F6F4]/30 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#3B2211]/5 flex items-center justify-center text-[#3B2211] font-black text-xs">
                              {a.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#3B2211]">{a.name}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase">
                                Bergabung {new Date(a.joinDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                              {a.notes && (
                                <p className="text-[9px] text-[#C88A58] font-bold italic mt-0.5">{a.notes}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold">
                              <Phone size={11} className="text-gray-300" />
                              {a.phone}
                            </div>
                            {a.instagram && (
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold">
                                <AtSign size={11} className="text-gray-300" />
                                {a.instagram}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1">
                            <span className="font-black text-[#3B2211] tracking-widest text-sm bg-[#3B2211]/5 px-3 py-1.5 rounded-lg">
                              {a.referralCode}
                            </span>
                            <CopyButton text={a.referralCode} />
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-lg font-black text-[#3B2211]">{a.totalReferrals}</span>
                          <span className="block text-[9px] text-gray-400 font-bold uppercase">transaksi</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className="font-black text-[#3B2211]">
                            Rp {a.totalEarnings.toLocaleString("id-ID")}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${status.className}`}
                            >
                              <StatusIcon size={11} />
                              {status.label}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="relative flex justify-end">
                            <button
                              onClick={() => setActiveMenu(activeMenu === a.id ? null : a.id)}
                              className="p-2 hover:bg-[#3B2211]/5 rounded-xl transition-colors text-gray-300 hover:text-[#3B2211]"
                            >
                              <MoreVertical size={16} />
                            </button>
                            <AnimatePresence>
                              {activeMenu === a.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                                  className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-2xl shadow-[#3B2211]/15 border border-[#3B2211]/5 z-50 overflow-hidden"
                                >
                                  <button
                                    onClick={() => openEdit(a)}
                                    className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase text-left hover:bg-[#F8F6F4] text-[#3B2211] transition-colors tracking-widest"
                                  >
                                    <Edit2 size={13} /> Edit Data
                                  </button>
                                  {a.status !== "active" && (
                                    <button
                                      onClick={() => handleStatusChange(a.id, "active")}
                                      className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase text-left hover:bg-emerald-50 text-emerald-600 transition-colors tracking-widest"
                                    >
                                      <CheckCircle2 size={13} /> Aktifkan
                                    </button>
                                  )}
                                  {a.status !== "inactive" && (
                                    <button
                                      onClick={() => handleStatusChange(a.id, "inactive")}
                                      className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase text-left hover:bg-amber-50 text-amber-600 transition-colors tracking-widest"
                                    >
                                      <XCircle size={13} /> Nonaktifkan
                                    </button>
                                  )}
                                  <div className="h-px bg-[#3B2211]/5 mx-4" />
                                  <button
                                    onClick={() => handleDelete(a.id)}
                                    className="w-full flex items-center gap-3 px-5 py-3.5 text-[11px] font-black uppercase text-left hover:bg-rose-50 text-rose-500 transition-colors tracking-widest"
                                  >
                                    <Trash2 size={13} /> Hapus
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Add/Edit ── */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop — locks scroll via body style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            {/* Modal — fixed center, flex-col so footer always visible */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col"
                style={{ maxHeight: "calc(100vh - 3rem)" }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-[#3B2211]/5 flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-black text-[#3B2211]">
                      {editingItem ? "Edit Affiliator" : "Tambah Affiliator Baru"}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      {editingItem ? `ID: ${editingItem.id}` : "Data affiliator baru"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-300 hover:text-[#3B2211] hover:bg-[#3B2211]/5 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                  {[
                    { label: "Nama Lengkap *", key: "name", placeholder: "Nama lengkap affiliator" },
                    { label: "Nomor WhatsApp *", key: "phone", placeholder: "08xxxxxxxxxx" },
                    { label: "Instagram", key: "instagram", placeholder: "@username" },
                    { label: "Email", key: "email", placeholder: "email@gmail.com" },
                    { label: "Kode Referral *", key: "referralCode", placeholder: "NAMA10" },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-black text-[#3B2211] uppercase tracking-widest mb-2">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={(form as any)[key] || ""}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-5 py-3.5 bg-[#F8F6F4] border border-transparent rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#3B2211]/10 transition-all"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-black text-[#3B2211] uppercase tracking-widest mb-2">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                      className="w-full px-5 py-3.5 bg-[#F8F6F4] border border-transparent rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#3B2211]/10 transition-all"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#3B2211] uppercase tracking-widest mb-2">
                      Catatan
                    </label>
                    <textarea
                      value={form.notes || ""}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Catatan internal..."
                      rows={3}
                      className="w-full px-5 py-3.5 bg-[#F8F6F4] border border-transparent rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#3B2211]/10 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Footer — always visible */}
                <div className="flex gap-3 px-8 py-5 border-t border-[#3B2211]/5 bg-[#F8F6F4]/50 flex-shrink-0 rounded-b-3xl">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 rounded-xl border border-[#3B2211]/10 text-[11px] font-black uppercase tracking-widest text-[#3B2211]/40 hover:text-[#3B2211] hover:border-[#3B2211]/20 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!form.name || !form.phone || !form.referralCode}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#3B2211] text-white text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xl shadow-[#3B2211]/20"
                  >
                    <Save size={14} />
                    {editingItem ? "Simpan Perubahan" : "Tambah Affiliator"}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
