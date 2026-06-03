"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { UNIVERSITY_EXAM_MAP } from "@/lib/constants";

const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_]{2,19}$/;

const schema = z.object({
  username: z
    .string()
    .min(3, "Must be at least 3 characters")
    .max(20, "Must be at most 20 characters")
    .regex(USERNAME_REGEX, "Letters, numbers, underscores only. Cannot start with underscore."),
  targetExamDate: z.string().min(1, "Please select your target exam date"),
  targetUniversityId: z.string().min(1, "Please select a target university"),
});

type FormValues = z.infer<typeof schema>;

interface University {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export function OnboardingForm({
  userId,
  universities,
}: {
  userId: string;
  universities: University[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const selectedUniversityName =
    universities.find((u) => u.id === selectedUniversityId)?.name ?? "";

  async function onSubmit(values: FormValues) {
    setSaving(true);
    const supabase = createClient();

    // Check username availability (exclude current user in case of re-submit)
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id")
      .ilike("username", values.username)
      .neq("id", userId)
      .maybeSingle();

    if (existing) {
      setError("username", { message: "Username already taken. Please choose another." });
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("user_profiles").upsert({
      id: userId,
      username: values.username,
      target_exam_date: values.targetExamDate,
      target_university_id: values.targetUniversityId,
    });

    if (error) {
      toast.error("Failed to save profile. Please try again.");
      setSaving(false);
      return;
    }

    // Seed exam target from selected university slug
    const selectedUniversity = universities.find((u) => u.id === values.targetUniversityId);
    const examType = selectedUniversity?.slug
      ? UNIVERSITY_EXAM_MAP[selectedUniversity.slug] ?? null
      : null;
    if (examType) {
      await supabase.from("user_exam_targets").upsert(
        { user_id: userId, exam_type: examType, exam_date: values.targetExamDate },
        { onConflict: "user_id,exam_type" }
      );
    }

    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
          <Input
            id="username"
            {...register("username")}
            placeholder="your_username"
            className="rounded-xl pl-7"
            maxLength={20}
            autoComplete="off"
          />
        </div>
        {errors.username ? (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Shown on the leaderboard. 3–20 characters.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="targetExamDate">Target exam date</Label>
        <Input
          id="targetExamDate"
          type="date"
          {...register("targetExamDate")}
          className="rounded-xl"
        />
        {errors.targetExamDate && (
          <p className="text-xs text-destructive">{errors.targetExamDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Target University</Label>
        <Select
          onValueChange={(val) => {
            const id = String(val ?? "");
            setSelectedUniversityId(id);
            setValue("targetUniversityId", id, { shouldValidate: true });
          }}
        >
          <SelectTrigger className="rounded-xl">
            <span className={selectedUniversityName ? "text-sm" : "text-sm text-muted-foreground"}>
              {selectedUniversityName || "Select a university"}
            </span>
          </SelectTrigger>
          <SelectContent>
            {universities.map((u) => (
              <SelectItem key={u.id} value={u.id} label={u.name} disabled={!u.is_active}>
                <span className="flex items-center gap-2">
                  {u.name}
                  {!u.is_active && (
                    <Badge variant="secondary" className="text-xs py-0">
                      Coming Soon
                    </Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.targetUniversityId && (
          <p className="text-xs text-destructive">{errors.targetUniversityId.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary hover:bg-[#0F766E] text-white font-semibold"
        size="lg"
      >
        {saving ? "Saving…" : "Get Started"}
      </Button>
    </form>
  );
}
