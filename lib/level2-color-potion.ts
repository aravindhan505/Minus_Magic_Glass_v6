import type { QuizQuestion } from "@/lib/level-data"

export const L2_ITEMS = "/images/level2/items"

export type RgbColor = { r: number; g: number; b: number }

export type PotionItem = {
  id: number
  name: string
}

/** 50 kid-friendly collectible items — ported from Minu's Magic Laboratory reference. */
export const POTION_ITEMS: PotionItem[] = [
  { id: 1, name: "strawberry" },
  { id: 2, name: "frog" },
  { id: 3, name: "whale" },
  { id: 4, name: "rubber-duck" },
  { id: 5, name: "ice-cube" },
  { id: 6, name: "jellyfish" },
  { id: 7, name: "pumpkin" },
  { id: 8, name: "grapes" },
  { id: 9, name: "teddy-bear" },
  { id: 10, name: "cloud" },
  { id: 11, name: "apple" },
  { id: 12, name: "banana" },
  { id: 13, name: "carrot" },
  { id: 14, name: "firetruck" },
  { id: 15, name: "turtle" },
  { id: 16, name: "dolphin" },
  { id: 17, name: "star" },
  { id: 18, name: "diamond" },
  { id: 19, name: "octopus" },
  { id: 20, name: "cookie" },
  { id: 21, name: "rocket-ship" },
  { id: 22, name: "school-bus" },
  { id: 23, name: "butterfly" },
  { id: 24, name: "ladybug" },
  { id: 25, name: "sunflower" },
  { id: 26, name: "penguin" },
  { id: 27, name: "snowman" },
  { id: 28, name: "umbrella" },
  { id: 29, name: "balloon" },
  { id: 30, name: "kite" },
  { id: 31, name: "soccer-ball" },
  { id: 32, name: "tree" },
  { id: 33, name: "mushroom" },
  { id: 34, name: "snail" },
  { id: 35, name: "crown" },
  { id: 36, name: "watermelon-slice" },
  { id: 37, name: "guitar" },
  { id: 38, name: "ice-cream-cone" },
  { id: 39, name: "cupcake" },
  { id: 40, name: "gift-box" },
  { id: 41, name: "bell" },
  { id: 42, name: "key" },
  { id: 43, name: "horseshoe-magnet" },
  { id: 44, name: "magic-wand" },
  { id: 45, name: "treasure-chest" },
  { id: 46, name: "anchor" },
  { id: 47, name: "sailboat" },
  { id: 48, name: "hot-air-balloon" },
  { id: 49, name: "teapot" },
  { id: 50, name: "dinosaur" },
]

export const COLOR_MATCH_TOLERANCE = 28
export const LEVEL2_ROUNDS_REQUIRED = 3
export const DEFAULT_MIX_COLOR: RgbColor = { r: 128, g: 128, b: 128 }

const PRIMARY_TARGETS: RgbColor[] = [
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
  { r: 255, g: 255, b: 0 },
  { r: 255, g: 0, b: 255 },
  { r: 0, g: 255, b: 255 },
]

const BLEND_TARGETS: RgbColor[] = [
  { r: 255, g: 128, b: 0 },
  { r: 128, g: 0, b: 255 },
  { r: 0, g: 255, b: 128 },
  { r: 255, g: 0, b: 128 },
  { r: 128, g: 255, b: 0 },
]

function padId(id: number): string {
  return id < 10 ? `0${id}` : `${id}`
}

