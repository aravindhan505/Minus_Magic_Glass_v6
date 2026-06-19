"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MinuSpaceship } from "@/components/minu-spaceship"

type FlyPoint = {
  x: number
  y: number
  rotate: number
}

export type PlanetWaypoint = {
  x: number
  y: number
}

type MinuSpaceshipFlyerProps = {
  size?: number
  planetWaypoints?: PlanetWaypoint[]
  /** When the focused planet changes, Minu sometimes swoops toward it. */
  focusPlanetIndex?: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function rotateForLeg(from: FlyPoint, to: { x: number; y: number }): number {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const bank = clamp(dx * 0.55 + (Math.random() - 0.5) * 8, -24, 24)
  const pitch = clamp(-dy * 0.12, -10, 10)
  return bank + pitch
}

function durationForLeg(from: FlyPoint, to: FlyPoint): number {
  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  const base = 2800 + distance * 55
  return clamp(base + Math.random() * 1800, 3200, 9000)
}

/**
 * Minu cruises between planets on the Planet Map —
 * sells the "flying through the solar system" vibe.
 */
export function MinuSpaceshipFlyer({
  size = 88,
  planetWaypoints = [],
  focusPlanetIndex = 0,
}: MinuSpaceshipFlyerProps) {
  const boundsRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef<FlyPoint>({ x: 50, y: 62, rotate: -4 })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const waypointsRef = useRef(planetWaypoints)
  const focusRef = useRef(focusPlanetIndex)
  const pendingFocusSwoopRef = useRef(false)

  const [pos, setPos] = useState<FlyPoint>(positionRef.current)
  const [flightMs, setFlightMs] = useState(5500)
  const [reducedMotion, setReducedMotion] = useState(false)

  waypointsRef.current = planetWaypoints

  const pickOrbitWander = useCallback(
    (width: number, height: number): { x: number; y: number } => {
      const padX = size * 0.55 + 16
      const padY = size * 0.55 + 16
      const minX = (padX / width) * 100
      const maxX = 100 - minX
      const minY = (padY / height) * 100
      const maxY = 100 - minY

      let x = minX + Math.random() * (maxX - minX)
      let y = minY + Math.random() * (maxY - minY)

      // Stay in the orbit lane — avoid dead center so she flies *between* planets
      if (Math.hypot(x - 50, y - 50) < 10) {
        x = x < 50 ? minX + 6 : maxX - 6
        y = clamp(y, minY + 4, maxY - 4)
      }

      return { x, y }
    },
    [size],
  )

  const pickDestination = useCallback(
    (width: number, height: number, from: FlyPoint, preferFocus = false): FlyPoint => {
      const waypoints = waypointsRef.current
      const padX = ((size * 0.55 + 16) / width) * 100
      const padY = ((size * 0.55 + 16) / height) * 100
      const clampPct = (x: number, y: number) => ({
        x: clamp(x, padX, 100 - padX),
        y: clamp(y, padY, 100 - padY),
      })

      let target: { x: number; y: number }

      if (preferFocus && waypoints.length > 0) {
        const focus = waypoints[focusRef.current] ?? waypoints[0]
        target = {
          x: focus.x + (Math.random() - 0.5) * 14,
          y: focus.y + (Math.random() - 0.5) * 10,
        }
      } else if (waypoints.length >= 2) {
        const roll = Math.random()

        if (roll < 0.42) {
          const planet = waypoints[Math.floor(Math.random() * waypoints.length)]
          target = {
            x: planet.x + (Math.random() - 0.5) * 16,
            y: planet.y + (Math.random() - 0.5) * 12,
          }
        } else if (roll < 0.72) {
          const a = waypoints[Math.floor(Math.random() * waypoints.length)]
          let b = waypoints[Math.floor(Math.random() * waypoints.length)]
          if (a === b && waypoints.length > 1) {
            b = waypoints[(waypoints.indexOf(a) + 1 + Math.floor(Math.random() * (waypoints.length - 1))) % waypoints.length]
          }
          const t = 0.35 + Math.random() * 0.35
          target = {
            x: a.x + (b.x - a.x) * t + (Math.random() - 0.5) * 12,
            y: a.y + (b.y - a.y) * t + (Math.random() - 0.5) * 10,
          }
        } else if (roll < 0.88) {
          const a = waypoints[Math.floor(Math.random() * waypoints.length)]
          const b = waypoints[Math.floor(Math.random() * waypoints.length)]
          target = {
            x: (a.x + b.x) / 2 + (Math.random() - 0.5) * 14,
            y: (a.y + b.y) / 2 + (Math.random() - 0.5) * 10,
          }
        } else {
          target = pickOrbitWander(width, height)
        }
      } else {
        target = pickOrbitWander(width, height)
      }

      const clamped = clampPct(target.x, target.y)
      return { ...clamped, rotate: rotateForLeg(from, clamped) }
    },
    [pickOrbitWander, size],
  )

  const scheduleNextLeg = useCallback(
    (preferFocus = false) => {
      const bounds = boundsRef.current
      if (!bounds || reducedMotion) return

      const { width, height } = bounds.getBoundingClientRect()
      if (width < 80 || height < 80) return

      const from = positionRef.current
      const next = pickDestination(width, height, from, preferFocus)
      const duration = durationForLeg(from, next)
      const pause = preferFocus ? 400 : 600 + Math.random() * 900

      positionRef.current = next
      setFlightMs(duration)
      setPos(next)

      timerRef.current = setTimeout(() => {
        pendingFocusSwoopRef.current = false
        scheduleNextLeg(false)
      }, duration + pause)
    },
    [pickDestination, reducedMotion],
  )

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (focusRef.current === focusPlanetIndex) return
    focusRef.current = focusPlanetIndex

    if (reducedMotion || planetWaypoints.length === 0) return

    pendingFocusSwoopRef.current = true
    if (timerRef.current) clearTimeout(timerRef.current)
    scheduleNextLeg(Math.random() < 0.55)
  }, [focusPlanetIndex, planetWaypoints.length, reducedMotion, scheduleNextLeg])

  useEffect(() => {
    const bounds = boundsRef.current
    if (!bounds) return

    const start = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (!reducedMotion && !pendingFocusSwoopRef.current) scheduleNextLeg(false)
    }

    start()
    const observer = new ResizeObserver(start)
    observer.observe(bounds)
    return () => {
      observer.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [scheduleNextLeg, reducedMotion])

  return (
    <div ref={boundsRef} className="pointer-events-none absolute inset-0 z-[8] overflow-visible">
      <div
        className="absolute will-change-[left,top,transform]"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: `translate(-50%, -50%) rotate(${pos.rotate}deg)`,
          transition: reducedMotion
            ? "none"
            : `left ${flightMs}ms cubic-bezier(0.42, 0, 0.2, 1), top ${flightMs}ms cubic-bezier(0.42, 0, 0.2, 1), transform ${flightMs}ms cubic-bezier(0.42, 0, 0.2, 1)`,
        }}
      >
        <MinuSpaceship size={size} className="drop-shadow-[0_0_18px_rgba(99,102,241,0.35)]" />
      </div>
    </div>
  )
}