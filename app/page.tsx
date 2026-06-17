"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { IntroScreen } from "@/components/intro-screen"
import { HomeScreen } from "@/components/home-screen"
import { CalibrationMap } from "@/components/calibration-map"
import { LevelScreen } from "@/components/level-screen"
import { minuPoses, type Level } from "@/lib/minu-config"
import { playFanfare, setSoundEnabled, startBGM, stopBGM, setBGMVolume, getBGMVolume, setSFXVolume, getSFXVolume, setVoiceVolume, getVoiceVolume, playNarratorFile } from "@/lib/audio"

type Screen = "intro" | "home" | "map" | "level"

export default function Page() {
  const [screen, setScreen] = useState<Screen>("intro")
  const [activeLevel, setActiveLevel] = useState<Level | null>(null)
  const [completed, setCompleted] = useState<number[]>([])
  const [soundOn, setSoundOn] = useState(true)
  const [bgmVolume, setBgmVolume] = useState(() => Math.round(getBGMVolume() * 100))
  const [sfxVolume, setSfxVolume] = useState(() => Math.round(getSFXVolume() * 100))
  const [voiceVolume, setVoiceVolumeState] = useState(() => Math.round(getVoiceVolume() * 100))
  const [celebrating, setCelebrating] = useState(false)

  // The highest level the player can enter (next after the last completed one).
  const unlockedLevel = completed.length === 0 ? 1 : Math.min(Math.max(...completed) + 1, 5)

  // Sync sound toggle with audio module and start background music
  useEffect(() => { setSoundEnabled(soundOn) }, [soundOn])
  useEffect(() => {
    startBGM()
    return () => stopBGM()
  }, [])

  function handleComplete(levelId: number) {
    setCompleted((prev) => (prev.includes(levelId) ? prev : [...prev, levelId]))
    setCelebrating(true)
    playFanfare()
    // Play level-complete narrator audio (all 5 done vs single level)
    const newCompleted = completed.includes(levelId) ? completed : [...completed, levelId]
    if (newCompleted.length >= 5) {
      playNarratorFile("narrator_all_complete.mp3")
    } else {
      playNarratorFile("narrator_level_complete.mp3")
    }
    // Wait long enough for narrator audio to finish before returning to map
    setTimeout(() => {
      setCelebrating(false)
      setScreen("map")
    }, 6000)
  }

  return (
    <>
      {screen === "intro" && <IntroScreen onFinish={() => setScreen("home")} />}

      {screen === "home" && (
        <HomeScreen
          onPlay={() => setScreen("map")}
          onWatchIntro={() => setScreen("intro")}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((s) => !s)}
          onResetProgress={() => setCompleted([])}
          bgmVolume={bgmVolume}
          onBGMVolumeChange={(v) => { setBgmVolume(v); setBGMVolume(v / 100) }}
          sfxVolume={sfxVolume}
          onSFXVolumeChange={(v) => { setSfxVolume(v); setSFXVolume(v / 100) }}
          voiceVolume={voiceVolume}
          onVoiceVolumeChange={(v) => { setVoiceVolumeState(v); setVoiceVolume(v / 100) }}
        />
      )}

      {screen === "map" && (
        <CalibrationMap
          unlockedLevel={unlockedLevel}
          completed={completed}
          onBack={() => setScreen("home")}
          onSelectLevel={(level) => {
            setActiveLevel(level)
            setScreen("level")
          }}
        />
      )}

      {screen === "level" && activeLevel && (
        <LevelScreen level={activeLevel} onBack={() => setScreen("map")} onComplete={handleComplete} />
      )}

      {/* Celebration overlay */}
      {celebrating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <Image
            src={minuPoses.celebrating || "/placeholder.svg"}
            alt="Minu celebrating"
            width={240}
            height={240}
            className="animate-pop-in drop-shadow-2xl"
          />
          <p className="font-heading mt-4 text-3xl font-extrabold text-accent">Great job! Glasses calibrated!</p>
        </div>
      )}
    </>
  )
}
