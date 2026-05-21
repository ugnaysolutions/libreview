import type { Metadata } from "next";
import { LoginButton } from "./LoginButton";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Libreview — Free UPCAT Reviewer",
  description:
    "Prepare for the UPCAT with Libreview — a free, no-ads reviewer for Filipino Grade 12 students. Practice by topic, take mock exams, and track your progress.",
};

export default function LoginPage() {
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
              Free UPCAT reviewer.
            </p>
            <p className="text-sm text-muted-foreground">No ads. No paywalls.</p>
          </div>

          <LoginButton />
        </div>
      </div>
    </div>
  );
}
