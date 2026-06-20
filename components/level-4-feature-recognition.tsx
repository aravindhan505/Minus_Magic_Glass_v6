"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MinuAvatar } from "@/components/minu-avatar"
import { LevelQuiz } from "@/components/level-quiz"
import { Starfield } from "@/components/starfield"
import { playClick, playFanfare, playError } from "@/lib/audio"
import type { LevelActivityProps } from "@/lib/level-data"
import type { MinuPose } from "@/lib/minu-config"
import {
  LEVEL4_FEATURE_OPTIONS,
  LEVEL4_QUIZ,
  LEVEL4_QUIZ_PASS_PERCENT,
  LEVEL4_ROUNDS,
  type Level4Feature,
} from "@/lib/level4-feature-recognition"
import { cn } from "@/lib/utils"

type Phase = "activity" | "quiz"
type SubmitState = "idle" | "correct" | "wrong"

const FEATURE_BUTTON_CLASS: Record<Level4Feature, string> = {
  Shape: "hover:border-violet-400/70 hover:bg-violet-500/10",
  Color: "hover:border-amber-400/70 hover:bg-amber-500/10",
  Texture: "hover:border-sky-400/70 hover:bg-sky-500/10",
}

export default function Level4FeatureRecognition({ onComplete, onBack }: LevelActivityProps) {
  const [phase, setPhase] = useState<Phase>("activity")
  const [quizKey, setQuizKey] = useState(0)
  const [roundIndex, setRoundIndex] = useState(0)
  const [selected, setSelected] = useState<Level4Feature | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [minuPose, setMinuPose] = useState<MinuPose>("pointing")
  const [statusText, setStatusText] = useState(
    "Look at both figures. What is the biggest difference — shape, color, or texture?",
  )

  const round = LEVEL4_ROUNDS[roundIndex]

  const handleAnswer = (option: Level4Feature) => {
    if (submitState !== "idle") return
    playClick()
    setSelected(option)

    if (option === round.correct) {
      setSubmitState("correct")
      setMinuPose("celebrating")
      setStatusText(round.explain)
      playFanfare()

      setTimeout(() => {
        const next = roundIndex + 1
        if (next < LEVEL4_ROUNDS.length) {
          setRoundIndex(next)
          setSelected(null)
          setSubmitState("idle")
          setMinuPose("pointing")
          setStatusText(
            "Look at both figures. What is the biggest difference — shape, color, or texture?",
          )
        } else {
          setPhase("quiz")
        }
      }, 1800)
    } else {
      setSubmitState("wrong")
      setMinuPose("oops")
      setStatusText(
        `Not quite! Look again — is it their ${round.correct.toLowerCase()} that stands out?`,
      )
      playError()

      setTimeout(() => {
        setSelected(null)
        setSubmitState("idle")
        setMinuPose("pointing")
        setStatusText(
          "Look at both figures. What is the biggest difference — shape, color, or texture?",
        )
      }, 1600)
    }
  }

  if (phase === "quiz") {
    return (
      <main className="relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-background">
        <Starfield count={70} />
        <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-primary/20 px-4 py-3 sm:px-6">
          <Button
            size="icon"
            variant="secondary"
            className="size-10 shrink-0 rounded-full border border-primary/25"
            aria-label="Back to map"
            onClick={() => {
              playClick()
              onBack()
            }}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-xs font-bold tracking-wide text-secondary uppercase">
              Level 4 Quiz
            </p>
            <h1 className="font-heading text-lg font-extrabold text-foreground sm:text-xl">
              Feature Spotter!
            </h1>
          </div>
          <Sparkles className="size-6 shrink-0 text-secondary" />
        </header>
        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col justify-center px-4 py-4">
          <LevelQuiz
            key={quizKey}
            questions={LEVEL4_QUIZ}
            passPercent={LEVEL4_QUIZ_PASS_PERCENT}
            retryOnlyOnFail
            compact
            successMessage="Sharp eyes! You can spot shape, color, and texture differences!"
            onComplete={() => {
              playFanfare()
              onComplete()
            }}
            onBack={onBack}
            onFail={() => {
              playClick()
              setQuizKey((k) => k + 1)
            }}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-background">
      <Starfield count={80} />
      <header className="relative z-10 flex shrink-0 items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
        <Button
          size="icon"
          variant="secondary"
          className="size-9 shrink-0 rounded-full border border-primary/25 sm:size-10"
          aria-label="Back to map"
          onClick={() => {
            playClick()
            onBack()
          }}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="font-heading flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-secondary uppercase sm:text-xs">
            <Zap className="size-3.5" />
            Level 4 · Feature Recognition
          </p>
          <h1 className="font-heading truncate text-base font-extrabold text-foreground sm:text-xl">
            {round.label}
          </h1>
        </div>
        <span className="font-heading shrink-0 rounded-full border border-primary/30 bg-card/80 px-2.5 py-1 text-xs font-bold text-primary shadow-sm sm:px-3 sm:text-sm">
          {roundIndex + 1}/{LEVEL4_ROUNDS.length}
        </span>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 gap-2 px-2 sm:gap-4 sm:px-4">
        <aside className="flex w-[36%] min-w-[118px] max-w-[280px] shrink-0 flex-col gap-2 sm:gap-2.5">
          <p className="font-heading text-center text-[10px] font-bold tracking-wider text-secondary uppercase sm:text-xs">
            Spot the Difference
          </p>
          <div className="flex shrink-0 items-center justify-center py-1">
            <MinuAvatar pose={minuPose} size={64} className="hidden sm:block" />
            <MinuAvatar pose={minuPose} size={48} className="sm:hidden" />
          </div>
          <div className="rounded-2xl border-2 border-primary/35 bg-card/75 px-3 py-2.5 shadow-lg shadow-primary/15">
            <p className="font-heading text-[11px] font-bold leading-snug text-foreground sm:text-sm">
              Shape, Color, or Texture — which feature is most different?
            </p>
          </div>
          <div
            className={cn(
              "rounded-2xl border-2 px-3 py-2.5 backdrop-blur-sm transition-all",
              submitState === "correct" && "border-accent/50 bg-accent/10",
              submitState === "wrong" && "border-destructive/45 bg-destructive/10",
              submitState === "idle" && "border-primary/25 bg-card/60",
            )}
          >
            <p className="font-heading text-[11px] font-bold leading-snug text-foreground sm:text-sm">
              {statusText}
            </p>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="relative min-h-0 flex-1">
            <Image
              src={round.image}
              alt={round.label}
              fill
              className="object-contain drop-shadow-2xl"
              sizes="(max-width: 640px) 60vw, 50vw"
              priority
            />
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-2">
            {LEVEL4_FEATURE_OPTIONS.map((option) => {
              const isSelected = selected === option
              const isCorrect = isSelected && submitState === "correct"
              const isWrong = isSelected && submitState === "wrong"
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  disabled={submitState !== "idle"}
                  className={cn(
                    "font-heading rounded-2xl border-2 py-3 text-sm font-extrabold transition-all sm:py-4 sm:text-base",
                    submitState === "idle" &&
                      cn("border-border bg-card/80", FEATURE_BUTTON_CLASS[option]),
                    isCorrect &&
                      "border-accent bg-accent/20 text-accent shadow-[0_0_16px_oklch(0.78_0.2_150/30%)]",
                    isWrong && "border-destructive bg-destructive/15 text-destructive",
                    !isSelected && submitState !== "idle" && "opacity-40",
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      <footer className="relative z-10 shrink-0 border-t border-primary/20 bg-card/40 px-4 py-2 backdrop-blur-sm sm:py-2.5">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
          {LEVEL4_ROUNDS.map((r, i) => (
            <div key={r.id} className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === roundIndex ? "w-8 bg-primary shadow-[0_0_8px_var(--primary)]" : "w-4",
                  i < roundIndex ? "bg-accent" : i !== roundIndex ? "bg-muted" : "",
                )}
              />
              <span
                className={cn(
                  "font-heading hidden text-[9px] font-bold sm:block",
                  i === roundIndex ? "text-primary" : "text-muted-foreground",
                )}
              >
                {r.correct}
              </span>
            </div>
          ))}
        </div>
      </footer>
    </main>
  )
}