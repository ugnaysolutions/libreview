import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="text-6xl">🔍</div>
        <div>
          <h1 className="text-5xl font-bold font-heading text-primary">404</h1>
          <p className="text-xl font-semibold text-foreground mt-2">
            Page not found
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ size: "sm" }), "rounded-xl")}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
