import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// POST: Buat kode referral baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const referralSchema = z.object({
      code: z.string().min(3).toUpperCase(),
      label: z.string().optional().default(""),
      type: z.enum(["PERCENTAGE", "FIXED"]),
      value: z.number().min(0),
      usageLimit: z.number().optional(),
      expiryDate: z.string().optional(),
    });

    const validatedData = referralSchema.parse(body);

    const referral = await prisma.referralCode.create({
      data: {
        code: validatedData.code,
        label: validatedData.label,
        type: validatedData.type,
        value: validatedData.value,
        usageLimit: validatedData.usageLimit,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
      },
    });

    return NextResponse.json(referral);
  } catch (error) {
    console.error("Referral creation error:", error);
    return NextResponse.json({ error: "Gagal membuat kode referral" }, { status: 400 });
  }
}

// GET: Ambil daftar kode referral
export async function GET() {
  try {
    const referrals = await prisma.referralCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(referrals);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data referral" }, { status: 500 });
  }
}
