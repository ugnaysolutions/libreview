"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteResource } from "@/app/actions/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteResourceButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this resource?")) return;
    setLoading(true);
    const result = await deleteResource(id);
    setLoading(false);
    if (result.success) {
      toast.success("Resource deleted.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        "rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50",
        loading && "opacity-60 cursor-not-allowed"
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
