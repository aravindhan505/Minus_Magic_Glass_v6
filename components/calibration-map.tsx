"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowLeft, Lock, Check, Sun, Palette, Scan, Shapes, Sparkles, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Starfield } from "@/components/starfield"
import { levels, minuPoses, type Level } from "@/lib/minu-config"
import { playClick, playNarratorFile } from "@/lib/audio"

const iconMap: Record<string, LucideIcon> = {
  Sun,
  Palette,
  Scan,
  Shapes,
  Sparkles,
}

type CalibrationMapProps = {
  /** Highest unlocked level id (1-based). Levels above this are locked. */
  unlockedLevel: number
  /** Completed level ids. */
  completed: number[]
  onBack: () => void
  onSelectLevel: (level: Level) => void
}

export function CalibrationMap({ unlockedLevel, completed, onBack, onSelectLevel }: CalibrationMapProps) {
  const hasPlayedRef = useRef(false)

  // Play narrator map explanation once per session (not on every re-mount)
  useEffect(() => {
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true
      playNarratorFile("narrator_map_explain.mp3")
    }
  }, [])

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background px-4 py-8">
      <Starfield count={90} />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center gap-3">
        <Button size="icon" variant="secondary" className="rounded-full" aria-label="Back to home" onClick={() => { playClick(); onBack() }}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-foreground md:text-3xl">Calibration Lab</h1>
          <p className="text-sm font-semibold text-muted-foreground">Calibrate Minu&apos;s glasses, one level at a time</p>
        </div>
        <div className="ml-auto hidden sm:block">
          <Image
            src={minuPoses.idle || "/placeholder.svg"}
            alt="Minu the alien"
            width={72}
            height={72}
            className="animate-float drop-shadow-xl"
          />
        </div>
      </header>

      <section className="relative z-10 mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((level, index) => {
          const Icon = iconMap[level.icon] ?? Sparkles
          const isCompleted = completed.includes(level.id)
          const isLocked = level.id > unlockedLevel
          return (
            <button
              key={level.id}
              type="button"
              disabled={isLocked}
              onClick={() => { playClick(); onSelectLevel(level) }}
              style={{ animationDelay: `${index * 70}ms` }}
              className="animate-pop-in group relative flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 text-left transition enabled:hover:-translate-y-1 enabled:hover:border-primary disabled:opacity-55"
            >
              <div className="flex items-center justify-between">
                <span
                  className="grid size-12 place-items-center rounded-2xl"
                  style={{ backgroundColor: level.color, color: "var(--background)" }}
                >
                  <Icon className="size-6" />
                </span>
                <span className="font-heading text-3xl font-extrabold text-muted-foreground/60">
                  {String(level.id).padStart(2, "0")}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">{level.subtitle}</p>
                <h2 className="font-heading text-xl font-extrabold text-card-foreground text-balance">{level.title}</h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground text-pretty">{level.description}</p>
              </div>

              <div className="mt-auto flex items-center gap-2 pt-2">
                {isLocked ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                    <Lock className="size-3.5" /> Locked
                  </span>
                ) : isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                    <Check className="size-3.5" /> Calibrated
                  </span>
                ) : (
                  <span className="font-heading inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground transition group-hover:gap-2.5">
                    Start
                    <span aria-hidden>→</span>
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </section>
    </main>
  )
}
