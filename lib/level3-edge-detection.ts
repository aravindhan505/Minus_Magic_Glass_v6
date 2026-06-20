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

/** Kid traces the outline of a picture — 6 drawing-book rounds. */
export const LEVEL3_TRACE_ROUNDS: Level3TraceRound[] = [
  {
    id: "butterfly",
    label: "Butterfly",
    title: "Round 1 – Butterfly",
    instruction: "Trace the butterfly's wings and body with your finger!",
    hint: "Start at the top of the body, then sweep around each wing.",
    doneText: "Beautiful! You traced the butterfly's edges!",
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
    title: "Round 2 – House",
    instruction: "Follow the dots around the house — roof and walls!",
    hint: "Trace the pointy roof first, then go down each wall.",
    doneText: "Great job! You found every edge of the house!",
    color: "#34d399",
    colorSrc: `${L3_TRACE_IMAGES}/trace-house-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-house-silhouette.png`,
    svgPath: "M45 110 L100 45 L155 110 L145 110 L145 180 L55 180 L55 110 Z",
    dots: buildHouseDots(),
  },
  {
    id: "rocket",
    label: "Rocket",
    title: "Round 3 – Rocket",
    instruction: "Trace the rocket from nose to fins!",
    hint: "Start at the tip, slide down the sides, then trace the fins.",
    doneText: "Blast off! You traced the whole rocket!",
    color: "#f59e0b",
    colorSrc: `${L3_TRACE_IMAGES}/trace-rocket-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-rocket-silhouette.png`,
    svgPath: "M100 28 L112 70 L112 165 L132 175 L112 175 L88 175 L68 175 L88 165 L88 70 Z",
    dots: buildRocketDots(),
  },
  {
    id: "teddybear",
    label: "Teddy Bear",
    title: "Round 4 – Teddy Bear",
    instruction: "Trace around the teddy bear — ears, head, and tummy!",
    hint: "Start at the top of one ear and go all the way around.",
    doneText: "Aww! You traced every edge on the teddy bear!",
    color: "#fbbf24",
    colorSrc: `${L3_TRACE_IMAGES}/trace-teddybear-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-teddybear-silhouette.png`,
    svgPath: "M78 52 A12 12 0 1 1 78 52 M122 52 A12 12 0 1 1 122 52 M68 72 A32 30 0 1 1 132 72 A42 48 0 1 1 58 130 Z",
    dots: buildTeddyBearDots(),
  },
  {
    id: "soccerball",
    label: "Soccer Ball",
    title: "Round 5 – Soccer Ball",
    instruction: "Trace the circle edge of the soccer ball!",
    hint: "Follow the dots all the way around — like drawing a big circle.",
    doneText: "Goal! You traced the whole ball edge!",
    color: "#38bdf8",
    colorSrc: `${L3_TRACE_IMAGES}/trace-soccerball-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-soccerball-silhouette.png`,
    svgPath: "M42 105 A58 58 0 1 1 158 105 A58 58 0 1 1 42 105 Z",
    dots: buildSoccerBallDots(),
  },
  {
    id: "car",
    label: "Car",
    title: "Round 6 – Car",
    instruction: "Trace the car from bumper to roof and back!",
    hint: "Go along the bottom, up the front, over the roof, and down the back.",
    doneText: "Vroom! You traced the whole car outline!",
    color: "#f472b6",
    colorSrc: `${L3_TRACE_IMAGES}/trace-car-color.png`,
    silhouetteSrc: `${L3_TRACE_IMAGES}/trace-car-silhouette.png`,
    svgPath: "M38 155 L38 130 L48 105 L78 88 L132 88 L158 105 L168 130 L168 155 Z",
    dots: buildCarDots(),
  },
]

export const LEVEL3_TRACE_RADIUS = 18
export const LEVEL3_REQUIRED_FRACTION = 0.92

export const LEVEL3_QUIZ_PASS_PERCENT = 67

export const LEVEL3_QUIZ = [
  {
    question: "What are you tracing along the picture?",
    options: ["The edges and outlines", "The middle colors only", "Hidden words", "The background sky"],
    correct: 0,
  },
  {
    question: "Where do edges hide in a picture?",
    options: ["Where shapes meet or colors change", "Only in corners", "In the center dot", "Under the ground"],
    correct: 0,
  },
  {
    question: "Which picture did you trace in Round 1?",
    options: ["Butterfly", "Teddy Bear", "Soccer Ball", "Car"],
    correct: 0,
  },
] as const

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