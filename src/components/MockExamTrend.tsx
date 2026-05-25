"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SCHOOL_EXAMS } from "@/lib/constants";
import type { ExamType } from "@/lib/constants";

interface Session {
  id: string;
  exam_type: string;
  correct_count: number;
  total_questions: number;
  completed_at: string;
  time_spent_seconds: number | null;
}

interface Props {
  sessions: Session[];
}

const EXAM_ORDER: ExamType[] = ["upcat", "acet", "dlsu", "ust", "dost"];

function toScore(s: Session) {
  return s.total_questions > 0
    ? Math.round((s.correct_count / s.total_questions) * 100)
    : 0;
}

function formatTime(seconds: number | null) {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as {
    attempt: number;
    score: number;
    date: string;
    time: string | null;
    correct: number;
    total: number;
  };
  return (
    <div className="rounded-xl border border-border bg-background shadow-md px-3 py-2 text-xs space-y-0.5">
      <p className="font-semibold text-foreground">Attempt {d.attempt}</p>
      <p className="text-muted-foreground">
        {d.correct}/{d.total} correct · {d.score}%
      </p>
      <p className="text-muted-foreground">{d.date}</p>
      {d.time && <p className="text-muted-foreground">{d.time}</p>}
    </div>
  );
}

export function MockExamTrend({ sessions }: Props) {
  const grouped = new Map<ExamType, Session[]>();
  for (const s of sessions) {
    const key = s.exam_type as ExamType;
    if (!EXAM_ORDER.includes(key)) continue;
    const arr = grouped.get(key) ?? [];
    arr.push(s);
    grouped.set(key, arr);
  }

  const availableTabs = EXAM_ORDER.filter((t) => grouped.has(t));

  const [activeTab, setActiveTab] = useState<ExamType>(
    availableTabs[0] ?? "upcat"
  );

  if (availableTabs.length === 0) {
    return (
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Complete a mock exam to see your score trend.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tabSessions = grouped.get(activeTab) ?? [];
  const chartData = tabSessions.map((s, i) => ({
    attempt: i + 1,
    score: toScore(s),
    date: format(parseISO(s.completed_at), "MMM d, yyyy"),
    time: formatTime(s.time_spent_seconds),
    correct: s.correct_count,
    total: s.total_questions,
  }));

  const scores = chartData.map((d) => d.score);
  const best = Math.max(...scores);
  const latest = scores[scores.length - 1] ?? 0;
  const trend =
    scores.length >= 2 ? latest - scores[0] : null;

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      {availableTabs.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {SCHOOL_EXAMS[tab].name}
            </button>
          ))}
        </div>
      )}

      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          {/* Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="attempt"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Attempt",
                  position: "insideBottomRight",
                  offset: -4,
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <ReferenceLine
                y={75}
                stroke="#F59E0B"
                strokeDasharray="4 3"
                label={{
                  value: "Target",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#F59E0B",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--primary, #0D9488)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--primary, #0D9488)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Summary chips */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-muted/50 p-2.5 text-center">
              <p className="text-base font-bold text-foreground">{best}%</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Best</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-2.5 text-center">
              <p className="text-base font-bold text-foreground">{latest}%</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Latest</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-2.5 text-center">
              {trend !== null ? (
                <p
                  className={cn(
                    "text-base font-bold",
                    trend > 0
                      ? "text-green-500"
                      : trend < 0
                      ? "text-red-500"
                      : "text-foreground"
                  )}
                >
                  {trend > 0 ? `+${trend}` : trend}%
                </p>
              ) : (
                <p className="text-base font-bold text-muted-foreground">—</p>
              )}
              <p className="text-[11px] text-muted-foreground mt-0.5">Trend</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
