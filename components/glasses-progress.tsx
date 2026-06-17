"use client"

import { cn } from "@/lib/utils"

type GlassesProgressProps = {
  /** Number of levels completed (0-5) */
  completed: number
  /** Total number of levels */
  total?: number
  className?: string
}

/**
 * Glasses calibration progress indicator.
 * Shows a glasses icon with 5 lens segments that fill in as levels complete,
 * plus a progress bar below.
 */
export function GlassesProgress({ completed, total = 5, className }: GlassesProgressProps) {
  const pct = Math.round((completed / total) * 100)

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Glasses SVG icon */}
      <div className="relative">
        <svg
          width="180"
          height="80"
          viewBox="0 0 180 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Bridge */}
          <path
            d="M72 40 C78 32, 102 32, 108 40"
            stroke="oklch(0.7 0.2 320 / 40%)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left lens */}
          <circle
            cx="52"
            cy="40"
            r="28"
            stroke="oklch(0.7 0.2 320 / 40%)"
            strokeWidth="3"
            fill={completed >= 1 ? "oklch(0.58 0.27 300 / 30%)" : "oklch(0.2 0.03 290 / 50%)"}
          />
          {/* Left lens highlight */}
          {completed >= 1 && (
            <circle
              cx="52"
              cy="40"
              r="28"
              stroke="oklch(0.72 0.29 332 / 80%)"
              strokeWidth="2"
              fill="none"
              className="animate-twinkle"
            />
          )}

          {/* Right lens */}
          <circle
            cx="128"
            cy="40"
            r="28"
            stroke="oklch(0.7 0.2 320 / 40%)"
            strokeWidth="3"
            fill={completed >= 2 ? "oklch(0.72 0.29 332 / 30%)" : "oklch(0.2 0.03 290 / 50%)"}
          />
          {completed >= 2 && (
            <circle
              cx="128"
              cy="40"
              r="28"
              stroke="oklch(0.72 0.29 332 / 80%)"
              strokeWidth="2"
              fill="none"
              className="animate-twinkle"
            />
          )}

          {/* Temple arms */}
          <path
            d="M24 40 L4 36"
            stroke="oklch(0.7 0.2 320 / 40%)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M156 40 L176 36"
            stroke="oklch(0.7 0.2 320 / 40%)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Level completion indicators (small dots inside lenses) */}
          {[
            { cx: 52, cy: 28, level: 1 },
            { cx: 38, cy: 48, level: 2 },
            { cx: 128, cy: 28, level: 3 },
            { cx: 142, cy: 48, level: 4 },
            { cx: 90, cy: 24, level: 5 },
          ].map(({ cx, cy, level }) => (
            <circle
              key={level}
              cx={cx}
              cy={cy}
              r="4"
              fill={
                completed >= level
                  ? "oklch(0.78 0.2 150)"
                  : "oklch(0.3 0.03 290 / 50%)"
              }
              className={completed >= level ? "animate-twinkle" : ""}
            />
          ))}
        </svg>

        {/* Sparkle effect when fully calibrated */}
        {completed === total && (
          <div className="absolute -left-2 -right-2 -top-2 -bottom-2">
            <div className="absolute left-4 top-0 size-2 animate-twinkle rounded-full bg-accent" />
            <div className="absolute right-6 top-1 size-1.5 animate-twinkle rounded-full bg-primary" style={{ animationDelay: "0.5s" }} />
            <div className="absolute bottom-2 left-8 size-1 animate-twinkle rounded-full bg-secondary" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-1 right-4 size-2 animate-twinkle rounded-full bg-accent" style={{ animationDelay: "1.5s" }} />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-heading text-xs font-bold text-muted-foreground">
            Calibration
          </span>
          <span className="font-heading text-xs font-extrabold text-secondary">
            {completed} / {total}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, oklch(0.58 0.27 300), oklch(0.72 0.29 332), oklch(0.78 0.2 150))",
              boxShadow: completed > 0 ? "0 0 8px oklch(0.72 0.29 332 / 60%)" : "none",
            }}
          />
        </div>
      </div>
    </div>
  )
}
