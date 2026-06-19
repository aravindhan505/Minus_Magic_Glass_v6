"use client"

import { useEffect, useRef } from "react"
import { Sparkles } from "lucide-react"
import { MinuAvatar } from "@/components/minu-avatar"
import { Starfield } from "@/components/starfield"
import { playLevel5Then } from "@/lib/level5-audio"
import type { MinuPose } from "@/lib/minu-config"
import { cn } from "@/lib/utils"

type Level5PartBridgeProps = {
  partLabel: string
  title: string
  tagline?: string
  narratorFile: string
  accentClass?: string
  minuPose?: MinuPose
  onReady: () => void
}

/**
 * Interstitial screen between Planet Map and each Level 5 part.
 * Shows the part title while the narrator intro plays, then hands off to gameplay.
 */
export function Level5PartBridge({
  partLabel,
  title,
  tagline,
  narratorFile,
  accentClass = "border-primary/50 shadow-primary/25",
  minuPose = "waving",
  onReady,
}: Level5PartBridgeProps) {
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    playLevel5Then(narratorFile, onReady)
  }, [narratorFile, onReady])

  return (
    <main className="relative flex h-dvh max-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4">
      <Starfield count={80} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-chart-5/25 via-primary/10 to-transparent"
      />

      <div
        className={cn(
          "animate-pop-in relative z-10 flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border-2 bg-card/90 p-6 text-center shadow-xl backdrop-blur-sm sm:gap-6 sm:p-8",
          accentClass,
        )}
      >
        <span className="font-heading rounded-full border border-secondary/40 bg-secondary/15 px-4 py-1 text-[10px] font-bold tracking-[0.2em] text-secondary uppercase sm:text-xs">
          Level 5 · Final Planet
        </span>

        <div className="flex flex-col gap-1">
          <p className="font-heading text-sm font-bold tracking-wide text-muted-foreground uppercase sm:text-base">
            {partLabel}
          </p>
          <h1 className="font-heading text-2xl font-extrabold text-balance text-foreground sm:text-3xl md:text-4xl">
            {title}
          </h1>
          {tagline && (
            <p className="mt-1 text-sm font-semibold text-muted-foreground text-pretty sm:text-base">
              {tagline}
            </p>
          )}
        </div>

        <MinuAvatar pose={minuPose} size={100} className="sm:hidden" />
        <MinuAvatar pose={minuPose} size={128} className="hidden sm:block" />

        <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
          <Sparkles className="size-4 animate-pulse text-primary" />
          <p className="font-heading text-xs font-bold text-primary sm:text-sm">
            Minu is listening…
          </p>
        </div>
      </div>
    </main>
  )
}