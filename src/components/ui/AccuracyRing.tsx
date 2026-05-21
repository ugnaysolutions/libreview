import { cn } from "@/lib/utils";

interface AccuracyRingProps {
  accuracy: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function AccuracyRing({
  accuracy,
  size = 72,
  strokeWidth = 7,
  showLabel = true,
  className,
}: AccuracyRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, accuracy));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70
      ? "#22C55E"
      : clamped >= 50
      ? "#F59E0B"
      : clamped === 0
      ? "#E2E8F0"
      : "#EF4444";

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground leading-none">
            {clamped === 0 ? "—" : `${Math.round(clamped)}%`}
          </span>
        </div>
      )}
    </div>
  );
}
