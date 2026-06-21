import type { QuizQuestion } from "@/lib/level-data"

export const L4_IMAGES = "/images/level4"
export const L4_SINGLES = `${L4_IMAGES}/singles`

export const LEVEL4_FEATURE_OPTIONS = ["Shape", "Color", "Texture"] as const
export type Level4Feature = (typeof LEVEL4_FEATURE_OPTIONS)[number]

export type Level4CompareRound = {
  id: string
  leftImage: string
  rightImage: string
  label: string
  /** Features that BOTH figures share — kid must select exactly this set */
  matchingFeatures: Level4Feature[]
  /** Shown after a correct check */
  explain: string
}

function pairImages(slug: string): Pick<Level4CompareRound, "leftImage" | "rightImage"> {
  return {
    leftImage: `${L4_SINGLES}/pair-${slug}-left.png`,
    rightImage: `${L4_SINGLES}/pair-${slug}-right.png`,
  }
}

/** Full pool — each run picks LEVEL4_ROUNDS_PER_RUN at random. */
export const LEVEL4_COMPARE_POOL: Level4CompareRound[] = [
  {
    id: "star-circle-yellow",
    ...pairImages("star-circle-yellow"),
    label: "Yellow Star vs Yellow Circle",
    matchingFeatures: ["Color", "Texture"],
    explain: "Same yellow color and both feel smooth — but a star and a circle are different shapes!",
  },
  {
    id: "red-blue-balls",
    ...pairImages("red-blue-balls"),
    label: "Red Ball vs Blue Ball",
    matchingFeatures: ["Shape", "Texture"],
    explain: "Both are smooth round balls — same shape and texture, but different colors!",
  },
  {
    id: "wood-metal-cubes",
    ...pairImages("wood-metal-cubes"),
    label: "Wooden Cube vs Metal Cube",
    matchingFeatures: ["Shape"],
    explain: "Both are cubes — same shape! But the wood and metal look and feel very different.",
  },
  {
    id: "red-green-apples",
    ...pairImages("red-green-apples"),
    label: "Red Apple vs Green Apple",
    matchingFeatures: ["Shape", "Texture"],
    explain: "Same apple shape and both have smooth shiny skin — just different colors!",
  },
  {
    id: "orange-tennis-ball",
    ...pairImages("orange-tennis-ball"),
    label: "Orange vs Tennis Ball",
    matchingFeatures: ["Shape"],
    explain: "Both are round ball shapes — but the colors and surfaces are different!",
  },
  {
    id: "dolphin-real-plush",
    ...pairImages("dolphin-real-plush"),
    label: "Real Dolphin vs Plush Dolphin",
    matchingFeatures: ["Shape", "Color"],
    explain: "Same dolphin shape and gray-blue color — one is smooth, one is soft and fuzzy!",
  },
  {
    id: "rough-smooth-rocks",
    ...pairImages("rough-smooth-rocks"),
    label: "Rough Rock vs Smooth Rock",
    matchingFeatures: ["Shape", "Color"],
    explain: "Same rock shape and brown color — one is rough, one is polished smooth!",
  },
  {
    id: "twin-strawberries",
    ...pairImages("twin-strawberries"),
    label: "Twin Strawberries",
    matchingFeatures: ["Shape", "Color", "Texture"],
    explain: "Perfect twins! Same shape, same red color, and same bumpy strawberry texture!",
  },
]

export const LEVEL4_ROUNDS_PER_RUN = 5

/** @deprecated Use LEVEL4_COMPARE_POOL — kept for imports during migration */
export const LEVEL4_ROUNDS = LEVEL4_COMPARE_POOL

export const LEVEL4_QUIZ_PER_SESSION = 3

/** Pass when the kid gets at least 2 of 3 correct. */
export const LEVEL4_QUIZ_PASS_PERCENT = 67

/** Pick `count` random comparison rounds without repeats. */
export function getRandomLevel4Rounds(count = LEVEL4_ROUNDS_PER_RUN): Level4CompareRound[] {
  const pool = [...LEVEL4_COMPARE_POOL]
  const picked: Level4CompareRound[] = []
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(index, 1)[0])
  }
  return picked
}

/** True when selected features exactly match the round answer set. */
export function level4FeaturesMatch(
  selected: Iterable<Level4Feature>,
  matching: Level4Feature[],
): boolean {
  const picked = new Set(selected)
  if (picked.size !== matching.length) return false
  return matching.every((f) => picked.has(f))
}

type Level4QuizOption = {
  slug: string
  label: string
  correct: boolean
}

