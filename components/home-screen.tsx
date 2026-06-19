"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Play, Film, Settings, X, Volume2, VolumeX, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Starfield } from "@/components/starfield"
import { minuPoses } from "@/lib/minu-config"
import {
  playClick,
  playNarratorFile,
  temporarilyEnableSound,
  restoreSoundState,
  unlockAudioFromGesture,
  MINU_VISITED_KEY,
  markMinuVisited,
} from "@/lib/audio"
import { LevelSlider } from "@/components/ui/slider"

type HomeScreenProps = {
  onPlay: () => void
  onWatchIntro: () => void
  soundOn: boolean
  onToggleSound: () => void
  onResetProgress: () => void
  bgmVolume: number
  onBGMVolumeChange: (v: number) => void
  sfxVolume: number
  onSFXVolumeChange: (v: number) => void
  voiceVolume: number
  onVoiceVolumeChange: (v: number) => void
}

export function HomeScreen({
  onPlay,
  onWatchIntro,
  soundOn,
  onToggleSound,
  onResetProgress,
  bgmVolume,
  onBGMVolumeChange,
  sfxVolume,
  onSFXVolumeChange,
  voiceVolume,
  onVoiceVolumeChange,
}: HomeScreenProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Play narrator welcome on mount (first-time vs returning).
  // Debounce blocks React Strict Mode's double-mount from flipping first-time → return.
  useEffect(() => {
    const now = Date.now()
    const last = Number(sessionStorage.getItem("minu-welcome-last") || 0)
    if (now - last < 1500) return
    sessionStorage.setItem("minu-welcome-last", String(now))

    const hasVisited = localStorage.getItem(MINU_VISITED_KEY) === "true"
    if (hasVisited) {
      playNarratorFile("narrator_welcome_return.mp3")
    } else {
      playNarratorFile("narrator_welcome_first_time.mp3", {
        onEnd: markMinuVisited,
      })
      setTimeout(markMinuVisited, 25000)
    }
  }, [])

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      <Starfield count={80} />

      {/* Settings button */}
      <header className="absolute right-0 top-0 z-10 px-5 py-5">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full"
          aria-label="Open settings"
          onClick={() => { playClick(); setSettingsOpen(true) }}
        >
          <Settings className="size-5" />
        </Button>
      </header>

      <div className="animate-pop-in relative z-10 flex flex-col items-center gap-6 text-center">
        <h1 className="font-arcade text-neon text-5xl font-extrabold tracking-tight text-balance md:text-7xl">
          Minu&apos;s Magic Glasses
        </h1>
        <p className="max-w-md text-lg font-semibold text-muted-foreground text-pretty md:text-xl">
          Help Minu the alien learn to see! Discover how computers see the world across 5 fun levels.
        </p>

        <div className="relative my-2">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 mx-auto my-auto size-56 rounded-full bg-primary/30 blur-3xl"
          />
          <Image
            src={minuPoses.waving || "/placeholder.svg"}
            alt="Minu the friendly alien waving"
            width={260}
            height={260}
            priority
            className="animate-float drop-shadow-2xl"
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={() => { unlockAudioFromGesture(); playClick(); onPlay() }}
            className="font-heading h-16 w-64 rounded-full text-2xl font-extrabold shadow-lg shadow-primary/30"
          >
            <Play className="size-7 fill-current" />
            Play
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => { unlockAudioFromGesture(); playClick(); onWatchIntro() }}
            className="font-heading rounded-full text-base font-bold"
          >
            <Film className="size-5" />
            Watch Intro Again
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="animate-pop-in w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-extrabold text-card-foreground">Settings</h2>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                aria-label="Close settings"
                onClick={() => { playClick(); setSettingsOpen(false) }}
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <Button
                variant="secondary"
                onClick={() => {
                  playClick()
                  if (soundOn) {
                    // Turning OFF: temporarily enable sound so the "off" clip is audible,
                    // then restore muted state after the clip has time to start
                    temporarilyEnableSound()
                    playNarratorFile("narrator_sound_off.mp3")
                    onToggleSound()
                    setTimeout(() => restoreSoundState(false), 200)
                  } else {
                    // Turning ON: play "on" clip while sound is still enabled
                    playNarratorFile("narrator_sound_on.mp3")
                    onToggleSound()
                  }
                }}
                className="font-heading h-12 justify-start rounded-2xl text-base font-bold"
              >
                {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
                Sound: {soundOn ? "On" : "Off"}
              </Button>

              {soundOn && (
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/50 p-4">
                  <LevelSlider
                    id="bgm"
                    label="Music"
                    min={0}
                    max={100}
                    value={bgmVolume}
                    color="var(--chart-2)"
                    onChange={(_id, v) => onBGMVolumeChange(v)}
                  />
                  <LevelSlider
                    id="sfx"
                    label="Effects"
                    min={0}
                    max={100}
                    value={sfxVolume}
                    color="var(--chart-1)"
                    onChange={(_id, v) => onSFXVolumeChange(v)}
                  />
                  <LevelSlider
                    id="voice"
                    label="Voice"
                    min={0}
                    max={100}
                    value={voiceVolume}
                    color="var(--chart-3)"
                    onChange={(_id, v) => onVoiceVolumeChange(v)}
                  />
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => { playClick(); onResetProgress() }}
                className="font-heading h-12 justify-start rounded-2xl text-base font-bold"
              >
                <RotateCcw className="size-5" />
                Reset Progress
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
