"use client";

import { WifiOff } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mx-auto">
          <WifiOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold font-heading text-foreground">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re offline. Check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