export function formatItemName(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function itemSilhouetteSrc(item: PotionItem): string {
  return `${L2_ITEMS}/${padId(item.id)}-${item.name}-silhouette.png`
}

export function itemRevealedSrc(item: PotionItem): string {
  return `${L2_ITEMS}/${padId(item.id)}-${item.name}-revealed.png`
}

export function rgbCss(c: RgbColor): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`
}

export function colorsMatch(target: RgbColor, guess: RgbColor, margin = COLOR_MATCH_TOLERANCE): boolean {
  return (
    Math.abs(target.r - guess.r) <= margin &&
    Math.abs(target.g - guess.g) <= margin &&
    Math.abs(target.b - guess.b) <= margin
  )
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function pickTargetPool(roundIndex: number): RgbColor[] {
  if (roundIndex === 0) return PRIMARY_TARGETS
  if (roundIndex === 1) return BLEND_TARGETS
  return [...PRIMARY_TARGETS, ...BLEND_TARGETS]
}

export function generateTargetColor(roundIndex: number, previous?: RgbColor): RgbColor {
  const pool = pickTargetPool(roundIndex)
  if (!previous || pool.length === 1) return pickRandom(pool)
  const filtered = pool.filter(
    (c) => !(c.r === previous.r && c.g === previous.g && c.b === previous.b),
  )
  return pickRandom(filtered.length > 0 ? filtered : pool)
}

export function pickRandomItem(excludeId?: number): PotionItem {
  const pool = excludeId
    ? POTION_ITEMS.filter((i) => i.id !== excludeId)
    : POTION_ITEMS
  return pool[Math.floor(Math.random() * pool.length)]
}

export type ColorChannel = "r" | "g" | "b"

export type ChannelAdjustment = {
  channel: ColorChannel
  label: string
  current: number
  target: number
  gap: number
  direction: "up" | "down"
}

const CHANNEL_META: Array<{ channel: ColorChannel; label: string; key: keyof RgbColor }> = [
  { channel: "r", label: "Red", key: "r" },
  { channel: "g", label: "Green", key: "g" },
  { channel: "b", label: "Blue", key: "b" },
]

/** Channels that are still outside the match tolerance, worst first. */
export function getChannelAdjustments(
  target: RgbColor,
  guess: RgbColor,
  margin = COLOR_MATCH_TOLERANCE,
): ChannelAdjustment[] {
  return CHANNEL_META.map(({ channel, label, key }) => {
    const current = guess[key]
    const targetVal = target[key]
    const gap = Math.abs(targetVal - current)
    return {
      channel,
      label,
      current,
      target: targetVal,
      gap,
      direction: current < targetVal ? ("up" as const) : ("down" as const),
    }
  })
    .filter((c) => c.gap > margin)
    .sort((a, b) => b.gap - a.gap)
}

function kidTargetApprox(value: number): number {
  if (value >= 240) return 255
  if (value <= 15) return 0
  return Math.round(value / 25) * 25
}

/**
 * Progressive hints — each tap reveals more specific guidance.
 * Level 1: which sliders need work
 * Level 2: direction + biggest gap channel
 * Level 3+: approximate target numbers for all off channels
 */
export function getProgressiveHint(
  target: RgbColor,
  guess: RgbColor,
  hintLevel: number,
): { message: string; highlightChannels: ColorChannel[] } {
  if (colorsMatch(target, guess)) {
    return {
      message: "That looks perfect! Tap Check Match to reveal the hidden object!",
      highlightChannels: [],
    }
  }

  const off = getChannelAdjustments(target, guess, 12)
  if (off.length === 0) {
    return {
      message: "So close! Tiny tweaks — nudge a slider a little, then Check Match!",
      highlightChannels: [],
    }
  }

  const highlightChannels = off.map((c) => c.channel)
  const level = ((hintLevel - 1) % 3) + 1

  if (level === 1) {
    const names = off.map((c) => c.label).join(", ")
    return {
      message: `Hint: The ${names} potion${off.length > 1 ? "s" : ""} still need${off.length === 1 ? "s" : ""} adjusting — watch the glowing slider${off.length > 1 ? "s" : ""}!`,
      highlightChannels,
    }
  }

  if (level === 2) {
    const top = off[0]
    const arrow = top.direction === "up" ? "RIGHT →" : "LEFT ←"
    const amount =
      top.gap > 80 ? "a lot" : top.gap > 40 ? "some" : "a little"
    return {
      message: `Hint: Slide ${top.label} ${arrow} (${amount})! Yours is ${top.current}, target needs ${top.direction === "up" ? "more" : "less"} ${top.label.toLowerCase()}.`,
      highlightChannels: [top.channel],
    }
  }

  const recipe = off
    .map((c) => `${c.label} ≈ ${kidTargetApprox(c.target)}`)
    .join(" · ")
  return {
    message: `Hint recipe: ${recipe}. Match these numbers on the sliders!`,
    highlightChannels,
  }
}

/** @deprecated Use getProgressiveHint — kept for miss feedback on Check Match */
export function getColorHint(target: RgbColor, guess: RgbColor): string {
  return getProgressiveHint(target, guess, 2).message
}

export function getRandomLevel2Rounds(count = LEVEL2_ROUNDS_REQUIRED): Array<{
  item: PotionItem
  target: RgbColor
}> {
  const rounds: Array<{ item: PotionItem; target: RgbColor }> = []
  let prevItemId: number | undefined
  let prevColor: RgbColor | undefined

  for (let i = 0; i < count; i++) {
    const item = pickRandomItem(prevItemId)
    const target = generateTargetColor(i, prevColor)
    rounds.push({ item, target })
    prevItemId = item.id
    prevColor = target
  }
  return rounds
}

/** End-of-level quiz — RGB concepts, no external quiz PNGs required. */
export const LEVEL2_QUIZ: QuizQuestion[] = [
  {
    type: "hands_on",
    question: "Turn the mix BRIGHT RED! Slide Red high and keep Green and Blue low.",
    targetSliderValues: { r: 220, g: 40, b: 40 },
    tolerance: 45,
  },
  {
    type: "hands_on",
    question: "Mix a sunny YELLOW! Red and Green should be high, Blue should be low.",
    targetSliderValues: { r: 220, g: 220, b: 40 },
    tolerance: 45,
  },
  {
    type: "hands_on",
    question: "Make a purple potion! Red and Blue high, Green lower.",
    targetSliderValues: { r: 180, g: 60, b: 200 },
    tolerance: 45,
  },
]