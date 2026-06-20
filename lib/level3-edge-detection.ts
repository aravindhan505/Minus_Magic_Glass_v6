export type TraceDot = { x: number; y: number }

export const L3_TRACE_IMAGES = "/images/level3"

export type Level3TraceRound = {
  id: string
  label: string
  title: string
  instruction: string
  hint: string
  doneText: string
  /** Accent for progress bar and lit dots */
  color: string
  /** Full-color picture the kid sees (drawing-book page) */
  colorSrc: string
  /** Green-outline guide — public/images/level3/trace-*-silhouette.png */
  silhouetteSrc: string
  /** SVG fallback if PNGs fail to load */
  svgPath: string
  dots: TraceDot[]
}

function ellipseDots(cx: number, cy: number, rx: number, ry: number, count: number): TraceDot[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI
    return { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) }
  })
}

function polygonDots(vertices: TraceDot[], pointsPerSide: number): TraceDot[] {
  const dots: TraceDot[] = []
  for (let s = 0; s < vertices.length; s++) {
    const v0 = vertices[s]
    const v1 = vertices[(s + 1) % vertices.length]
    for (let t = 0; t < pointsPerSide; t++) {
      dots.push({
        x: v0.x + (v1.x - v0.x) * (t / pointsPerSide),
        y: v0.y + (v1.y - v0.y) * (t / pointsPerSide),
      })
    }
  }
  return dots
}

function lineDots(ax: number, ay: number, bx: number, by: number, count: number): TraceDot[] {
  return Array.from({ length: count }, (_, i) => ({
    x: ax + (bx - ax) * (i / count),
    y: ay + (by - ay) * (i / count),
  }))
}

function buildButterflyDots(): TraceDot[] {
  const leftWing = ellipseDots(72, 95, 38, 52, 14)
  const rightWing = ellipseDots(128, 95, 38, 52, 14)
  const body = lineDots(100, 55, 100, 155, 10)
  return [...leftWing, ...rightWing, ...body]
}

function buildHouseDots(): TraceDot[] {
  const base = polygonDots(
    [
      { x: 55, y: 180 },
      { x: 55, y: 110 },
      { x: 145, y: 110 },
      { x: 145, y: 180 },
    ],
    6,
  )
  const roof = polygonDots(
    [
      { x: 45, y: 110 },
      { x: 100, y: 45 },
      { x: 155, y: 110 },
    ],
    6,
  )
  return [...roof, ...base]
}

function buildRocketDots(): TraceDot[] {
  const nose = polygonDots(
    [
      { x: 88, y: 70 },
      { x: 100, y: 28 },
      { x: 112, y: 70 },
    ],
    5,
  )
  const body = polygonDots(
    [
      { x: 88, y: 70 },
      { x: 88, y: 165 },
      { x: 112, y: 165 },
      { x: 112, y: 70 },
    ],
    5,
  )
  const leftFin = polygonDots(
    [
      { x: 88, y: 155 },
      { x: 68, y: 175 },
      { x: 88, y: 175 },
    ],
    4,
  )
  const rightFin = polygonDots(
    [
      { x: 112, y: 155 },
      { x: 132, y: 175 },
      { x: 112, y: 175 },
    ],
    4,
  )
  return [...nose, ...body, ...leftFin, ...rightFin]
}

function buildTeddyBearDots(): TraceDot[] {
  const head = ellipseDots(100, 72, 32, 30, 12)
  const body = ellipseDots(100, 130, 42, 48, 16)
  const leftEar = ellipseDots(78, 52, 12, 12, 6)
  const rightEar = ellipseDots(122, 52, 12, 12, 6)
  return [...head, ...body, ...leftEar, ...rightEar]
}

function buildSoccerBallDots(): TraceDot[] {
  return ellipseDots(100, 105, 58, 58, 28)
}

function buildCarDots(): TraceDot[] {
  const body = polygonDots(
    [
      { x: 38, y: 130 },
      { x: 48, y: 105 },
      { x: 78, y: 88 },
      { x: 132, y: 88 },
      { x: 158, y: 105 },
      { x: 168, y: 130 },
      { x: 168, y: 155 },
      { x: 38, y: 155 },
    ],
    5,
  )
  const cabin = polygonDots(
    [
      { x: 78, y: 88 },
      { x: 95, y: 72 },
      { x: 125, y: 72 },
      { x: 132, y: 88 },
    ],
    4,
  )
  return [...body, ...cabin]
}

