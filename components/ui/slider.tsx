"use client"

import { useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type SliderProps = {
  id: string
  label: string
  min: number
  max: number
  value: number
  color?: string
  onChange: (id: string, value: number) => void
  className?: string
  /** Pulse ring when a hint points at this slider */
  highlighted?: boolean
}

/**
 * Large, touch-friendly slider for kids (5-8 years old).
 * Minimum 44px handle for easy tapping.
 */
export function LevelSlider({
  id,
  label,
  min,
  max,
  value,
  color = "var(--primary)",
  onChange,
  className,
  highlighted,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const percent = ((value - min) / (max - min)) * 100

  const updateValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const raw = min + pct * (max - min)
      const rounded = Math.round(raw)
      onChange(id, rounded)
    },
    [id, min, max, onChange],
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      setDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      updateValue(e.clientX)
    },
    [updateValue],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      updateValue(e.clientX)
    },
    [dragging, updateValue],
  )

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-xl select-none transition-shadow",
        highlighted && "animate-pulse ring-2 ring-secondary/70 ring-offset-2 ring-offset-card/80",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <label className="font-heading text-sm font-bold text-foreground">
          {label}
        </label>
        <span
          className="font-heading text-xs font-extrabold tabular-nums"
          style={{ color }}
        >
          {value}
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        className="relative h-12 cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={(e) => {
          const step = max > 100 ? 10 : 1
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            onChange(id, Math.min(max, value + step))
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            onChange(id, Math.max(min, value - step))
          }
        }}
      >
        {/* Track background */}
        <div className="absolute left-0 right-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-muted" />

        {/* Filled track */}
        <div
          className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full transition-all"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />

        {/* Handle */}
        <div
          className={cn(
            "absolute top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30 shadow-lg transition-transform",
            dragging && "scale-110",
          )}
          style={{
            left: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}
