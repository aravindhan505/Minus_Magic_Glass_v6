import type { QuizQuestion } from "@/lib/level-data"

export const L4_IMAGES = "/images/level4"

export const LEVEL4_FEATURE_OPTIONS = ["Shape", "Color", "Texture"] as const
export type Level4Feature = (typeof LEVEL4_FEATURE_OPTIONS)[number]

export type Level4CompareRound = {
  id: string
  image: string
  label: string
  correct: Level4Feature
  /** Shown after a correct pick — teaches why */
  explain: string
}

/**
 * Five comparison rounds — each answer type (Shape / Color / Texture) appears.
 * Images from friend's reference pack; answers reviewed against actual assets.
 */
export const LEVEL4_ROUNDS: Level4CompareRound[] = [
  {
    id: "apple-tomato",
    image: `${L4_IMAGES}/apple-vs-tomato.png`,
    label: "Apple vs Tomato",
    correct: "Shape",
    explain: "Both are red and roundish, but their outlines are different shapes!",
  },
  {
    id: "orange-tennis",
    image: `${L4_IMAGES}/orange-vs-tennis-ball.png`,
    label: "Orange vs Tennis Ball",
    correct: "Color",
    explain: "Both are ball-shaped, but one is bright orange and the other is yellow-green!",
  },
  {
    id: "coconut-basketball",
    image: `${L4_IMAGES}/coconut-vs-basketball.png`,
    label: "Coconut vs Basketball",
    correct: "Texture",
    explain: "The coconut is hairy and rough — the basketball is smooth!",
  },
  {
    id: "dolphin",
    image: `${L4_IMAGES}/dolphin.png`,
    label: "Real Dolphin vs Plush Dolphin",
    correct: "Texture",
    explain: "Same shape, but one is smooth and shiny and one is soft and fuzzy!",
  },
  {
    id: "football-golf",
    image: `${L4_IMAGES}/football-vs-golf.png`,
    label: "Football vs Golf Ball",
    correct: "Texture",
    explain: "Both are white balls, but the surfaces feel different — panels vs dimples!",
  },
]

export const LEVEL4_QUIZ_PASS_PERCENT = 67

/** Visual quiz — matches activity categories (Shape / Color / Texture). */
export const LEVEL4_QUIZ: QuizQuestion[] = [
  {
    type: "visual_choice",
    question: "Tap the pair that differ mainly by SHAPE.",
    options: [
      { imageSrc: `${L4_IMAGES}/apple-vs-tomato.png`, label: "Apple vs Tomato", correct: true },
      { imageSrc: `${L4_IMAGES}/orange-vs-tennis-ball.png`, label: "Orange vs Tennis Ball", correct: false },
      { imageSrc: `${L4_IMAGES}/coconut-vs-basketball.png`, label: "Coconut vs Basketball", correct: false },
      { imageSrc: `${L4_IMAGES}/dolphin.png`, label: "Dolphin", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Tap the pair that differ mainly by COLOR.",
    options: [
      { imageSrc: `${L4_IMAGES}/apple-vs-tomato.png`, label: "Apple vs Tomato", correct: false },
      { imageSrc: `${L4_IMAGES}/orange-vs-tennis-ball.png`, label: "Orange vs Tennis Ball", correct: true },
      { imageSrc: `${L4_IMAGES}/football-vs-golf.png`, label: "Football vs Golf", correct: false },
      { imageSrc: `${L4_IMAGES}/coconut-vs-basketball.png`, label: "Coconut vs Basketball", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Tap the pair that differ mainly by TEXTURE.",
    options: [
      { imageSrc: `${L4_IMAGES}/dolphin.png`, label: "Dolphin", correct: true },
      { imageSrc: `${L4_IMAGES}/apple-vs-tomato.png`, label: "Apple vs Tomato", correct: false },
      { imageSrc: `${L4_IMAGES}/orange-vs-tennis-ball.png`, label: "Orange vs Tennis Ball", correct: false },
      { imageSrc: `${L4_IMAGES}/football-vs-golf.png`, label: "Football vs Golf", correct: false },
    ],
  },
]