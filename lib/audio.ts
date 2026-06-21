"use client"

import { planetAudio } from "@/lib/minu-config"

// =============================================================
// Audio — TTS voiceover and SFX sound effects helpers.
// Uses Web Speech API for TTS and Web Audio API for simple tones.
// =============================================================

// ─── TTS (Text-to-Speech) ─────────────────────────────────────

type TTSOptions = {
  rate?: number
  pitch?: number
  voice?: string
  onEnd?: () => void
}

let _soundEnabled = true
let _bgmVolume = 0.6    // 0–1 scale (default 60%)
let _sfxVolume = 0.8    // 0–1 scale (default 80%)
let _voiceVolume = 0.8  // 0–1 scale (default 80%)

/** Master switch — set to false to mute all SFX, TTS, and background music. */
export function setSoundEnabled(enabled: boolean): void {
  _soundEnabled = enabled
  if (!enabled) stopSpeaking()
  updateBGMVolume()
}

/** Check if sound is enabled. */
export function isSoundEnabled(): boolean {
  return _soundEnabled
}

/**
 * Temporarily enable sound to play a confirmation clip (e.g. sound-off beep),
 * then restore the previous enabled state.
 */
export function temporarilyEnableSound(): void {
  _soundEnabled = true
  updateBGMVolume()
}

export function restoreSoundState(enabled: boolean): void {
  _soundEnabled = enabled
  if (!enabled) stopSpeaking()
  updateBGMVolume()
}

/** Set background music volume (0–1). */
export function setBGMVolume(v: number): void {
  _bgmVolume = Math.max(0, Math.min(1, v))
  updateBGMVolume()
}

/** Get background music volume (0–1). */
export function getBGMVolume(): number {
  return _bgmVolume
}

/** Set SFX volume (0–1). */
export function setSFXVolume(v: number): void {
  _sfxVolume = Math.max(0, Math.min(1, v))
}

/** Get SFX volume (0–1). */
export function getSFXVolume(): number {
  return _sfxVolume
}

/** Set voice/narration volume (0–1). */
export function setVoiceVolume(v: number): void {
  _voiceVolume = Math.max(0, Math.min(1, v))
}

/** Get voice/narration volume (0–1). */
export function getVoiceVolume(): number {
  return _voiceVolume
}

let currentUtterance: SpeechSynthesisUtterance | null = null

/**
 * Speak text using the Web Speech API.
 * Gracefully falls back to no-op if TTS is unavailable.
 */
export function speak(
  text: string,
  options: TTSOptions = {},
): void {
  if (!_soundEnabled) return
  if (typeof window === "undefined") return
  const synth = window.speechSynthesis
  if (!synth) return

  // Cancel any ongoing speech
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = options.rate ?? 0.88
  utterance.pitch = options.pitch ?? 1.1

  // Try to pick a friendly English voice
  const voices = synth.getVoices()
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.includes("Female") ||
        v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.name.includes("Moira") ||
        v.name.includes("Google") ||
        v.name.includes("Microsoft")),
  )
  if (preferred) {
    utterance.voice = preferred
  } else {
    const englishVoice = voices.find((v) => v.lang.startsWith("en"))
    if (englishVoice) utterance.voice = englishVoice
  }

  if (options.onEnd) {
    utterance.onend = options.onEnd
  }

  currentUtterance = utterance
  synth.speak(utterance)
}

/** Stop any currently playing TTS. */
export function stopSpeaking(): void {
  if (typeof window === "undefined") return
  window.speechSynthesis?.cancel()
  currentUtterance = null
}

/** Check if TTS is available in the current browser. */
export function isTTSAvailable(): boolean {
  if (typeof window === "undefined") return false
  return "speechSynthesis" in window
}

// ─── SFX (Sound Effects via Web Audio API) ────────────────────

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext()
    } catch {
      return null
    }
  }
  return audioCtx
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.15,
): void {
  const ctx = getAudioContext()
  if (!ctx) return

  // Resume context if suspended (required after user gesture)
  if (ctx.state === "suspended") {
    ctx.resume()
  }

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

  const adjustedVolume = volume * _sfxVolume
  gainNode.gain.setValueAtTime(adjustedVolume, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

/** Button click sound — short, pleasant click. */
export function playClick(): void {
  if (!_soundEnabled) return
  playTone(800, 0.08, "sine", 0.1)
}

/** Level complete fanfare — ascending notes. */
export function playFanfare(): void {
  if (!_soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === "suspended") ctx.resume()

  const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, "sine", 0.12), i * 120)
  })
}

