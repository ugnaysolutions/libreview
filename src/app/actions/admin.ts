"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Choice, QuestionStatus } from "@/lib/supabase/types";
import { activatePremium, deactivatePremium } from "@/lib/activatePremium";

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Unauthorized");
  return { supabase, userId: user.id };
}

// ── Questions ────────────────────────────────────────────────────────────────

export async function createQuestion(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdmin();
    const { error } = await supabase.from("questions").insert({
      topic_id: formData.get("topic_id") as string,
      question_text: formData.get("question_text") as string,
      image_url: (formData.get("image_url") as string) || null,
      choice_a: formData.get("choice_a") as string,
      choice_b: formData.get("choice_b") as string,
      choice_c: formData.get("choice_c") as string,
      choice_d: formData.get("choice_d") as string,
      correct_choice: formData.get("correct_choice") as Choice,
      explanation: formData.get("explanation") as string,
      difficulty: Number(formData.get("difficulty")) || 1,
      status: (formData.get("status") as QuestionStatus) || "draft",
      is_premium: formData.get("is_premium") !== "false",
      created_by: userId,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateQuestion(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdmin();
    const { error } = await supabase
      .from("questions")
      .update({
        topic_id: formData.get("topic_id") as string,
        question_text: formData.get("question_text") as string,
        image_url: (formData.get("image_url") as string) || null,
        choice_a: formData.get("choice_a") as string,
        choice_b: formData.get("choice_b") as string,
        choice_c: formData.get("choice_c") as string,
        choice_d: formData.get("choice_d") as string,
        correct_choice: formData.get("correct_choice") as Choice,
        explanation: formData.get("explanation") as string,
        difficulty: Number(formData.get("difficulty")) || 1,
        status: formData.get("status") as QuestionStatus,
        is_premium: formData.get("is_premium") !== "false",
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function bulkApproveQuestions(
  ids: string[]
): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdmin();
    const { error } = await supabase
      .from("questions")
      .update({
        status: "approved",
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .in("id", ids);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Resources ────────────────────────────────────────────────────────────────

export async function createResource(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdmin();
    const { error } = await supabase.from("resources").insert({
      topic_id: formData.get("topic_id") as string,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      resource_type:
        (formData.get("resource_type") as "youtube" | "article") || "youtube",
      url: formData.get("url") as string,
      is_published: formData.get("is_published") === "true",
      display_order: Number(formData.get("display_order")) || null,
      created_by: userId,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateResource(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("resources")
      .update({
        topic_id: formData.get("topic_id") as string,
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        resource_type:
          formData.get("resource_type") as "youtube" | "article",
        url: formData.get("url") as string,
        is_published: formData.get("is_published") === "true",
        display_order: Number(formData.get("display_order")) || null,
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteResource(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("resources").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function toggleResourcePublished(
  id: string,
  published: boolean
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("resources")
      .update({ is_published: published })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Reports ──────────────────────────────────────────────────────────────────

export async function resolveReport(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("question_reports")
      .update({ is_resolved: true })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── User Plan Management (testing / admin override) ───────────────────────────

export async function grantPremium(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await activatePremium(userId, expiresAt, "monthly");
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function revokePremium(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deactivatePremium(userId);
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Payment Requests ──────────────────────────────────────────────────────────

export async function approvePaymentRequest(requestId: string): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdmin();

    const { data: req, error: fetchErr } = await supabase
      .from("payment_requests")
      .select("user_id, plan_type, reference_number")
      .eq("id", requestId)
      .single();

    if (fetchErr || !req) return { success: false, error: fetchErr?.message ?? "Request not found" };

    const days = req.plan_type === "annual" ? 365 : 30;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await activatePremium(req.user_id, expiresAt, req.plan_type as "monthly" | "annual");

    await supabase.from("subscriptions").insert({
      user_id: req.user_id,
      provider: "manual",
      provider_subscription_id: req.reference_number,
      plan_type: req.plan_type,
      status: "active",
      current_period_end: expiresAt.toISOString(),
    });

    const { error: updateErr } = await supabase
      .from("payment_requests")
      .update({ status: "approved", reviewed_by: userId, reviewed_at: new Date().toISOString() })
      .eq("id", requestId);

    if (updateErr) return { success: false, error: updateErr.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function rejectPaymentRequest(requestId: string): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdmin();

    const { error } = await supabase
      .from("payment_requests")
      .update({ status: "rejected", reviewed_by: userId, reviewed_at: new Date().toISOString() })
      .eq("id", requestId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
