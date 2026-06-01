import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MarkReviewedButton } from "@/components/admin/MarkReviewedButton";
import { format, parseISO } from "date-fns";

const CATEGORY_LABELS: Record<string, string> = {
  new_university: "New University",
  new_topic: "New Topic / Subject",
  more_questions: "More Questions",
  feature_idea: "Feature Idea",
  bug_report: "Bug Report",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  new_university: "bg-indigo-100 text-indigo-700",
  new_topic: "bg-teal-100 text-teal-700",
  more_questions: "bg-green-100 text-green-700",
  feature_idea: "bg-amber-100 text-amber-700",
  bug_report: "bg-red-100 text-red-700",
  other: "bg-slate-100 text-slate-700",
};

export default async function AdminWishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewed?: string }>;
}) {
  const { reviewed } = await searchParams;
  const showReviewed = reviewed === "1";
  const supabase = await createClient();

  const { data: wishes } = await supabase
    .from("wishlist_requests")
    .select(
      "id, category, title, description, is_reviewed, created_at, user_profiles(full_name)"
    )
    .eq("is_reviewed", showReviewed)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            Wishlist
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Feature and content requests from users
          </p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-border text-sm">
          <Link
            href="/admin/wishlist"
            className={cn(
              "px-3 py-1.5 transition-colors",
              !showReviewed
                ? "bg-primary text-white font-medium"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Pending
          </Link>
          <Link
            href="/admin/wishlist?reviewed=1"
            className={cn(
              "px-3 py-1.5 transition-colors",
              showReviewed
                ? "bg-primary text-white font-medium"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            Reviewed
          </Link>
        </div>
      </div>

      {!wishes || wishes.length === 0 ? (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No {showReviewed ? "reviewed" : "pending"} wishes.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {wishes.map((wish) => {
            const profile = wish.user_profiles as unknown as {
              full_name: string | null;
            } | null;
            const colorClass =
              CATEGORY_COLORS[wish.category] ?? "bg-slate-100 text-slate-700";
            return (
              <Card
                key={wish.id}
                className="rounded-2xl border-border shadow-sm"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {wish.title}
                      </p>
                      {wish.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {wish.description}
                        </p>
                      )}
                    </div>
                    {!showReviewed && <MarkReviewedButton id={wish.id} />}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                      className={cn(
                        "text-[10px] px-2 py-0.5 border-0",
                        colorClass
                      )}
                    >
                      {CATEGORY_LABELS[wish.category] ?? wish.category}
                    </Badge>
                    {profile?.full_name && (
                      <span className="text-muted-foreground">
                        {profile.full_name}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      {format(parseISO(wish.created_at), "MMM d, yyyy")}
                    </span>
                    {wish.is_reviewed && (
                      <span className="text-primary font-medium">✓ Seen</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
