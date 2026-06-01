import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, BookOpen, FileText, Sparkles, AlertTriangle, CreditCard, Star } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <Card className="rounded-2xl border-border shadow-sm">
      <CardContent className="p-5 flex items-start gap-4">
        <div className="bg-primary/10 rounded-xl p-2.5 shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({
  label,
  count,
  href,
  icon: Icon,
}: {
  label: string;
  count: number;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 hover:bg-muted/40 transition-colors shadow-sm"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      {count > 0 ? (
        <span className="text-xs font-bold bg-red-100 text-red-700 rounded-full px-2.5 py-0.5 tabular-nums">
          {count}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">None</span>
      )}
    </Link>
  );
}

export default async function AdminOverviewPage() {
  const admin = createAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    totalUsersRes,
    newUsersRes,
    premiumUsersRes,
    practiceSessionsRes,
    mockSessionsRes,
    questionsAnsweredRes,
    pendingPaymentsRes,
    unresolvedReportsRes,
    pendingWishlistRes,
    totalQuestionsRes,
    approvedQuestionsRes,
  ] = await Promise.all([
    admin.from("user_profiles").select("id", { count: "exact", head: true }),
    admin.from("user_profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    admin.from("user_profiles").select("id", { count: "exact", head: true }).eq("plan", "premium"),
    admin.from("exam_sessions").select("id", { count: "exact", head: true }).eq("status", "completed").eq("session_type", "topic_practice").gte("completed_at", sevenDaysAgo),
    admin.from("exam_sessions").select("id", { count: "exact", head: true }).eq("status", "completed").eq("session_type", "mock_exam").gte("completed_at", sevenDaysAgo),
    admin.from("session_answers").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    admin.from("payment_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("question_reports").select("id", { count: "exact", head: true }).eq("is_resolved", false),
    admin.from("wishlist_requests").select("id", { count: "exact", head: true }).eq("is_reviewed", false),
    admin.from("questions").select("id", { count: "exact", head: true }),
    admin.from("questions").select("id", { count: "exact", head: true }).eq("status", "approved"),
  ]);

  const totalUsers = totalUsersRes.count ?? 0;
  const newUsers = newUsersRes.count ?? 0;
  const premiumUsers = premiumUsersRes.count ?? 0;
  const freeUsers = totalUsers - premiumUsers;
  const practiceSessions = practiceSessionsRes.count ?? 0;
  const mockSessions = mockSessionsRes.count ?? 0;
  const questionsAnswered = questionsAnsweredRes.count ?? 0;
  const pendingPayments = pendingPaymentsRes.count ?? 0;
  const unresolvedReports = unresolvedReportsRes.count ?? 0;
  const pendingWishlist = pendingWishlistRes.count ?? 0;
  const totalQuestions = totalQuestionsRes.count ?? 0;
  const approvedQuestions = approvedQuestionsRes.count ?? 0;

  const premiumPct = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold font-heading text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Last updated now · 7-day window where applicable</p>
      </div>

      {/* Users */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Users</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Users" value={totalUsers} icon={Users} />
          <StatCard label="New This Week" value={newUsers} icon={TrendingUp} sub="Last 7 days" />
          <StatCard label="Premium" value={premiumUsers} icon={Star} sub={`${premiumPct}% of users`} />
          <StatCard label="Free" value={freeUsers} icon={Users} sub={`${100 - premiumPct}% of users`} />
        </div>

        {/* Free vs Premium bar */}
        {totalUsers > 0 && (
          <div className="rounded-2xl border border-border bg-card shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Free — {freeUsers}</span>
              <span>Premium — {premiumUsers}</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              <div
                className="bg-muted-foreground/40 h-full"
                style={{ width: `${100 - premiumPct}%` }}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${premiumPct}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Activity (7d) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Activity — Last 7 Days</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Practice Sessions" value={practiceSessions} icon={BookOpen} />
          <StatCard label="Mock Exams" value={mockSessions} icon={FileText} />
          <StatCard label="Questions Answered" value={questionsAnswered.toLocaleString()} icon={Sparkles} />
        </div>
      </section>

      {/* Question bank */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Question Bank</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Questions" value={totalQuestions} icon={FileText} />
          <StatCard label="Approved" value={approvedQuestions} icon={BookOpen} sub={`${totalQuestions > 0 ? Math.round((approvedQuestions / totalQuestions) * 100) : 0}% of total`} />
        </div>
      </section>

      {/* Needs attention */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Needs Attention</h2>
        <div className="space-y-2">
          <AlertCard label="Pending Payment Requests" count={pendingPayments} href="/admin/users" icon={CreditCard} />
          <AlertCard label="Unresolved Question Reports" count={unresolvedReports} href="/admin/reports" icon={AlertTriangle} />
          <AlertCard label="Pending Wishlist Items" count={pendingWishlist} href="/admin/wishlist" icon={Sparkles} />
        </div>
      </section>
    </div>
  );
}
