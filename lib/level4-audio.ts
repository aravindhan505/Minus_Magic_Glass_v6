import { playNarratorSrc, type NarratorPlaybackOptions } from "@/lib/audio"

/** Level 4 narrator clips — public/audio/level_4/ (see level4_assets/level4audio.txt) */
export const LEVEL4_AUDIO_BASE = "/audio/level_4"

/** Per-pair correct explain lines keyed by LEVEL4_COMPARE_POOL[].id */
export const LEVEL4_PAIR_AUDIO: Record<string, string> = {
  "star-circle-yellow": "narrator_level4_pair_star_circle_yellow.mp3",
  "red-blue-balls": "narrator_level4_pair_red_blue_balls.mp3",
  "wood-metal-cubes": "narrator_level4_pair_wood_metal_cubes.mp3",
  "red-green-apples": "narrator_level4_pair_red_green_apples.mp3",
  "orange-tennis-ball": "narrator_level4_pair_orange_tennis_ball.mp3",
  "dolphin-real-plush": "narrator_level4_pair_dolphin_real_plush.mp3",
  "rough-smooth-rocks": "narrator_level4_pair_rough_smooth_rocks.mp3",
  "twin-strawberries": "narrator_level4_pair_twin_strawberries.mp3",
}

/** One clip per quiz pool question (keyed by LEVEL4_QUIZ_POOL[].id). */
export const LEVEL4_QUIZ_QUESTION_AUDIO: Record<string, string> = {
  "shape-same-color-diff": "narrator_level4_quiz_shape_same_color_diff.mp3",
  "color-same-shape-diff": "narrator_level4_quiz_color_same_shape_diff.mp3",
  "texture-same-shape-diff": "narrator_level4_quiz_texture_same_shape_diff.mp3",
  "all-three-match": "narrator_level4_quiz_all_three_match.mp3",
  "shape-color-same-texture-diff": "narrator_level4_quiz_shape_color_same_texture_diff.mp3",
  "shape-texture-same-color-diff": "narrator_level4_quiz_shape_texture_same_color_diff.mp3",
}

export const LEVEL4_WRONG_AUDIO = {
  empty: "narrator_level4_wrong_empty.mp3",
  missing: "narrator_level4_wrong_missing.mp3",
  extra: "narrator_level4_wrong_extra.mp3",
  mixed: "narrator_level4_wrong_mixed.mp3",
} as const

export function playLevel4Narrator(
  filename: string,
  options?: NarratorPlaybackOptions,
): void {
  playNarratorSrc(`${LEVEL4_AUDIO_BASE}/${filename}`, options)
}

/** Play a Level 4 clip, then run `next` only after it finishes. */
export function playLevel4Then(
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
  playLevel4Narrator(filename, { onEnd: finish })
  setTimeout(finish, fallbackMs)
}

export function level4PairAudioForRound(roundId: string): string | undefined {
  return LEVEL4_PAIR_AUDIO[roundId]
}

/** Play the pair-specific explain line on a correct check. */
export function playLevel4ExplainForRound(
  roundId: string,
  options?: NarratorPlaybackOptions,
): void {
  const filename = level4PairAudioForRound(roundId)
  if (!filename) {
    options?.onEnd?.()
    return
  }
  playLevel4Narrator(filename, options)
}