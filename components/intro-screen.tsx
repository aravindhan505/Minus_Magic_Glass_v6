"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Glasses, Sparkles, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { introVideo, minuPoses } from "@/lib/minu-config"
import { Starfield } from "@/components/starfield"
import { playClick, unlockAudioFromGesture } from "@/lib/audio"

export function IntroScreen({ onFinish }: { onFinish: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [muted, setMuted] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Try to autoplay with sound. If the browser blocks unmuted autoplay,
  // fall back to muted playback so the video still starts.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    const tryPlay = video.play()
    if (tryPlay) {
      tryPlay.catch(() => {
        setMuted(true)
        video.muted = true
        video.play().catch(() => {})
      })
    }
  }, [])

  const clearStartTimer = useCallback(() => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current)
      startTimerRef.current = null
    }
  }, [])

  // Safety net ONLY for a video that never starts. Once playback begins this is
  // cleared, so a playing video is always allowed to finish (audio included).
  useEffect(() => {
    startTimerRef.current = setTimeout(() => {
      setVideoFailed(true)
      setIsLoading(false)
    }, introVideo.fallbackSeconds * 1000)
    return clearStartTimer
  }, [clearStartTimer])

  // Called once the video actually begins to play.
  const handlePlaying = useCallback(() => {
    clearStartTimer()
    setIsLoading(false)
  }, [clearStartTimer])

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4">
      <Starfield count={70} />

      <div className="animate-pop-in relative z-10 flex w-full max-w-4xl flex-col items-center gap-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          {!videoFailed ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={introVideo.src}
              autoPlay
              muted={muted}
              playsInline
              onPlaying={handlePlaying}
              onCanPlay={handlePlaying}
              onWaiting={() => setIsLoading(true)}
              onEnded={onFinish}
              onError={() => {
                setVideoFailed(true)
                setIsLoading(false)
              }}
            />
          ) : (
            // Fallback shown only if a real video can't load.
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
              <Image
                src={minuPoses.waving || "/placeholder.svg"}
                alt="Minu the alien waving hello"
                width={180}
                height={180}
                className="animate-float drop-shadow-2xl"
              />
              <div className="px-6">
                <p className="font-heading text-2xl font-bold text-foreground text-balance">
                  Drop your intro video at{" "}
                  <code className="rounded-md bg-muted px-2 py-0.5 text-secondary">public/Intro.mp4</code>
                </p>
                <p className="mt-2 text-sm text-muted-foreground text-pretty">
                  Until then, tap Skip to meet Minu and start calibrating!
                </p>
              </div>
            </div>
          )}

          {/* Magic Glasses loading animation while the video buffers */}
          {isLoading && !videoFailed && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-7 bg-card">
              <div className="relative animate-float">
                <Glasses className="size-24 text-secondary drop-shadow-2xl" strokeWidth={1.75} />
                <Sparkles className="absolute -right-4 -top-3 size-8 animate-twinkle text-primary" />
                <Sparkles
                  className="absolute -left-3 bottom-0 size-5 animate-twinkle text-accent"
                  style={{ animationDelay: "0.7s" }}
                />
              </div>
              <div className="text-center">
                <p className="font-heading text-xl font-bold text-foreground">
                  Polishing Minu&apos;s Magic Glasses
                </p>
                <div className="mt-4 flex items-center justify-center gap-2" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-3 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="sr-only">Loading intro video</span>
              </div>
            </div>
          )}

          {/* Mute / unmute */}
          {!videoFailed && !isLoading && (
            <Button
              size="icon"
              variant="secondary"
              onClick={() => { playClick(); setMuted((m) => !m) }}
              aria-label={muted ? "Unmute video" : "Mute video"}
              className="absolute bottom-4 left-4 rounded-full"
            >
              {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
            </Button>
          )}
        </div>

        <Button
          size="lg"
          onClick={() => { unlockAudioFromGesture(); playClick(); onFinish() }}
          className="font-heading rounded-full px-8 text-lg font-bold"
        >
          <SkipForward className="size-5" />
          Skip Intro
        </Button>
      </div>
    </main>
  )
}
