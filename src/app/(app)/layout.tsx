import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("user_profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  const currentUser = {
    name: profile?.full_name ?? user?.email ?? "User",
    email: user?.email ?? "",
    avatarUrl: (profile?.avatar_url as string | null) ?? null,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar user={currentUser} />
      <main className="flex-1 min-w-0 pb-28 md:pb-0">{children}</main>
      <BottomNav user={currentUser} />
    </div>
  );
}
