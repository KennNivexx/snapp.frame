"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { ReferralType } from "@/prisma/generated/client";

export async function getReferrals() {
  try {
    const [referrals, bookingsRes] = await Promise.all([
      prisma.referralCode.findMany({
        orderBy: { createdAt: "desc" },
      }),
      supabaseAdmin
        .from("bookings")
        .select("referral_code")
        .not("referral_code", "is", null)
    ]);

    const onlineUsages = (bookingsRes.data || []) as { referral_code: string | null }[];
    
    // Aggregate online usages
    const onlineCounts: Record<string, number> = {};
    onlineUsages.forEach(b => {
      const code = b.referral_code?.toUpperCase();
      if (code) {
        onlineCounts[code] = (onlineCounts[code] || 0) + 1;
      }
    });

    // Combine with Prisma usageCount (which typically tracks POS usage)
    const combinedData = referrals.map(ref => ({
      ...ref,
      createdAt: ref.createdAt.toISOString(),
      updatedAt: ref.updatedAt.toISOString(),
      expiryDate: ref.expiryDate ? ref.expiryDate.toISOString() : null,
      usageCount: ref.usageCount + (onlineCounts[ref.code.toUpperCase()] || 0)
    }));

    return { success: true, data: combinedData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createReferral(data: {
  code: string;
  label: string;
  type: ReferralType;
  value: number;
  usageLimit?: number | null;
  expiryDate?: string | null;
}) {
  try {
    const referral = await prisma.referralCode.create({
      data: {
        code: data.code.toUpperCase(),
        label: data.label,
        type: data.type,
        value: data.value,
        usageLimit: data.usageLimit || null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        isActive: true,
      },
    });
    revalidatePath("/admin/referrals");
    return { 
      success: true, 
      data: {
        ...referral,
        createdAt: referral.createdAt.toISOString(),
        updatedAt: referral.updatedAt.toISOString(),
        expiryDate: referral.expiryDate ? referral.expiryDate.toISOString() : null,
      } 
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Kode promo ini sudah ada. Silakan gunakan kode lain yang unik." };
    }
    return { success: false, error: error.message || "Gagal membuat kode promo." };
  }
}

export async function toggleReferralStatus(id: string, isActive: boolean) {
  try {
    await prisma.referralCode.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/referrals");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteReferral(id: string) {
  try {
    await prisma.referralCode.delete({
      where: { id },
    });
    revalidatePath("/admin/referrals");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
export async function validateReferral(code: string) {
  try {
    const referral = await prisma.referralCode.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
      },
    });

    if (!referral) {
      // Fallback codes for consistency with marketing page
      const fallbacks: Record<string, { type: "PERCENTAGE" | "FIXED", value: number }> = {
        "SNAPP10": { type: "PERCENTAGE", value: 10 },
        "TEMAN15": { type: "PERCENTAGE", value: 15 },
        "SPESIAL20": { type: "PERCENTAGE", value: 20 },
        "FOTO10": { type: "PERCENTAGE", value: 10 },
      };

      const fallback = fallbacks[code.toUpperCase()];
      if (fallback) {
        return {
          success: true,
          data: {
            code: code.toUpperCase(),
            type: fallback.type,
            value: fallback.value
          }
        };
      }

      return { success: false, error: "Kode promo tidak valid atau sudah tidak aktif." };
    }

    if (referral.usageLimit && referral.usageCount >= referral.usageLimit) {
      return { success: false, error: "Batas penggunaan kode promo telah tercapai." };
    }

    if (referral.expiryDate && new Date() > referral.expiryDate) {
      return { success: false, error: "Kode promo telah kadaluarsa." };
    }

    return { 
      success: true, 
      data: {
        code: referral.code,
        type: referral.type,
        value: referral.value
      } 
    };
  } catch (error: any) {
    console.error("ValidateReferral Error:", error);
    return { success: false, error: `Gagal memvalidasi kode promo: ${error.message}` };
  }
}
