import { playNarratorSrc, type NarratorPlaybackOptions } from "@/lib/audio"

/** Level 3 narrator clips — public/audio/level_3/ (see level3_assets/level3audio.txt) */
export const LEVEL3_AUDIO_BASE = "/audio/level_3"

export function playLevel3Narrator(
  filename: string,
  options?: NarratorPlaybackOptions,
): void {
  playNarratorSrc(`${LEVEL3_AUDIO_BASE}/${filename}`, options)
}

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