"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Sparkles, Check, ChevronRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MinuAvatar } from "@/components/minu-avatar"
import { SpeechBubble } from "@/components/speech-bubble"
import { LevelQuiz } from "@/components/level-quiz"
import { playClick, playTick } from "@/lib/audio"
import type { LevelActivityProps, QuizQuestion } from "@/lib/level-data"
import type { MinuPose } from "@/lib/minu-config"
import { cn } from "@/lib/utils"

// ─── Category Data ───────────────────────────────────────

type Category = {
  id: string
  label: string
  emoji: string
  color: string
}

const CATEGORIES: Category[] = [
  { id: "animal", label: "Animal", emoji: "🐱", color: "#a855f7" },
  { id: "vehicle", label: "Vehicle", emoji: "🚗", color: "#3b82f6" },
  { id: "food", label: "Food", emoji: "🍕", color: "#f97316" },
  { id: "space", label: "Space", emoji: "🚀", color: "#6366f1" },
  { id: "nature", label: "Nature", emoji: "🌿", color: "#22c55e" },
]

// ─── Analysis Step Data ──────────────────────────────────

type AnalysisStep = {
  id: string
  levelConcept: string
  icon: string
  title: string
  description: string
  minuReaction: string
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: "brightness",
    levelConcept: "Level 1: Numbers to Brightness",
    icon: "☀️",
    title: "Brightness Analysis",
    description: "Measuring how bright or dark the image is",
    minuReaction: "I see the brightness numbers!",
  },
  {
    id: "color",
    levelConcept: "Level 2: Brightness in Color",
    icon: "🎨",
    title: "Color Analysis",
    description: "Finding the dominant colors in the image",
    minuReaction: "I can see the colors now!",
  },
  {
    id: "edges",
    levelConcept: "Level 3: Edge Detection",
    icon: "📐",
    title: "Edge Analysis",
    description: "Detecting outlines and boundaries",
    minuReaction: "I found all the edges!",
  },
  {
    id: "features",
    levelConcept: "Level 4: Feature Recognition",
    icon: "🔍",
    title: "Feature Analysis",
    description: "Identifying shapes and regions",
    minuReaction: "I can see the shapes!",
  },
]

// ─── Image Data ──────────────────────────────────────────

type ImageEntry = {
  id: string
  label: string
  correctCategoryId: string
  placeholder: { emoji: string; bgColor: string }
  src?: string
  analysis: {
    brightness: { avg: number; label: string }
    color: { dominant: string; label: string }
    edges: { density: string; label: string }
    features: { shapes: string; label: string }
  }
}

