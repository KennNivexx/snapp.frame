"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getReferrals() {
  try {
    const referrals = await prisma.referralCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: referrals };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createReferral(data: {
  code: string;
  label: string;
  type: "PERCENTAGE" | "FIXED";
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
    return { success: true, data: referral };
  } catch (error: any) {
    return { success: false, error: error.message };
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
