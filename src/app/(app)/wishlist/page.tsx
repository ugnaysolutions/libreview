import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { isPremium } from "@/lib/plan";
import { WishlistForm } from "@/components/wishlist/WishlistForm";

const CATEGORY_META: Record<string, { label: string; borderColor: string }> = {
  new_university: { label: "New University", borderColor: "#818cf8" },
  new_topic: { label: "New Topic / Subject", borderColor: "#2dd4bf" },
  more_questions: { label: "More Questions", borderColor: "#4ade80" },
  feature_idea: { label: "Feature Idea", borderColor: "#fbbf24" },
  bug_report: { label: "Bug Report", borderColor: "#f87171" },
  other: { label: "Other", borderColor: "#94a3b8" },
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [premium, wishesRes] = await Promise.all([
    isPremium(user.id),
    supabase
      .from("wishlist_requests")
      .select("id, category, title, is_reviewed, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const wishes = wishesRes.data ?? [];
  const wishCount = wishes.length;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Make a Wish
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your ideas shape what Libreview becomes.
          </p>
        </div>
        {!premium && wishCount > 0 && wishCount < 3 && (
          <p className="text-xs text-muted-foreground">
            {wishCount} of 3 free wishes used
            <span className="inline-flex gap-0.5 ml-1.5 align-middle">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={
                    i < wishCount
                      ? "inline-block h-2 w-2 rounded-full bg-primary"
                      : "inline-block h-2 w-2 rounded-full border border-border bg-transparent"
                  }
                />
              ))}
            </span>
          </p>
        )}
      </div>

      {/* Submission form */}
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <WishlistForm wishCount={wishCount} premium={premium} />
      </div>

      {/* Past wishes */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Your Wishes</h2>

        {wishes.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-3xl">🌱</p>
            <p className="text-sm text-muted-foreground">
              No wishes yet. Be the first to plant an idea!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {wishes.map((w) => {
              const meta = CATEGORY_META[w.category] ?? {
                label: w.category,
                borderColor: "#94a3b8",
              };
              return (
                <div
                  key={w.id}
                  className="rounded-2xl border border-border bg-white p-4 flex items-start gap-3 border-l-[3px]"
                  style={{ borderLeftColor: meta.borderColor }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {meta.label}
                    </p>
                    <p className="text-sm font-medium text-foreground mt-0.5 leading-snug">
                      {w.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(w.created_at)}
                    </p>
                  </div>
                  {w.is_reviewed ? (
                    <span className="shrink-0 text-[10px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-0.5 mt-0.5">
                      Seen ✓
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5 mt-0.5">
                      Pending
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