/** Error buzz — low dissonant tone. */
export function playError(): void {
  if (!_soundEnabled) return
  playTone(180, 0.2, "sawtooth", 0.08)
  setTimeout(() => playTone(160, 0.15, "sawtooth", 0.06), 100)
}

/** Slider tick — subtle click (throttled externally). */
export function playTick(): void {
  if (!_soundEnabled) return
  playTone(1200, 0.03, "sine", 0.05)
}

/** Pixel inspect sound — soft chime. */
export function playInspect(): void {
  if (!_soundEnabled) return
  playTone(1000, 0.1, "sine", 0.08)
  setTimeout(() => playTone(1200, 0.08, "sine", 0.06), 60)
}

let _lastTraceDotAt = 0

/** Trace dot fill — soft bloop when a kid lights an edge dot (throttled). */
export function playTraceDot(litCount = 0): void {
  if (!_soundEnabled) return
  const now = Date.now()
  if (now - _lastTraceDotAt < 35) return
  _lastTraceDotAt = now

  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === "suspended") ctx.resume()

  const scale = [523, 587, 659, 698, 784, 880, 988]
  const freq = scale[litCount % scale.length] ?? 659

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = "sine"
  oscillator.frequency.setValueAtTime(freq * 0.92, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(freq * 1.08, ctx.currentTime + 0.045)

  const vol = 0.07 * _sfxVolume
  gainNode.gain.setValueAtTime(vol, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.08)
}

// ─── Narrator MP3 Playback ─────────────────────────────────

let currentNarratorAudio: HTMLAudioElement | null = null
let mapExplainPlayedThisSession = false
let audioUnlockedFromGesture = false

/** Tiny silent WAV — primes autoplay after a real tap/click (required on production HTTPS). */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"

/**
 * Call synchronously inside a user click/tap handler before starting narrator audio.
 * Browsers block unprompted audio on deployed sites; localhost is more permissive.
 */
export function unlockAudioFromGesture(): void {
  if (audioUnlockedFromGesture || typeof window === "undefined") return
  audioUnlockedFromGesture = true
  const primer = new Audio(SILENT_WAV)
  primer.volume = 0
  primer.play().catch(() => {})
}

export type NarratorPlaybackOptions = {
  /** Called when the clip finishes (or after a short fallback if the file is missing). */
  onEnd?: () => void
  /** Called when the file fails to load; if omitted, onEnd runs after a short delay. */
  onError?: () => void
  /** Minimum ms to wait before onEnd when sound is muted (default 3000). */
  mutedFallbackMs?: number
}

/**
 * Play a narrator MP3 from a public audio path (e.g. /audio/minu/foo.mp3).
 * Stops any currently playing narrator line first.
 */
export function playNarratorSrc(src: string, options?: NarratorPlaybackOptions): void {
  if (typeof window === "undefined") {
    options?.onEnd?.()
    return
  }

  const finish = () => options?.onEnd?.()

  if (!_soundEnabled) {
    setTimeout(finish, options?.mutedFallbackMs ?? 3000)
    return
  }

  stopNarrator()

  const audio = new Audio(src)
  audio.volume = _voiceVolume

  const handleEnd = () => {
    if (currentNarratorAudio === audio) currentNarratorAudio = null
    finish()
  }

  audio.addEventListener("ended", handleEnd, { once: true })
  audio.addEventListener(
    "error",
    () => {
      if (options?.onError) {
        if (currentNarratorAudio === audio) currentNarratorAudio = null
        options.onError()
        return
      }
      setTimeout(handleEnd, 2000)
    },
    { once: true },
  )

  currentNarratorAudio = audio
  const tryPlay = () => audio.play().catch(() => setTimeout(handleEnd, 2000))
  if (audioUnlockedFromGesture) {
    tryPlay()
    return
  }
  // Wait briefly for a nearby tap/click unlock (e.g. Play → map mount).
  setTimeout(tryPlay, 50)
}

/** Play a narrator MP3 file from /public/audio/minu/. */
export function playNarratorFile(filename: string, options?: NarratorPlaybackOptions): void {
  playNarratorSrc(`/audio/minu/${filename}`, options)
}

/** Play the narrator clip that announces a planet's name on the Planet Map. */
export function playPlanetNarrator(levelId: number): void {
  const filename = planetAudio[levelId]
  if (!filename) return
  playNarratorSrc(`/audio/planets/${filename}`)
}

/** Play the planet-map narrator line at most once per browser session. */
export function playMapExplainOnce(options?: { onComplete?: () => void }): void {
  if (mapExplainPlayedThisSession) {
    options?.onComplete?.()
    return
  }
  mapExplainPlayedThisSession = true
  playNarratorFile("narrator_map_explain.mp3", { onEnd: options?.onComplete })
}

