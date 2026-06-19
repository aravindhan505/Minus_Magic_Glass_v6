"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MinuSpaceshipFlyer } from "@/components/minu-spaceship-flyer"
import { Starfield } from "@/components/starfield"
import { levels, planetImages, type Level } from "@/lib/minu-config"
import { playClick, playMapExplainOnce, playPlanetNarrator, stopNarrator, unlockAudioFromGesture } from "@/lib/audio"
import { cn } from "@/lib/utils"

const PLANET_COUNT = levels.length
const ORBIT_ANGLE_STEP = (2 * Math.PI) / PLANET_COUNT

type PlanetSize = "center" | "neighbor" | "distant"

const PLANET_PX: Record<PlanetSize, number> = {
  center: 280,
  neighbor: 180,
  distant: 120,
}

type CalibrationMapProps = {
  unlockedLevel: number
  completed: number[]
  focusLevelId: number
  onFocusChange: (levelId: number) => void
  onBack: () => void
  onSelectLevel: (level: Level) => void
}

function circularOffset(index: number, activeIndex: number): number {
  let offset = index - activeIndex
  const half = PLANET_COUNT / 2
  if (offset > half) offset -= PLANET_COUNT
  if (offset < -half) offset += PLANET_COUNT
  return offset
}

function orbitPosition(offset: number, radiusX: number, radiusY: number): { x: number; y: number } {
  const angle = offset * ORBIT_ANGLE_STEP
  return {
    x: Math.sin(angle) * radiusX,
    y: (1 - Math.cos(angle)) * radiusY,
  }
}

/** Horizontal spread from width; vertical arc from height — decoupled so wide screens get used. */
function orbitRadiiFromContainer(width: number, height: number): { radiusX: number; radiusY: number } {
  const widthFactor = width >= 1280 ? 0.54 : width >= 1024 ? 0.52 : width >= 768 ? 0.5 : 0.46
  const radiusX = Math.min(width * widthFactor, (width - 24) * 0.52)
  const radiusY = Math.min(height * 0.28, radiusX * 0.2)
  return { radiusX, radiusY }
}

function orbitScale(offset: number): number {
  if (offset === 0) return 1
  if (Math.abs(offset) === 1) return 0.68
  return 0.48
}

function orbitOpacity(offset: number): number {
  if (offset === 0) return 1
  if (Math.abs(offset) === 1) return 0.72
  return 0.4
}

function PlanetSphere({
  level,
  isLocked,
  isCompleted,
  isActive,
  size,
  onActivate,
  onStart,
}: {
  level: Level
  isLocked: boolean
  isCompleted: boolean
  isActive: boolean
  size: PlanetSize
  onActivate: () => void
  onStart: () => void
}) {
  const px = PLANET_PX[size]
  const bounceDelay = `${(level.id - 1) * 0.35}s`
  const src = planetImages[level.id] ?? "/placeholder.svg"

  return (
    <button
      type="button"
      disabled={isActive && isLocked}
      onClick={() => {
        unlockAudioFromGesture()
        playClick()
        if (isActive && !isLocked) onStart()
        else onActivate()
      }}
      aria-label={
        isActive
          ? isLocked
            ? `${level.title} — locked`
            : isCompleted
              ? `${level.title} — calibrated, tap to play again`
              : `${level.title} — tap to start`
          : `${level.title} — tap to travel here`
      }
      className={cn(
        "relative flex flex-col items-center outline-none",
        isActive && isLocked ? "cursor-not-allowed" : "cursor-pointer",
        !isActive && "hover:brightness-110",
      )}
    >
      <div
        className="animate-planet-bounce relative will-change-transform"
        style={{ animationDelay: bounceDelay, animationDuration: "2.8s" }}
      >
        {/* Neon glow halo */}
        <div
          aria-hidden
          className={cn(
            "animate-planet-glow pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl",
            isActive ? "size-[115%]" : "size-full opacity-70",
            isLocked && "opacity-25",
          )}
          style={{
            backgroundColor: level.color,
            boxShadow: `0 0 48px ${level.color}`,
          }}
        />

        {/* Ground shadow */}
        <div
          aria-hidden
          className={cn(
            "animate-planet-shadow-bounce pointer-events-none absolute top-[88%] left-1/2 -translate-x-1/2 rounded-[50%] blur-md",
            isActive ? "h-3 w-[55%] opacity-50" : "h-2 w-[45%] opacity-30",
          )}
          style={{ background: "oklch(0.05 0.02 290 / 80%)", animationDelay: bounceDelay }}
        />

        {/* Planet image */}
        <div
          className={cn(
            "planet-img-glow relative transition-all duration-500",
            isLocked && "opacity-50 grayscale-[40%]",
            isActive && !isLocked && "planet-img-glow-active",
          )}
          style={
            {
              "--planet-glow": level.color,
              width: px,
              height: px,
            } as React.CSSProperties
          }
        >
          <Image
            src={src}
            alt={`${level.title} planet`}
            width={px}
            height={px}
            className="size-full object-contain drop-shadow-lg"
            priority={isActive}
          />

          {isActive && (
            <span className="font-heading absolute top-1 right-1 grid size-7 place-items-center rounded-full border border-primary/30 bg-background/80 text-sm font-bold text-foreground shadow-md backdrop-blur-sm sm:size-8 sm:text-base">
              {level.id}
            </span>
          )}

          {isLocked && isActive && (
            <div className="absolute inset-0 grid place-items-center rounded-full bg-background/45 backdrop-blur-[2px]">
              <span className="inline-flex flex-col items-center gap-1 rounded-2xl bg-muted/90 px-3 py-2 shadow-lg">
                <Lock className="size-6 text-muted-foreground sm:size-7" />
                <span className="font-heading text-xs font-bold text-muted-foreground">Locked</span>
              </span>
            </div>
          )}

          {isCompleted && !isLocked && isActive && (
            <span className="absolute bottom-0 left-1/2 inline-flex -translate-x-1/2 translate-y-1 items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground shadow-lg sm:text-sm">
              <Check className="size-3.5" />
              Calibrated
            </span>
          )}
        </div>
      </div>

      {!isActive && size !== "distant" && (
        <p
          className="font-heading mt-1.5 max-w-[5.5rem] truncate text-center text-xs font-bold sm:text-sm"
          style={{ color: level.color }}
        >
          {level.title.split(" ").slice(0, 2).join(" ")}
        </p>
      )}
    </button>
  )
}

