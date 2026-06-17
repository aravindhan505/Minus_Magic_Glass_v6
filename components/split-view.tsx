"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type SplitViewProps = {
  /** Source path for the original image */
  leftSrc: string
  /** Source path for the processed/comparison image. */
  rightSrc?: string
  /** Alt text for the images */
  alt: string
  /** Label shown on the left side */
  leftLabel?: string
  /** Label shown on the right side */
  rightLabel?: string
  className?: string
}

/**
 * Before/after split view with a draggable divider.
 * Touch-friendly for 5-year-old fingers.
 */
export function SplitView({
  leftSrc,
  rightSrc,
  alt,
  leftLabel = "Original",
  rightLabel = "Processed",
  className,
}: SplitViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [splitPos, setSplitPos] = useState(50) // percentage
  const [dragging, setDragging] = useState(false)


  const updateSplit = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100))
    setSplitPos(pct)
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      setDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      updateSplit(e.clientX)
    },
    [updateSplit],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      updateSplit(e.clientX)
    },
    [dragging, updateSplit],
  )

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card select-none touch-none",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Left image (original) */}
      <div className="relative aspect-video w-full">
        <Image
          src={leftSrc}
          alt={`${alt} - original`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Right image (processed) — clipped by split position */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
      >
        {rightSrc ? (
          <Image
            src={rightSrc}
            alt={`${alt} - processed`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="font-heading text-sm font-bold text-muted-foreground">
              Processing...
            </span>
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="absolute left-3 top-3 z-10 rounded-full bg-background/70 px-3 py-1 text-xs font-bold text-foreground backdrop-blur-sm">
        {leftLabel}
      </div>
      <div className="absolute right-3 top-3 z-10 rounded-full bg-background/70 px-3 py-1 text-xs font-bold text-foreground backdrop-blur-sm">
        {rightLabel}
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 z-20 h-full w-0.5 bg-white/60"
        style={{ left: `${splitPos}%` }}
      />

      {/* Divider handle */}
      <div
        className={cn(
          "absolute top-1/2 z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-primary shadow-lg transition-transform",
          dragging && "scale-110",
        )}
        style={{ left: `${splitPos}%` }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-primary-foreground"
        >
          <path
            d="M6 10L2 10M2 10L4 8M2 10L4 12M14 10L18 10M18 10L16 8M18 10L16 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
