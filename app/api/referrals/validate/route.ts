import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Kode diperlukan" }, { status: 400 });
    }

    const referral = await prisma.referralCode.findUnique({
      where: { code },
    });

    if (!referral) {
      // Fallback codes
      const fallbacks: Record<string, { type: "PERCENTAGE" | "FIXED", value: number }> = {
        "SNAPP10": { type: "PERCENTAGE", value: 10 },
        "TEMAN15": { type: "PERCENTAGE", value: 15 },
        "SPESIAL20": { type: "PERCENTAGE", value: 20 },
        "FOTO10": { type: "PERCENTAGE", value: 10 },
      };

      const fallback = fallbacks[code];
      if (fallback) {
        return NextResponse.json({
          code: code,
          type: fallback.type,
          value: fallback.value,
        });
      }

      return NextResponse.json({ error: "Kode tidak ditemukan" }, { status: 404 });
    }

    if (!referral.isActive) {
      return NextResponse.json({ error: "Kode tidak aktif" }, { status: 400 });
    }

    if (referral.usageLimit && referral.usageCount >= referral.usageLimit) {
      return NextResponse.json({ error: "Limit penggunaan tercapai" }, { status: 400 });
    }

    if (referral.expiryDate && new Date() > new Date(referral.expiryDate)) {
      return NextResponse.json({ error: "Kode sudah kadaluarsa" }, { status: 400 });
    }

    return NextResponse.json({
      code: referral.code,
      type: referral.type,
      value: referral.value,
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memvalidasi kode" }, { status: 500 });
  }
}
