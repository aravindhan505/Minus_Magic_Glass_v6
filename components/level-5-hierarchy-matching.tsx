"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Layers,
  Sparkles,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MinuAvatar } from "@/components/minu-avatar"
import { MinuSpaceship } from "@/components/minu-spaceship"
import { Starfield } from "@/components/starfield"
import { isNarratorPlaying, playClick, playError, playFanfare } from "@/lib/audio"
import { playLevel5Narrator, playLevel5Then } from "@/lib/level5-audio"
import type { MinuPose } from "@/lib/minu-config"
import {
  HIERARCHY_PHASES,
  MACRO_BODY_PHASE,
  hierarchyAssetSrc,
  type HierarchyLayerPart,
  type HierarchyPartId,
  type HierarchyPhaseConfig,
} from "@/lib/level5-hierarchy"
import { cn } from "@/lib/utils"

type Props = {
  onComplete: () => void
  onBack: () => void
}

type DragState = {
  partId: HierarchyPartId
  pointerId: number
  ghostSize: number
  offsetX: number
  offsetY: number
  file: string
  label: string
}

function shuffleParts(parts: HierarchyLayerPart[]): HierarchyLayerPart[] {
  const copy = [...parts]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function paletteLayout(partCount: number): { cols: number; rows: number } {
  if (partCount <= 4) return { cols: 2, rows: 2 }
  return { cols: 3, rows: 2 }
}

function LayerStack({
  phase,
  revealed,
  sortedPlacedParts,
}: {
  phase: HierarchyPhaseConfig
  revealed: boolean
  sortedPlacedParts: HierarchyLayerPart[]
}) {
  return (
    <div className="relative size-full overflow-hidden bg-transparent">
      {revealed ? (
        <Image
          src={hierarchyAssetSrc(phase.revealFile)}
          alt="Complete"
          fill
          className="animate-pop-in object-contain object-center"
          sizes="(max-width: 768px) 55vw, 480px"
          priority
        />
      ) : (
        sortedPlacedParts.map((part) => (
          <div
            key={part.id}
            className="absolute inset-0 bg-transparent"
            style={{ zIndex: part.zIndex }}
          >
            <Image
              src={hierarchyAssetSrc(part.file)}
              alt={part.label}
              fill
              className="object-contain object-center"
              sizes="(max-width: 768px) 55vw, 480px"
            />
          </div>
        ))
      )}
    </div>
  )
}

function DragGhost({
  drag,
  x,
  y,
}: {
  drag: DragState
  x: number
  y: number
}) {
  return (
    <div
      className="pointer-events-none fixed z-[300] touch-none select-none"
      style={{
        left: 0,
        top: 0,
        width: drag.ghostSize,
        height: drag.ghostSize,
        transform: `translate3d(${x - drag.offsetX}px, ${y - drag.offsetY}px, 0)`,
        willChange: "transform",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hierarchyAssetSrc(drag.file)}
        alt={drag.label}
        draggable={false}
        className="size-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
      />
    </div>
  )
}

function PhaseAssembly({
  phase,
  phaseIndex,
  onPhaseComplete,
  onBack,
}: {
  phase: HierarchyPhaseConfig
  phaseIndex: number
  onPhaseComplete: () => void
  onBack: () => void
}) {
  const dropRef = useRef<HTMLDivElement>(null)
  const paletteParts = useMemo(() => shuffleParts(phase.parts), [phase.id])
  const { cols: paletteCols, rows: paletteRows } = paletteLayout(phase.parts.length)

  const [placed, setPlaced] = useState<Set<HierarchyPartId>>(new Set())
  const [dragging, setDragging] = useState<DragState | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const dragPosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [statusText, setStatusText] = useState(phase.kidInstruction)
  const [minuPose, setMinuPose] = useState<MinuPose>("pointing")
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phaseIntroPlayed = useRef(false)
  const idleRemindersPlayed = useRef(0)
  const phaseCompleting = useRef(false)

  const sortedPlacedParts = useMemo(
    () =>
      phase.parts
        .filter((p) => placed.has(p.id))
        .sort((a, b) => a.zIndex - b.zIndex),
    [phase.parts, placed],
  )

  const allPlaced = placed.size === phase.parts.length

  const scheduleIdleReminder = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      if (revealed || allPlaced || idleRemindersPlayed.current >= 1) return
      if (isNarratorPlaying()) return
      idleRemindersPlayed.current += 1
      playLevel5Narrator(
        phase.id === "macro"
          ? "narrator_level5_macro_instruction.mp3"
          : "narrator_level5_micro_instruction.mp3",
      )
    }, 8000)
  }, [phase.id, revealed, allPlaced])

  useEffect(() => {
    if (phaseIntroPlayed.current) return
    phaseIntroPlayed.current = true

    const phaseClip =
      phase.id === "macro"
        ? "narrator_level5_macro_intro.mp3"
        : "narrator_level5_micro_intro.mp3"

    playLevel5Narrator(phaseClip)

    scheduleIdleReminder()
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [phase.id, scheduleIdleReminder])

  useEffect(() => {
    if (revealed) return
    idleRemindersPlayed.current = 0
    scheduleIdleReminder()
  }, [placed.size, revealed, scheduleIdleReminder])

  const tryPlace = useCallback(
    (partId: HierarchyPartId, clientX: number, clientY: number) => {
      const drop = dropRef.current
      if (!drop) return false

      const rect = drop.getBoundingClientRect()
      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom

      if (!inside) {
        setStatusText("Drop the piece on the big silhouette on the left!")
        if (!isNarratorPlaying()) {
          playLevel5Narrator("narrator_level5_drop_miss.mp3")
        }
        return false
      }

      if (placed.has(partId)) return false

      playClick()
      const next = new Set(placed).add(partId)
      setPlaced(next)
      setMinuPose("celebrating")

      const part = phase.parts.find((p) => p.id === partId)
      setStatusText(`${part?.label ?? "Part"} placed! Keep going!`)
      if (Math.random() < 0.5 && !isNarratorPlaying()) {
        playLevel5Narrator("narrator_level5_part_placed.mp3")
      }

      if (next.size === phase.parts.length && !phaseCompleting.current) {
        phaseCompleting.current = true
        setRevealed(true)
        setMinuPose("celebrating")
        setStatusText(phase.successMessage)
        playFanfare()
        const completeClip =
          phase.id === "macro"
            ? "narrator_level5_macro_complete.mp3"
            : "narrator_level5_micro_complete.mp3"
        playLevel5Then(completeClip, onPhaseComplete)
      }
      return true
    },
    [placed, phase, onPhaseComplete],
  )

  const scheduleDragPaint = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      setDragPos({ ...dragPosRef.current })
    })
  }, [])

  const endDragSession = useCallback(
    (partId: HierarchyPartId, clientX: number, clientY: number) => {
      const ok = tryPlace(partId, clientX, clientY)
      if (!ok && dropRef.current) {
        const rect = dropRef.current.getBoundingClientRect()
        const wasInside =
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        if (!wasInside) playError()
      }
      setDragging(null)
    },
    [tryPlace],
  )

  useEffect(() => {
    if (!dragging) return

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== dragging.pointerId) return
      dragPosRef.current = { x: e.clientX, y: e.clientY }
      scheduleDragPaint()
    }

    const onEnd = (e: PointerEvent) => {
      if (e.pointerId !== dragging.pointerId) return
      dragPosRef.current = { x: e.clientX, y: e.clientY }
      endDragSession(dragging.partId, e.clientX, e.clientY)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerup", onEnd)
    window.addEventListener("pointercancel", onEnd)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onEnd)
      window.removeEventListener("pointercancel", onEnd)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [dragging, scheduleDragPaint, endDragSession])

  const startDrag = (part: HierarchyLayerPart, e: React.PointerEvent) => {
    if (placed.has(part.id) || revealed) return
    e.preventDefault()

    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const ghostSize = rect.width

    setDragging({
      partId: part.id,
      pointerId: e.pointerId,
      ghostSize,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      file: part.file,
      label: part.label,
    })
    dragPosRef.current = { x: e.clientX, y: e.clientY }
    setDragPos({ x: e.clientX, y: e.clientY })
    playClick()
    setMinuPose("thinking")
  }

  return (
    <main className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      <Starfield count={50} />

      {dragging && <DragGhost drag={dragging} x={dragPos.x} y={dragPos.y} />}

      <header className="relative z-10 flex shrink-0 items-center gap-2 border-b border-primary/15 px-3 py-2 sm:px-4">
        <Button
          size="icon"
          variant="secondary"
          className="size-9 shrink-0 rounded-full"
          aria-label="Back to map"
          onClick={() => {
            playClick()
            onBack()
          }}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="font-heading flex items-center gap-1 text-[10px] font-bold text-secondary uppercase sm:text-xs">
            <Layers className="size-3" />
            Part 2 · {phase.id === "macro" ? "Macro Body" : "Micro Head"} · {phaseIndex + 1}/2
          </p>
          <h1 className="font-heading truncate text-sm font-extrabold sm:text-lg">
            {phase.kidTitle}
          </h1>
        </div>
        <MinuSpaceship size={60} className="sm:hidden" />
        <MinuSpaceship size={76} className="hidden sm:block" />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-row gap-2 overflow-hidden px-2 py-2 sm:gap-4 sm:px-4 sm:py-3">
        {/* Left: silhouette */}
        <section className="flex min-h-0 min-w-0 flex-[3] flex-col gap-1.5 sm:gap-2">
          <div
            className={cn(
              "shrink-0 rounded-xl border-2 px-3 py-1.5 backdrop-blur-sm sm:py-2",
              revealed
                ? "border-accent/50 bg-accent/10"
                : "border-primary/35 bg-card/75",
            )}
          >
            <p className="font-heading text-[11px] font-bold leading-snug text-foreground sm:text-sm">
              {statusText}
            </p>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div
              ref={dropRef}
              className={cn(
                "relative mx-auto aspect-square h-full max-h-full w-auto max-w-full rounded-2xl border-2 bg-card/40 sm:rounded-3xl",
                revealed ? "border-accent shadow-lg shadow-accent/25" : "border-primary/35",
                dragging && "ring-2 ring-secondary/50",
              )}
            >
              {!revealed && (
                <div className="pointer-events-none absolute inset-3 z-0 sm:inset-4">
                  <div className="relative size-full bg-transparent">
                    <Image
                      src={hierarchyAssetSrc(phase.silhouetteFile)}
                      alt=""
                      fill
                      className="object-contain object-center opacity-45"
                      sizes="(max-width: 768px) 55vw, 480px"
                      priority
                    />
                  </div>
                </div>
              )}

              <div className="absolute inset-3 z-10 bg-transparent sm:inset-4">
                <LayerStack
                  phase={phase}
                  revealed={revealed}
                  sortedPlacedParts={sortedPlacedParts}
                />
              </div>

              {revealed && (
                <div className="pointer-events-none absolute -right-1 -top-1 z-20 grid size-9 place-items-center rounded-full bg-accent shadow-md sm:size-10">
                  <Sparkles className="size-5 text-accent-foreground" />
                </div>
              )}

              {!allPlaced && !revealed && (
                <p className="absolute bottom-2 left-0 right-0 z-0 text-center font-heading text-[9px] font-bold text-muted-foreground sm:text-[10px]">
                  Drop parts here
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-center gap-1.5 py-0.5">
            {phase.parts.map((p) => (
              <Star
                key={p.id}
                className={cn(
                  "size-3.5 sm:size-4",
                  placed.has(p.id) ? "fill-secondary text-secondary" : "text-muted/35",
                )}
              />
            ))}
            <span className="ml-1 font-heading text-[10px] font-bold text-muted-foreground sm:text-xs">
              {placed.size}/{phase.parts.length}
            </span>
          </div>
        </section>

        {/* Right: transparent draggable parts — grid cells cap size per phase */}
        <section className="flex min-h-0 min-w-0 flex-[2] flex-col gap-1 overflow-hidden border-l border-primary/15 pl-2 sm:gap-2 sm:pl-4">
          <p className="shrink-0 text-center font-heading text-[9px] font-bold text-secondary uppercase sm:text-[10px]">
            Drag onto silhouette →
          </p>

          <div
            className="grid min-h-0 flex-1 gap-1 overflow-hidden sm:gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${paletteCols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${paletteRows}, minmax(0, 1fr))`,
            }}
          >
            {paletteParts.map((part) => {
              const isPlaced = placed.has(part.id)
              const isDragging = dragging?.partId === part.id

              return (
                <div
                  key={part.id}
                  className="flex min-h-0 min-w-0 items-center justify-center p-0.5"
                >
                  <div
                    role="button"
                    tabIndex={isPlaced ? -1 : 0}
                    aria-label={`Drag ${part.label}`}
                    aria-disabled={isPlaced || revealed}
                    onPointerDown={(e) => startDrag(part, e)}
                    className={cn(
                      "relative aspect-square max-h-full max-w-full touch-none select-none",
                      isPlaced ? "size-[70%]" : "size-full",
                      isPlaced && "pointer-events-none opacity-35",
                      !isPlaced && !isDragging && "cursor-grab active:cursor-grabbing",
                      isDragging && "opacity-25",
                    )}
                  >
                    {!isPlaced ? (
                      <>
                        <div
                          className={cn(
                            "absolute inset-0 rounded-lg border border-dashed bg-transparent",
                            isDragging
                              ? "border-secondary/30"
                              : "border-primary/20 hover:border-secondary/50",
                          )}
                        />
                        <Image
                          src={hierarchyAssetSrc(part.file)}
                          alt={part.label}
                          fill
                          className="object-contain p-0.5"
                          sizes="(max-width: 768px) 18vw, 120px"
                          draggable={false}
                        />
                        <span className="absolute inset-x-0 bottom-0 truncate px-0.5 text-center font-heading text-[8px] font-bold leading-tight text-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-[9px]">
                          {part.label}
                        </span>
                      </>
                    ) : (
                      <div className="grid size-full place-items-center">
                        <Check className="size-5 text-accent sm:size-6" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}

export default function Level5HierarchyMatching({ onComplete, onBack }: Props) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [showTransition, setShowTransition] = useState(false)

  const phase = HIERARCHY_PHASES[phaseIndex]

  const handlePhaseComplete = () => {
    if (phase.id === "macro") {
      playLevel5Then("narrator_level5_macro_transition.mp3", () => {
        setShowTransition(true)
      })
      return
    }
    onComplete()
  }

  const handleContinueToMicro = () => {
    playClick()
    setShowTransition(false)
    setPhaseIndex(1)
  }

  if (showTransition) {
    return (
      <main className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4">
        <Starfield count={50} />
        <div className="relative z-10 flex max-w-sm flex-col items-center gap-4 rounded-3xl border-2 border-accent/50 bg-card/90 p-5 text-center shadow-lg sm:gap-5 sm:p-7">
          <div className="text-4xl sm:text-5xl">🎉</div>
          <h2 className="font-heading text-lg font-extrabold text-accent sm:text-xl">
            Body Complete!
          </h2>
          <p className="font-heading text-xs font-bold leading-relaxed text-foreground sm:text-sm">
            {MACRO_BODY_PHASE.transitionMessage}
          </p>
          <MinuAvatar pose="celebrating" size={72} />
          <Button
            onClick={handleContinueToMicro}
            className="font-heading gap-2 rounded-full px-6 text-sm font-extrabold sm:px-8 sm:text-base"
          >
            Build the Head <ArrowRight className="size-4" />
          </Button>
        </div>
      </main>
    )
  }

  return (
    <PhaseAssembly
      key={phase.id}
      phase={phase}
      phaseIndex={phaseIndex}
      onPhaseComplete={handlePhaseComplete}
      onBack={onBack}
    />
  )
}