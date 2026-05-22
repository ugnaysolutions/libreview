import { Medal } from "lucide-react";

export type BadgeLevel = "gold" | "silver" | "bronze";

const BADGE_STYLES: Record<BadgeLevel, { color: string; label: string }> = {
  gold:   { color: "#F59E0B", label: "Gold"   },
  silver: { color: "#94A3B8", label: "Silver" },
  bronze: { color: "#B87333", label: "Bronze" },
};

export function getBadgeLevel(accuracy: number, hasStarted: boolean): BadgeLevel | null {
  if (!hasStarted) return null;
  if (accuracy >= 100) return "gold";
  if (accuracy >= 85)  return "silver";
  if (accuracy >= 70)  return "bronze";
  return null;
}

export function TopicBadge({ level, size = 14 }: { level: BadgeLevel; size?: number }) {
  const { color } = BADGE_STYLES[level];
  return <Medal style={{ color, width: size, height: size, flexShrink: 0 }} />;
}

export function badgeLabel(level: BadgeLevel): string {
  return BADGE_STYLES[level].label;
}
