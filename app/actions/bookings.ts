"use server";

// v2 - forced reload

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

function createAdminClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing from environment!");
  } else {
    console.log("Supabase Admin Client initialized with key starting with:", env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 5) + "...");
  }
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export async function getBookings() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return { data: [], error: error.message };
  }
  return { data, error: null };
}

export async function updateBookingStatus(id: string, status: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Calculate and award commission if status becomes completed ("Selesai")
  if (status === "Selesai") {
    try {
      const { prisma } = await import("@/lib/prisma");
      const booking = await prisma.booking.findUnique({
        where: { id },
      });

      if (booking && booking.referralCode) {
        const code = booking.referralCode.trim().toUpperCase();
        const ref = await prisma.referralCode.findUnique({
          where: { code },
          include: { owner: true }
        });

        // Award fee if referral code is owned by a SNAPPER
        if (ref && ref.ownerId && ref.owner && ref.owner.role === "SNAPPER") {
          // Prevent duplicate commission entries for same booking
          const existingCommission = await prisma.affiliateCommission.findFirst({
            where: { bookingId: id }
          });

          if (!existingCommission) {
            const commissionAmount = booking.finalPrice * (ref.feePercentage / 100);

            await prisma.affiliateCommission.create({
              data: {
                snapperId: ref.ownerId,
                bookingId: id,
                amount: commissionAmount,
                status: "pending"
              }
            });
            console.log(`[Commission] Succesfully awarded Rp ${commissionAmount} to Snapper ${ref.owner.name} (Code: ${code})`);
          }
        }
      }
    } catch (err) {
      console.error("Failed to reward commission on booking completion:", err);
    }
  }

  return { success: true };
}
export async function createBooking(data: any) {
  const supabase = createAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
  
  // Increment referral usage if applicable
  if (data.referral_code) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const normalizedCode = data.referral_code.trim().toUpperCase();
      await prisma.referralCode.update({
        where: { code: normalizedCode },
        data: { usageCount: { increment: 1 } }
      });
    } catch (err) {
      console.error("Failed to increment referral usage:", err);
      // Don't fail the booking if only referral increment fails
    }
  }

  return { success: true, data: booking };
}
