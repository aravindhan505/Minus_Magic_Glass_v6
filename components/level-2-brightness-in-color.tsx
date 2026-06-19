"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, HelpCircle, Palette, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LevelSlider } from "@/components/ui/slider"
import { ColorLens } from "@/components/level-2-color-lens"
import { LevelQuiz } from "@/components/level-quiz"
import { MinuAvatar } from "@/components/minu-avatar"
import { MinuSpaceship } from "@/components/minu-spaceship"
import { SpeechBubble } from "@/components/speech-bubble"
import { Starfield } from "@/components/starfield"
import { playClick, playError, playFanfare } from "@/lib/audio"
import type { LevelActivityProps } from "@/lib/level-data"
import type { MinuPose } from "@/lib/minu-config"
import {
  COLOR_MATCH_TOLERANCE,
  DEFAULT_MIX_COLOR,
  LEVEL2_QUIZ,
  LEVEL2_ROUNDS_REQUIRED,
  colorsMatch,
  formatItemName,
  getProgressiveHint,
  getRandomLevel2Rounds,
  type ColorChannel,
  itemRevealedSrc,
  type RgbColor,
} from "@/lib/level2-color-potion"
import { cn } from "@/lib/utils"

type Phase = "activity" | "reveal" | "quiz"

export default function Level2BrightnessInColor({ onComplete, onBack }: LevelActivityProps) {
  const [phase, setPhase] = useState<Phase>("activity")
  const [roundIndex, setRoundIndex] = useState(0)
  const [quizKey, setQuizKey] = useState(0)
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

  const resetMix = useCallback(() => {
    setGuessColor(DEFAULT_MIX_COLOR)
    setMinuPose("pointing")
    setHintLevel(0)
    setHighlightChannels([])
    setStatusText(
      `Round ${roundIndex + 1}: Match the target color to reveal the hidden object!`,
    )
  }, [roundIndex])

  useEffect(() => {
    if (phase === "activity") resetMix()
  }, [phase, roundIndex, resetMix])

  const handleSliderChange = useCallback((id: string, value: number) => {
    playClick()
    setGuessColor((prev) => ({ ...prev, [id]: value }))
    setMinuPose("thinking")
    setHighlightChannels((prev) => prev.filter((c) => c !== id))
    if (mixingTimer.current) clearTimeout(mixingTimer.current)
    mixingTimer.current = setTimeout(() => setMinuPose("pointing"), 600)
  }, [])

  const handleHint = useCallback(() => {
    playClick()
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
    if (hintTimer.current) clearTimeout(hintTimer.current)
    hintTimer.current = setTimeout(() => {
      setHighlightChannels([])
      setMinuPose("pointing")
    }, 4500)
  }, [hintLevel, round.target, guessColor])

  const handleCheckMatch = useCallback(() => {
    playClick()
    const matched = colorsMatch(round.target, guessColor, COLOR_MATCH_TOLERANCE)

    if (matched) {
      playFanfare()
      setMinuPose("celebrating")
      setStatusText(`Perfect mix! You revealed a ${formatItemName(round.item.name)}!`)
      setPhase("reveal")
      return
    }

    playError()
    setMinuPose("oops")
    setWobble(true)
    const { message, highlightChannels: channels } = getProgressiveHint(
      round.target,
      guessColor,
      2,
    )
    setStatusText(`Almost! ${message}`)
    setHighlightChannels(channels)
    setTimeout(() => setWobble(false), 550)
  }, [round, guessColor])

  const handleRevealContinue = useCallback(() => {
    playClick()
    if (roundIndex < rounds.length - 1) {
      setRoundIndex((i) => i + 1)
      resetMix()
      setPhase("activity")
      return
    }
    setPhase("quiz")
  }, [roundIndex, rounds.length, resetMix])

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
        {/* Left — Minu + mission */}
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

        {/* Right — lenses + sliders */}
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