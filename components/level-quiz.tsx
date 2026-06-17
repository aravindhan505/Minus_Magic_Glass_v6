"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, X, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LevelSlider } from "@/components/ui/slider"
import { SpeechBubble } from "@/components/speech-bubble"
import { playClick, playFanfare, playError, playNarratorFile } from "@/lib/audio"
import type { QuizQuestion } from "@/lib/level-data"
import { cn } from "@/lib/utils"

const QUIZ_PASS_PERCENT = 80

type LevelQuizProps = {
  questions: QuizQuestion[]
  /** Called when the quiz is passed (>= threshold correct) */
  onComplete: () => void
  /** Called to go back without completing */
  onBack: () => void
  /** Called when the quiz is failed (< threshold correct) */
  onFail: () => void
}

/**
 * End-of-level quiz component.
 * Supports visual multiple choice and hands-on slider challenges.
 * Tracks score and only calls onComplete when the pass threshold is met.
 */
export function LevelQuiz({ questions, onComplete, onBack, onFail }: LevelQuizProps) {
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({})
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [allDone, setAllDone] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const question = questions[currentQ]
  const passPercent = Math.round((correctAnswers / questions.length) * 100)
  const passed = passPercent >= QUIZ_PASS_PERCENT

  const handleVisualChoice = (optionIndex: number) => {
    if (feedback) return

    setSelectedOption(optionIndex)
    const isCorrect = question.type === "visual_choice" && question.options[optionIndex].correct

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
          <SpeechBubble text="You did it! Great job! Minu's glasses are calibrated! 🌟" />
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
            You need {QUIZ_PASS_PERCENT}% to pass. Try again!
          </p>
        </div>
        <SpeechBubble text="Don't give up! Let's try the quiz again! 💪" />
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onBack}
            className="font-heading rounded-full px-6 font-bold"
          >
            <ArrowRight className="size-4 rotate-180" /> Practice More
          </Button>
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
    <div className="animate-pop-in flex w-full max-w-lg flex-col gap-6 rounded-3xl border border-border bg-card p-6">
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

      <p className="font-heading text-lg font-extrabold text-foreground text-balance">
        {question.question}
      </p>

      {/* Visual choice options */}
      {question.type === "visual_choice" && (
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleVisualChoice(i)}
              disabled={!!feedback}
              className={cn(
                "group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all",
                selectedOption === i && feedback === "correct"
                  ? "border-accent bg-accent/20"
                  : selectedOption === i && feedback === "incorrect"
                    ? "border-destructive bg-destructive/20"
                    : "border-border hover:border-primary bg-card",
                feedback && "cursor-default",
              )}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={option.imageSrc}
                  alt={option.label}
                  fill
                  className="object-cover"
                  sizes="200px"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                  }}
                />
              </div>
              <span className="font-heading text-sm font-bold text-foreground">
                {option.label}
              </span>
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
