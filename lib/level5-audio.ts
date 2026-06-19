import { playNarratorSrc, type NarratorPlaybackOptions } from "@/lib/audio"

/** Level 5 narrator clips live in public/audio/level_5/ */
export const LEVEL5_AUDIO_BASE = "/audio/level_5"

export const LEVEL5_ROUND_AUDIO: Record<string, string> = {
  cats: "narrator_level5_round_cats.mp3",
  dogs: "narrator_level5_round_dogs.mp3",
  cars: "narrator_level5_round_cars.mp3",
  apples: "narrator_level5_round_apples.mp3",
  rockets: "narrator_level5_round_rockets.mp3",
}

export const LEVEL5_HINT_AUDIO = [
  "narrator_level5_hint_count.mp3",
  "narrator_level5_hint_colors.mp3",
  "narrator_level5_hint_transform.mp3",
  "narrator_level5_hint_glow.mp3",
] as const

export function playLevel5Narrator(
  filename: string,
  options?: NarratorPlaybackOptions,
): void {
  playNarratorSrc(`${LEVEL5_AUDIO_BASE}/${filename}`, options)
}

/**
 * Play a Level 5 clip, then run `next` only after it finishes.
 * Includes a long fallback so transitions never stall if a file is missing.
 */
export function playLevel5Then(
  filename: string,
  next: () => void,
  fallbackMs = 20000,
): void {
  let done = false
  const finish = () => {
    if (done) return
    done = true
    next()
  }
  playLevel5Narrator(filename, { onEnd: finish })
  setTimeout(finish, fallbackMs)
}