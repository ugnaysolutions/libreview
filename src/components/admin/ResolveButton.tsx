"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resolveReport } from "@/app/actions/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function ResolveButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleResolve() {
    setLoading(true);
    const result = await resolveReport(id);
    setLoading(false);
    if (result.success) {
      toast.success("Report resolved.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <button
      onClick={handleResolve}
      disabled={loading}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "rounded-xl gap-1.5",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Resolve
    </button>
  );
}
