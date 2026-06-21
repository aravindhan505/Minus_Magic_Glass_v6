"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, Zap, CheckCircle2, RotateCcw, Lightbulb, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MinuAvatar } from "@/components/minu-avatar"
import { LevelQuiz } from "@/components/level-quiz"
import { Level5PartBridge } from "@/components/level-5-part-bridge"
import { Starfield } from "@/components/starfield"
import { playClick, playFanfare, playTraceDot } from "@/lib/audio"
import {
  LEVEL3_QUIZ_QUESTION_AUDIO,
  playLevel3Narrator,
  playLevel3RevealForRound,
  playLevel3Then,
} from "@/lib/level3-audio"
import type { LevelActivityProps } from "@/lib/level-data"
import type { MinuPose } from "@/lib/minu-config"
import {
  LEVEL3_QUIZ_PASS_PERCENT,
  LEVEL3_REQUIRED_FRACTION,
  getRandomLevel3Quiz,
  getRandomLevel3Rounds,
  level3QuizToQuizQuestions,
  distToSegment,
  type TraceDot,
} from "@/lib/level3-edge-detection"
import {
  extractTraceDotsFromSilhouette,
  traceMetricsForImage,
} from "@/lib/level3-trace-dots"
import { cn } from "@/lib/utils"

type Phase = "intro-bridge" | "activity" | "quiz-bridge" | "quiz"

const IDLE_REMINDER_MS = 30_000

