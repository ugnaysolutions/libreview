"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="text-6xl">⚡</div>
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            An unexpected error occurred. Please try again or go back to the
            dashboard.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-muted-foreground/60">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-xl"
            )}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "sm" }), "rounded-xl")}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
