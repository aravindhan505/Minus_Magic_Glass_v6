"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, Check, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MinuAvatar } from "@/components/minu-avatar"
import { LevelQuiz } from "@/components/level-quiz"
import { Level5PartBridge } from "@/components/level-5-part-bridge"
import { Starfield } from "@/components/starfield"
import { playClick, playFanfare, playError } from "@/lib/audio"
import {
  LEVEL4_QUIZ_QUESTION_AUDIO,
  LEVEL4_WRONG_AUDIO,
  playLevel4ExplainForRound,
  playLevel4Narrator,
  playLevel4Then,
} from "@/lib/level4-audio"
import type { LevelActivityProps } from "@/lib/level-data"
import type { MinuPose } from "@/lib/minu-config"
import {
  LEVEL4_FEATURE_OPTIONS,
  LEVEL4_QUIZ_PASS_PERCENT,
  LEVEL4_ROUNDS_PER_RUN,
  getRandomLevel4QuizItems,
  getRandomLevel4Rounds,
  level4FeaturesMatch,
  level4QuizToQuestion,
  type Level4Feature,
} from "@/lib/level4-feature-recognition"
import { cn } from "@/lib/utils"

type Phase = "intro-bridge" | "activity" | "quiz-bridge" | "quiz"
type SubmitState = "idle" | "correct" | "wrong"

const IDLE_REMINDER_MS = 30_000

const FEATURE_BUTTON_CLASS: Record<Level4Feature, string> = {
  Shape: "hover:border-violet-400/70 hover:bg-violet-500/10",
  Color: "hover:border-amber-400/70 hover:bg-amber-500/10",
  Texture: "hover:border-sky-400/70 hover:bg-sky-500/10",
}

const FEATURE_SELECTED_CLASS: Record<Level4Feature, string> = {
  Shape: "border-violet-400/80 bg-violet-500/15",
  Color: "border-amber-400/80 bg-amber-500/15",
  Texture: "border-sky-400/80 bg-sky-500/15",
}

const PROMPT_TEXT =
  "Look at both figures. Tap every feature they share — shape, color, or texture — then press Check!"

function formatMatchingLabel(features: Level4Feature[]): string {
  if (features.length === 0) return "—"
  return features.map((f) => f[0]).join(" + ")
}