const IMAGES: ImageEntry[] = [
  {
    id: "cat",
    label: "A cute cat",
    correctCategoryId: "animal",
    placeholder: { emoji: "🐱", bgColor: "#7c3aed" },
    analysis: {
      brightness: { avg: 140, label: "Medium brightness — soft fur tones" },
      color: { dominant: "Orange & White", label: "Warm orange and white patches" },
      edges: { density: "Many curves", label: "Curved edges — round face, ears" },
      features: { shapes: "Round face, triangular ears", label: "2 main regions: face + body" },
    },
  },
  {
    id: "dog",
    label: "A friendly dog",
    correctCategoryId: "animal",
    placeholder: { emoji: "🐶", bgColor: "#92400e" },
    analysis: {
      brightness: { avg: 130, label: "Medium brightness — warm brown fur" },
      color: { dominant: "Brown & Tan", label: "Rich brown coat with tan highlights" },
      edges: { density: "Rounded shapes", label: "Soft curved edges — floppy ears" },
      features: { shapes: "Oval face, long snout", label: "3 regions: head, body, legs" },
    },
  },
  {
    id: "car",
    label: "A red car",
    correctCategoryId: "vehicle",
    placeholder: { emoji: "🚗", bgColor: "#2563eb" },
    analysis: {
      brightness: { avg: 120, label: "Medium brightness — metallic surface" },
      color: { dominant: "Red & Black", label: "Bright red body, black tires" },
      edges: { density: "Straight lines", label: "Sharp straight edges — doors, windows" },
      features: { shapes: "Rectangular body, circular wheels", label: "3 regions: body, wheels, windows" },
    },
  },
  {
    id: "bicycle",
    label: "A bicycle",
    correctCategoryId: "vehicle",
    placeholder: { emoji: "🚲", bgColor: "#0891b2" },
    analysis: {
      brightness: { avg: 110, label: "Medium — metallic frame reflects light" },
      color: { dominant: "Silver & Black", label: "Chrome frame, black rubber tires" },
      edges: { density: "Thin circles", label: "Circular wheels, thin frame tubes" },
      features: { shapes: "Two circles, triangular frame", label: "4 regions: wheels, frame, seat, handlebars" },
    },
  },
  {
    id: "pizza",
    label: "A slice of pizza",
    correctCategoryId: "food",
    placeholder: { emoji: "🍕", bgColor: "#ea580c" },
    analysis: {
      brightness: { avg: 160, label: "Bright — golden cheese reflects light" },
      color: { dominant: "Yellow & Red", label: "Golden cheese, red sauce" },
      edges: { density: "Triangle shape", label: "Triangular outline with bumpy edges" },
      features: { shapes: "Triangle with circles", label: "3 regions: crust, cheese, toppings" },
    },
  },
  {
    id: "apple",
    label: "A red apple",
    correctCategoryId: "food",
    placeholder: { emoji: "🍎", bgColor: "#dc2626" },
    analysis: {
      brightness: { avg: 155, label: "Bright — glossy skin reflects light" },
      color: { dominant: "Red & Green", label: "Vibrant red with green leaf" },
      edges: { density: "Smooth curves", label: "Round outline with slight dimple at top" },
      features: { shapes: "Circle with small stem", label: "2 regions: apple body + leaf" },
    },
  },
  {
    id: "rocket",
    label: "A rocket ship",
    correctCategoryId: "space",
    placeholder: { emoji: "🚀", bgColor: "#4f46e5" },
    analysis: {
      brightness: { avg: 90, label: "Dark background — space!" },
      color: { dominant: "Black & Silver", label: "Dark space, metallic rocket" },
      edges: { density: "Pointed shape", label: "Sharp pointed edges — nose cone" },
      features: { shapes: "Cylinder with fins", label: "2 regions: rocket + stars" },
    },
  },
  {
    id: "planet",
    label: "A ringed planet",
    correctCategoryId: "space",
    placeholder: { emoji: "🪐", bgColor: "#7c3aed" },
    analysis: {
      brightness: { avg: 80, label: "Dim — distant in space" },
      color: { dominant: "Gold & Brown", label: "Warm gold rings, brown body" },
      edges: { density: "Elliptical ring", label: "Oval ring around circular body" },
      features: { shapes: "Circle with ellipse", label: "3 regions: planet, ring, background" },
    },
  },
  {
    id: "flower",
    label: "A pretty flower",
    correctCategoryId: "nature",
    placeholder: { emoji: "🌺", bgColor: "#16a34a" },
    analysis: {
      brightness: { avg: 150, label: "Bright — colorful petals" },
      color: { dominant: "Pink & Green", label: "Pink petals, green stem" },
      edges: { density: "Soft curves", label: "Gentle curved edges — petals" },
      features: { shapes: "Circular petals, thin stem", label: "3 regions: petals, center, stem" },
    },
  },
  {
    id: "tree",
    label: "A tall tree",
    correctCategoryId: "nature",
    placeholder: { emoji: "🌳", bgColor: "#15803d" },
    analysis: {
      brightness: { avg: 120, label: "Medium — dappled sunlight through leaves" },
      color: { dominant: "Green & Brown", label: "Deep green canopy, brown trunk" },
      edges: { density: "Irregular canopy", label: "Jagged leaf edges, straight trunk" },
      features: { shapes: "Wide crown, thin trunk", label: "3 regions: canopy, trunk, ground" },
    },
  },
  {
    id: "star",
    label: "A shining star",
    correctCategoryId: "space",
    placeholder: { emoji: "⭐", bgColor: "#1e3a5f" },
    analysis: {
      brightness: { avg: 200, label: "Very bright — glowing light source" },
      color: { dominant: "White & Yellow", label: "Brilliant white center, yellow rays" },
      edges: { density: "Pointed rays", label: "Sharp triangular points radiating outward" },
      features: { shapes: "Five-pointed star shape", label: "2 regions: star + dark background" },
    },
  },
  {
    id: "sandwich",
    label: "A delicious sandwich",
    correctCategoryId: "food",
    placeholder: { emoji: "🥪", bgColor: "#a16207" },
    analysis: {
      brightness: { avg: 145, label: "Medium — varied fillings" },
      color: { dominant: "Tan & Green", label: "Golden bread, green lettuce" },
      edges: { density: "Layered lines", label: "Horizontal layered edges — stacked fillings" },
      features: { shapes: "Rectangular layers", label: "4 regions: top bread, fillings, bottom bread" },
    },
  },
]

