"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleResourcePublished } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  published: boolean;
}

export function PublishToggle({ id, published }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(published);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const next = !value;
    setValue(next);
    const result = await toggleResourcePublished(id, next);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setValue(!next);
      toast.error(result.error);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={value ? "Published — click to unpublish" : "Unpublished — click to publish"}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        value ? "bg-primary" : "bg-muted",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          value ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}
