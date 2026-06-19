"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { IntroScreen } from "@/components/intro-screen"
import { HomeScreen } from "@/components/home-screen"
import { CalibrationMap } from "@/components/calibration-map"
import { LevelScreen } from "@/components/level-screen"
import { minuPoses, TESTING_UNLOCK_ALL_LEVELS, type Level } from "@/lib/minu-config"
import { playFanfare, setSoundEnabled, startBGM, stopBGM, setBGMVolume, getBGMVolume, setSFXVolume, getSFXVolume, setVoiceVolume, getVoiceVolume, playNarratorFile, resetWelcomeSession } from "@/lib/audio"

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
  /** Which planet the map focuses on — persists across level complete / back navigation. */
  const [mapFocusLevelId, setMapFocusLevelId] = useState(1)

  // The highest level the player can enter (next after the last completed one).
  const unlockedLevel = TESTING_UNLOCK_ALL_LEVELS
    ? 5
    : completed.length === 0
      ? 1
      : Math.min(Math.max(...completed) + 1, 5)

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

    const newCompleted = completed.includes(levelId) ? completed : [...completed, levelId]
    const narratorFile =
      newCompleted.length >= 5 ? "narrator_all_complete.mp3" : "narrator_level_complete.mp3"

    let returnedToMap = false
    const returnToMap = () => {
      if (returnedToMap) return
      returnedToMap = true
      setCelebrating(false)
      setMapFocusLevelId(levelId)
      setScreen("map")
    }

    // Wait for narrator to finish — never cut off mid-sentence
    playNarratorFile(narratorFile, { onEnd: returnToMap })
    // Safety net if the file is missing or playback fails
    setTimeout(returnToMap, 15000)
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
          onResetProgress={() => {
            setCompleted([])
            setMapFocusLevelId(1)
            resetWelcomeSession()
          }}
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
          focusLevelId={mapFocusLevelId}
          onFocusChange={setMapFocusLevelId}
          onBack={() => setScreen("home")}
          onSelectLevel={(level) => {
            setMapFocusLevelId(level.id)
            setActiveLevel(level)
            setScreen("level")
          }}
        />
      )}

      {screen === "level" && activeLevel && (
        <LevelScreen
          level={activeLevel}
          onBack={() => {
            setMapFocusLevelId(activeLevel.id)
            setScreen("map")
          }}
          onComplete={handleComplete}
        />
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
          <p className="font-heading mt-4 text-2xl font-bold text-accent text-balance md:text-3xl">
            Great job! Glasses calibrated!
          </p>
        </div>
      )}
    </>
  )
}
