// =============================================================
// Level Data — shared types & configurations for all 5 modules.
// Each module builder imports these types and exports a LevelModule.
// =============================================================

import type { MinuPose } from "./minu-config"

// ─── Slider Configuration ─────────────────────────────────────

export type SliderConfig = {
  /** Unique identifier, e.g. "brightness", "r", "g", "b" */
  id: string
  /** Kid-friendly label displayed next to the slider */
  label: string
  /** Minimum value */
  min: number
  /** Maximum value */
  max: number
  /** Starting value when the level loads */
  defaultValue: number
  /** CSS color for the slider track (e.g. "#ff0000" for red) */
  color: string
}

// ─── Minu Reaction ────────────────────────────────────────────

export type ReactionTrigger =
  | "slider_extreme_min"
  | "slider_extreme_max"
  | "pixel_tap"
  | "slider_change"
  | "idle"

export type MinuReaction = {
  trigger: ReactionTrigger
  /** Which slider triggers this (optional — if omitted, applies to all sliders) */
  sliderId?: string
  pose: MinuPose
  /** Speech bubble text. Supports {value} template for dynamic values. */
  text?: string
}

// ─── Quiz Questions ───────────────────────────────────────────

export type VisualChoiceTransform = "rotate90" | "flipH" | "invert" | "tilt"

export type VisualChoiceOption = {
  imageSrc: string
  /** Second figure for side-by-side pair options (Level 4) */
  imageSrcRight?: string
  label: string
  correct: boolean
  /** CSS transform preview for CV transformation quiz items */
  transform?: VisualChoiceTransform
}

export type TextChoiceOption = {
  label: string
  correct: boolean
}

export type QuizQuestion =
  | {
      type: "visual_choice"
      question: string
      options: VisualChoiceOption[]
    }
  | {
      type: "text_choice"
      question: string
      options: TextChoiceOption[]
    }
  | {
      type: "hands_on"
      question: string
      targetSliderValues: Record<string, number>
      /** How close each slider must be to the target (default: 20) */
      tolerance?: number
    }

// ─── Level Configuration ──────────────────────────────────────

export type LevelConfig = {
  id: number
  slug: string
  title: string
  subtitle: string
  description: string
  color: string
  icon: string

  /** Primary image path (e.g. "/images/level1-bright.png") */
  imageSrc: string
  /** Reference/comparison image for split view (optional) */
  referenceSrc?: string

  /** Sliders available in this level */
  sliders: SliderConfig[]
  /** Enable pixel inspector (tap to see pixel values) */
  pixelInspectorEnabled: boolean
  /** Enable split view (before/after comparison) */
  splitViewEnabled: boolean

  /** Minu reactions to user actions */
  minuReactions: MinuReaction[]
  /** Quiz questions shown at the end of the level */
  quiz: QuizQuestion[]

  /** TTS line when the level starts */
  introLine: string
  /** TTS line when the level is completed */
  completionLine: string
}

// ─── Level Module Interface ───────────────────────────────────

export type LevelActivityProps = {
  /** Called when the level is completed (quiz passed) */
  onComplete: () => void
  /** Called to go back to the map */
  onBack: () => void
}

export type LevelModule = {
  /** The level ID (1-5) */
  levelId: number
  /** The level configuration */
  config: LevelConfig
  /** The React component that renders the level activity */
  component: React.FC<LevelActivityProps>
}

// ─── Default Level Configs ────────────────────────────────────

