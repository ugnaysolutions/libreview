"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { markWishReviewed } from "@/app/actions/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarkReviewedButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await markWishReviewed(id);
    setLoading(false);
    if (result.success) {
      toast.success("Marked as reviewed.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "rounded-xl gap-1.5",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      Mark Seen
    </button>
  );
}
