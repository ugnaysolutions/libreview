"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PRICING } from "@/lib/constants";

export async function submitPaymentRequest(
  planType: "monthly" | "annual",
  referenceNumber: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const ref = referenceNumber.trim();
  if (!ref || ref.length < 5) return { error: "Please enter a valid reference number." };

  // Prevent duplicate pending requests
  const { data: existing } = await supabase
    .from("payment_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) return { error: "You already have a pending payment request. Please wait for it to be reviewed." };

  const { error } = await supabase.from("payment_requests").insert({
    user_id: user.id,
    plan_type: planType,
    reference_number: ref,
    amount_cents: PRICING[planType].cents,
  });

  if (error) return { error: error.message };
  revalidatePath("/upgrade");
  return { error: null };
}
