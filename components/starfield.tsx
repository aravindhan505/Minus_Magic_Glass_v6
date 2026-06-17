"use client"

import { useEffect, useState } from "react"

type Star = {
  left: string
  top: string
  size: number
  delay: string
  duration: string
  color: string
}

// Retro pixel-star palette: magenta + purple to match the arcade theme.
const STAR_COLORS = [
  "oklch(0.72 0.29 332)",
  "oklch(0.6 0.27 300)",
  "oklch(0.82 0.18 330)",
  "oklch(0.5 0.22 295)",
]

function generateStars(count: number): Star[] {
  return Array.from({ length: count }).map(() => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    // Whole-pixel sizes keep the crisp, retro 8-bit square look.
    size: Math.floor(Math.random() * 3) + 2,
    delay: `${Math.random() * 3}s`,
    duration: `${Math.random() * 2 + 1.6}s`,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  }))
}

/** A decorative twinkling pixel-star background. Purely visual. */
export function Starfield({ count = 60 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([])

  // Generate stars only on the client to avoid SSR hydration mismatch.
  useEffect(() => {
    setStars(generateStars(count))
  }, [count])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star, i) => (
        <span
          key={i}
          className="animate-twinkle absolute"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  )
}
