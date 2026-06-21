import { playNarratorSrc, type NarratorPlaybackOptions } from "@/lib/audio"

/** Level 3 narrator clips — public/audio/level_3/ (see level3_assets/level3audio.txt) */
export const LEVEL3_AUDIO_BASE = "/audio/level_3"

/** Per-shape reveal lines keyed by LEVEL3_TRACE_ROUNDS[].id */
export const LEVEL3_REVEAL_AUDIO: Record<string, string> = {
  butterfly: "narrator_level3_reveal_butterfly.mp3",
  house: "narrator_level3_reveal_house.mp3",
  rocket: "narrator_level3_reveal_rocket.mp3",
  teddybear: "narrator_level3_reveal_teddybear.mp3",
  soccerball: "narrator_level3_reveal_soccerball.mp3",
  car: "narrator_level3_reveal_car.mp3",
}

/** One clip per quiz pool question (keyed by LEVEL3_QUIZ_POOL[].id). */
export const LEVEL3_QUIZ_QUESTION_AUDIO: Record<string, string> = {
  "what-traced": "narrator_level3_quiz_what_traced.mp3",
  "draw-ball-first": "narrator_level3_quiz_draw_ball.mp3",
  "edge-word": "narrator_level3_quiz_edge_word.mp3",
  "house-edge": "narrator_level3_quiz_house_edge.mp3",
  "dot-placement": "narrator_level3_quiz_dot_placement.mp3",
  "butterfly-outline": "narrator_level3_quiz_butterfly_outline.mp3",
}

export function playLevel3Narrator(
  filename: string,
  options?: NarratorPlaybackOptions,
): void {
  playNarratorSrc(`${LEVEL3_AUDIO_BASE}/${filename}`, options)
}

/** Play a Level 3 clip, then run `next` only after it finishes. */
export function playLevel3Then(
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
  playLevel3Narrator(filename, { onEnd: finish })
  setTimeout(finish, fallbackMs)
}

export function level3RevealAudioForRound(roundId: string): string | undefined {
  return LEVEL3_REVEAL_AUDIO[roundId]
}

/** Play the shape-specific reveal line only (no generic trace_complete prefix). */
export function playLevel3RevealForRound(
  roundId: string,
  options?: NarratorPlaybackOptions,
): void {
  const filename = level3RevealAudioForRound(roundId)
  if (!filename) {
    options?.onEnd?.()
    return
  }
  playLevel3Narrator(filename, options)
}