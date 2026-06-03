export function applySmTwo(
  stats: { interval_days: number; ease_factor: number; repetitions: number },
  correct: boolean
): {
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  next_review_at: string;
  last_reviewed_at: string;
} {
  let { interval_days, ease_factor, repetitions } = stats;

  if (correct) {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
    ease_factor = Math.max(1.3, ease_factor + 0.1);
    repetitions += 1;
  } else {
    interval_days = 1;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
    repetitions = 0;
  }

  const now = new Date();
  return {
    interval_days,
    ease_factor,
    repetitions,
    next_review_at: new Date(now.getTime() + interval_days * 86_400_000).toISOString(),
    last_reviewed_at: now.toISOString(),
  };
}
