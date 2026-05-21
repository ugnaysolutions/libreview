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
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const schema = z.object({
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("user_profiles").upsert({
      id: userId,
      target_exam_date: values.targetExamDate,
      target_university_id: values.targetUniversityId,
    });

    if (error) {
      toast.error("Failed to save profile. Please try again.");
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="targetExamDate">Target UPCAT Exam Date</Label>
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
          onValueChange={(val) => setValue("targetUniversityId", String(val ?? ""), { shouldValidate: true })}
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select a university" />
          </SelectTrigger>
          <SelectContent>
            {universities.map((u) => (
              <SelectItem key={u.id} value={u.id} disabled={!u.is_active}>
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
