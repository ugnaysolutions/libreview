"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleExamConfigActive } from "@/app/admin/schedule/actions";
import { cn } from "@/lib/utils";

export function ExamActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(isActive);

  async function handle() {
    setLoading(true);
    const next = !active;
    const result = await toggleExamConfigActive(id, next);
    setLoading(false);
    if (result.success) {
      setActive(next);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
        active ? "bg-primary" : "bg-muted-foreground/30",
        loading && "opacity-50 cursor-not-allowed"
      )}
      aria-label={active ? "Deactivate" : "Activate"}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
          active ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
