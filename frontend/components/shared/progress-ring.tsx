import { cn } from "@/lib/utils";

export function ProgressRing({
  completed,
  total,
  className,
  size = 44,
}: {
  completed: number;
  total: number;
  className?: string;
  size?: number;
}) {
  const safeTotal = Math.max(total, 1);
  const ratio = Math.min(Math.max(completed / safeTotal, 0), 1);
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${completed} of ${total} documents uploaded`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-accent transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums text-foreground">
        {completed}/{total}
      </span>
    </div>
  );
}
