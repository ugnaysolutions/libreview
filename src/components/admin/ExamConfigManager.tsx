"use client";

import { useState } from "react";
import { ExamConfigForm } from "./ExamConfigForm";
import { DeleteExamConfigButton } from "./DeleteExamConfigButton";
import { ExamActiveToggle } from "./ExamActiveToggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Plus, ListChecks } from "lucide-react";
import Link from "next/link";

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
  universities: { name: string } | null;
}

interface Props {
  configs: ExamConfig[];
  universities: University[];
}

export function ExamConfigManager({ configs, universities }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground">Exam & Schedule Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage exam configs (colors, names) and their milestone dates.
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditing(null); }}
          className={cn(buttonVariants({ size: "sm" }), "rounded-xl gap-1.5")}
        >
          <Plus className="h-4 w-4" />
          Add Exam
        </button>
      </div>

      {showAdd && !editing && (
        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">New Exam</h2>
            <ExamConfigForm
              universities={universities}
              onClose={() => setShowAdd(false)}
            />
          </CardContent>
        </Card>
      )}

      {configs.length === 0 ? (
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No exams configured yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {configs.map((cfg) => (
            <div key={cfg.id}>
              <Card className="rounded-2xl border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Color swatch */}
                    <div
                      className="h-9 w-9 rounded-xl shrink-0 border border-border/40"
                      style={{ backgroundColor: cfg.color }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{cfg.name}</p>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-md">
                          {cfg.slug}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {cfg.full_name ?? "—"}{cfg.universities ? ` · ${cfg.universities.name}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <ExamActiveToggle id={cfg.id} isActive={cfg.is_active} />

                      <Link
                        href={`/admin/schedule/${cfg.slug}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon-sm" }),
                          "rounded-lg text-muted-foreground hover:text-foreground"
                        )}
                        title="Manage milestones"
                      >
                        <ListChecks className="h-3.5 w-3.5" />
                      </Link>

                      <button
                        onClick={() => { setEditing(cfg.id); setShowAdd(false); }}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon-sm" }),
                          "rounded-lg"
                        )}
                        title="Edit exam"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <DeleteExamConfigButton id={cfg.id} name={cfg.name} />
                    </div>
                  </div>

                  {editing === cfg.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <ExamConfigForm
                        universities={universities}
                        config={cfg}
                        onClose={() => setEditing(null)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