// ─── Threshold ───────────────────────────────────────────

const CORRECT_THRESHOLD_PERCENT = 80
const QUIZ_PASS_PERCENT = 80
const MIN_QUIZ_QUESTIONS = 5

// ─── Shuffle helper ──────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ─── Quiz Question Generation ────────────────────────────

/** Pool of all possible quiz questions we can pick from */
const QUIZ_QUESTION_POOL: QuizQuestion[] = [
  {
    type: "visual_choice",
    question: "Which analysis helped identify the curved edges and round shapes?",
    options: [
      { imageSrc: "/placeholder.svg", label: "☀️ Brightness", correct: false },
      { imageSrc: "/placeholder.svg", label: "🎨 Color", correct: false },
      { imageSrc: "/placeholder.svg", label: "📐 Edges", correct: true },
      { imageSrc: "/placeholder.svg", label: "🔍 Features", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "What does brightness analysis measure?",
    options: [
      { imageSrc: "/placeholder.svg", label: "How bright/dark pixels are", correct: true },
      { imageSrc: "/placeholder.svg", label: "What color things are", correct: false },
      { imageSrc: "/placeholder.svg", label: "Where edges are", correct: false },
      { imageSrc: "/placeholder.svg", label: "What shapes exist", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Which level taught Minu about Red, Green, and Blue?",
    options: [
      { imageSrc: "/placeholder.svg", label: "Level 1", correct: false },
      { imageSrc: "/placeholder.svg", label: "Level 2", correct: true },
      { imageSrc: "/placeholder.svg", label: "Level 3", correct: false },
      { imageSrc: "/placeholder.svg", label: "Level 4", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Feature recognition groups similar pixels into...",
    options: [
      { imageSrc: "/placeholder.svg", label: "Colors", correct: false },
      { imageSrc: "/placeholder.svg", label: "Numbers", correct: false },
      { imageSrc: "/placeholder.svg", label: "Regions", correct: true },
      { imageSrc: "/placeholder.svg", label: "Lines", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Edge detection looks for places where...",
    options: [
      { imageSrc: "/placeholder.svg", label: "Colors change quickly", correct: true },
      { imageSrc: "/placeholder.svg", label: "Pixels are very bright", correct: false },
      { imageSrc: "/placeholder.svg", label: "Regions are large", correct: false },
      { imageSrc: "/placeholder.svg", label: "Shapes are round", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "What does image classification use all four analysis steps for?",
    options: [
      { imageSrc: "/placeholder.svg", label: "Sorting and labeling pictures", correct: true },
      { imageSrc: "/placeholder.svg", label: "Making pictures brighter", correct: false },
      { imageSrc: "/placeholder.svg", label: "Drawing new pictures", correct: false },
      { imageSrc: "/placeholder.svg", label: "Changing picture colors", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Computers store light as numbers from...",
    options: [
      { imageSrc: "/placeholder.svg", label: "0 to 100", correct: false },
      { imageSrc: "/placeholder.svg", label: "0 to 255", correct: true },
      { imageSrc: "/placeholder.svg", label: "1 to 10", correct: false },
      { imageSrc: "/placeholder.svg", label: "0 to 500", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Every color on a screen is made by mixing...",
    options: [
      { imageSrc: "/placeholder.svg", label: "Red, Green, Blue", correct: true },
      { imageSrc: "/placeholder.svg", label: "Yellow, Pink, Blue", correct: false },
      { imageSrc: "/placeholder.svg", label: "Black, White, Gray", correct: false },
      { imageSrc: "/placeholder.svg", label: "Red, Yellow, Blue", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Which analysis step finds outlines and boundaries?",
    options: [
      { imageSrc: "/placeholder.svg", label: "Brightness", correct: false },
      { imageSrc: "/placeholder.svg", label: "Color", correct: false },
      { imageSrc: "/placeholder.svg", label: "Edge Detection", correct: true },
      { imageSrc: "/placeholder.svg", label: "Feature Recognition", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Minu's magic glasses need all these steps to...",
    options: [
      { imageSrc: "/placeholder.svg", label: "See and understand pictures", correct: true },
      { imageSrc: "/placeholder.svg", label: "Take new photographs", correct: false },
      { imageSrc: "/placeholder.svg", label: "Draw cartoons", correct: false },
      { imageSrc: "/placeholder.svg", label: "Record videos", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "What happens when brightness is set to 0?",
    options: [
      { imageSrc: "/placeholder.svg", label: "The image is completely black", correct: true },
      { imageSrc: "/placeholder.svg", label: "The image is very bright", correct: false },
      { imageSrc: "/placeholder.svg", label: "The image turns colorful", correct: false },
      { imageSrc: "/placeholder.svg", label: "Nothing changes", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "What does the color 'white' look like in RGB?",
    options: [
      { imageSrc: "/placeholder.svg", label: "R:0 G:0 B:0", correct: false },
      { imageSrc: "/placeholder.svg", label: "R:255 G:255 B:255", correct: true },
      { imageSrc: "/placeholder.svg", label: "R:128 G:128 B:128", correct: false },
      { imageSrc: "/placeholder.svg", label: "R:255 G:0 B:0", correct: false },
    ],
  },
]

/**
 * Generate a set of dynamic quiz questions for each attempt.
 * Picks random questions from the pool, ensuring variety.
 */
function generateQuizQuestions(
  classificationResults: { imageId: string; correct: boolean; label: string; categoryId: string }[],
): QuizQuestion[] {
  // Always start with a classification question from the images they just worked on
  const shuffledImages = shuffleArray(classificationResults).slice(0, 2)
  const classificationQuestions: QuizQuestion[] = shuffledImages.map((img) => {
    const correctCat = CATEGORIES.find((c) => c.id === img.categoryId)!
    const wrongCats = shuffleArray(CATEGORIES.filter((c) => c.id !== img.categoryId)).slice(0, 2)
    const options = shuffleArray([
      { imageSrc: "/placeholder.svg", label: `${correctCat.emoji} ${correctCat.label}`, correct: true },
      ...wrongCats.map((c) => ({
        imageSrc: "/placeholder.svg",
        label: `${c.emoji} ${c.label}`,
        correct: false,
      })),
    ])
    return {
      type: "visual_choice" as const,
      question: `What category does "${img.label}" belong to?`,
      options,
    }
  })

  // Pick remaining questions from the concept pool
  const remainingCount = Math.max(MIN_QUIZ_QUESTIONS - classificationQuestions.length, 0)
  const shuffledPool = shuffleArray(QUIZ_QUESTION_POOL)
  const conceptQuestions = shuffledPool.slice(0, remainingCount)

  // Shuffle everything together for variety
  return shuffleArray([...classificationQuestions, ...conceptQuestions])
}

// ─── Main Component ──────────────────────────────────────

export default function Level5ImageClassification({
  onComplete,
  onBack,
}: LevelActivityProps) {
  const [phase, setPhase] = useState<"intro" | "explore" | "threshold_result" | "quiz">("intro")
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<Record<string, boolean>>({})
  const [showClassification, setShowClassification] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [minuPose, setMinuPose] = useState<MinuPose>("pointing")
  const [minuText, setMinuText] = useState<string>(
    "All those things work together? I only see numbers!",
  )

  // Classification tracking for all images
  const [classifiedImages, setClassifiedImages] = useState<
    Record<string, { correct: boolean; categoryId: string }>
  >({})
  const [imagesViewed, setImagesViewed] = useState<Set<string>>(new Set())

  // Quiz state
  const [quizAttempts, setQuizAttempts] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])

  const currentImage = IMAGES[currentImageIdx]
  const currentStep = ANALYSIS_STEPS[currentStepIdx]

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // Mark image as viewed
  useEffect(() => {
    setImagesViewed((prev) => new Set(prev).add(currentImage.id))
  }, [currentImage.id])

  // Computed stats
  const totalClassified = Object.keys(classifiedImages).length
  const correctCount = Object.values(classifiedImages).filter((r) => r.correct).length
  const accuracyPercent = totalClassified > 0 ? Math.round((correctCount / totalClassified) * 100) : 0
  const meetsThreshold = accuracyPercent >= CORRECT_THRESHOLD_PERCENT && totalClassified >= IMAGES.length

  // ─── Step Completion ──────────────────────────────────

  const handleCompleteStep = useCallback(() => {
    playTick()

    const newResults = { ...analysisResults, [currentStep.id]: true }
    setAnalysisResults(newResults)

    setMinuPose("thinking")
    setMinuText(currentStep.minuReaction)

    if (currentStepIdx < ANALYSIS_STEPS.length - 1) {
      timeoutRef.current = setTimeout(() => {
        setCurrentStepIdx(currentStepIdx + 1)
        setMinuPose("surprised")
        setMinuText(`Now let's try ${ANALYSIS_STEPS[currentStepIdx + 1].title}!`)
      }, 1500)
    } else {
      timeoutRef.current = setTimeout(() => {
        setShowClassification(true)
        setMinuPose("clapping")
        setMinuText("I've analyzed everything! What do you think this is?")
      }, 1500)
    }
  }, [analysisResults, currentStepIdx, currentStep])

  // ─── Category Selection ──────────────────────────────

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      playTick()
      setSelectedCategory(categoryId)

      const isCorrect = categoryId === currentImage.correctCategoryId

      // Record the classification
      setClassifiedImages((prev) => ({
        ...prev,
        [currentImage.id]: { correct: isCorrect, categoryId },
      }))

      if (isCorrect) {
        setMinuPose("celebrating")
        setMinuText("Yes! You helped me classify it correctly!")
      } else {
        setMinuPose("empathetic")
        setMinuText(`Hmm, not quite. This is actually ${CATEGORIES.find((c) => c.id === currentImage.correctCategoryId)?.emoji} ${CATEGORIES.find((c) => c.id === currentImage.correctCategoryId)?.label}. Let's keep learning!`)
      }
    },
    [currentImage],
  )

  // ─── Navigation ──────────────────────────────────────

  const handleNextImage = () => {
    playClick()
    const nextIdx = (currentImageIdx + 1) % IMAGES.length
    setCurrentImageIdx(nextIdx)
    setCurrentStepIdx(0)
    setAnalysisResults({})
    setShowClassification(false)
    setSelectedCategory(null)
    setMinuPose("surprised")
    setMinuText("A new image! Let me analyze it step by step!")
  }

  const handlePrevImage = () => {
    playClick()
    const prevIdx = (currentImageIdx - 1 + IMAGES.length) % IMAGES.length
    setCurrentImageIdx(prevIdx)
    setCurrentStepIdx(0)
    setAnalysisResults({})
    setShowClassification(false)
    setSelectedCategory(null)
    setMinuPose("surprised")
    setMinuText("Going back! Let me analyze this one!")
  }

  // ─── Proceed to Threshold Check ──────────────────────

  const handleProceedToQuiz = () => {
    playClick()
    if (meetsThreshold) {
      // Generate fresh quiz questions
      const classificationList = Object.entries(classifiedImages).map(([imageId, data]) => {
        const img = IMAGES.find((i) => i.id === imageId)!
        return { imageId, correct: data.correct, label: img.label, categoryId: data.categoryId }
      })
      setQuizQuestions(generateQuizQuestions(classificationList))
      setPhase("quiz")
      setMinuPose("pointing")
      setMinuText("Time for a quiz! Let's see what you learned!")
    } else {
      setPhase("threshold_result")
      setMinuPose("empathetic")
      setMinuText("Let's try again! Practice makes perfect!")
    }
  }

  // ─── Quiz Completion Handler ──────────────────────────

  const handleQuizComplete = () => {
    setMinuPose("celebrating")
    setMinuText("You passed the quiz! Great job!")
    // Call onComplete after a delay for celebration
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  const handleQuizFail = () => {
    setQuizAttempts((prev) => prev + 1)
    setPhase("threshold_result")
    setMinuPose("empathetic")
    setMinuText("Almost! Let's practice more and try again!")
  }

  // ─── Intro Phase ─────────────────────────────────────

  if (phase === "intro") {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
        <div className="animate-pop-in flex max-w-lg flex-col items-center gap-6 text-center">
          <Sparkles className="size-12 text-accent animate-twinkle" />

          <h1 className="font-heading text-3xl font-extrabold text-foreground text-balance md:text-4xl">
            Level 5: Image Classification
          </h1>

          <p className="text-base text-muted-foreground text-pretty">
            Minu will use everything she learned — brightness, color, edges, and
            features — to classify {IMAGES.length} images step by step!
            You need to correctly identify at least {CORRECT_THRESHOLD_PERCENT}% to unlock the quiz.
          </p>

          <MinuAvatar pose="pointing" size={160} />

          <SpeechBubble
            text="I can use all four tools to understand pictures? Let's try!"
            className="mx-auto"
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                playClick()
                onBack()
              }}
              className="font-heading rounded-full px-6 font-bold"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button
              onClick={() => {
                playClick()
                setPhase("explore")
                setMinuPose("thinking")
                setMinuText("Let me start analyzing this image!")
              }}
              className="font-heading rounded-full px-8 font-bold"
            >
              Let&apos;s Go! <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // ─── Threshold Result Phase ──────────────────────────

  if (phase === "threshold_result") {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
        <div className="animate-pop-in flex max-w-lg flex-col items-center gap-6 text-center">
          {totalClassified > 0 && !meetsThreshold ? (
            <>
              <div className="text-6xl">💪</div>
              <h1 className="font-heading text-3xl font-extrabold text-foreground text-balance">
                Not Quite There Yet!
              </h1>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
                <div className="mb-2 font-heading text-sm text-muted-foreground">
                  Your Score
                </div>
                <div className="mb-4 font-heading text-4xl font-extrabold">
                  {correctCount} / {totalClassified}
                  <span className="ml-2 text-lg text-muted-foreground">
                    ({accuracyPercent}%)
                  </span>
                </div>
                <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      accuracyPercent >= CORRECT_THRESHOLD_PERCENT ? "bg-accent" : "bg-primary",
                    )}
                    style={{ width: `${Math.min(accuracyPercent, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  You need {CORRECT_THRESHOLD_PERCENT}% correct to unlock the quiz.
                </p>
              </div>
              <SpeechBubble
                text="Let's try again! Practice makes perfect! 💪"
                className="mx-auto"
              />
            </>
          ) : (
            <>
              <div className="text-6xl">🎯</div>
              <h1 className="font-heading text-3xl font-extrabold text-foreground text-balance">
                Ready for the Quiz?
              </h1>
              <div className="rounded-2xl border border-accent bg-card p-6 shadow-lg">
                <div className="mb-2 font-heading text-sm text-muted-foreground">
                  Your Score
                </div>
                <div className="mb-4 font-heading text-4xl font-extrabold text-accent">
                  {correctCount} / {totalClassified}
                  <span className="ml-2 text-lg text-muted-foreground">
                    ({accuracyPercent}%)
                  </span>
                </div>
                <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500"
                    style={{ width: `${Math.min(accuracyPercent, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-accent">
                  ✓ You met the {CORRECT_THRESHOLD_PERCENT}% threshold!
                </p>
              </div>
              <SpeechBubble
                text="Great work! Let's take the quiz now! 🎉"
                className="mx-auto"
              />
            </>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                playClick()
                setPhase("explore")
                setMinuPose("thinking")
                setMinuText("Let's analyze more images!")
              }}
              className="font-heading rounded-full px-6 font-bold"
            >
              <RotateCcw className="size-4" />            {!meetsThreshold ? "Try Again" : "Practice More"}
            </Button>
            {meetsThreshold && (
              <Button
                onClick={handleProceedToQuiz}
                className="font-heading rounded-full px-8 font-bold"
              >
                <Sparkles className="size-5" /> Take the Quiz!
              </Button>
            )}
          </div>
        </div>
      </main>
    )
  }

  // ─── Quiz Phase ──────────────────────────────────────

  if (phase === "quiz") {
    return (
      <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
        <div className="animate-pop-in flex w-full max-w-2xl flex-col items-center gap-6">
          <h2 className="font-heading text-2xl font-extrabold text-foreground">
            Quiz Time! 🎯
            {quizAttempts > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Attempt {quizAttempts + 1})
              </span>
            )}
          </h2>
          <LevelQuiz
            questions={quizQuestions}
            onComplete={handleQuizComplete}
            onBack={() => {
              playClick()
              setPhase("threshold_result")
              setMinuPose("thinking")
              setMinuText("Let's go back and practice more!")
            }}
            onFail={handleQuizFail}
          />
        </div>
      </main>
    )
  }

  // ─── Explore Phase (Main Activity) ───────────────────

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            playClick()
            onBack()
          }}
          aria-label="Go back to map"
          className="rounded-full"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="font-heading text-sm font-extrabold text-foreground md:text-base">
          Level 5: Image Classification
        </h1>
        <div className="flex items-center gap-2">
          {/* Score indicator */}
          <div className="rounded-full bg-card/80 px-3 py-1 text-xs font-bold shadow-sm border border-border">
            <span className="text-accent">{correctCount}</span>
            <span className="text-muted-foreground"> / {totalClassified}</span>
            <span className="ml-1 text-muted-foreground">({accuracyPercent}%)</span>
          </div>
          {/* Proceed button */}
          {totalClassified >= 2 && (
            <Button
              size="sm"
              onClick={handleProceedToQuiz}
              className={cn(
                "rounded-full font-heading text-xs font-bold",
                meetsThreshold
                  ? "bg-accent text-accent-foreground animate-pulse"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {meetsThreshold ? "Quiz Ready! ✓" : `Classify All to Quiz (${totalClassified}/${IMAGES.length})`}
            </Button>
          )}
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:items-start md:gap-6 md:p-6">
        {/* Left: Image + Navigation */}
        <div className="flex flex-col items-center gap-4 md:w-1/2">
          {/* Image card */}
          <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-3xl border-2 border-border bg-card shadow-xl">
            {currentImage.src ? (
              <Image
                src={currentImage.src}
                alt={currentImage.label}
                fill
                className="object-cover"
                sizes="300px"
              />
            ) : (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-2"
                style={{ backgroundColor: currentImage.placeholder.bgColor }}
              >
                <span className="text-8xl">{currentImage.placeholder.emoji}</span>
                <span className="font-heading text-lg font-bold text-white/90">
                  {currentImage.label}
                </span>
              </div>
            )}
            {/* Classification status badge */}
            {classifiedImages[currentImage.id] && (
              <div
                className={cn(
                  "absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-bold shadow-lg",
                  classifiedImages[currentImage.id].correct
                    ? "bg-accent text-accent-foreground"
                    : "bg-destructive text-white",
                )}
              >
                {classifiedImages[currentImage.id].correct ? "✓ Correct" : "✗ Try again"}
              </div>
            )}
          </div>

          {/* Image navigation */}
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="secondary"
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="rounded-full"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <span className="font-heading text-sm font-bold text-muted-foreground">
              {currentImageIdx + 1} / {IMAGES.length}
            </span>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleNextImage}
              aria-label="Next image"
              className="rounded-full"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Minu avatar + speech bubble */}
          <div className="flex flex-col items-center gap-2">
            <MinuAvatar pose={minuPose} size={100} />
            <SpeechBubble text={minuText} className="max-w-xs" />
          </div>
        </div>

        {/* Right: Analysis Pipeline + Classification */}
        <div className="flex flex-1 flex-col gap-5 md:w-1/2">
          {/* Analysis Pipeline */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-lg">
            <h2 className="font-heading mb-4 text-sm font-extrabold text-muted-foreground">
              🔬 Analysis Pipeline
            </h2>
            <div className="flex flex-col gap-3">
              {ANALYSIS_STEPS.map((step, idx) => {
                const isCompleted = analysisResults[step.id]
                const isCurrent = idx === currentStepIdx && !showClassification
                const isPending = idx > currentStepIdx || (idx === currentStepIdx && showClassification)

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl p-3 transition-all duration-300",
                      isCompleted && "bg-accent/20 border border-accent/50",
                      isCurrent && "bg-primary/10 border border-primary animate-pulse",
                      isPending && "bg-muted/50 border border-border opacity-60",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full text-lg",
                        isCompleted && "bg-accent text-accent-foreground",
                        isCurrent && "bg-primary text-primary-foreground",
                        isPending && "bg-muted text-muted-foreground",
                      )}
                    >
                      {isCompleted ? <Check className="size-5" /> : step.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-heading text-xs font-bold",
                            isCompleted ? "text-accent" : isCurrent ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {step.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ({step.levelConcept})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isCompleted
                          ? currentImage.analysis[step.id as keyof typeof currentImage.analysis].label
                          : isCurrent
                            ? step.description
                            : "Pending..."}
                      </p>
                    </div>

                    {isCurrent && (
                      <Button
                        size="sm"
                        onClick={handleCompleteStep}
                        className="rounded-full font-heading text-xs"
                      >
                        Analyze <ChevronRight className="size-3" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Classification (shown after all steps complete) */}
          {showClassification && (
            <div className="animate-pop-in rounded-3xl border border-accent bg-card p-5 shadow-lg">
              <h2 className="font-heading mb-4 text-sm font-extrabold text-accent">
                🏷️ Classification Result
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Based on the analysis, what do you think this image is?
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id
                  const isCorrect = cat.id === currentImage.correctCategoryId
                  const showResult = selectedCategory !== null

                  return (
                    <Button
                      key={cat.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleCategorySelect(cat.id)}
                      disabled={showResult}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl py-4 font-heading",
                        showResult && isCorrect && "bg-accent text-accent-foreground border-accent",
                        showResult && isSelected && !isCorrect && "bg-destructive/20 text-destructive border-destructive",
                      )}
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="text-xs font-bold">{cat.label}</span>
                      {showResult && isCorrect && (
                        <span className="text-[10px]">✓ Correct!</span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Next image / Proceed buttons */}
          {showClassification && selectedCategory && (
            <div className="animate-pop-in flex flex-col gap-3">
              <Button
                onClick={handleNextImage}
                variant="outline"
                className="font-heading w-full rounded-full py-4 text-base font-bold"
              >
                Next Image <ArrowRight className="size-4" />
              </Button>
              {totalClassified >= 2 && (
                <Button
                  onClick={handleProceedToQuiz}
                  className={cn(
                    "font-heading w-full rounded-full py-6 text-lg font-extrabold",
                    meetsThreshold && "bg-accent text-accent-foreground",
                  )}
                >
                  <Sparkles className="size-5" />
                  {meetsThreshold
                    ? "Quiz Ready! Take the Quiz!"
                    : `${CORRECT_THRESHOLD_PERCENT}% to Unlock Quiz (${accuracyPercent}%)`}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
