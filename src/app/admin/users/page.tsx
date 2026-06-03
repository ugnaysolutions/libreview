import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PlanToggleButtons } from "./PlanToggleButtons";
import { PaymentRequestsTable } from "@/components/admin/PaymentRequestsTable";
import { BroadcastNotificationForm } from "@/components/admin/BroadcastNotificationForm";

export default async function AdminUsersPage() {
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
  if (profile?.role !== "admin") redirect("/dashboard");

  const adminClient = createAdminClient();

  const [{ data: authData }, { data: profiles }, { data: paymentReqs }] = await Promise.all([
    adminClient.auth.admin.listUsers({ perPage: 200 }),
    adminClient.from("user_profiles").select("id, full_name, plan, plan_type, plan_expires_at, role"),
    adminClient.from("payment_requests").select("*").eq("status", "pending").order("created_at"),
  ]);

  const authUsers = authData?.users ?? [];
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const emailMap = new Map(authUsers.map((u) => [u.id, u.email ?? "—"]));

  const rows = authUsers.map((u) => {
    const p = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "—",
      name: p?.full_name ?? "—",
      role: p?.role ?? "student",
      plan: p?.plan ?? "free",
      planType: p?.plan_type ?? "monthly",
      expiresAt: p?.plan_expires_at ?? null,
    };
  });

  const pendingRequests = (paymentReqs ?? []).map((r) => ({
    ...r,
    user_email: emailMap.get(r.user_id) ?? r.user_id,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Pending payment requests */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Pending Payment Requests</h2>
          <p className="text-sm text-muted-foreground">
            Review GCash payments and approve or reject them.
          </p>
        </div>
        <PaymentRequestsTable requests={pendingRequests} />
      </div>

      {/* Users table */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground">
            Grant or revoke premium access for testing.
          </p>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                  <td className="px-4 py-3">
                    {row.role === "admin" ? (
                      <Badge variant="secondary">Admin</Badge>
                    ) : (
                      <span className="text-muted-foreground">Student</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.plan === "premium" ? (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">
                        Premium · {row.planType}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {row.expiresAt
                      ? new Date(row.expiresAt).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <PlanToggleButtons userId={row.id} isPremium={row.plan === "premium"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast notification */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Send Notification</h2>
          <p className="text-sm text-muted-foreground">
            Broadcast a message to all users (e.g. new questions, announcements).
          </p>
        </div>
        <BroadcastNotificationForm />
      </div>
    </div>
  );
}
