import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { isPremium } from "@/lib/plan";
import { cn } from "@/lib/utils";
import type { Choice } from "@/lib/supabase/types";

const FREE_BOOKMARK_LIMIT = 20;

export default async function BookmarksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const premium = await isPremium(user.id);

  const { data: bookmarks } = await supabase
    .from("bookmarked_questions")
    .select(
      `question_id, created_at,
      questions(
        id, question_text, image_url,
        choice_a, choice_b, choice_c, choice_d,
        correct_choice, explanation,
        topics(name, subtests(name))
      )`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(premium ? 500 : FREE_BOOKMARK_LIMIT);

  const items = bookmarks ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Bookmarks
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {items.length} saved question{items.length !== 1 ? "s" : ""}
          {!premium && ` · ${FREE_BOOKMARK_LIMIT} max`}
        </p>
      </div>

      {!premium && items.length >= FREE_BOOKMARK_LIMIT && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You&apos;ve reached the 20-bookmark limit.{" "}
          <Link href="/upgrade" className="underline font-semibold">
            Upgrade to Premium
          </Link>{" "}
          for unlimited bookmarks and explanations.
        </div>
      )}

      {items.length === 0 ? (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-8 text-center space-y-2">
            <Bookmark className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium text-foreground">
              No bookmarks yet
            </p>
            <p className="text-xs text-muted-foreground">
              Tap &ldquo;Save&rdquo; on any wrong answer after a practice
              session to review it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((b) => {
            const q = b.questions as unknown as {
              id: string;
              question_text: string;
              image_url: string | null;
              choice_a: string;
              choice_b: string;
              choice_c: string;
              choice_d: string;
              correct_choice: Choice;
              explanation: string | null;
              topics: {
                name: string;
                subtests: { name: string };
              } | null;
            } | null;
            if (!q) return null;

            const choiceText: Record<Choice, string> = {
              a: q.choice_a,
              b: q.choice_b,
              c: q.choice_c,
              d: q.choice_d,
            };
            const topicLabel = q.topics
              ? `${q.topics.subtests.name} · ${q.topics.name}`
              : null;

            return (
              <Card
                key={b.question_id}
                className="rounded-2xl border-border shadow-sm"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {topicLabel && (
                        <p className="text-[11px] text-muted-foreground mb-1">
                          {topicLabel}
                        </p>
                      )}
                      <p className="text-sm font-medium text-foreground leading-snug">
                        {q.question_text}
                      </p>
                    </div>
                    <BookmarkButton
                      questionId={q.id}
                      defaultBookmarked={true}
                    />
                  </div>

                  {q.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={q.image_url}
                      alt=""
                      className="w-full rounded-lg object-contain max-h-32"
                      loading="lazy"
                    />
                  )}

                  {/* Correct answer */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Correct answer
                    </p>
                    <div className="flex items-start gap-2 text-sm px-3 py-2 rounded-lg bg-green-50 text-green-800 font-medium">
                      <span className="font-semibold uppercase shrink-0">
                        {q.correct_choice}.
                      </span>
                      <span>{choiceText[q.correct_choice]}</span>
                    </div>
                  </div>

                  {/* Explanation */}
                  {premium && q.explanation && (
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Explanation
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                  {!premium && q.explanation && (
                    <div
                      className={cn(
                        "rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2",
                        "flex items-center justify-between gap-2"
                      )}
                    >
                      <p className="text-xs text-amber-700">
                        Explanation available on Premium
                      </p>
                      <Link
                        href="/upgrade"
                        className="text-xs font-semibold text-amber-600 underline shrink-0"
                      >
                        Upgrade
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
