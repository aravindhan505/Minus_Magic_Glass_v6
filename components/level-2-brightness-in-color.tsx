"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, HelpCircle, Palette, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LevelSlider } from "@/components/ui/slider"
import { ColorLens } from "@/components/level-2-color-lens"
import { LevelQuiz } from "@/components/level-quiz"
import { Level5PartBridge } from "@/components/level-5-part-bridge"
import { MinuAvatar } from "@/components/minu-avatar"
import { MinuSpaceship } from "@/components/minu-spaceship"
import { SpeechBubble } from "@/components/speech-bubble"
import { Starfield } from "@/components/starfield"
import { playClick, playError, playFanfare } from "@/lib/audio"
import type { LevelActivityProps } from "@/lib/level-data"
import type { MinuPose } from "@/lib/minu-config"
import {
  LEVEL2_HINT_AUDIO,
  LEVEL2_QUIZ_QUESTION_AUDIO,
  playLevel2Narrator,
  playLevel2RevealForItem,
  playLevel2Then,
} from "@/lib/level2-audio"
import {
  COLOR_MATCH_TOLERANCE,
  DEFAULT_MIX_COLOR,
  LEVEL2_QUIZ,
  LEVEL2_ROUNDS_REQUIRED,
  colorsMatch,
  formatItemName,
  getChannelAdjustments,
  getProgressiveHint,
  getRandomLevel2Rounds,
  type ColorChannel,
  itemRevealedSrc,
  type RgbColor,
} from "@/lib/level2-color-potion"
import { cn } from "@/lib/utils"

type Phase = "intro-bridge" | "activity" | "reveal" | "quiz-bridge" | "quiz"

const IDLE_REMINDER_MS = 10_000