export function CalibrationMap({
  unlockedLevel,
  completed,
  focusLevelId,
  onFocusChange,
  onBack,
  onSelectLevel,
}: CalibrationMapProps) {
  const focusIndex = Math.max(0, levels.findIndex((l) => l.id === focusLevelId))
  const [activeIndex, setActiveIndex] = useState(focusIndex)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const orbitRef = useRef<HTMLDivElement>(null)
  const [mapIntroDone, setMapIntroDone] = useState(false)
  const lastPlanetNarrator = useRef<{ index: number; at: number } | null>(null)
  const [orbitRadii, setOrbitRadii] = useState({ radiusX: 320, radiusY: 72 })
  const [orbitSize, setOrbitSize] = useState({ width: 800, height: 400 })

  const activeLevel = levels[activeIndex]
  const isLocked = activeLevel.id > unlockedLevel
  const isCompleted = completed.includes(activeLevel.id)

  useEffect(() => {
    playMapExplainOnce({ onComplete: () => setMapIntroDone(true) })
  }, [])

  useEffect(() => {
    if (!mapIntroDone) return

    const now = Date.now()
    const last = lastPlanetNarrator.current
    if (last && last.index === activeIndex && now - last.at < 2000) return

    lastPlanetNarrator.current = { index: activeIndex, at: now }
    playPlanetNarrator(levels[activeIndex].id)
  }, [mapIntroDone, activeIndex])

  useEffect(() => {
    const el = orbitRef.current
    if (!el) return

    const update = () => {
      setOrbitRadii(orbitRadiiFromContainer(el.clientWidth, el.clientHeight))
      setOrbitSize({ width: el.clientWidth, height: el.clientHeight })
    }
    update()

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const idx = levels.findIndex((l) => l.id === focusLevelId)
    if (idx >= 0 && idx !== activeIndex) setActiveIndex(idx)
  }, [focusLevelId, activeIndex])

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= levels.length || index === activeIndex || isTransitioning) return
      unlockAudioFromGesture()
      playClick()
      stopNarrator()
      setIsTransitioning(true)
      setActiveIndex(index)
      onFocusChange(levels[index].id)
      setTimeout(() => setIsTransitioning(false), 650)
    },
    [activeIndex, isTransitioning, onFocusChange],
  )

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + PLANET_COUNT) % PLANET_COUNT)
  }, [activeIndex, goTo])

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % PLANET_COUNT)
  }, [activeIndex, goTo])

  const planetWaypoints = useMemo(() => {
    if (orbitSize.width < 80 || orbitSize.height < 80) return []

    return levels.map((_, index) => {
      const offset = circularOffset(index, activeIndex)
      const { x, y } = orbitPosition(offset, orbitRadii.radiusX, orbitRadii.radiusY)
      return {
        x: 50 + (x / orbitSize.width) * 100,
        y: 50 + (y / orbitSize.height) * 100,
      }
    })
  }, [activeIndex, orbitRadii, orbitSize])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      if (isTransitioning) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      e.preventDefault()
      if (e.key === "ArrowLeft") goPrev()
      else goNext()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [goPrev, goNext, isTransitioning])

  return (
    <main
      className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-background px-4 py-3 sm:px-8 sm:py-4 lg:px-12"
      tabIndex={-1}
    >
      <Starfield count={100} />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl shrink-0 items-center gap-2 sm:gap-3">
        <Button
          size="icon"
          variant="secondary"
          className="size-11 shrink-0 rounded-full sm:size-12"
          aria-label="Back to home"
          onClick={() => {
            playClick()
            onBack()
          }}
        >
          <ArrowLeft className="size-6" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl md:text-3xl">Planet Map</h1>
          <p className="text-sm font-semibold text-muted-foreground sm:text-base">
            Travel the solar system and help Minu learn to see!
          </p>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-0 w-full max-w-none flex-1 flex-col items-center gap-2 sm:gap-3">
        <div className="relative flex min-h-0 w-full flex-1 items-stretch px-14 sm:px-16 md:px-20">
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-1/2 left-0 z-20 size-14 -translate-y-1/2 rounded-full border-2 border-primary/30 shadow-lg shadow-primary/20 disabled:opacity-25 sm:size-16"
            aria-label="Previous planet (left arrow key)"
            disabled={isTransitioning}
            onClick={goPrev}
          >
            <ChevronLeft className="size-8 sm:size-9" />
          </Button>

          <div ref={orbitRef} className="relative mx-auto min-h-0 flex-1 w-full overflow-visible">
            <MinuSpaceshipFlyer
              size={92}
              planetWaypoints={planetWaypoints}
              focusPlanetIndex={activeIndex}
            />
            {levels.map((level, index) => {
              const offset = circularOffset(index, activeIndex)
              const { x, y } = orbitPosition(offset, orbitRadii.radiusX, orbitRadii.radiusY)

              const planetLocked = level.id > unlockedLevel
              const planetDone = completed.includes(level.id)
              const isActive = offset === 0
              const size: PlanetSize =
                offset === 0 ? "center" : Math.abs(offset) === 1 ? "neighbor" : "distant"

              return (
                <div
                  key={level.id}
                  className="absolute top-1/2 left-1/2 will-change-transform"
                  style={{
                    zIndex: 10 - Math.abs(offset),
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${orbitScale(offset)})`,
                    opacity: orbitOpacity(offset),
                    transition: "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease",
                  }}
                >
                  <PlanetSphere
                    level={level}
                    isLocked={planetLocked}
                    isCompleted={planetDone}
                    isActive={isActive}
                    size={size}
                    onActivate={() => goTo(index)}
                    onStart={() => onSelectLevel(level)}
                  />
                </div>
              )
            })}
          </div>

          <Button
            size="icon"
            variant="secondary"
            className="absolute top-1/2 right-0 z-20 size-14 -translate-y-1/2 rounded-full border-2 border-primary/30 shadow-lg shadow-primary/20 disabled:opacity-25 sm:size-16"
            aria-label="Next planet (right arrow key)"
            disabled={isTransitioning}
            onClick={goNext}
          >
            <ChevronRight className="size-8 sm:size-9" />
          </Button>
        </div>

        <div className="flex w-full shrink-0 flex-col items-center gap-2 pb-2 sm:gap-2.5 sm:pb-3">
          <div className="w-full max-w-lg px-2 text-center">
            <p className="font-heading text-xs font-bold tracking-wide text-secondary uppercase sm:text-sm">
              {activeLevel.subtitle}
            </p>
            <h2 className="font-heading text-lg font-bold text-foreground text-balance sm:text-2xl">
              {activeLevel.title}
            </h2>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-muted-foreground text-pretty sm:text-base">
              {activeLevel.description}
            </p>

            {isLocked ? (
              <p className="font-heading mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-bold text-muted-foreground sm:mt-2 sm:px-4 sm:py-2">
                <Lock className="size-4" />
                Finish earlier planets first!
              </p>
            ) : isCompleted ? (
              <p className="font-heading mt-1.5 text-sm font-bold text-accent sm:mt-2 sm:text-base">
                Calibrated! Tap the planet to play again.
              </p>
            ) : (
              <p className="font-heading mt-1.5 text-sm font-bold text-primary sm:mt-2 sm:text-base">
                Tap the planet to help Minu!
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-3 py-1" role="tablist" aria-label="Planet navigation">
              {levels.map((level, index) => {
                const dotLocked = level.id > unlockedLevel
                const dotDone = completed.includes(level.id)
                return (
                  <button
                    key={level.id}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    aria-label={`Planet ${level.id}: ${level.title}`}
                    disabled={isTransitioning}
                    onClick={() => goTo(index)}
                    className={cn(
                      "relative size-4 rounded-full transition-all md:size-5",
                      index === activeIndex
                        ? "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "opacity-60 hover:opacity-100",
                    )}
                    style={{ backgroundColor: level.color }}
                  >
                    {dotLocked && (
                      <span className="absolute -top-1 -right-1 grid size-3 place-items-center rounded-full bg-muted">
                        <Lock className="size-2 text-muted-foreground" />
                      </span>
                    )}
                    {dotDone && !dotLocked && (
                      <span className="absolute -right-1 -bottom-1 grid size-3 place-items-center rounded-full bg-accent">
                        <Check className="size-2 text-accent-foreground" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-xs font-semibold text-muted-foreground/75">
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">←</kbd>{" "}
              <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">→</kbd> to
              navigate
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}