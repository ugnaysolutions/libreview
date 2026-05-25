import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: universities } = await supabase
    .from("universities")
    .select("id, name, slug, is_active")
    .order("display_order");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Welcome to LibreviewPH!
          </h1>
          <p className="text-muted-foreground text-sm">
            Let&apos;s set up your study profile.
          </p>
        </div>
        <OnboardingForm
          userId={user.id}
          universities={universities ?? []}
        />
      </div>
    </div>
  );
}