export default function Level2BrightnessInColor({ onComplete, onBack }: LevelActivityProps) {
  const [phase, setPhase] = useState<Phase>("intro-bridge")
  const [roundIndex, setRoundIndex] = useState(0)
  const [quizKey, setQuizKey] = useState(0)
  const [quizIntroDone, setQuizIntroDone] = useState(false)
  const [runKey] = useState(() => Date.now())

  const rounds = useMemo(() => getRandomLevel2Rounds(LEVEL2_ROUNDS_REQUIRED), [runKey])
  const round = rounds[roundIndex]

  const [guessColor, setGuessColor] = useState<RgbColor>(DEFAULT_MIX_COLOR)
  const [statusText, setStatusText] = useState(
    "Mix the Red, Green, and Blue potions to match the Target lens on the left!",
  )
  const [minuPose, setMinuPose] = useState<MinuPose>("pointing")
  const [wobble, setWobble] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [highlightChannels, setHighlightChannels] = useState<ColorChannel[]>([])
  const mixingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const roundNarratorPlayed = useRef(-1)
  const revealPlayedForItem = useRef<string | null>(null)

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
      idleTimer.current = null
    }
  }, [])

  const scheduleIdleReminder = useCallback(() => {
    clearIdleTimer()
    if (phase !== "activity") return
    idleTimer.current = setTimeout(() => {
      playLevel2Narrator("narrator_level2_reminder.mp3")
    }, IDLE_REMINDER_MS)
  }, [phase, clearIdleTimer])

  const resetMix = useCallback(() => {
    setGuessColor(DEFAULT_MIX_COLOR)
    setMinuPose("pointing")
    setHintLevel(0)
    setHighlightChannels([])
    setStatusText(
      `Round ${roundIndex + 1}: Match the target color to reveal the hidden object!`,
    )
    scheduleIdleReminder()
  }, [roundIndex, scheduleIdleReminder])

  useEffect(() => {
    if (phase === "activity") resetMix()
  }, [phase, roundIndex, resetMix])

  useEffect(() => {
    if (phase !== "activity" || !round) return

    if (roundNarratorPlayed.current === roundIndex) return
    roundNarratorPlayed.current = roundIndex
    const clip =
      roundIndex === 0
        ? "narrator_level2_activity_intro.mp3"
        : "narrator_level2_round_start.mp3"
    playLevel2Narrator(clip)
    scheduleIdleReminder()
  }, [phase, roundIndex, round, scheduleIdleReminder])

  useEffect(() => {
    if (phase !== "reveal") {
      revealPlayedForItem.current = null
      return
    }
    const slug = round.item.name
    if (revealPlayedForItem.current === slug) return
    revealPlayedForItem.current = slug
    playLevel2RevealForItem(slug)
  }, [phase, round.item.name])

  useEffect(() => () => clearIdleTimer(), [clearIdleTimer])

  const handleIntroBridgeReady = useCallback(() => {
    setPhase("activity")
  }, [])

  const handleQuizBridgeReady = useCallback(() => {
    setQuizIntroDone(true)
    setPhase("quiz")
  }, [])

  const handleQuizQuestionStart = useCallback((questionIndex: number) => {
    const clip = LEVEL2_QUIZ_QUESTION_AUDIO[questionIndex]
    if (clip) playLevel2Narrator(clip)
  }, [])

  const handleQuizPass = useCallback(() => {
    playLevel2Narrator("narrator_level2_quiz_pass.mp3")
  }, [])

  const handleQuizFail = useCallback(() => {
    playLevel2Narrator("narrator_level2_quiz_fail.mp3")
  }, [])

  const handleSliderChange = useCallback(
    (id: string, value: number) => {
      playClick()
      clearIdleTimer()
      setGuessColor((prev) => ({ ...prev, [id]: value }))
      setMinuPose("thinking")
      setHighlightChannels((prev) => prev.filter((c) => c !== id))
      if (mixingTimer.current) clearTimeout(mixingTimer.current)
      mixingTimer.current = setTimeout(() => {
        setMinuPose("pointing")
        scheduleIdleReminder()
      }, 600)
    },
    [clearIdleTimer, scheduleIdleReminder],
  )

  const handleHint = useCallback(() => {
    playClick()
    clearIdleTimer()
    const nextLevel = hintLevel + 1
    setHintLevel(nextLevel)
    setMinuPose("thinking")
    const { message, highlightChannels: channels } = getProgressiveHint(
      round.target,
      guessColor,
      nextLevel,
    )
    setStatusText(message)
    setHighlightChannels(channels)

    const hintClip = LEVEL2_HINT_AUDIO[Math.min(nextLevel - 1, LEVEL2_HINT_AUDIO.length - 1)]
    if (hintClip) playLevel2Narrator(hintClip)

    if (hintTimer.current) clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => {
      setHighlightChannels([])
      setMinuPose("pointing")
      scheduleIdleReminder()
    }, 4500)
  }, [hintLevel, round.target, guessColor, clearIdleTimer, scheduleIdleReminder])

  const handleCheckMatch = useCallback(() => {
    playClick()
    clearIdleTimer()
    const matched = colorsMatch(round.target, guessColor, COLOR_MATCH_TOLERANCE)

    if (matched) {
      playFanfare()
      setMinuPose("celebrating")
      setStatusText(`Perfect mix! You revealed a ${formatItemName(round.item.name)}!`)
      playLevel2Then("narrator_level2_match_success.mp3", () => setPhase("reveal"))
      return
    }

    playError()
    setMinuPose("oops")
    setWobble(true)
    const off = getChannelAdjustments(round.target, guessColor, 12)
    const veryClose = off.length === 0

    if (veryClose) {
      playLevel2Narrator("narrator_level2_hint_close.mp3")
      setStatusText("So close! Tiny tweaks — nudge a slider a little, then Check Match!")
    } else {
      playLevel2Narrator("narrator_level2_match_miss.mp3")
      const { message, highlightChannels: channels } = getProgressiveHint(
        round.target,
        guessColor,
        2,
      )
      setStatusText(`Almost! ${message}`)
      setHighlightChannels(channels)
    }

    setTimeout(() => setWobble(false), 550)
    scheduleIdleReminder()
  }, [round, guessColor, clearIdleTimer, scheduleIdleReminder])

  const handleRevealContinue = useCallback(() => {
    playClick()
    if (roundIndex < rounds.length - 1) {
      playLevel2Narrator("narrator_level2_reveal_continue.mp3")
      setRoundIndex((i) => i + 1)
      setPhase("activity")
      return
    }
    playLevel2Then("narrator_level2_all_rounds_done.mp3", () => setPhase("quiz-bridge"))
  }, [roundIndex, rounds.length])

  if (phase === "intro-bridge") {
    return (
      <Level5PartBridge
        key="l2-intro-bridge"
        levelBadge="Level 2 · Color Potion Time"
        partLabel="Welcome"
        title="Color Potion Time!"
        tagline="Mix Red, Green & Blue potions to match the magic lenses and reveal hidden objects!"
        narratorFile="narrator_level2_intro.mp3"
        accentClass="border-chart-1/50 shadow-chart-1/25"
        minuPose="waving"
        playThen={playLevel2Then}
        onReady={handleIntroBridgeReady}
      />
    )
  }

  if (phase === "quiz-bridge") {
    return (
      <Level5PartBridge
        key="l2-quiz-bridge"
        levelBadge="Level 2 · Color Potion Time"
        partLabel="Final Challenge"
        title="Color Potion Quiz"
        tagline="Three hands-on RGB challenges — get all three right to calibrate Minu's color lens!"
        narratorFile="narrator_level2_quiz_intro.mp3"
        accentClass="border-accent/50 shadow-accent/25"
        minuPose="thinking"
        playThen={playLevel2Then}
        onReady={handleQuizBridgeReady}
      />
    )
  }

  if (phase === "quiz") {
    return (
      <main className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
        <Starfield count={60} />
        <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-primary/20 px-4 py-3">
          <Button
            size="icon"
            variant="secondary"
            className="size-10 shrink-0 rounded-full"
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
              Level 2 Quiz · RGB Colors
            </p>
            <h1 className="font-heading text-lg font-extrabold text-foreground">Color Potion Quiz!</h1>
          </div>
          <Palette className="size-6 shrink-0 text-primary" />
        </header>
        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col justify-center px-3 py-2">
          <LevelQuiz
            key={quizKey}
            questions={LEVEL2_QUIZ}
            compact
            questionNarratorEnabled={quizIntroDone}
            onQuestionStart={handleQuizQuestionStart}
            onPass={handleQuizPass}
            onQuizFail={handleQuizFail}
            successMessage="Amazing! You mastered Red, Green, and Blue mixing!"
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

  if (phase === "reveal") {
    return (
      <main className="relative flex h-dvh max-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4">
        <Starfield count={60} />
        <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 rounded-3xl border-2 border-accent/50 bg-card/90 p-5 text-center shadow-xl sm:gap-5 sm:p-7">
          <span className="font-heading rounded-full bg-accent/20 px-3 py-1 text-[10px] font-bold text-accent uppercase sm:text-xs">
            Magic Reveal!
          </span>
          <h2 className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
            It&apos;s a {formatItemName(round.item.name)}!
          </h2>
          <div className="relative size-40 sm:size-44">
            <Image
              src={itemRevealedSrc(round.item)}
              alt={formatItemName(round.item.name)}
              fill
              className="animate-pop-in object-contain drop-shadow-lg"
              sizes="176px"
              priority
            />
          </div>
          <p className="font-heading text-xs font-bold leading-relaxed text-muted-foreground sm:text-sm">
            {statusText}
          </p>
          <MinuAvatar pose="celebrating" size={72} />
          <Button
            onClick={handleRevealContinue}
            className="font-heading gap-2 rounded-full px-6 text-sm font-extrabold sm:px-8"
          >
            {roundIndex < rounds.length - 1 ? (
              <>
                Next Potion <ArrowRight className="size-4" />
              </>
            ) : (
              <>
                Final Quiz <Sparkles className="size-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      <Starfield count={60} />

      <header className="relative z-10 flex shrink-0 items-center gap-2 border-b border-primary/15 px-3 py-2 sm:px-4">
        <Button
          size="icon"
          variant="secondary"
          className="size-9 shrink-0 rounded-full"
          aria-label="Back to map"
          onClick={() => {
            playClick()
            onBack()
          }}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="font-heading flex items-center gap-1 text-[10px] font-bold text-secondary uppercase sm:text-xs">
            <Palette className="size-3" />
            Level 2 · Color Potion Time · Round {roundIndex + 1}/{rounds.length}
          </p>
          <h1 className="font-heading truncate text-sm font-extrabold sm:text-lg">
            Mix the Magic Lenses!
          </h1>
        </div>
        <MinuSpaceship size={60} className="sm:hidden" />
        <MinuSpaceship size={76} className="hidden sm:block" />
      </header>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden px-2 py-2 sm:gap-3 sm:px-4 md:grid-cols-12 md:py-3">
        <section className="flex min-h-0 flex-col gap-1.5 md:col-span-5">
          <div className="shrink-0 rounded-xl border border-primary/30 bg-card/70 px-3 py-2">
            <p className="font-heading text-[11px] font-bold leading-snug text-foreground sm:text-sm">
              {statusText}
            </p>
          </div>

          <div className="flex min-h-0 flex-1 items-end justify-center overflow-hidden">
            <MinuAvatar pose={minuPose} size={260} className="shrink-0 sm:hidden" />
            <MinuAvatar pose={minuPose} size={340} className="hidden shrink-0 sm:block" />
          </div>

          <SpeechBubble
            text="Mix Red, Green & Blue until both lenses match!"
            className="mx-auto max-w-full shrink-0 text-center text-[11px] sm:text-xs"
          />

          <div className="flex shrink-0 items-center justify-center gap-1.5 py-0.5">
            {rounds.map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "size-4 sm:size-5",
                  i < roundIndex ? "fill-accent text-accent" : i === roundIndex ? "fill-secondary text-secondary" : "text-muted/35",
                )}
              />
            ))}
          </div>
        </section>

        <section className="flex min-h-0 flex-col gap-2 overflow-hidden md:col-span-7 md:border-l md:border-primary/15 md:pl-4">
          <p className="shrink-0 text-center font-heading text-[9px] font-bold text-muted-foreground uppercase sm:text-[10px]">
            Align both magic lenses, then tap Check Match!
          </p>

          <div className="flex shrink-0 items-center justify-center gap-3 sm:gap-5">
            <ColorLens label="🎯 Target" color={round.target} item={round.item} variant="target" />
            <div className="h-8 w-3 shrink-0 self-center rounded-md border border-amber-400/50 bg-gradient-to-b from-amber-300 to-amber-600 shadow-sm" />
            <ColorLens label="🧪 My Mix" color={guessColor} item={round.item} variant="mix" />
          </div>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col justify-center gap-2 rounded-2xl border border-primary/25 bg-card/60 p-3 sm:gap-2.5 sm:p-4",
              wobble && "animate-[wobble_0.55s_ease-in-out]",
            )}
          >
            <LevelSlider
              id="r"
              label="Red Potion"
              min={0}
              max={255}
              value={guessColor.r}
              color="#ff4444"
              highlighted={highlightChannels.includes("r")}
              onChange={handleSliderChange}
            />
            <LevelSlider
              id="g"
              label="Green Potion"
              min={0}
              max={255}
              value={guessColor.g}
              color="#44cc44"
              highlighted={highlightChannels.includes("g")}
              onChange={handleSliderChange}
            />
            <LevelSlider
              id="b"
              label="Blue Potion"
              min={0}
              max={255}
              value={guessColor.b}
              color="#4488ff"
              highlighted={highlightChannels.includes("b")}
              onChange={handleSliderChange}
            />

            <div className="mt-1 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleHint}
                className="font-heading h-11 gap-1.5 rounded-xl text-xs font-bold sm:text-sm"
              >
                <HelpCircle className="size-4" />
                Hint{hintLevel > 0 ? ` (${hintLevel})` : ""}
              </Button>
              <Button
                type="button"
                onClick={handleCheckMatch}
                className="font-heading h-11 gap-1.5 rounded-xl border-2 border-primary/30 text-xs font-extrabold shadow-lg shadow-primary/20 sm:text-sm"
              >
                <Sparkles className="size-4" />
                Check Match!
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}