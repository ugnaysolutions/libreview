"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { upsertExamConfig } from "@/app/admin/schedule/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface University {
  id: string;
  name: string;
}

interface ExamConfig {
  id: string;
  slug: string;
  name: string;
  full_name: string | null;
  university_id: string | null;
  color: string;
  display_order: number | null;
  is_active: boolean;
}

interface Props {
  universities: University[];
  config?: ExamConfig;
  onClose: () => void;
}

export function ExamConfigForm({ universities, config, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(config?.name ?? "");
  const [slug, setSlug] = useState(config?.slug ?? "");

  function handleNameChange(val: string) {
    setName(val);
    if (!config) {
      setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await upsertExamConfig(fd);
    setLoading(false);
    if (result.success) {
      toast.success(config ? "Exam updated." : "Exam added.");
      router.refresh();
      onClose();
    } else {
      toast.error(result.error);
    }
  }

  const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {config && <input type="hidden" name="id" value={config.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Short Name *</label>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. UPCAT"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Slug *</label>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. upcat"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Full Name</label>
        <input
          name="full_name"
          defaultValue={config?.full_name ?? ""}
          placeholder="e.g. UP College Admission Test"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>University</label>
          <select name="university_id" defaultValue={config?.university_id ?? ""} className={inputCls}>
            <option value="">— None —</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="color"
              defaultValue={config?.color ?? "#0D9488"}
              className="h-9 w-14 rounded-lg border border-border cursor-pointer bg-background p-0.5"
            />
            <span className="text-xs text-muted-foreground">Badge & calendar dot color</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Display Order</label>
          <input
            type="number"
            name="display_order"
            defaultValue={config?.display_order ?? ""}
            placeholder="e.g. 1"
            className={inputCls}
          />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            value="true"
            defaultChecked={config?.is_active ?? true}
            className="rounded"
          />
          <label htmlFor="is_active" className="text-sm text-foreground">Active (visible to students)</label>
          {/* Hidden fallback so unchecked sends "false" */}
        </div>
      </div>

      {/* is_active workaround: use a hidden select pattern */}
      <input type="hidden" name="is_active" value="false" />

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-xl")}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1.5")}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {config ? "Save Changes" : "Add Exam"}
        </button>
      </div>
    </form>
  );
}
