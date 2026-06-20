"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, Zap, CheckCircle2, RotateCcw, Lightbulb, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MinuAvatar } from "@/components/minu-avatar"
import { Starfield } from "@/components/starfield"
import { playClick, playFanfare, playError } from "@/lib/audio"
import type { LevelActivityProps } from "@/lib/level-data"
import type { MinuPose } from "@/lib/minu-config"
import {
  LEVEL3_QUIZ,
  LEVEL3_QUIZ_PASS_PERCENT,
  LEVEL3_REQUIRED_FRACTION,
  LEVEL3_TRACE_RADIUS,
  LEVEL3_TRACE_ROUNDS,
  distToSegment,
} from "@/lib/level3-edge-detection"
import { cn } from "@/lib/utils"

type Phase = "activity" | "quiz"

export default function Level3EdgeDetection({ onComplete, onBack }: LevelActivityProps) {
  const [phase, setPhase] = useState<Phase>("activity")
  const [roundIndex, setRoundIndex] = useState(0)
  const [litDots, setLitDots] = useState<Set<number>>(new Set())
  const [roundDone, setRoundDone] = useState(false)
  const [minuPose, setMinuPose] = useState<MinuPose>("pointing")
  const [statusText, setStatusText] = useState(LEVEL3_TRACE_ROUNDS[0].instruction)
  const [hintVisible, setHintVisible] = useState(false)
  const [showPicture, setShowPicture] = useState(true)

  const [quizIndex, setQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [quizSelected, setQuizSelected] = useState<number | null>(null)
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null)
  const [quizDone, setQuizDone] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)
  const prevPosRef = useRef<{ x: number; y: number } | null>(null)
  const round = LEVEL3_TRACE_ROUNDS[roundIndex]
  const progress = litDots.size / round.dots.length
  const progressPct = Math.min(100, Math.round(progress * 100))

  useEffect(() => {
    setShowPicture(true)
  }, [roundIndex])

  useEffect(() => {
    if (roundDone) return
    if (progress >= LEVEL3_REQUIRED_FRACTION) {
      setRoundDone(true)
      setMinuPose("celebrating")
      setStatusText(round.doneText)
      playFanfare()
    } else if (progress >= 0.5) {
      setMinuPose("clapping")
    } else if (progress >= 0.2) {
      setMinuPose("thinking")
    }
  }, [progress, roundDone, round.doneText])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (roundDone) return
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

      setLitDots((prevDots) => {
        const next = new Set(prevDots)
        round.dots.forEach((dot, i) => {
          if (next.has(i)) return
          const dist = prev
            ? distToSegment(dot.x, dot.y, prev.x, prev.y, curX, curY)
            : Math.sqrt((dot.x - curX) ** 2 + (dot.y - curY) ** 2)
          if (dist <= LEVEL3_TRACE_RADIUS) next.add(i)
        })
        return next.size !== prevDots.size ? next : prevDots
      })
    },
    [round.dots, roundDone],
  )

  const goNextRound = () => {
    playClick()
    prevPosRef.current = null
    if (roundIndex < LEVEL3_TRACE_ROUNDS.length - 1) {
      const next = roundIndex + 1
      setRoundIndex(next)
      setLitDots(new Set())
      setRoundDone(false)
      setMinuPose("pointing")
      setStatusText(LEVEL3_TRACE_ROUNDS[next].instruction)
      setHintVisible(false)
    } else {
      setPhase("quiz")
    }
  }

  const resetRound = () => {
    playClick()
    prevPosRef.current = null
    setLitDots(new Set())
    setRoundDone(false)
    setMinuPose("pointing")
    setStatusText(round.instruction)
    setHintVisible(false)
  }

  const handleQuizAnswer = (optionIndex: number) => {
    if (quizSelected !== null) return
    playClick()
    const q = LEVEL3_QUIZ[quizIndex]
    const correct = optionIndex === q.correct
    setQuizSelected(optionIndex)
    setQuizCorrect(correct)
    const newScore = correct ? quizScore + 1 : quizScore
    if (correct) setQuizScore(newScore)
    else playError()

    setTimeout(() => {
      const next = quizIndex + 1
      if (next < LEVEL3_QUIZ.length) {
        setQuizIndex(next)
        setQuizSelected(null)
        setQuizCorrect(null)
      } else {
        setQuizDone(true)
        const passCount = Math.ceil((LEVEL3_QUIZ.length * LEVEL3_QUIZ_PASS_PERCENT) / 100)
        if (newScore >= passCount) playFanfare()
      }
    }, 1000)
  }

  const retryQuiz = () => {
    playClick()
    setQuizIndex(0)
    setQuizScore(0)
    setQuizSelected(null)
    setQuizCorrect(null)
    setQuizDone(false)
  }

  const passCount = Math.ceil((LEVEL3_QUIZ.length * LEVEL3_QUIZ_PASS_PERCENT) / 100)

  if (phase === "quiz") {
    const q = LEVEL3_QUIZ[quizIndex]
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
              Level 3 Quiz
            </p>
            <h1 className="font-heading text-lg font-extrabold text-foreground sm:text-xl">
              Edge Detective!
            </h1>
          </div>
          <Star className="size-6 shrink-0 text-secondary" />
        </header>

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col justify-center gap-5 px-4 py-4">
          {!quizDone ? (
            <>
              <p className="font-heading text-center text-xs font-bold text-muted-foreground">
                Question {quizIndex + 1} of {LEVEL3_QUIZ.length}
              </p>
              <p className="font-heading text-center text-base font-extrabold text-foreground sm:text-lg">
                {q.question}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, i) => {
                  const isSelected = quizSelected === i
                  const isRight = isSelected && quizCorrect === true
                  const isWrong = isSelected && quizCorrect === false
                  const isMissed =
                    quizSelected !== null && !isSelected && i === q.correct
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleQuizAnswer(i)}
                      disabled={quizSelected !== null}
                      className={cn(
                        "rounded-2xl border-2 px-4 py-3 text-left font-heading text-sm font-bold transition-all",
                        quizSelected === null &&
                          "border-border hover:border-secondary/70 hover:bg-secondary/10",
                        isRight && "border-accent bg-accent/15 text-accent",
                        isWrong && "border-destructive bg-destructive/15",
                        isMissed && "border-accent/50 bg-accent/5",
                      )}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-5 text-center">
              <MinuAvatar pose={quizScore >= passCount ? "celebrating" : "empathetic"} size={100} />
              <p className="font-heading text-xl font-extrabold text-foreground">
                {quizScore >= passCount ? "Awesome!" : "Keep trying!"} You scored {quizScore}/
                {LEVEL3_QUIZ.length}!
              </p>
              {quizScore >= passCount ? (
                <Button
                  size="lg"
                  onClick={() => {
                    playClick()
                    onComplete()
                  }}
                  className="font-heading rounded-full px-8 font-extrabold"
                >
                  <CheckCircle2 className="size-5" /> Level Complete!
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={retryQuiz}
                    className="font-heading rounded-full px-6 font-extrabold"
                  >
                    <RotateCcw className="size-4" /> Try Again
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      playClick()
                      onBack()
                    }}
                    className="font-heading rounded-full px-6 font-extrabold"
                  >
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                </div>
              )}
            </div>
          )}
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
            {round.title}
          </h1>
        </div>
        <span className="font-heading shrink-0 rounded-full border border-primary/30 bg-card/80 px-2.5 py-1 text-xs font-bold text-primary shadow-sm sm:px-3 sm:text-sm">
          {roundIndex + 1}/{LEVEL3_TRACE_ROUNDS.length}
        </span>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 gap-2 px-2 sm:gap-4 sm:px-4">
        <aside className="flex w-[36%] min-w-[118px] max-w-[280px] shrink-0 flex-col gap-2 sm:gap-2.5">
          <p className="font-heading text-center text-[10px] font-bold tracking-wider text-secondary uppercase sm:text-xs">
            <Star className="mb-0.5 inline size-3 fill-secondary text-secondary" /> Trace the Picture
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
          <div className="shrink-0 rounded-2xl border border-border/50 bg-card/60 px-3 py-2">
            <p className="font-heading mb-1.5 text-center text-[10px] font-bold text-muted-foreground sm:text-xs">
              Traced: {progressPct}%
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{ width: `${progressPct}%`, backgroundColor: round.color }}
              />
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                playClick()
                setHintVisible((h) => !h)
              }}
              className="font-heading h-9 gap-1 rounded-full border border-secondary/30 text-[10px] font-bold sm:h-10 sm:text-xs"
            >
              <Lightbulb className="size-3.5 text-secondary" />
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
          {hintVisible && (
            <p className="rounded-xl bg-secondary/10 px-2 py-2 text-[10px] font-bold leading-snug text-secondary sm:text-xs">
              {round.hint}
            </p>
          )}
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-primary/25 bg-card/50 px-2 py-1.5 sm:px-3">
            <p className="font-heading text-[10px] font-bold text-foreground sm:text-xs">
              Slide your finger along the dots — like a coloring book!
            </p>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-primary/20 bg-card/40 p-2">
            {round.imageSrc && showPicture && (
              <Image
                src={round.imageSrc}
                alt=""
                fill
                className="pointer-events-none object-contain p-4 opacity-95"
                sizes="(max-width: 640px) 55vw, 400px"
                onError={() => setShowPicture(false)}
                priority
              />
            )}
            <svg
              ref={svgRef}
              viewBox="0 0 200 200"
              className="relative z-10 h-full max-h-full w-full max-w-full touch-none select-none"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => {
                prevPosRef.current = null
              }}
            >
              {!round.imageSrc || !showPicture ? (
                <>
                  <path
                    d={round.svgPath}
                    fill={round.color}
                    fillOpacity={0.35}
                    stroke={round.color}
                    strokeWidth={2}
                    strokeOpacity={0.5}
                  />
                  {round.id === "butterfly" && (
                    <>
                      <circle cx={92} cy={88} r={4} fill="#1f2937" />
                      <circle cx={108} cy={88} r={4} fill="#1f2937" />
                    </>
                  )}
                  {round.id === "house" && (
                    <>
                      <rect x={90} y={135} width={20} height={25} rx={2} fill="#78350f" />
                      <rect x={118} y={125} width={16} height={16} fill="#7dd3fc" stroke="#0ea5e9" strokeWidth={1.5} />
                    </>
                  )}
                  {round.id === "rocket" && (
                    <>
                      <circle cx={100} cy={110} r={8} fill="#7dd3fc" stroke="#0ea5e9" strokeWidth={1.5} />
                      <rect x={94} y={145} width={12} height={8} rx={1} fill="#ef4444" />
                    </>
                  )}
                </>
              ) : (
                <path
                  d={round.svgPath}
                  fill="transparent"
                  stroke="transparent"
                  pointerEvents="none"
                />
              )}
              {round.dots.map((dot, i) => {
                const lit = litDots.has(i)
                return (
                  <circle
                    key={i}
                    cx={dot.x}
                    cy={dot.y}
                    r={lit ? 6 : 4}
                    fill={lit ? round.color : "#6b7280"}
                    opacity={lit ? 1 : 0.45}
                    style={lit ? { filter: `drop-shadow(0 0 5px ${round.color})` } : undefined}
                    className="transition-all duration-100"
                  />
                )
              })}
            </svg>
          </div>

          {roundDone && (
            <Button
              size="lg"
              onClick={goNextRound}
              className="font-heading h-11 shrink-0 rounded-full border-2 border-primary/40 text-sm font-extrabold shadow-lg shadow-primary/25 sm:h-12 sm:text-base"
            >
              <CheckCircle2 className="size-5" />
              {roundIndex < LEVEL3_TRACE_ROUNDS.length - 1 ? "Next Picture →" : "Go to Quiz!"}
            </Button>
          )}
        </section>
      </div>

      <footer className="relative z-10 shrink-0 border-t border-primary/20 bg-card/40 px-4 py-2 backdrop-blur-sm sm:py-2.5">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
          {LEVEL3_TRACE_ROUNDS.map((r, i) => (
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
                {r.label}
              </span>
            </div>
          ))}
        </div>
      </footer>
    </main>
  )
}