"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings } from "@/app/actions/settings";
import { Save, Loader2, Globe, Mail, Phone, Clock, Type } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await getSiteSettings();
      // Set defaults if empty
      setSettings({
        contact_email: data.contact_email || "hello@snappframe.com",
        contact_phone: data.contact_phone || "+62 812 3456 7890",
        contact_wa: data.contact_wa || "6281234567890",
        contact_ig: data.contact_ig || "@snapp.frame",
        contact_address: data.contact_address || "Jl. Sudirman No. 123, Jakarta Selatan",
        operational_hours: data.operational_hours || "Setiap Hari: 09:00 - 21:00",
        hero_eyebrow: data.hero_eyebrow || "Snapp.frame Studio",
        hero_text_1: data.hero_text_1 || "Yang Kamu Lihat",
        hero_highlight_1: data.hero_highlight_1 || "Hari Ini",
        hero_text_2: data.hero_text_2 || "Akan Kamu Rindukan",
        hero_highlight_2: data.hero_highlight_2 || "Nanti",
        hero_desc: data.hero_desc || "Abadikan momen paling berhargamu dengan sentuhan editorial yang abadi. Sebuah pengalaman fotografi eksklusif yang dirancang khusus untuk menceritakan kisahmu.",
      });
    } catch (error) {
      toast.error("Gagal memuat pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateSiteSettings(settings);
      if (res.success) {
        toast.success("Pengaturan berhasil disimpan!");
      } else {
        toast.error(res.error || "Gagal menyimpan pengaturan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-near-black/50" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-near-black tracking-tight mb-1">
            Pengaturan Website
          </h1>
          <p className="text-sm font-medium text-near-black/60">
            Ubah teks, kontak, dan informasi yang tampil di website pelanggan.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-near-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-near-black/90 disabled:opacity-50 transition-colors shadow-lg shadow-near-black/10"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-white p-6 rounded-2xl border border-near-black/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-near-black/5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-near-black uppercase tracking-widest">Informasi Kontak</h2>
              <p className="text-[11px] text-near-black/50 font-medium">Email, Telepon, dan Lokasi</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Email Publik</label>
              <input
                type="text"
                value={settings.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Nomor Telepon (Tampilan)</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Nomor WhatsApp (Untuk Tombol/Link, tanpa +)</label>
              <input
                type="text"
                value={settings.contact_wa}
                onChange={(e) => handleChange("contact_wa", e.target.value)}
                className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                placeholder="6281234567890"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Username Instagram</label>
              <input
                type="text"
                value={settings.contact_ig}
                onChange={(e) => handleChange("contact_ig", e.target.value)}
                className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Alamat Studio</label>
              <textarea
                value={settings.contact_address}
                onChange={(e) => handleChange("contact_address", e.target.value)}
                className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all min-h-[80px]"
              />
            </div>
          </div>
        </div>

        {/* Operational & General */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-near-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-near-black/5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-near-black uppercase tracking-widest">Jam Operasional</h2>
                <p className="text-[11px] text-near-black/50 font-medium">Tampil di footer / info kontak</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Jam Buka Studio</label>
              <input
                type="text"
                value={settings.operational_hours}
                onChange={(e) => handleChange("operational_hours", e.target.value)}
                className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                placeholder="Contoh: Setiap Hari: 09:00 - 21:00"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-near-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-near-black/5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-near-black uppercase tracking-widest">Teks Hero (Halaman Utama)</h2>
                <p className="text-[11px] text-near-black/50 font-medium">Tulisan besar pertama kali dilihat pengunjung</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Teks Eyebrow (Kecil di atas)</label>
                <input
                  type="text"
                  value={settings.hero_eyebrow}
                  onChange={(e) => handleChange("hero_eyebrow", e.target.value)}
                  className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Baris 1: Normal</label>
                  <input
                    type="text"
                    value={settings.hero_text_1}
                    onChange={(e) => handleChange("hero_text_1", e.target.value)}
                    className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide text-gold">Baris 1: Aksen/Warna</label>
                  <input
                    type="text"
                    value={settings.hero_highlight_1}
                    onChange={(e) => handleChange("hero_highlight_1", e.target.value)}
                    className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Baris 2: Normal</label>
                  <input
                    type="text"
                    value={settings.hero_text_2}
                    onChange={(e) => handleChange("hero_text_2", e.target.value)}
                    className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide text-gold">Baris 2: Aksen/Warna</label>
                  <input
                    type="text"
                    value={settings.hero_highlight_2}
                    onChange={(e) => handleChange("hero_highlight_2", e.target.value)}
                    className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-near-black mb-2 uppercase tracking-wide">Deskripsi Pendek</label>
                <textarea
                  value={settings.hero_desc}
                  onChange={(e) => handleChange("hero_desc", e.target.value)}
                  className="w-full px-4 py-3 bg-warm-white/50 border border-near-black/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
