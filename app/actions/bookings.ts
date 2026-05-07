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
  return { success: true };
}
