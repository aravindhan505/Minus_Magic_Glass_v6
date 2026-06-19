"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  Check,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MinuAvatar } from "@/components/minu-avatar"
import { LevelQuiz } from "@/components/level-quiz"
import { Starfield } from "@/components/starfield"
import { playClick, playError, playFanfare } from "@/lib/audio"
import {
  LEVEL5_HINT_AUDIO,
  LEVEL5_ROUND_AUDIO,
  playLevel5Narrator,
  playLevel5Then,
} from "@/lib/level5-audio"
import type { LevelActivityProps } from "@/lib/level-data"
import type { MinuPose } from "@/lib/minu-config"
import Level5HierarchyMatching from "@/components/level-5-hierarchy-matching"
import { Level5PartBridge } from "@/components/level-5-part-bridge"
import {
  LEVEL5_QUIZ_PASS_PERCENT,
  TILE_TRANSFORM_CLASS,
  getRandomDetectionRounds,
  getRandomLevel5Quiz,
  getRoundTiles,
  referenceImageSrc,
  tileImageSrc,
  type DetectionRound,
  type DetectionTile,
} from "@/lib/level5-object-detection"
import { cn } from "@/lib/utils"

type Phase = "part1-bridge" | "activity" | "part2-bridge" | "hierarchy" | "quiz-bridge" | "quiz"
type SubmitState = "idle" | "success" | "error"

const CORRECT_PER_ROUND = 7

function shuffleTiles<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function TileButton({
  tile,
  selected,
  submitState,
  hinted,
  onToggle,
}: {
  tile: DetectionTile
  selected: boolean
  submitState: SubmitState
  hinted: boolean
  onToggle: () => void
}) {
  const transform = tile.transform ?? "none"
  const wrongPick = submitState === "error" && selected && !tile.isCorrect
  const missed = submitState === "error" && !selected && tile.isCorrect

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={submitState === "success"}
      aria-pressed={selected}
      aria-label={tile.isCorrect ? `Picture of a match` : `Picture — not a match`}
      className={cn(
        "group relative h-full min-h-0 w-full min-w-0 overflow-hidden rounded-xl border-2 transition-all outline-none",
        "border-border/60 bg-card/80 shadow-sm hover:border-secondary/70 hover:shadow-md hover:shadow-secondary/10",
        selected && submitState !== "error" && "border-secondary bg-secondary/15 ring-2 ring-secondary/40",
        hinted && !selected && "animate-pulse border-secondary ring-2 ring-secondary/60",
        wrongPick && "border-destructive bg-destructive/15",
        missed && "border-accent/70 ring-1 ring-accent/50",
        submitState === "success" && tile.isCorrect && selected && "border-accent bg-accent/20",
      )}
    >
      <div
        className={cn(
          "flex size-full items-center justify-center p-0.5 sm:p-1",
          TILE_TRANSFORM_CLASS[transform],
        )}
      >
        <Image
          src={tileImageSrc(tile)}
          alt=""
          width={512}
          height={512}
          sizes="(max-width: 640px) 18vw, 120px"
          className="max-h-[92%] max-w-[92%] object-contain drop-shadow-md transition-transform group-hover:scale-105"
          draggable={false}
        />
      </div>
      {selected && (
        <span
          className={cn(
            "absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full shadow sm:size-5",
            wrongPick ? "bg-destructive text-white" : "bg-secondary text-secondary-foreground",
          )}
        >
          {wrongPick ? <X className="size-2.5 sm:size-3" /> : <Check className="size-2.5 sm:size-3" />}
        </span>
      )}
    </button>
  )
}

function MissionMessage({
  text,
  submitState,
}: {
  text: string
  submitState: SubmitState
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 px-3 py-2.5 backdrop-blur-sm",
        submitState === "error" &&
          "border-destructive/45 bg-destructive/10 shadow-[0_0_20px_oklch(0.62_0.24_25/25%)]",
        submitState === "success" &&
          "border-accent/50 bg-accent/10 shadow-[0_0_20px_oklch(0.78_0.2_150/25%)]",
        submitState === "idle" &&
          "border-primary/35 bg-card/75 shadow-lg shadow-primary/15",
      )}
    >
      <p className="font-heading text-[11px] font-bold leading-snug text-foreground sm:text-sm">
        {text}
      </p>
    </div>
  )
}

