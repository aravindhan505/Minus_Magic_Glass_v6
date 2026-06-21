"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Check, X, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LevelSlider } from "@/components/ui/slider"
import { SpeechBubble } from "@/components/speech-bubble"
import { playClick, playFanfare, playError, playNarratorFile } from "@/lib/audio"
import type { QuizQuestion } from "@/lib/level-data"
import { TILE_TRANSFORM_CLASS } from "@/lib/level5-object-detection"
import { cn } from "@/lib/utils"

const QUIZ_PASS_PERCENT = 80

/** RGB potion slider colors (Level 2 hands-on quiz). */
const RGB_SLIDER_COLORS: Record<string, string> = {
  r: "#ff4444",
  g: "#44cc44",
  b: "#4488ff",
}

type LevelQuizProps = {
  questions: QuizQuestion[]
  /** Called when the quiz is passed (>= threshold correct) */
  onComplete: () => void
  /** Called to go back without completing */
  onBack: () => void
  /** Called when the quiz is failed (< threshold correct) */
  onFail: () => void
  /** Hide "Practice More" on fail — only show Retry Quiz (Level 5) */
  retryOnlyOnFail?: boolean
  /** Tighter layout for Level 5 (fits h-dvh without scroll) */
  compact?: boolean
  /** Override default 80% pass threshold (Level 5 Part 1 uses 67%) */
  passPercent?: number
  /** Custom success message on pass screen */
  successMessage?: string
  /** Optional narrator when a new question appears (receives 0-based question index). */
  onQuestionStart?: (questionIndex: number) => void
  /** Gate question narrator (e.g. wait for quiz intro to finish) */
  questionNarratorEnabled?: boolean
  /** Optional narrator when the pass results screen shows */
  onPass?: () => void
  /** Optional narrator when the fail results screen shows */
  onQuizFail?: () => void
  /** Picture-only options — hide text labels under each choice (Level 5) */
  hideOptionLabels?: boolean
}

/**
 * End-of-level quiz component.
 * Supports visual multiple choice and hands-on slider challenges.
 * Tracks score and only calls onComplete when the pass threshold is met.
 */