export const defaultLevelConfigs: LevelConfig[] = [
  {
    id: 1,
    slug: "pixel-to-colors",
    title: "Pixel to Colors",
    subtitle: "Level 1",
    description: "Teach Minu how computers store light as numbers.",
    color: "var(--chart-2)",
    icon: "Sun",
    imageSrc: "/images/level1-bright.png",
    referenceSrc: "/images/level1-dark.png",
    sliders: [
      {
        id: "brightness",
        label: "Brightness",
        min: 0,
        max: 255,
        defaultValue: 128,
        color: "#e0e0e0",
      },
    ],
    pixelInspectorEnabled: true,
    splitViewEnabled: true,
    minuReactions: [
      {
        trigger: "slider_extreme_min",
        sliderId: "brightness",
        pose: "empathetic",
        text: "It's so dark! I can barely see!",
      },
      {
        trigger: "slider_extreme_max",
        sliderId: "brightness",
        pose: "surprised",
        text: "Whoa! That's so bright!",
      },
      {
        trigger: "pixel_tap",
        pose: "holdingLens",
        text: "This pixel's value is {value}!",
      },
      {
        trigger: "slider_change",
        pose: "thinking",
      },
    ],
    quiz: [
      {
        type: "visual_choice",
        question: "Which image is brighter?",
        options: [
          { imageSrc: "/images/quiz/q1-bright.png", label: "Bright", correct: true },
          { imageSrc: "/images/quiz/q1-dark.png", label: "Dark", correct: false },
        ],
      },
      {
        type: "hands_on",
        question: "Can you make this dark image look like this bright one?",
        targetSliderValues: { brightness: 220 },
        tolerance: 30,
      },
    ],
    introLine:
      "Hi friend! Today we're learning about brightness. Computers store light as numbers from 0 to 255!",
    completionLine:
      "Amazing! You calibrated brightness! Now I can see numbers everywhere!",
  },
  {
    id: 2,
    slug: "color-potion-time",
    title: "Color Potion Time!",
    subtitle: "Level 2",
    description: "Red, Green and Blue make every colour Minu sees.",
    color: "var(--chart-1)",
    icon: "Palette",
    imageSrc: "/images/level2-colorful.png",
    referenceSrc: "/images/level2-grid.png",
    sliders: [
      { id: "r", label: "Red", min: 0, max: 255, defaultValue: 128, color: "#ff4444" },
      { id: "g", label: "Green", min: 0, max: 255, defaultValue: 128, color: "#44ff44" },
      { id: "b", label: "Blue", min: 0, max: 255, defaultValue: 128, color: "#4444ff" },
    ],
    pixelInspectorEnabled: true,
    splitViewEnabled: true,
    minuReactions: [
      {
        trigger: "slider_extreme_max",
        sliderId: "r",
        pose: "surprised",
        text: "Whoa! So much red!",
      },
      {
        trigger: "slider_extreme_max",
        sliderId: "g",
        pose: "surprised",
        text: "Everything is green!",
      },
      {
        trigger: "slider_extreme_max",
        sliderId: "b",
        pose: "surprised",
        text: "So much blue!",
      },
      {
        trigger: "pixel_tap",
        pose: "holdingLens",
        text: "R:{r} G:{g} B:{b}",
      },
      {
        trigger: "slider_change",
        pose: "thinking",
      },
    ],
    quiz: [
      {
        type: "visual_choice",
        question: "Which slider makes the image more red?",
        options: [
          { imageSrc: "/images/quiz/q2-red.png", label: "Red slider", correct: true },
          { imageSrc: "/images/quiz/q2-green.png", label: "Green slider", correct: false },
          { imageSrc: "/images/quiz/q2-blue.png", label: "Blue slider", correct: false },
        ],
      },
      {
        type: "hands_on",
        question: "Mix the right colors to make this image look like the original!",
        targetSliderValues: { r: 200, g: 150, b: 100 },
        tolerance: 30,
      },
    ],
    introLine:
      "Hi friend! Every color is made of Red, Green, and Blue. Let's mix them together!",
    completionLine:
      "Amazing! You calibrated color! Now I can see all the colors!",
  },
  {
    id: 3,
    slug: "edge-detection",
    title: "Edge Detection",
    subtitle: "Level 3",
    description: "Help Minu find the outlines hiding in a picture.",
    color: "var(--chart-3)",
    icon: "Scan",
    imageSrc: "/images/level3-cartoon.png",
    referenceSrc: "/images/level3-edges.png",
    sliders: [
      {
        id: "threshold",
        label: "Sensitivity",
        min: 10,
        max: 100,
        defaultValue: 50,
        color: "var(--chart-3)",
      },
      {
        id: "brightness",
        label: "Edge Brightness",
        min: 0,
        max: 255,
        defaultValue: 128,
        color: "#e0e0e0",
      },
    ],
    pixelInspectorEnabled: true,
    splitViewEnabled: true,
    minuReactions: [
      {
        trigger: "slider_extreme_max",
        sliderId: "threshold",
        pose: "empathetic",
        text: "Where did all the edges go?",
      },
      {
        trigger: "slider_extreme_min",
        sliderId: "threshold",
        pose: "surprised",
        text: "Wow, so many edges!",
      },
      {
        trigger: "pixel_tap",
        pose: "holdingLens",
        text: "Edge found!",
      },
      {
        trigger: "slider_change",
        pose: "thinking",
      },
    ],
    quiz: [
      {
        type: "visual_choice",
        question: "Which of these is an edge-detected image?",
        options: [
          { imageSrc: "/images/quiz/q3-edges.png", label: "Edges", correct: true },
          { imageSrc: "/images/quiz/q3-original.png", label: "Original", correct: false },
        ],
      },
      {
        type: "hands_on",
        question: "Adjust the slider to find the most edges in this picture!",
        targetSliderValues: { threshold: 25 },
        tolerance: 15,
      },
    ],
    introLine:
      "Hi friend! Computers find edges by looking for places where colors change quickly!",
    completionLine:
      "Amazing! You calibrated edge detection! Now I can see all the outlines!",
  },
  {
    id: 4,
    slug: "feature-recognition",
    title: "Feature Recognition",
    subtitle: "Level 4",
    description: "Spot shapes and regions so Minu knows what's what.",
    color: "var(--chart-4)",
    icon: "Shapes",
    imageSrc: "/images/level4-shapes.png",
    referenceSrc: "/images/level4-regions.png",
    sliders: [
      {
        id: "regions",
        label: "Region Size",
        min: 2,
        max: 20,
        defaultValue: 8,
        color: "var(--chart-4)",
      },
      {
        id: "similarity",
        label: "Color Similarity",
        min: 10,
        max: 100,
        defaultValue: 50,
        color: "var(--chart-5)",
      },
    ],
    pixelInspectorEnabled: true,
    splitViewEnabled: true,
    minuReactions: [
      {
        trigger: "slider_extreme_max",
        sliderId: "regions",
        pose: "surprised",
        text: "Wow, so many pieces!",
      },
      {
        trigger: "slider_extreme_min",
        sliderId: "regions",
        pose: "thinking",
        text: "Everything is grouped together!",
      },
      {
        trigger: "pixel_tap",
        pose: "holdingLens",
        text: "This region is a {color} area!",
      },
      {
        trigger: "slider_change",
        pose: "thinking",
      },
    ],
    quiz: [
      {
        type: "visual_choice",
        question: "How many regions can you see?",
        options: [
          { imageSrc: "/images/quiz/q4-3regions.png", label: "3 regions", correct: true },
          { imageSrc: "/images/quiz/q4-many.png", label: "Many", correct: false },
          { imageSrc: "/images/quiz/q4-1region.png", label: "1 region", correct: false },
        ],
      },
      {
        type: "hands_on",
        question: "Adjust the slider to split this image into exactly 3 regions!",
        targetSliderValues: { regions: 3 },
        tolerance: 1,
      },
    ],
    introLine:
      "Hi friend! Computers group similar pixels into regions. Let's see how many we can find!",
    completionLine:
      "Amazing! You calibrated feature recognition! Now I can see shapes and regions!",
  },
  {
    id: 5,
    slug: "object-detection",
    title: "Object Detection",
    subtitle: "Level 5",
    description: "Teach Minu to spot and name objects in pictures.",
    color: "var(--chart-5)",
    icon: "Sparkles",
    imageSrc: "/images/level5/characters/black_cat.png",
    referenceSrc: "/images/level5/characters/red_rocket.png",
    sliders: [],
    pixelInspectorEnabled: false,
    splitViewEnabled: false,
    minuReactions: [
      { trigger: "slider_change", pose: "thinking" },
    ],
    quiz: [],
    introLine:
      "Find every picture that matches the reference — even if it's flipped or a different colour!",
    completionLine:
      "You did it! My magic glasses are fully calibrated! Now I can see the world!",
  },
]
