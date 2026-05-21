import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-5xl">🚫</p>
          <h1 className="text-xl font-bold font-heading text-foreground">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground">
            You don&apos;t have permission to view this page. Contact an
            administrator if you believe this is an error.
          </p>
          <Link
            href="/dashboard"
            className="inline-block text-sm text-primary font-medium mt-2"
          >
            ← Back to app
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
