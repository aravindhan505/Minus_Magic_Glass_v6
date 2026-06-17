"use client"

import { lazy, Suspense } from "react"
import Image from "next/image"
import { ArrowLeft, Wrench, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Starfield } from "@/components/starfield"
import { minuPoses, type Level } from "@/lib/minu-config"
import { playClick } from "@/lib/audio"

type LevelScreenProps = {
  level: Level
  onBack: () => void
  onComplete: (levelId: number) => void
}

// Lazy-load level modules (only imported when that level is active)
const Level5 = lazy(() => import("@/components/level-5-image-classification"))

/**
 * Routes to the correct level module, or shows a placeholder.
 */
export function LevelScreen({ level, onBack, onComplete }: LevelScreenProps) {
  // Level 5: Image Classification — has a full module
  if (level.id === 5) {
    return (
      <Suspense fallback={<PlaceholderLevel level={level} onBack={onBack} onComplete={onComplete} />}>
        <Level5 onComplete={() => onComplete(level.id)} onBack={onBack} />
      </Suspense>
    )
  }

  // Levels 1–4: placeholder until teammates submit modules
  return <PlaceholderLevel level={level} onBack={onBack} onComplete={onComplete} />
}

/** Placeholder for levels without a module yet. */
function PlaceholderLevel({ level, onBack, onComplete }: LevelScreenProps) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <Starfield count={70} />

      <header className="absolute left-0 top-0 z-10 px-5 py-5">
        <Button size="icon" variant="secondary" className="rounded-full" aria-label="Back to map" onClick={() => { playClick(); onBack() }}>
          <ArrowLeft className="size-5" />
        </Button>
      </header>

      <div className="animate-pop-in relative z-10 flex max-w-lg flex-col items-center gap-5 text-center">
        <Image
          src={minuPoses.idle || "/placeholder.svg"}
          alt="Minu the alien ready to learn"
          width={170}
          height={170}
          className="animate-float drop-shadow-2xl"
        />
        <span className="font-heading inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-bold text-secondary">
          {level.subtitle}
        </span>
        <h1 className="font-heading text-4xl font-extrabold text-foreground text-balance">{level.title}</h1>
        <p className="text-base font-semibold text-muted-foreground text-pretty">{level.description}</p>

        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card px-5 py-4 text-sm font-semibold text-muted-foreground">
          <Wrench className="size-5 text-secondary" />
          This level&apos;s activity is coming soon — we&apos;ll build it together next!
        </div>

        <Button
          size="lg"
          onClick={() => { playClick(); onComplete(level.id) }}
          className="font-heading mt-2 rounded-full px-8 text-lg font-extrabold"
        >
          <CheckCircle2 className="size-6" />
          Mark Calibrated
        </Button>
      </div>
    </main>
  )
}