export default function Level5ObjectDetection({ onComplete, onBack }: LevelActivityProps) {
  const [phase, setPhase] = useState<Phase>("part1-bridge")
  const [roundIndex, setRoundIndex] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [statusText, setStatusText] = useState("")
  const [minuPose, setMinuPose] = useState<MinuPose>("pointing")
  const [hintLevel, setHintLevel] = useState(0)
  const [hintedIds, setHintedIds] = useState<Set<string>>(new Set())
  const [quizKey, setQuizKey] = useState(0)
  const [runKey] = useState(() => Date.now())
  const part1IntroPlayed = useRef(false)
  const roundNarratorPlayed = useRef(-1)
  const [quizIntroDone, setQuizIntroDone] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const activeRounds = useMemo(() => getRandomDetectionRounds(3), [runKey])
  const quizQuestions = useMemo(() => getRandomLevel5Quiz(5), [quizKey])

  const round: DetectionRound = activeRounds[roundIndex]
  const tiles = useMemo(
    () => (round ? shuffleTiles(getRoundTiles(round)) : []),
    [round],
  )

  const correctIds = useMemo(
    () => new Set(tiles.filter((t) => t.isCorrect).map((t) => t.id)),
    [tiles],
  )

  useEffect(() => {
    if (phase !== "activity" || !round) return

    setStatusText(round.kidInstruction)
    setMinuPose("pointing")
    setHintLevel(0)
    setHintedIds(new Set())
    setSelectedIds(new Set())
    setSubmitState("idle")
    setTransitioning(false)

    if (roundNarratorPlayed.current === roundIndex) return
    roundNarratorPlayed.current = roundIndex

    const roundClip = LEVEL5_ROUND_AUDIO[round.id]
    const playRoundClip = () => {
      if (roundClip) playLevel5Narrator(roundClip)
    }

    if (!part1IntroPlayed.current && roundIndex === 0) {
      part1IntroPlayed.current = true
      playLevel5Narrator("narrator_level5_part1_intro.mp3", { onEnd: playRoundClip })
      return
    }

    playRoundClip()
  }, [phase, roundIndex, round])

  const handleQuizQuestionStart = useCallback(() => {
    playLevel5Narrator("narrator_level5_quiz_question.mp3")
  }, [])

  const handleQuizPass = useCallback(() => {
    playLevel5Narrator("narrator_level5_quiz_pass.mp3")
  }, [])

  const handleQuizFail = useCallback(() => {
    playLevel5Narrator("narrator_level5_quiz_fail.mp3")
  }, [])

  const handlePart1BridgeReady = useCallback(() => {
    setPhase("activity")
  }, [])

  const handlePart2BridgeReady = useCallback(() => {
    setPhase("hierarchy")
  }, [])

  const handleQuizBridgeReady = useCallback(() => {
    setQuizIntroDone(true)
    setPhase("quiz")
  }, [])

  const toggleTile = useCallback(
    (id: string) => {
      if (submitState === "success") return
      playClick()
      if (submitState === "error") setSubmitState("idle")
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [submitState],
  )

  const handleHint = useCallback(() => {
    playClick()
    const nextLevel = hintLevel + 1
    setHintLevel(nextLevel)
    setMinuPose("thinking")

    if (nextLevel === 1) {
      setStatusText(round.hintCount)
      playLevel5Narrator(LEVEL5_HINT_AUDIO[0])
      return
    }
    if (nextLevel === 2) {
      setStatusText(round.hintColors)
      playLevel5Narrator(LEVEL5_HINT_AUDIO[1])
      return
    }
    if (nextLevel === 3) {
      setStatusText(round.hintUpsideDown)
      playLevel5Narrator(LEVEL5_HINT_AUDIO[2])
      return
    }

    const unselectedCorrect = tiles.filter((t) => t.isCorrect && !selectedIds.has(t.id))
    if (unselectedCorrect.length > 0) {
      playLevel5Narrator(LEVEL5_HINT_AUDIO[3])
      const pick = unselectedCorrect[Math.floor(Math.random() * unselectedCorrect.length)]
      setHintedIds((prev) => new Set(prev).add(pick.id))
      setStatusText(`Look! One more ${round.noun} is glowing — tap it!`)
      setTimeout(() => {
        setHintedIds((prev) => {
          const next = new Set(prev)
          next.delete(pick.id)
          return next
        })
      }, 3500)
    } else {
      setStatusText(`You found all ${CORRECT_PER_ROUND} ${round.nounPlural}! Tap the big button to check!`)
    }
  }, [hintLevel, round, tiles, selectedIds])

  const handleSubmit = useCallback(() => {
    if (submitState !== "idle" && submitState !== "error") return
    playClick()

    const hasWrong = [...selectedIds].some((id) => {
      const tile = tiles.find((t) => t.id === id)
      return tile && !tile.isCorrect
    })
    const allCorrectSelected = [...correctIds].every((id) => selectedIds.has(id))

    if (hasWrong) {
      setSubmitState("error")
      setMinuPose("oops")
      playError()
      playLevel5Narrator("narrator_level5_wrong_pick.mp3")
      setStatusText(
        "Oops! You picked something that does NOT match. Tap the red X to un-pick it!",
      )
      return
    }

    if (!allCorrectSelected) {
      setSubmitState("error")
      setMinuPose("thinking")
      playError()
      playLevel5Narrator("narrator_level5_missing.mp3")
      const missing = CORRECT_PER_ROUND - [...correctIds].filter((id) => selectedIds.has(id)).length
      setStatusText(
        `Keep going! You still need ${missing} more ${missing === 1 ? round.noun : round.nounPlural}. Try a Hint!`,
      )
      return
    }

    if (selectedIds.size > CORRECT_PER_ROUND) {
      setSubmitState("error")
      setMinuPose("oops")
      playError()
      playLevel5Narrator("narrator_level5_too_many.mp3")
      setStatusText("Too many picks! Only tap the matching pictures.")
      return
    }

    setSubmitState("success")
    setMinuPose("celebrating")
    setStatusText(`Awesome! All ${CORRECT_PER_ROUND} ${round.nounPlural} found!`)
    setTransitioning(true)
    playFanfare()

    const isLastRound = roundIndex >= activeRounds.length - 1
    playLevel5Then("narrator_level5_round_success.mp3", () => {
      if (!isLastRound) {
        setTransitioning(false)
        setRoundIndex((i) => i + 1)
        return
      }
      playLevel5Then("narrator_level5_part1_complete.mp3", () => {
        setPhase("part2-bridge")
      })
    })
  }, [submitState, selectedIds, tiles, correctIds, round, roundIndex, activeRounds.length])

  if (phase === "part1-bridge") {
    return (
      <Level5PartBridge
        partLabel="Part 1"
        title="Object Detection"
        tagline="Spot matching objects in the grid — even when colours or angles change!"
        narratorFile="narrator_level5_intro.mp3"
        minuPose="waving"
        onReady={handlePart1BridgeReady}
      />
    )
  }

  if (phase === "part2-bridge") {
    return (
      <Level5PartBridge
        partLabel="Part 2"
        title="Hierarchical Feature Matching"
        tagline="Build a person piece by piece — big body parts first, then tiny face details!"
        narratorFile="narrator_level5_part2_intro.mp3"
        accentClass="border-chart-4/50 shadow-chart-4/20"
        minuPose="pointing"
        onReady={handlePart2BridgeReady}
      />
    )
  }

  if (!round && phase === "activity") {
    return null
  }

  if (phase === "hierarchy") {
    return (
      <Level5HierarchyMatching
        onComplete={() => {
          playFanfare()
          playLevel5Then("narrator_level5_part2_complete.mp3", () => {
            setPhase("quiz-bridge")
          })
        }}
        onBack={onBack}
      />
    )
  }

  if (phase === "quiz-bridge") {
    return (
      <Level5PartBridge
        partLabel="Final Challenge"
        title="Quiz Time"
        tagline="Five computer vision questions — get four right to calibrate Minu's final lens!"
        narratorFile="narrator_level5_quiz_intro.mp3"
        accentClass="border-accent/50 shadow-accent/25"
        minuPose="thinking"
        onReady={handleQuizBridgeReady}
      />
    )
  }

  if (phase === "quiz") {
    return (
      <main className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
        <Starfield count={70} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/15 to-transparent"
        />
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
              Final Quiz · Computer Vision
            </p>
            <h1 className="font-heading text-lg font-extrabold text-foreground sm:text-xl">
              5 Random Questions!
            </h1>
          </div>
          <Sparkles className="size-6 shrink-0 text-secondary drop-shadow-[0_0_8px_var(--chart-2)]" />
        </header>
        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col justify-center px-3 py-2 sm:px-4">
          <LevelQuiz
            key={quizKey}
            questions={quizQuestions}
            retryOnlyOnFail
            compact
            hideOptionLabels
            passPercent={LEVEL5_QUIZ_PASS_PERCENT}
            successMessage="Amazing! You mastered object detection and feature hierarchy!"
            questionNarratorEnabled={quizIntroDone}
            onQuestionStart={handleQuizQuestionStart}
            onPass={handleQuizPass}
            onQuizFail={handleQuizFail}
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

  const selectedCorrectCount = [...correctIds].filter((id) => selectedIds.has(id)).length

  return (
    <main className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      <Starfield count={80} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-chart-5/20 via-primary/5 to-transparent"
      />

      {/* Header */}
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
            Level 5 · Part 1 · Object Detection
          </p>
          <h1 className="font-heading truncate text-base font-extrabold text-foreground sm:text-xl">
            Find ALL the {round.nounPlural}!
          </h1>
        </div>
        <span className="font-heading shrink-0 rounded-full border border-primary/30 bg-card/80 px-2.5 py-1 text-xs font-bold text-primary shadow-sm sm:px-3 sm:text-sm">
          {roundIndex + 1}/3
        </span>
      </header>

      {/* Main — left mission column + right grid */}
      <div className="relative z-10 flex min-h-0 flex-1 gap-2 px-2 sm:gap-4 sm:px-4">
        {/* Left: reference, Minu, mission text, progress, side actions */}
        <aside className="flex w-[36%] min-w-[118px] max-w-[280px] shrink-0 flex-col gap-2 sm:gap-2.5">
          <p className="font-heading text-center text-[10px] font-bold tracking-wider text-secondary uppercase sm:text-xs">
            <Star className="mb-0.5 inline size-3 fill-secondary text-secondary" /> Your Mission
          </p>

          <div
            className="planet-img-glow-active relative flex min-h-0 flex-[1.2] flex-col items-center justify-center rounded-2xl border-2 border-primary/45 bg-card/85 p-2 shadow-lg shadow-primary/20 sm:rounded-3xl sm:p-3"
            style={{ "--planet-glow": "var(--chart-5)" } as React.CSSProperties}
          >
            <p className="font-heading mb-1 text-[9px] font-bold text-muted-foreground uppercase sm:text-[10px]">
              Look at this
            </p>
            <Image
              src={referenceImageSrc(round)}
              alt={round.referenceCaption}
              width={512}
              height={512}
              sizes="(max-width: 640px) 32vw, 240px"
              className="max-h-[58%] max-w-full flex-1 object-contain drop-shadow-xl"
              priority
            />
            <p className="font-heading mt-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary sm:text-xs">
              {round.referenceCaption}
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-center gap-2">
            <MinuAvatar pose={minuPose} size={48} className="sm:hidden" />
            <MinuAvatar pose={minuPose} size={64} className="hidden sm:block" />
          </div>

          <MissionMessage text={statusText} submitState={submitState} />

          {/* Star progress — fun found counter */}
          <div className="shrink-0 rounded-2xl border border-border/50 bg-card/60 px-2 py-2">
            <p className="font-heading mb-1.5 text-center text-[10px] font-bold text-muted-foreground sm:text-xs">
              Matches found: {selectedCorrectCount}/{CORRECT_PER_ROUND}
            </p>
            <div className="flex justify-center gap-1">
              {Array.from({ length: CORRECT_PER_ROUND }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4 transition-all sm:size-5",
                    i < selectedCorrectCount
                      ? "fill-secondary text-secondary drop-shadow-[0_0_6px_var(--chart-2)]"
                      : "text-muted/40",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleHint}
              className="font-heading h-9 gap-1 rounded-full border border-secondary/30 text-[10px] font-bold sm:h-10 sm:text-xs"
            >
              <Lightbulb className="size-3.5 text-secondary" />
              Hint
              {hintLevel > 0 && (
                <span className="rounded-full bg-muted px-1 text-[9px]">{hintLevel}</span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                playClick()
                setSelectedIds(new Set())
                setSubmitState("idle")
                setStatusText(round.kidInstruction)
                setMinuPose("pointing")
                setHintLevel(0)
              }}
              className="font-heading h-9 gap-1 rounded-full text-[10px] font-bold sm:h-10 sm:text-xs"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
          </div>
        </aside>

        {/* Right: grid + submit */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-primary/25 bg-card/50 px-2 py-1.5 sm:px-3">
            <p className="font-heading text-[10px] font-bold text-foreground sm:text-xs">
              Tap all {CORRECT_PER_ROUND} matching pictures
            </p>
            <span className="font-heading rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-bold text-secondary sm:text-xs">
              4×4 grid
            </span>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-4 gap-1 sm:gap-1.5">
            {tiles.map((tile) => (
              <TileButton
                key={tile.id}
                tile={tile}
                selected={selectedIds.has(tile.id)}
                submitState={submitState}
                hinted={hintedIds.has(tile.id)}
                onToggle={() => toggleTile(tile.id)}
              />
            ))}
          </div>

          <Button
            type="button"
            size="lg"
            disabled={selectedIds.size === 0 || submitState === "success" || transitioning}
            onClick={handleSubmit}
            className="font-heading h-11 shrink-0 rounded-full border-2 border-primary/40 text-sm font-extrabold shadow-lg shadow-primary/25 sm:h-12 sm:text-base"
          >
            {submitState === "success" ? (
              <>
                <Check className="size-5" /> Correct! Next...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                I&apos;m Done — Check My Picks!
              </>
            )}
          </Button>
        </section>
      </div>

      {/* Bottom progress rail */}
      <footer className="relative z-10 shrink-0 border-t border-primary/20 bg-card/40 px-4 py-2 backdrop-blur-sm sm:py-2.5">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
          {activeRounds.map((r, i) => (
            <div key={`${r.id}-${i}`} className="flex flex-col items-center gap-0.5">
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
                {r.nounPlural}
              </span>
            </div>
          ))}
        </div>
      </footer>
    </main>
  )
}