export default function Level4FeatureRecognition({ onComplete, onBack }: LevelActivityProps) {
  const [phase, setPhase] = useState<Phase>("intro-bridge")
  const [quizKey, setQuizKey] = useState(0)
  const [quizIntroDone, setQuizIntroDone] = useState(false)
  const [runKey] = useState(() => Date.now())
  const [roundIndex, setRoundIndex] = useState(0)
  const [selected, setSelected] = useState<Set<Level4Feature>>(() => new Set())
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [minuPose, setMinuPose] = useState<MinuPose>("pointing")
  const [statusText, setStatusText] = useState(PROMPT_TEXT)

  const rounds = useMemo(() => getRandomLevel4Rounds(LEVEL4_ROUNDS_PER_RUN), [runKey])
  const quizPool = useMemo(() => getRandomLevel4QuizItems(), [runKey, quizKey])
  const quizQuestions = useMemo(() => quizPool.map(level4QuizToQuestion), [quizPool])
  const round = rounds[roundIndex]

  const activityIntroPlayed = useRef(false)
  const roundNarratorPlayed = useRef(-1)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
      idleTimer.current = null
    }
  }, [])

  const scheduleIdleReminder = useCallback(() => {
    clearIdleTimer()
    if (phase !== "activity" || submitState !== "idle") return
    idleTimer.current = setTimeout(() => {
      playLevel4Narrator("narrator_level4_reminder.mp3")
    }, IDLE_REMINDER_MS)
  }, [phase, submitState, clearIdleTimer])

  useEffect(() => {
    if (phase === "activity" && submitState === "idle") {
      scheduleIdleReminder()
    } else {
      clearIdleTimer()
    }
  }, [phase, submitState, roundIndex, scheduleIdleReminder, clearIdleTimer])

  useEffect(() => () => clearIdleTimer(), [clearIdleTimer])

  useEffect(() => {
    if (phase !== "activity" || !round) return
    if (roundNarratorPlayed.current === roundIndex) return
    roundNarratorPlayed.current = roundIndex

    if (roundIndex === 0) {
      if (activityIntroPlayed.current) return
      activityIntroPlayed.current = true
      playLevel4Narrator("narrator_level4_activity_intro.mp3")
      return
    }
    playLevel4Narrator("narrator_level4_round_start.mp3")
  }, [phase, roundIndex, round])

  const handleIntroBridgeReady = useCallback(() => {
    setPhase("activity")
  }, [])

  const handleQuizBridgeReady = useCallback(() => {
    setQuizIntroDone(true)
    setPhase("quiz")
  }, [])

  const handleQuizQuestionStart = useCallback(
    (questionIndex: number) => {
      const q = quizPool[questionIndex]
      if (!q) return
      const clip = LEVEL4_QUIZ_QUESTION_AUDIO[q.id]
      if (clip) playLevel4Narrator(clip)
    },
    [quizPool],
  )

  const handleQuizPass = useCallback(() => {
    playLevel4Narrator("narrator_level4_quiz_pass.mp3")
  }, [])

  const handleQuizFail = useCallback(() => {
    playLevel4Narrator("narrator_level4_quiz_fail.mp3")
  }, [])

  const resetRoundUi = useCallback(() => {
    setSelected(new Set())
    setSubmitState("idle")
    setMinuPose("pointing")
    setStatusText(PROMPT_TEXT)
  }, [])

  const toggleFeature = (option: Level4Feature) => {
    if (submitState !== "idle") return
    playClick()
    clearIdleTimer()
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(option)) next.delete(option)
      else next.add(option)
      return next
    })
    scheduleIdleReminder()
  }

  const handleCheck = () => {
    if (submitState !== "idle" || !round) return
    clearIdleTimer()

    if (selected.size === 0) {
      playError()
      playLevel4Narrator(LEVEL4_WRONG_AUDIO.empty)
      setMinuPose("oops")
      setStatusText("Tap at least one feature that both figures share, then press Check!")
      setTimeout(() => {
        setMinuPose("pointing")
        setStatusText(PROMPT_TEXT)
        scheduleIdleReminder()
      }, 1600)
      return
    }

    playClick()

    if (level4FeaturesMatch(selected, round.matchingFeatures)) {
      setSubmitState("correct")
      setMinuPose("celebrating")
      setStatusText(round.explain)
      playFanfare()

      playLevel4ExplainForRound(round.id, {
        onEnd: () => {
          setTimeout(() => {
            const next = roundIndex + 1
            if (next < rounds.length) {
              setRoundIndex(next)
              resetRoundUi()
              scheduleIdleReminder()
            } else {
              playLevel4Then("narrator_level4_all_rounds_done.mp3", () => setPhase("quiz-bridge"))
            }
          }, 600)
        },
      })
    } else {
      setSubmitState("wrong")
      setMinuPose("oops")
      const missing = round.matchingFeatures.filter((f) => !selected.has(f))
      const extra = [...selected].filter((f) => !round.matchingFeatures.includes(f))

      if (missing.length > 0 && extra.length > 0) {
        setStatusText("Some picks are right, but you missed a match and picked one that differs!")
        playLevel4Narrator(LEVEL4_WRONG_AUDIO.mixed)
      } else if (missing.length > 0) {
        setStatusText("Almost! You missed a feature that both figures share — look again!")
        playLevel4Narrator(LEVEL4_WRONG_AUDIO.missing)
      } else {
        setStatusText("One of those features is different between the two figures — try again!")
        playLevel4Narrator(LEVEL4_WRONG_AUDIO.extra)
      }
      playError()

      setTimeout(() => {
        resetRoundUi()
        scheduleIdleReminder()
      }, 2000)
    }
  }

  if (phase === "intro-bridge") {
    return (
      <Level5PartBridge
        key="l4-intro-bridge"
        levelBadge="Level 4 · Feature Recognition"
        partLabel="Welcome"
        title="Common Features!"
        tagline="Two figures side by side — tap every feature they share, then press Check!"
        narratorFile="narrator_level4_intro.mp3"
        accentClass="border-chart-4/50 shadow-chart-4/25"
        minuPose="waving"
        playThen={playLevel4Then}
        onReady={handleIntroBridgeReady}
      />
    )
  }

  if (phase === "quiz-bridge") {
    return (
      <Level5PartBridge
        key="l4-quiz-bridge"
        levelBadge="Level 4 · Feature Recognition"
        partLabel="Final Challenge"
        title="Feature Spotter Quiz"
        tagline="Three random picture pairs — get two right to calibrate Minu's feature lens!"
        narratorFile="narrator_level4_quiz_intro.mp3"
        accentClass="border-accent/50 shadow-accent/25"
        minuPose="thinking"
        playThen={playLevel4Then}
        onReady={handleQuizBridgeReady}
      />
    )
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
              Quiz · Feature Recognition
            </p>
            <h1 className="font-heading text-lg font-extrabold text-foreground sm:text-xl">
              3 Random Questions!
            </h1>
          </div>
          <Sparkles className="size-6 shrink-0 text-secondary" />
        </header>
        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col justify-center px-4 py-4">
          <LevelQuiz
            key={quizKey}
            questions={quizQuestions}
            passPercent={LEVEL4_QUIZ_PASS_PERCENT}
            retryOnlyOnFail
            compact
            questionNarratorEnabled={quizIntroDone}
            onQuestionStart={handleQuizQuestionStart}
            onPass={handleQuizPass}
            onQuizFail={handleQuizFail}
            successMessage="Sharp eyes! You can spot shape, color, and texture differences!"
            onComplete={() => {
              playFanfare()
              onComplete()
            }}
            onBack={onBack}
            onFail={() => {
              playClick()
              setQuizIntroDone(false)
              setQuizKey((k) => k + 1)
              setPhase("quiz-bridge")
            }}
          />
        </div>
      </main>
    )
  }

  if (!round) return null

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
          {roundIndex + 1}/{rounds.length}
        </span>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 gap-2 px-2 sm:gap-4 sm:px-4">
        <aside className="flex w-[36%] min-w-[118px] max-w-[280px] shrink-0 flex-col gap-2 sm:gap-2.5">
          <p className="font-heading text-center text-[10px] font-bold tracking-wider text-secondary uppercase sm:text-xs">
            Common Features
          </p>
          <div className="flex shrink-0 items-center justify-center py-1">
            <MinuAvatar pose={minuPose} size={64} className="hidden sm:block" />
            <MinuAvatar pose={minuPose} size={48} className="sm:hidden" />
          </div>
          <div
            className={cn(
              "rounded-2xl border-2 px-3 py-2.5 backdrop-blur-sm transition-all",
              submitState === "correct" && "border-accent/50 bg-accent/10",
              submitState === "wrong" && "border-destructive/45 bg-destructive/10",
              submitState === "idle" && "border-primary/35 bg-card/75 shadow-lg shadow-primary/15",
            )}
          >
            <p className="font-heading text-[11px] font-bold leading-snug text-foreground sm:text-sm">
              {statusText}
            </p>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-primary/25 bg-card/50 px-2 py-1.5 sm:px-3">
            <p className="font-heading text-[10px] font-bold text-foreground sm:text-xs">
              What do BOTH figures share? Tap Shape, Color, and/or Texture — then press Check!
            </p>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3">
            <div className="relative min-h-0 min-w-0">
              <Image
                src={round.leftImage}
                alt={`${round.label} — left`}
                fill
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 640px) 30vw, 25vw"
                priority
              />
            </div>
            <div className="relative min-h-0 min-w-0">
              <Image
                src={round.rightImage}
                alt={`${round.label} — right`}
                fill
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 640px) 30vw, 25vw"
                priority
              />
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-2">
            {LEVEL4_FEATURE_OPTIONS.map((option) => {
              const isPicked = selected.has(option)
              const isCorrectPick =
                submitState === "correct" && round.matchingFeatures.includes(option)
              const isWrongPick =
                submitState === "wrong" &&
                (isPicked !== round.matchingFeatures.includes(option))
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleFeature(option)}
                  disabled={submitState !== "idle"}
                  className={cn(
                    "font-heading rounded-2xl border-2 py-3 text-sm font-extrabold transition-all sm:py-4 sm:text-base",
                    submitState === "idle" &&
                      cn(
                        "border-border bg-card/80",
                        isPicked ? FEATURE_SELECTED_CLASS[option] : FEATURE_BUTTON_CLASS[option],
                      ),
                    isCorrectPick &&
                      "border-accent bg-accent/20 text-accent shadow-[0_0_16px_oklch(0.78_0.2_150/30%)]",
                    isWrongPick && "border-destructive bg-destructive/15 text-destructive",
                    !isPicked && submitState !== "idle" && "opacity-40",
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>

          <Button
            type="button"
            disabled={submitState !== "idle"}
            onClick={handleCheck}
            className="font-heading h-11 shrink-0 gap-2 rounded-2xl text-base font-extrabold sm:h-12"
          >
            <Check className="size-5" />
            Check
          </Button>
        </section>
      </div>

      <footer className="relative z-10 shrink-0 border-t border-primary/20 bg-card/40 px-4 py-2 backdrop-blur-sm sm:py-2.5">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
          {rounds.map((r, i) => (
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
                {i < roundIndex ? formatMatchingLabel(r.matchingFeatures) : i === roundIndex ? "?" : ""}
              </span>
            </div>
          ))}
        </div>
      </footer>
    </main>
  )
}