/** Reset map narrator guard (e.g. after a full app reload in dev). */
export function resetMapExplainSession(): void {
  mapExplainPlayedThisSession = false
}

export const MINU_VISITED_KEY = "minu-visited"

let minuVisitedMarked = false

/** Mark the player as a returning visitor (after first-time welcome finishes). */
export function markMinuVisited(): void {
  if (typeof window === "undefined" || minuVisitedMarked) return
  minuVisitedMarked = true
  localStorage.setItem(MINU_VISITED_KEY, "true")
}

/** Clear welcome/map session guards — use with Reset Progress. */
export function resetWelcomeSession(): void {
  if (typeof window === "undefined") return
  minuVisitedMarked = false
  sessionStorage.removeItem("minu-welcome-last")
  localStorage.removeItem(MINU_VISITED_KEY)
  resetMapExplainSession()
}

/** Stop any currently playing narrator MP3. */
export function stopNarrator(): void {
  if (currentNarratorAudio) {
    currentNarratorAudio.pause()
    currentNarratorAudio.currentTime = 0
    currentNarratorAudio = null
  }
}

/** True while a narrator clip is actively playing. */
export function isNarratorPlaying(): boolean {
  if (!currentNarratorAudio) return false
  return !currentNarratorAudio.paused && !currentNarratorAudio.ended
}

// ─── Background Music (Ambient Space Loop) ───────────────────

let bgmNodes: { osc1: OscillatorNode; osc2: OscillatorNode; osc3: OscillatorNode; lfo: OscillatorNode; lfoGain: GainNode; masterGain: GainNode } | null = null
let bgmPlaying = false

/**
 * Start ambient space background music.
 * Three detuned sine oscillators with a slow LFO for a dreamy, evolving pad.
 */
export function startBGM(): void {
  if (typeof window === "undefined") return
  if (bgmPlaying) return
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === "suspended") ctx.resume()

  // Master gain (very quiet — background only)
  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(_soundEnabled ? _bgmVolume * 0.12 : 0, ctx.currentTime)
  masterGain.connect(ctx.destination)

  // Three detuned sine oscillators for a warm pad chord (D3, F#3, A3)
  const freqs = [146.83, 185.0, 220.0]
  const oscs = freqs.map((f) => {
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.setValueAtTime(f, ctx.currentTime)
    osc.detune.setValueAtTime(Math.random() * 6 - 3, ctx.currentTime) // slight detune
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.35, ctx.currentTime)
    osc.connect(g)
    g.connect(masterGain)
    return osc
  })

  // Slow LFO modulating pitch for movement
  const lfo = ctx.createOscillator()
  lfo.type = "sine"
  lfo.frequency.setValueAtTime(0.08, ctx.currentTime) // very slow
  const lfoGain = ctx.createGain()
  lfoGain.gain.setValueAtTime(1.5, ctx.currentTime) // subtle pitch wobble
  lfo.connect(lfoGain)
  lfoGain.connect(oscs[0].frequency)
  lfoGain.connect(oscs[2].frequency)

  oscs.forEach((o) => o.start())
  lfo.start()

  bgmNodes = { osc1: oscs[0], osc2: oscs[1], osc3: oscs[2], lfo, lfoGain, masterGain }
  bgmPlaying = true
}

/** Stop background music. */
export function stopBGM(): void {
  if (!bgmNodes) return
  try {
    bgmNodes.osc1.stop()
    bgmNodes.osc2.stop()
    bgmNodes.osc3.stop()
    bgmNodes.lfo.stop()
    bgmNodes.osc1.disconnect()
    bgmNodes.osc2.disconnect()
    bgmNodes.osc3.disconnect()
    bgmNodes.lfo.disconnect()
    bgmNodes.lfoGain.disconnect()
    bgmNodes.masterGain.disconnect()
  } catch {
    // Already stopped/disconnected
  }
  bgmNodes = null
  bgmPlaying = false
}

/** Fade background music volume in/out based on sound state. */
export function updateBGMVolume(): void {
  if (!bgmNodes) return
  const ctx = getAudioContext()
  if (!ctx) return
  const target = _soundEnabled ? _bgmVolume * 0.12 : 0  // _bgmVolume 0–1 maps to 0–0.12 gain
  bgmNodes.masterGain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.3)
  if (_soundEnabled && !bgmPlaying) {
    startBGM()
  } else if (!_soundEnabled && bgmPlaying) {
    // Fade out then stop after a moment
    setTimeout(() => {
      if (!_soundEnabled) stopBGM()
    }, 400)
  }
}
