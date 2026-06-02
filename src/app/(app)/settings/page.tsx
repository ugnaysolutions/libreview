import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ChevronRight, Target } from "lucide-react";
import { ExamTargetsManager } from "@/components/settings/ExamTargetsManager";
import { WeeklyGoalSetter } from "@/components/settings/WeeklyGoalSetter";
import { UsernameEditor } from "@/components/settings/UsernameEditor";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, targetsRes] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("full_name, avatar_url, weekly_goal, username")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_exam_targets")
      .select("id, exam_type, exam_date")
      .eq("user_id", user.id)
      .order("exam_date"),
  ]);

  const profile = profileRes.data;
  const targets = targetsRes.data ?? [];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and exam targets.</p>
      </div>

      {/* Profile */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Profile</h2>
        <div className="text-sm text-muted-foreground space-y-0.5">
          <p>{profile?.full_name ?? "—"}</p>
          <p className="text-xs">{user.email}</p>
        </div>
        <div className="rounded-xl border border-border p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Username</p>
            <p className="text-xs text-muted-foreground mt-0.5">Shown on the leaderboard</p>
          </div>
          <UsernameEditor currentUsername={(profile as unknown as { username: string | null })?.username ?? null} />
        </div>
      </section>

      {/* Exam Targets */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Exam Targets</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track countdowns for each entrance exam you&apos;re preparing for.
          </p>
        </div>
        <ExamTargetsManager targets={targets} />
      </section>

      {/* Weekly Goal */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Weekly Practice Goal</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set a target number of practice sessions per week.
          </p>
        </div>
        <div className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-foreground">Sessions per week</span>
          </div>
          <WeeklyGoalSetter current={(profile as unknown as { weekly_goal: number | null })?.weekly_goal ?? null} />
        </div>
      </section>

      {/* Feedback & Ideas */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Feedback & Ideas</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Help shape what Libreview becomes.
          </p>
        </div>
        <Link
          href="/wishlist"
          className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Make a Wish</p>
              <p className="text-xs text-muted-foreground">
                Request features, universities, topics & more
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>
      </section>
    </div>
  );
}