export type Level4QuizPoolItem = {
  id: string
  question: string
  options: Level4QuizOption[]
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function quizPair(slug: string, label: string, correct: boolean) {
  return {
    imageSrc: `${L4_SINGLES}/pair-${slug}-left.png`,
    imageSrcRight: `${L4_SINGLES}/pair-${slug}-right.png`,
    label,
    correct,
  }
}

export function level4QuizToQuestion(item: Level4QuizPoolItem): QuizQuestion {
  return {
    type: "visual_choice",
    question: item.question,
    options: shuffleArray(item.options).map((o) => quizPair(o.slug, o.label, o.correct)),
  }
}

/** Full visual quiz pool — each run picks LEVEL4_QUIZ_PER_SESSION at random. */
export const LEVEL4_QUIZ_POOL: Level4QuizPoolItem[] = [
  {
    id: "shape-same-color-diff",
    question: "Tap the pair where SHAPE is the same but COLOR is different.",
    options: [
      { slug: "red-blue-balls", label: "Red vs Blue Balls", correct: true },
      { slug: "star-circle-yellow", label: "Star vs Circle", correct: false },
      { slug: "wood-metal-cubes", label: "Wood vs Metal Cube", correct: false },
      { slug: "twin-strawberries", label: "Twin Strawberries", correct: false },
    ],
  },
  {
    id: "color-same-shape-diff",
    question: "Tap the pair where COLOR is the same but SHAPE is different.",
    options: [
      { slug: "star-circle-yellow", label: "Star vs Circle", correct: true },
      { slug: "red-green-apples", label: "Red vs Green Apple", correct: false },
      { slug: "orange-tennis-ball", label: "Orange vs Tennis", correct: false },
      { slug: "red-blue-balls", label: "Red vs Blue Balls", correct: false },
    ],
  },
  {
    id: "texture-same-shape-diff",
    question: "Tap the pair where TEXTURE is the same but SHAPE is different.",
    options: [
      { slug: "star-circle-yellow", label: "Star vs Circle", correct: true },
      { slug: "rough-smooth-rocks", label: "Rough vs Smooth Rock", correct: false },
      { slug: "dolphin-real-plush", label: "Real vs Plush Dolphin", correct: false },
      { slug: "red-green-apples", label: "Red vs Green Apple", correct: false },
    ],
  },
  {
    id: "all-three-match",
    question: "Tap the pair where shape, color, AND texture all match!",
    options: [
      { slug: "twin-strawberries", label: "Twin Strawberries", correct: true },
      { slug: "red-blue-balls", label: "Red vs Blue Balls", correct: false },
      { slug: "dolphin-real-plush", label: "Real vs Plush Dolphin", correct: false },
      { slug: "wood-metal-cubes", label: "Wood vs Metal Cube", correct: false },
    ],
  },
  {
    id: "shape-color-same-texture-diff",
    question: "Tap the pair where SHAPE and COLOR match but TEXTURE is different.",
    options: [
      { slug: "dolphin-real-plush", label: "Real vs Plush Dolphin", correct: true },
      { slug: "rough-smooth-rocks", label: "Rough vs Smooth Rock", correct: false },
      { slug: "red-green-apples", label: "Red vs Green Apple", correct: false },
      { slug: "orange-tennis-ball", label: "Orange vs Tennis", correct: false },
    ],
  },
  {
    id: "shape-texture-same-color-diff",
    question: "Tap the pair where SHAPE and TEXTURE match but COLOR is different.",
    options: [
      { slug: "red-green-apples", label: "Red vs Green Apple", correct: true },
      { slug: "red-blue-balls", label: "Red vs Blue Balls", correct: false },
      { slug: "star-circle-yellow", label: "Star vs Circle", correct: false },
      { slug: "twin-strawberries", label: "Twin Strawberries", correct: false },
    ],
  },
]

/** @deprecated Use getRandomLevel4Quiz() — kept for static references */
export const LEVEL4_QUIZ: QuizQuestion[] = LEVEL4_QUIZ_POOL.map(level4QuizToQuestion)

/** Pick `count` random quiz pool items without repeats. */
export function getRandomLevel4QuizItems(count = LEVEL4_QUIZ_PER_SESSION): Level4QuizPoolItem[] {
  const pool = [...LEVEL4_QUIZ_POOL]
  const picked: Level4QuizPoolItem[] = []
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(index, 1)[0])
  }
  return picked
}

/** Pick `count` random quiz questions and shuffle options within each. */
export function getRandomLevel4Quiz(count = LEVEL4_QUIZ_PER_SESSION): QuizQuestion[] {
  return getRandomLevel4QuizItems(count).map(level4QuizToQuestion)
}