export function LevelQuiz({
  questions,
  onComplete,
  onBack,
  onFail,
  retryOnlyOnFail,
  compact,
  passPercent: passPercentThreshold = QUIZ_PASS_PERCENT,
  successMessage = "You did it! Great job! Minu's glasses are calibrated! 🌟",
  onQuestionStart,
  questionNarratorEnabled = true,
  onPass,
  onQuizFail,
  hideOptionLabels,
}: LevelQuizProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const resultsNarratorPlayed = useRef(false)
  const questionNarratorForQ = useRef(-1)
  const onQuestionStartRef = useRef(onQuestionStart)
  const onPassRef = useRef(onPass)
  const onQuizFailRef = useRef(onQuizFail)
  onQuestionStartRef.current = onQuestionStart
  onPassRef.current = onPass
  onQuizFailRef.current = onQuizFail
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [allDone, setAllDone] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const question = questions[currentQ]
  const passPercent = Math.round((correctAnswers / questions.length) * 100)
  const passed = passPercent >= passPercentThreshold

  useEffect(() => {
    if (allDone || !questionNarratorEnabled) return
    if (questionNarratorForQ.current === currentQ) return
    questionNarratorForQ.current = currentQ
    onQuestionStartRef.current?.(currentQ)
  }, [currentQ, allDone, questionNarratorEnabled])

  useEffect(() => {
    if (!allDone || resultsNarratorPlayed.current) return
    resultsNarratorPlayed.current = true
    if (passed) onPassRef.current?.()
    else onQuizFailRef.current?.()
  }, [allDone, passed])

  const handleChoice = (optionIndex: number) => {
    if (feedback) return
    if (question.type !== "visual_choice" && question.type !== "text_choice") return

    setSelectedOption(optionIndex)
    const isCorrect = question.options[optionIndex].correct

    if (isCorrect) {
      setFeedback("correct")
      setCorrectAnswers((prev) => prev + 1)
      playFanfare()
      // Alternate between correct audio clips
      const correctFiles = ["narrator_quiz_correct.mp3", "narrator_quiz_correct_amazing.mp3"]
      playNarratorFile(correctFiles[Math.floor(Math.random() * correctFiles.length)])
    } else {
      setFeedback("incorrect")
      playError()
      // Alternate between incorrect audio clips
      const incorrectFiles = ["narrator_quiz_incorrect.mp3", "narrator_quiz_incorrect_try.mp3"]
      playNarratorFile(incorrectFiles[Math.floor(Math.random() * incorrectFiles.length)])
    }
  }

  const handleSliderSubmit = () => {
    if (question.type !== "hands_on") return

    const tolerance = question.tolerance ?? 20
    const allCorrect = Object.entries(question.targetSliderValues).every(([key, target]) => {
      const current = sliderValues[key] ?? 0
      return Math.abs(current - target) <= tolerance
    })

    if (allCorrect) {
      setFeedback("correct")
      setCorrectAnswers((prev) => prev + 1)
      playFanfare()
      const correctFiles = ["narrator_quiz_correct.mp3", "narrator_quiz_correct_amazing.mp3"]
      playNarratorFile(correctFiles[Math.floor(Math.random() * correctFiles.length)])
    } else {
      setFeedback("incorrect")
      playError()
      const incorrectFiles = ["narrator_quiz_incorrect.mp3", "narrator_quiz_incorrect_try.mp3"]
      playNarratorFile(incorrectFiles[Math.floor(Math.random() * incorrectFiles.length)])
    }
  }

  const handleNext = () => {
    playClick()
    setSelectedOption(null)
    setFeedback(null)

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setAllDone(true)
    }
  }

  // ─── Results Screen ───────────────────────────────────

  if (allDone) {
    if (passed) {
      return (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-pop-in text-6xl">🎉</div>
          <p className="font-heading text-2xl font-extrabold text-accent">
            Quiz Passed!
          </p>
          <div className="rounded-2xl border border-accent bg-card p-6 shadow-lg text-center">
            <div className="font-heading text-5xl font-extrabold text-accent mb-2">
              {correctAnswers} / {questions.length}
            </div>
            <div className="text-lg text-muted-foreground mb-1">
              {passPercent}% correct
            </div>
            <div className="h-3 w-48 mx-auto overflow-hidden rounded-full bg-muted mt-2">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${passPercent}%` }}
              />
            </div>
          </div>
          <SpeechBubble text={successMessage} />
          <Button
            onClick={onComplete}
            className="font-heading rounded-full px-8 font-bold text-lg animate-pulse"
          >
            Continue <ArrowRight className="size-4" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="animate-pop-in text-6xl">💪</div>
        <p className="font-heading text-2xl font-extrabold text-foreground">
          Almost There!
        </p>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg text-center">
          <div className="font-heading text-5xl font-extrabold mb-2">
            {correctAnswers} / {questions.length}
          </div>
          <div className="text-lg text-muted-foreground mb-1">
            {passPercent}% correct
          </div>
          <div className="h-3 w-48 mx-auto overflow-hidden rounded-full bg-muted mt-2">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${passPercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            You need {passPercentThreshold}% to pass. Try again!
          </p>
        </div>
        <SpeechBubble text="Don't give up! Let's try the quiz again! 💪" />
        <div className="flex gap-3">
          {!retryOnlyOnFail && (
            <Button
              variant="secondary"
              onClick={onBack}
              className="font-heading rounded-full px-6 font-bold"
            >
              <ArrowRight className="size-4 rotate-180" /> Practice More
            </Button>
          )}
          <Button
            onClick={onFail}
            className="font-heading rounded-full px-8 font-bold"
          >
            <RotateCcw className="size-4" /> Retry Quiz
          </Button>
        </div>
      </div>
    )
  }

  // ─── Question Screen ──────────────────────────────────

  return (
    <div
      className={cn(
        "animate-pop-in flex w-full max-w-lg flex-col rounded-3xl border border-border bg-card",
        compact ? "max-h-full gap-3 overflow-y-auto p-4" : "gap-6 p-6",
      )}
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {questions.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              i < currentQ
                ? "bg-accent"
                : i === currentQ
                  ? "bg-primary"
                  : "bg-muted",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="font-heading text-sm font-bold text-muted-foreground">
          Question {currentQ + 1} of {questions.length}
        </p>
        <p className="font-heading text-xs font-bold text-muted-foreground">
          Score: {correctAnswers}/{currentQ + (feedback ? 1 : 0)}
        </p>
      </div>

      <p
        className={cn(
          "font-heading font-extrabold text-foreground text-balance",
          compact ? "text-base" : "text-lg",
        )}
      >
        {question.question}
      </p>

      {/* Visual choice options */}
      {question.type === "visual_choice" && (
        <div className={cn("grid grid-cols-2", compact ? "gap-2" : "gap-3")}>
          {question.options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleChoice(i)}
              disabled={!!feedback}
              aria-label={hideOptionLabels ? `Picture choice ${i + 1}` : option.label}
              className={cn(
                "group relative flex flex-col items-center rounded-2xl border-2 transition-all",
                hideOptionLabels ? "gap-0 p-2 sm:p-3" : "gap-2 p-4",
                selectedOption === i && feedback === "correct"
                  ? "border-accent bg-accent/20"
                  : selectedOption === i && feedback === "incorrect"
                    ? "border-destructive bg-destructive/20"
                    : "border-border hover:border-primary bg-card",
                feedback && "cursor-default",
              )}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                <div
                  className={cn(
                    "relative size-full",
                    option.imageSrcRight ? "grid grid-cols-2 gap-1" : "",
                    option.transform ? TILE_TRANSFORM_CLASS[option.transform] : "",
                  )}
                >
                  <div className="relative min-h-0 min-w-0">
                    <Image
                      src={option.imageSrc}
                      alt=""
                      fill
                      className={cn("object-contain", hideOptionLabels ? "p-1 sm:p-1.5" : "p-2")}
                      sizes="200px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                      }}
                    />
                  </div>
                  {option.imageSrcRight && (
                    <div className="relative min-h-0 min-w-0">
                      <Image
                        src={option.imageSrcRight}
                        alt=""
                        fill
                        className={cn("object-contain", hideOptionLabels ? "p-1 sm:p-1.5" : "p-2")}
                        sizes="200px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              {!hideOptionLabels && (
                <span className="font-heading text-sm font-bold text-foreground">
                  {option.label}
                </span>
              )}
              {selectedOption === i && feedback === "correct" && (
                <div className="absolute -right-2 -top-2 rounded-full bg-accent p-1">
                  <Check className="size-4 text-accent-foreground" />
                </div>
              )}
              {selectedOption === i && feedback === "incorrect" && (
                <div className="absolute -right-2 -top-2 rounded-full bg-destructive p-1">
                  <X className="size-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Text-only multiple choice (Level 3) */}
      {question.type === "text_choice" && (
        <div className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
          {question.options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleChoice(i)}
              disabled={!!feedback}
              className={cn(
                "group relative rounded-2xl border-2 px-4 py-3 text-left font-heading text-sm font-bold transition-all sm:text-base",
                selectedOption === i && feedback === "correct"
                  ? "border-accent bg-accent/20 text-accent"
                  : selectedOption === i && feedback === "incorrect"
                    ? "border-destructive bg-destructive/20"
                    : "border-border hover:border-primary bg-card",
                feedback && "cursor-default",
              )}
            >
              {option.label}
              {selectedOption === i && feedback === "correct" && (
                <div className="absolute -right-2 -top-2 rounded-full bg-accent p-1">
                  <Check className="size-4 text-accent-foreground" />
                </div>
              )}
              {selectedOption === i && feedback === "incorrect" && (
                <div className="absolute -right-2 -top-2 rounded-full bg-destructive p-1">
                  <X className="size-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Hands-on slider challenge */}
      {question.type === "hands_on" && (
        <div className="flex flex-col gap-4">
          {Object.entries(question.targetSliderValues).map(([key]) => (
            <LevelSlider
              key={key}
              id={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              min={0}
              max={255}
              value={sliderValues[key] ?? 128}
              color={RGB_SLIDER_COLORS[key]}
              onChange={(id, val) => setSliderValues((prev) => ({ ...prev, [id]: val }))}
            />
          ))}
          {!feedback && (
            <Button
              onClick={handleSliderSubmit}
              className="font-heading rounded-full text-base font-bold"
            >
              Check my answer
            </Button>
          )}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="animate-pop-in flex flex-col items-center gap-3">
          <SpeechBubble
            text={
              feedback === "correct"
                ? "You did it! Great job! 🎉"
                : "Hmm, not quite. Try again! 💪"
            }
          />
          <Button
            onClick={handleNext}
            className="font-heading rounded-full px-6 font-bold"
          >
            {currentQ < questions.length - 1 ? (
              <>
                Next question <ArrowRight className="size-4" />
              </>
            ) : (
              <>
                See Results <Check className="size-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
