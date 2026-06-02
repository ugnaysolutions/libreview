"use client";

import { useState } from "react";
import { updateUsername } from "@/app/actions/settings";
import { toast } from "sonner";
import { AtSign, Check, Loader2, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_]{2,19}$/;

interface Props {
  currentUsername: string | null;
}

export function UsernameEditor({ currentUsername }: Props) {
  const [editing, setEditing] = useState(!currentUsername);
  const [value, setValue] = useState(currentUsername ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!USERNAME_REGEX.test(value)) {
      setError("3–20 characters. Letters, numbers, underscores. Cannot start with underscore.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updateUsername(value);
    setSaving(false);
    if (result?.error === "taken") {
      setError("Username already taken. Please choose another.");
    } else if (result?.error === "invalid") {
      setError("Invalid username format.");
    } else {
      toast.success("Username updated!");
      setEditing(false);
    }
  }

  function handleCancel() {
    setValue(currentUsername ?? "");
    setError(null);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
              @
            </span>
            <Input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              placeholder="your_username"
              className="rounded-xl pl-7"
              maxLength={20}
              autoFocus
              autoComplete="off"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            aria-label="Save username"
            className={cn(
              buttonVariants({ size: "icon" }),
              "rounded-xl shrink-0",
              saving && "opacity-60 cursor-not-allowed"
            )}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
          {currentUsername && (
            <button
              onClick={handleCancel}
              aria-label="Cancel"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "rounded-xl shrink-0"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            3–20 characters. Letters, numbers, underscores only.
          </p>
        )}
      </div>
    );
  }

  // Username is set — show display + edit button
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <AtSign className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-semibold text-foreground">{currentUsername}</span>
      </div>
      <button
        onClick={() => setEditing(true)}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-xl gap-1.5 shrink-0"
        )}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>
    </div>
  );
}
