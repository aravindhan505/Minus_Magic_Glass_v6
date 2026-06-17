"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type SpeechBubbleProps = {
  text: string
  className?: string
  /** Auto-dismiss after this many ms. If undefined, stays visible until text changes. */
  autoHideMs?: number
}

/**
 * Retro arcade-style speech bubble for Minu.
 * Appears with a pop-in animation, shows text, and can auto-dismiss.
 */
export function SpeechBubble({ text, className, autoHideMs }: SpeechBubbleProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!text) {
      setVisible(false)
      return
    }
    setVisible(true)

    if (autoHideMs) {
      const timer = setTimeout(() => setVisible(false), autoHideMs)
      return () => clearTimeout(timer)
    }
  }, [text, autoHideMs])

  if (!visible || !text) return null

  return (
    <div
      className={cn(
        "animate-pop-in relative max-w-xs rounded-2xl border border-primary/40 bg-card px-5 py-3 shadow-lg shadow-primary/10",
        className,
      )}
      style={{
        boxShadow: "0 0 12px oklch(0.58 0.27 300 / 25%), 0 4px 16px oklch(0 0 0 / 30%)",
      }}
    >
      {/* Speech bubble tail */}
      <div className="absolute -bottom-2 left-8 h-0 w-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-primary/40" />

      <p className="font-heading text-sm font-bold leading-snug text-foreground">
        {text}
      </p>
    </div>
  )
}
