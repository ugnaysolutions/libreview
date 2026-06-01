"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { toast } from "sonner";
import { Upload, AlertCircle, CheckCircle2, Loader2, Download, X } from "lucide-react";
import { bulkImportQuestions, type ImportRow } from "@/app/actions/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REQUIRED_COLS = ["topic_slug", "question_text", "choice_a", "choice_b", "choice_c", "choice_d", "correct_choice"];

const TEMPLATE_CSV = [
  "topic_slug,question_text,choice_a,choice_b,choice_c,choice_d,correct_choice,explanation,difficulty,is_premium",
  "algebra,What is 2 + 2?,3,4,5,6,b,2 + 2 equals 4,1,false",
].join("\n");

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "questions_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface ParsedRow {
  row: number;
  data: ImportRow;
  warnings: string[];
}

interface ParseError {
  row: number;
  message: string;
}

export function CsvImportForm({ topicSlugs }: { topicSlugs: string[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFile(file: File) {
    setFileName(file.name);
    setParsed(null);
    setErrors([]);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete({ data, errors: parseErrors }) {
        if (parseErrors.length > 0) {
          setErrors([{ row: 0, message: `Parse error: ${parseErrors[0].message}` }]);
          return;
        }
        if (data.length === 0) {
          setErrors([{ row: 0, message: "File is empty" }]);
          return;
        }

        const cols = Object.keys(data[0]);
        const missing = REQUIRED_COLS.filter((c) => !cols.includes(c));
        if (missing.length > 0) {
          setErrors([{ row: 0, message: `Missing required columns: ${missing.join(", ")}` }]);
          return;
        }

        const rows: ParsedRow[] = [];
        const errs: ParseError[] = [];

        data.forEach((raw, i) => {
          const rowNum = i + 2; // 1-indexed + header
          const warnings: string[] = [];

          const slug = raw.topic_slug?.trim() ?? "";
          if (!topicSlugs.includes(slug)) {
            warnings.push(`Unknown topic_slug "${slug}"`);
          }

          const choice = (raw.correct_choice ?? "").toLowerCase().trim();
          if (!["a", "b", "c", "d"].includes(choice)) {
            errs.push({ row: rowNum, message: `Row ${rowNum}: correct_choice must be a/b/c/d, got "${raw.correct_choice}"` });
            return;
          }

          if (!raw.question_text?.trim()) {
            errs.push({ row: rowNum, message: `Row ${rowNum}: question_text is empty` });
            return;
          }

          const diff = Number(raw.difficulty);
          if (raw.difficulty && ![1, 2, 3].includes(diff)) {
            warnings.push(`difficulty "${raw.difficulty}" is invalid — defaulting to 1`);
          }

          rows.push({
            row: rowNum,
            warnings,
            data: {
              topic_slug: slug,
              question_text: raw.question_text.trim(),
              choice_a: raw.choice_a?.trim() ?? "",
              choice_b: raw.choice_b?.trim() ?? "",
              choice_c: raw.choice_c?.trim() ?? "",
              choice_d: raw.choice_d?.trim() ?? "",
              correct_choice: choice,
              explanation: raw.explanation?.trim() ?? "",
              difficulty: [1, 2, 3].includes(diff) ? diff : 1,
              is_premium: raw.is_premium?.toLowerCase() === "true",
            },
          });
        });

        setErrors(errs);
        setParsed(rows);
      },
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
    else toast.error("Please upload a .csv file");
  }

  async function handleImport() {
    if (!parsed || parsed.length === 0) return;
    setSubmitting(true);
    const result = await bulkImportQuestions(parsed.map((p) => p.data));
    setSubmitting(false);

    if (result.success) {
      toast.success(`Imported ${result.imported} question${result.imported !== 1 ? "s" : ""}${result.skipped > 0 ? ` (${result.skipped} skipped)` : ""} as drafts.`);
      setParsed(null);
      setFileName(null);
      if (fileRef.current) fileRef.current.value = "";
      router.push("/admin/questions?status=draft");
    } else {
      toast.error(result.error);
    }
  }

  function reset() {
    setParsed(null);
    setErrors([]);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const validCount = parsed?.length ?? 0;
  const warnCount = parsed?.filter((p) => p.warnings.length > 0).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Template download */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-muted/30">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Download Template</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fill in the CSV template and upload it below. Topic slugs must match existing topics.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl gap-1.5 shrink-0")}
        >
          <Download className="h-3.5 w-3.5" />
          Template
        </button>
      </div>

      {/* Upload area */}
      {!parsed && errors.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            {fileName ? fileName : "Click or drag a CSV file here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Only .csv files · Max 500 rows recommended</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> {errors.length} error{errors.length > 1 ? "s" : ""} found
            </p>
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-1">
            {errors.map((e, i) => (
              <p key={i} className="text-xs text-destructive">{e.message}</p>
            ))}
          </div>
          <button
            onClick={reset}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
          >
            Upload a different file
          </button>
        </div>
      )}

      {/* Preview */}
      {parsed && parsed.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-foreground">
                {validCount} row{validCount !== 1 ? "s" : ""} ready to import
                {warnCount > 0 && (
                  <span className="text-amber-600 ml-1.5">· {warnCount} with warnings</span>
                )}
              </p>
            </div>
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          </div>

          {/* Table preview */}
          <div className="rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">#</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Topic</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Question</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Answer</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Diff</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Premium</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Warnings</th>
                </tr>
              </thead>
              <tbody>
                {parsed.slice(0, 20).map((p, i) => (
                  <tr key={i} className={cn("border-b border-border last:border-0", p.warnings.length > 0 && "bg-amber-50/50")}>
                    <td className="px-3 py-2 text-muted-foreground">{p.row}</td>
                    <td className="px-3 py-2 font-mono">{p.data.topic_slug}</td>
                    <td className="px-3 py-2 max-w-[200px] truncate">{p.data.question_text}</td>
                    <td className="px-3 py-2 uppercase font-semibold">{p.data.correct_choice}</td>
                    <td className="px-3 py-2">{p.data.difficulty}</td>
                    <td className="px-3 py-2">{p.data.is_premium ? "Yes" : "No"}</td>
                    <td className="px-3 py-2 text-amber-600">{p.warnings.join("; ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.length > 20 && (
              <p className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
                + {parsed.length - 20} more rows (not shown)
              </p>
            )}
          </div>

          <button
            onClick={handleImport}
            disabled={submitting}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full rounded-xl font-bold gap-2",
              submitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Importing…" : `Import ${validCount} Question${validCount !== 1 ? "s" : ""} as Drafts`}
          </button>
        </div>
      )}

      {/* Topic slugs reference */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground font-medium py-1">
          Available topic slugs ({topicSlugs.length})
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {topicSlugs.map((s) => (
            <code key={s} className="bg-muted px-2 py-0.5 rounded font-mono text-[11px]">{s}</code>
          ))}
        </div>
      </details>
    </div>
  );
}