/** Full pool — each run picks LEVEL3_ROUNDS_PER_RUN at random. */
export const LEVEL3_TRACE_ROUNDS: Level3TraceRound[] = [
  {
    id: "butterfly",
    label: "Butterfly",
    title: "Mystery Shape",
    instruction: "Trace every dot along the edges — complete the outline to reveal the picture!",
    hint: "Start at the top of the body, then sweep around each wing.",
    doneText: "Beautiful! You mapped every edge — it's a butterfly!",
    color: "#c084fc",
    colorSrc: `${L3_TRACE_IMAGES}/trace-butterfly-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-butterfly-silhouette.png`,
    svgPath:
      "M72 95 C35 40, 20 130, 72 150 C72 120, 72 70, 100 55 C100 70, 100 120, 100 150 C100 130, 85 40, 128 95 C180 40, 165 130, 128 150 C128 120, 128 70, 100 55 Z",
    dots: buildButterflyDots(),
  },
  {
    id: "house",
    label: "House",
    title: "Mystery Shape",
    instruction: "Trace every dot along the edges — complete the outline to reveal the picture!",
    hint: "Trace the pointy roof first, then go down each wall.",
    doneText: "Great job! You mapped every edge — it's a house!",
    color: "#34d399",
    colorSrc: `${L3_TRACE_IMAGES}/trace-house-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-house-silhouette.png`,
    svgPath: "M45 110 L100 45 L155 110 L145 110 L145 180 L55 180 L55 110 Z",
    dots: buildHouseDots(),
  },
  {
    id: "rocket",
    label: "Rocket",
    title: "Mystery Shape",
    instruction: "Trace every dot along the edges — complete the outline to reveal the picture!",
    hint: "Start at the tip, slide down the sides, then trace the fins.",
    doneText: "Blast off! You mapped every edge — it's a rocket!",
    color: "#f59e0b",
    colorSrc: `${L3_TRACE_IMAGES}/trace-rocket-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-rocket-silhouette.png`,
    svgPath: "M100 28 L112 70 L112 165 L132 175 L112 175 L88 175 L68 175 L88 165 L88 70 Z",
    dots: buildRocketDots(),
  },
  {
    id: "teddybear",
    label: "Teddy Bear",
    title: "Mystery Shape",
    instruction: "Trace every dot along the edges — complete the outline to reveal the picture!",
    hint: "Start at the top of one ear and go all the way around.",
    doneText: "Aww! You mapped every edge — it's a teddy bear!",
    color: "#fbbf24",
    colorSrc: `${L3_TRACE_IMAGES}/trace-teddybear-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-teddybear-silhouette.png`,
    svgPath: "M78 52 A12 12 0 1 1 78 52 M122 52 A12 12 0 1 1 122 52 M68 72 A32 30 0 1 1 132 72 A42 48 0 1 1 58 130 Z",
    dots: buildTeddyBearDots(),
  },
  {
    id: "soccerball",
    label: "Soccer Ball",
    title: "Mystery Shape",
    instruction: "Trace every dot along the edges — complete the outline to reveal the picture!",
    hint: "Follow the dots all the way around — like drawing a big circle.",
    doneText: "Goal! You mapped every edge — it's a soccer ball!",
    color: "#38bdf8",
    colorSrc: `${L3_TRACE_IMAGES}/trace-soccerball-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-soccerball-silhouette.png`,
    svgPath: "M42 105 A58 58 0 1 1 158 105 A58 58 0 1 1 42 105 Z",
    dots: buildSoccerBallDots(),
  },
  {
    id: "car",
    label: "Car",
    title: "Mystery Shape",
    instruction: "Trace every dot along the edges — complete the outline to reveal the picture!",
    hint: "Go along the bottom, up the front, over the roof, and down the back.",
    doneText: "Vroom! You mapped every edge — it's a car!",
    color: "#f472b6",
    colorSrc: `${L3_TRACE_IMAGES}/trace-car-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-car-silhouette.png`,
    svgPath: "M38 155 L38 130 L48 105 L78 88 L132 88 L158 105 L168 130 L168 155 Z",
    dots: buildCarDots(),
  },
]

export const LEVEL3_TRACE_RADIUS = 18
/** All dots must be lit — 100% edge trace before color reveal. */
export const LEVEL3_REQUIRED_FRACTION = 1

/** How many mystery shapes per activity run (picked from LEVEL3_TRACE_ROUNDS). */
export const LEVEL3_ROUNDS_PER_RUN = 3

export const LEVEL3_QUIZ_PASS_PERCENT = 67

export const LEVEL3_QUIZ = [
  {
    question: "What were you tracing on the mystery shape?",
    options: ["The edges and outlines", "The colorful middle", "Hidden words", "The background"],
    correct: 0,
  },
  {
    question: "What is edge detection?",
    options: [
      "Finding the outlines where shapes meet",
      "Mixing paint colors",
      "Counting how many stars",
      "Turning up the volume",
    ],
    correct: 0,
  },
  {
    question: "What happens when you trace every dot?",
    options: [
      "The colorful picture is revealed!",
      "The screen goes blank",
      "A new planet unlocks",
      "The dots disappear forever",
    ],
    correct: 0,
  },
] as const

/** Pick `count` random trace rounds without repeats. */
export function getRandomLevel3Rounds(count = LEVEL3_ROUNDS_PER_RUN): Level3TraceRound[] {
  const pool = [...LEVEL3_TRACE_ROUNDS]
  const picked: Level3TraceRound[] = []
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(index, 1)[0])
  }
  return picked
}

/** Minimum distance from point P to line segment AB. */
export function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.sqrt((px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2)
}