export default function Level3EdgeDetection({ onComplete, onBack }: LevelActivityProps) {
  const [phase, setPhase] = useState<Phase>("intro-bridge")
  const [runKey] = useState(() => Date.now())
  const [quizKey, setQuizKey] = useState(0)
  const [quizIntroDone, setQuizIntroDone] = useState(false)
  const rounds = useMemo(() => getRandomLevel3Rounds(), [runKey])
  const quizPool = useMemo(() => getRandomLevel3Quiz(), [runKey, quizKey])
  const quizQuestions = useMemo(() => level3QuizToQuizQuestions(quizPool), [quizPool])

  const [roundIndex, setRoundIndex] = useState(0)
  const [litDots, setLitDots] = useState<Set<number>>(new Set())
  const [roundDone, setRoundDone] = useState(false)
  const [colorRevealed, setColorRevealed] = useState(false)
  const [minuPose, setMinuPose] = useState<MinuPose>("pointing")
  const [statusText, setStatusText] = useState(
    "A mystery shape! Trace every dot along the edges to reveal the picture!",
  )
  const [hintVisible, setHintVisible] = useState(false)
  const [hintActive, setHintActive] = useState(false)
  const [silhouetteOk, setSilhouetteOk] = useState(true)
  const [traceDots, setTraceDots] = useState<TraceDot[]>([])
  const [viewBox, setViewBox] = useState({ w: 1, h: 1 })
  const [traceMetrics, setTraceMetrics] = useState({
    traceRadius: 10,
    dotLit: 4,
    dotUnlit: 2.5,
  })
  const [dotsLoading, setDotsLoading] = useState(true)

  const svgRef = useRef<SVGSVGElement>(null)
  const prevPosRef = useRef<{ x: number; y: number } | null>(null)
  const activityIntroPlayed = useRef(false)
  const revealPlayedForRound = useRef(-1)
  const almostDonePlayed = useRef(false)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current)
      idleTimer.current = null
    }
  }, [])

  const round = rounds[roundIndex]
  const dotCount = traceDots.length || 1
  const progress = litDots.size / dotCount
  const progressPct = Math.min(100, Math.round(progress * 100))

  const isDotMappingScreenVisible =
    phase === "activity" &&
    !roundDone &&
    !colorRevealed &&
    !dotsLoading &&
    traceDots.length > 0

  const scheduleIdleReminder = useCallback(() => {
    clearIdleTimer()
    if (!isDotMappingScreenVisible) return
    idleTimer.current = setTimeout(() => {
      playLevel3Narrator("narrator_level3_reminder.mp3")
    }, IDLE_REMINDER_MS)
  }, [isDotMappingScreenVisible, clearIdleTimer])

  useEffect(() => {
    if (isDotMappingScreenVisible) {
      scheduleIdleReminder()
    } else {
      clearIdleTimer()
    }
  }, [isDotMappingScreenVisible, scheduleIdleReminder, clearIdleTimer])

  useEffect(() => {
    if (!round) return
    let cancelled = false
    setDotsLoading(true)
    setLitDots(new Set())
    setSilhouetteOk(true)
    setColorRevealed(false)
    setRoundDone(false)
    setHintActive(false)
    prevPosRef.current = null
    almostDonePlayed.current = false

    extractTraceDotsFromSilhouette(round.silhouetteSrc)
      .then(({ dots, width, height }) => {
        if (cancelled) return
        setTraceDots(dots)
        setViewBox({ w: width, h: height })
        setTraceMetrics(traceMetricsForImage(width, height))
        setDotsLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setTraceDots(round.dots)
        setViewBox({ w: 200, h: 200 })
        setTraceMetrics(traceMetricsForImage(200, 200))
        setDotsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [round])

  useEffect(() => {
    if (phase !== "activity" || !round || roundIndex !== 0) return
    if (activityIntroPlayed.current) return
    activityIntroPlayed.current = true
    playLevel3Narrator("narrator_level3_activity_intro.mp3")
  }, [phase, roundIndex, round])

  useEffect(() => {
    if (phase !== "activity" || roundDone) return
    if (progress < 0.8 || almostDonePlayed.current) return
    almostDonePlayed.current = true
    playLevel3Narrator("narrator_level3_hint_almost_done.mp3")
  }, [phase, progress, roundDone])

  useEffect(() => {
    if (!roundDone || !round) return
    if (revealPlayedForRound.current === roundIndex) return
    revealPlayedForRound.current = roundIndex
    playLevel3RevealForRound(round.id)
  }, [roundDone, round, roundIndex])

  useEffect(() => () => clearIdleTimer(), [clearIdleTimer])

  useEffect(() => {
    if (!round || roundDone) return
    if (progress >= LEVEL3_REQUIRED_FRACTION) {
      setRoundDone(true)
      setColorRevealed(true)
      setMinuPose("celebrating")
      setStatusText(round.doneText)
      playFanfare()
    } else if (progress >= 0.5) {
      setMinuPose("clapping")
    } else if (progress >= 0.2) {
      setMinuPose("thinking")
    }
  }, [progress, roundDone, round])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (roundDone || !round || dotsLoading || traceDots.length === 0) return
      const svg = svgRef.current
      if (!svg) return

      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const svgPt = pt.matrixTransform(ctm.inverse())
      const curX = svgPt.x
      const curY = svgPt.y

      const prev = prevPosRef.current
      prevPosRef.current = { x: curX, y: curY }
      const hitRadius = traceMetrics.traceRadius

      let added = 0
      let newLitCount = 0
      setLitDots((prevDots) => {
        const next = new Set(prevDots)
        traceDots.forEach((dot, i) => {
          if (next.has(i)) return
          const dist = prev
            ? distToSegment(dot.x, dot.y, prev.x, prev.y, curX, curY)
            : Math.sqrt((dot.x - curX) ** 2 + (dot.y - curY) ** 2)
          if (dist <= hitRadius) next.add(i)
        })
        added = next.size - prevDots.size
        newLitCount = next.size
        return next.size !== prevDots.size ? next : prevDots
      })
      if (added > 0) {
        playTraceDot(newLitCount)
        setHintActive(false)
        scheduleIdleReminder()
      }
    },
    [round, roundDone, dotsLoading, traceDots, traceMetrics.traceRadius, scheduleIdleReminder],
  )

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
      const clip = LEVEL3_QUIZ_QUESTION_AUDIO[q.id]
      if (clip) playLevel3Narrator(clip)
    },
    [quizPool],
  )

  const handleQuizPass = useCallback(() => {
    playLevel3Narrator("narrator_level3_quiz_pass.mp3")
  }, [])

  const handleQuizFail = useCallback(() => {
    playLevel3Narrator("narrator_level3_quiz_fail.mp3")
  }, [])

  const advanceToRound = useCallback((nextIndex: number) => {
    setRoundIndex(nextIndex)
    setLitDots(new Set())
    setRoundDone(false)
    setColorRevealed(false)
    setMinuPose("pointing")
    setStatusText(
      "A mystery shape! Trace every dot along the edges to reveal the picture!",
    )
    setHintVisible(false)
    setHintActive(false)
    almostDonePlayed.current = false
    prevPosRef.current = null
  }, [])

  const goNextRound = () => {
    playClick()
    if (roundIndex < rounds.length - 1) {
      playLevel3Then("narrator_level3_next_mystery.mp3", () => {
        advanceToRound(roundIndex + 1)
        playLevel3Narrator("narrator_level3_round_start.mp3")
      })
    } else {
      playLevel3Then("narrator_level3_all_rounds_done.mp3", () => setPhase("quiz-bridge"))
    }
  }

  const resetRound = () => {
    playClick()
    prevPosRef.current = null
    setLitDots(new Set())
    setRoundDone(false)
    setColorRevealed(false)
    setMinuPose("pointing")
    setStatusText(round?.instruction ?? "")
    setHintVisible(false)
    setHintActive(false)
  }

  const showHint = () => {
    playClick()
    clearIdleTimer()
    setHintVisible(true)
    setHintActive(true)
    playLevel3Narrator("narrator_level3_hint_glow.mp3")
  }

  const missedDotCount = traceDots.length - litDots.size

  if (!round) return null

  if (phase === "intro-bridge") {
    return (
      <Level5PartBridge
        key="l3-intro-bridge"
        levelBadge="Level 3 · Edge Detection"
        partLabel="Welcome"
        title="Map the Edges!"
        tagline="Trace mystery silhouettes dot by dot — reveal the real picture when every edge is found!"
        narratorFile="narrator_level3_intro.mp3"
        accentClass="border-chart-3/50 shadow-chart-3/25"
        minuPose="waving"
        playThen={playLevel3Then}
        onReady={handleIntroBridgeReady}
      />
    )
  }

  if (phase === "quiz-bridge") {
    return (
      <Level5PartBridge
        key="l3-quiz-bridge"
        levelBadge="Level 3 · Edge Detection"
        partLabel="Final Challenge"
        title="Edge Detective Quiz"
        tagline="Three random questions — get two right to calibrate Minu's edge lens!"
        narratorFile="narrator_level3_quiz_intro.mp3"
        accentClass="border-accent/50 shadow-accent/25"
        minuPose="thinking"
        playThen={playLevel3Then}
        onReady={handleQuizBridgeReady}
      />
    )
  }

  if (phase === "quiz") {
    return (
      <main className="relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-background">
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
              Quiz · Edge Detection
            </p>
            <h1 className="font-heading text-lg font-extrabold text-foreground sm:text-xl">
              3 Random Questions!
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
            passPercent={LEVEL3_QUIZ_PASS_PERCENT}
            questionNarratorEnabled={quizIntroDone}
            onQuestionStart={handleQuizQuestionStart}
            onPass={handleQuizPass}
            onQuizFail={handleQuizFail}
            successMessage="Sharp tracing! You really understand edges and outlines!"
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
            Level 3 · Edge Detection
          </p>
          <h1 className="font-heading truncate text-base font-extrabold text-foreground sm:text-xl">
            {colorRevealed ? round.label : `Round ${roundIndex + 1} – Mystery Shape`}
          </h1>
        </div>
        <span className="font-heading shrink-0 rounded-full border border-primary/30 bg-card/80 px-2.5 py-1 text-xs font-bold text-primary shadow-sm sm:px-3 sm:text-sm">
          {roundIndex + 1}/{rounds.length}
        </span>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 gap-2 px-2 sm:gap-4 sm:px-4">
        <aside className="flex w-[36%] min-w-[118px] max-w-[280px] shrink-0 flex-col gap-2 sm:gap-2.5">
          <p className="font-heading text-center text-[10px] font-bold tracking-wider text-secondary uppercase sm:text-xs">
            <Star className="mb-0.5 inline size-3 fill-secondary text-secondary" /> Map the Edges
          </p>
          <div className="flex shrink-0 items-center justify-center py-1">
            <MinuAvatar pose={minuPose} size={64} className="hidden sm:block" />
            <MinuAvatar pose={minuPose} size={48} className="sm:hidden" />
          </div>
          <div
            className={cn(
              "rounded-2xl border-2 px-3 py-2.5 backdrop-blur-sm",
              roundDone
                ? "border-accent/50 bg-accent/10"
                : "border-primary/35 bg-card/75 shadow-lg shadow-primary/15",
            )}
          >
            <p className="font-heading text-[11px] font-bold leading-snug text-foreground sm:text-sm">
              {statusText}
            </p>
          </div>
          {!colorRevealed && !dotsLoading && (
            <div className="shrink-0 rounded-2xl border border-border/50 bg-card/60 px-3 py-2">
              <p className="font-heading mb-1.5 text-center text-[10px] font-bold text-muted-foreground sm:text-xs">
                Edges traced: {progressPct}%
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{ width: `${progressPct}%`, backgroundColor: round.color }}
                />
              </div>
              <p className="font-heading mt-1.5 text-center text-[9px] font-bold text-muted-foreground">
                Trace 100% to reveal the picture!
              </p>
            </div>
          )}
          {!roundDone && (
            <div className="grid shrink-0 grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={showHint}
                disabled={missedDotCount === 0}
                className={cn(
                  "font-heading h-9 gap-1 rounded-full border text-[10px] font-bold sm:h-10 sm:text-xs",
                  hintActive
                    ? "border-secondary bg-secondary/20 shadow-[0_0_12px_var(--secondary)]"
                    : "border-secondary/30",
                )}
              >
                <Lightbulb
                  className={cn(
                    "size-3.5 text-secondary",
                    hintActive && "fill-secondary/40",
                  )}
                />
                Hint
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetRound}
                className="font-heading h-9 gap-1 rounded-full text-[10px] font-bold sm:h-10 sm:text-xs"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            </div>
          )}
          {hintVisible && !roundDone && (
            <p className="rounded-xl bg-secondary/10 px-2 py-2 text-[10px] font-bold leading-snug text-secondary sm:text-xs">
              {hintActive && missedDotCount > 0
                ? `Look for the ${missedDotCount} glowing dot${missedDotCount === 1 ? "" : "s"} you missed! ${round.hint}`
                : round.hint}
            </p>
          )}
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-primary/25 bg-card/50 px-2 py-1.5 sm:px-3">
            <p className="font-heading text-[10px] font-bold text-foreground sm:text-xs">
              {colorRevealed
                ? "You found every edge — here's the real picture!"
                : "Trace the dotted edges on the mystery silhouette!"}
            </p>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-black">
            {colorRevealed ? (
              <div className="relative size-full animate-pop-in">
                <Image
                  src={round.colorSrc}
                  alt={round.label}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 55vw, 400px"
                  priority
                />
                <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
                  <span className="font-heading flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/20 px-3 py-1 text-[10px] font-bold text-accent sm:text-xs">
                    <Sparkles className="size-3.5" />
                    Color revealed!
                  </span>
                </div>
              </div>
            ) : (
              <>
                {silhouetteOk && (
                  <Image
                    src={round.silhouetteSrc}
                    alt="Mystery shape outline"
                    fill
                    className="pointer-events-none object-contain"
                    sizes="(max-width: 640px) 55vw, 400px"
                    onError={() => setSilhouetteOk(false)}
                    priority
                  />
                )}
                {!silhouetteOk && (
                  <svg
                    viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="pointer-events-none absolute inset-0 size-full opacity-60"
                    aria-hidden
                  >
                    <path d={round.svgPath} fill={round.color} fillOpacity={0.4} />
                  </svg>
                )}
                {!dotsLoading && traceDots.length > 0 && (
                  <svg
                    ref={svgRef}
                    viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="absolute inset-0 z-10 size-full touch-none select-none"
                    onPointerMove={handlePointerMove}
                    onPointerLeave={() => {
                      prevPosRef.current = null
                    }}
                  >
                    {traceDots.map((dot, i) => {
                      const lit = litDots.has(i)
                      const hinted = hintActive && !lit
                      return (
                        <g key={i}>
                          {hinted && (
                            <circle
                              cx={dot.x}
                              cy={dot.y}
                              r={traceMetrics.dotLit * 2.2}
                              fill="none"
                              stroke="#facc15"
                              strokeWidth={traceMetrics.dotUnlit * 0.9}
                              className="animate-trace-hint-pulse pointer-events-none"
                              style={{
                                filter: "drop-shadow(0 0 6px #fde047) drop-shadow(0 0 12px #facc15)",
                              }}
                            />
                          )}
                          <circle
                            cx={dot.x}
                            cy={dot.y}
                            r={
                              lit
                                ? traceMetrics.dotLit
                                : hinted
                                  ? traceMetrics.dotLit * 1.15
                                  : traceMetrics.dotUnlit
                            }
                            fill={lit ? round.color : hinted ? "#fde047" : "#d1d5db"}
                            opacity={lit ? 1 : hinted ? 1 : 0.85}
                            style={
                              lit
                                ? { filter: `drop-shadow(0 0 4px ${round.color})` }
                                : hinted
                                  ? {
                                      filter:
                                        "drop-shadow(0 0 5px #fde047) drop-shadow(0 0 10px #facc15)",
                                    }
                                  : undefined
                            }
                            className="transition-all duration-75"
                          />
                        </g>
                      )
                    })}
                  </svg>
                )}
                {dotsLoading && (
                  <p className="absolute z-20 font-heading text-xs font-bold text-muted-foreground">
                    Loading edges…
                  </p>
                )}
              </>
            )}
          </div>

          {roundDone && (
            <Button
              size="lg"
              onClick={goNextRound}
              className="font-heading h-11 shrink-0 rounded-full border-2 border-primary/40 text-sm font-extrabold shadow-lg shadow-primary/25 sm:h-12 sm:text-base"
            >
              <CheckCircle2 className="size-5" />
              {roundIndex < rounds.length - 1 ? "Next Mystery Shape →" : "Go to Quiz!"}
            </Button>
          )}
        </section>
      </div>

      <footer className="relative z-10 shrink-0 border-t border-primary/20 bg-card/40 px-4 py-2 backdrop-blur-sm sm:py-2.5">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
          {rounds.map((r, i) => (
            <div key={r.id} className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === roundIndex
                    ? "w-8 bg-primary shadow-[0_0_8px_var(--primary)]"
                    : "w-4",
                  i < roundIndex ? "bg-accent" : i !== roundIndex ? "bg-muted" : "",
                )}
              />
              <span
                className={cn(
                  "font-heading hidden text-[9px] font-bold sm:block",
                  i === roundIndex ? "text-primary" : "text-muted-foreground",
                )}
              >
                {i < roundIndex ? r.label : i === roundIndex ? "?" : "·"}
              </span>
            </div>
          ))}
        </div>
      </footer>
    </main>
  )
}