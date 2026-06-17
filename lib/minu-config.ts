// =============================================================
// Minu's Magic Glasses — central, editable game configuration.
// Add / edit assets, levels and copy here without touching UI code.
// =============================================================

/** Minu character pose images. Drop new files in /public/minu and point to them here. */
export const minuPoses = {
  idle: "/minu/minu_idle.png",
  waving: "/minu/minu_waving.png",
  celebrating: "/minu/minu_celebrating.png",
  thinking: "/minu/minu_thinking.png",
  clapping: "/minu/minu_clapping.png",
  surprised: "/minu/minu_surprised.png",
  pointing: "/minu/minu_pointing.png",
  holdingLens: "/minu/minu_holding_lens.png",
  holding255: "/minu/minu_holding_255.png",
  holdingMatrix: "/minu/minu_holding_matrix.png",
  empathetic: "/minu/minu_empathetic.png",
  oops: "/minu/minu_oops.png",
  pullingLever: "/minu/minu_pulling_lever.png",
  afkYawning: "/minu/minu_afk_yawning.png",
} as const

export type MinuPose = keyof typeof minuPoses

/** Intro video. Put your 1920x1080 mp4 in /public and point to it here. */
export const introVideo = {
  // Add your file at public/Intro.mp4 — falls back to a poster + skip if missing.
  src: "/Intro.mp4",
  poster: "/minu/minu_waving.png",
  // Auto-advance to home after this many seconds even if the video can't load.
  fallbackSeconds: 60,
}

export type Level = {
  id: number
  slug: string
  title: string
  subtitle: string
  /** Short, kid-friendly description of what Minu learns. */
  description: string
  /** Accent color token used for the level's planet/glow. */
  color: string
  icon: string
}

/** The 5 calibration stages. Reorder or add levels freely. */
export const levels: Level[] = [
  {
    id: 1,
    slug: "numbers-to-brightness",
    title: "Numbers to Brightness",
    subtitle: "Level 1",
    description: "Teach Minu how computers store light as numbers.",
    color: "var(--chart-2)",
    icon: "Sun",
  },
  {
    id: 2,
    slug: "brightness-in-color",
    title: "Brightness in Color",
    subtitle: "Level 2",
    description: "Red, Green and Blue make every colour Minu sees.",
    color: "var(--chart-1)",
    icon: "Palette",
  },
  {
    id: 3,
    slug: "edge-detection",
    title: "Edge Detection",
    subtitle: "Level 3",
    description: "Help Minu find the outlines hiding in a picture.",
    color: "var(--chart-3)",
    icon: "Scan",
  },
  {
    id: 4,
    slug: "feature-recognition",
    title: "Feature Recognition",
    subtitle: "Level 4",
    description: "Spot shapes and regions so Minu knows what's what.",
    color: "var(--chart-4)",
    icon: "Shapes",
  },
  {
    id: 5,
    slug: "image-classification",
    title: "Image Classification",
    subtitle: "Level 5",
    description: "Teach Minu to sort pictures all on her own.",
    color: "var(--chart-5)",
    icon: "Sparkles",
  },
]
