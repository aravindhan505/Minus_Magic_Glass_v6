import { playNarratorSrc, type NarratorPlaybackOptions } from "@/lib/audio"

/** Level 4 narrator clips — public/audio/level_4/ (see level4_assets/level4audio.txt) */
export const LEVEL4_AUDIO_BASE = "/audio/level_4"

export function playLevel4Narrator(
  filename: string,
  options?: NarratorPlaybackOptions,
): void {
  playNarratorSrc(`${LEVEL4_AUDIO_BASE}/${filename}`, options)
}

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