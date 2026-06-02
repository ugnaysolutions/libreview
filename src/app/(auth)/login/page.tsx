import type { Metadata } from "next";
import { LoginButton } from "./LoginButton";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "LibreviewPH — Free College Entrance Test Reviewer",
  description:
    "Prepare for your college entrance test with LibreviewPH — a free, no-ads reviewer for Filipino Grade 12 students. Practice by topic, take mock exams, and track your progress.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary font-heading tracking-tight">
            {APP_NAME}
          </h1>
          <p className="text-muted-foreground text-lg">{APP_TAGLINE}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Free college entrance test reviewer.
            </p>
            <p className="text-sm text-muted-foreground">Start free. Go further with premium.</p>
          </div>

          {error === "auth" && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
              Sign-in failed. Please try again or contact support if the issue persists.
            </p>
          )}

          <LoginButton />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Powered by{" "}
          <span className="font-medium text-foreground/60">Ugnay Solutions</span>
        </p>
      </div>
    </div>
  );
}
