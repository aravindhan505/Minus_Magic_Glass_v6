"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { minuSpaceship } from "@/lib/minu-config"
import { cn } from "@/lib/utils"

type SmokePuff = {
  id: number
  createdAt: number
  leftPct: number
  drift: number
  scale: number
}

type MinuSpaceshipProps = {
  size?: number
  className?: string
}

/**
 * Compact Minu in a hovering spaceship — for level headers (top-right).
 * Emits occasional engine smoke puffs for a gentle hover effect.
 */
export function MinuSpaceship({ size = 64, className }: MinuSpaceshipProps) {
  const smokeSize = Math.max(7, size * 0.11)
  const [puffs, setPuffs] = useState<SmokePuff[]>([])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>

    const schedulePuff = () => {
      const delay = 900 + Math.random() * 1400
      timeoutId = setTimeout(() => {
        setPuffs((prev) => {
          const now = Date.now()
          const next: SmokePuff = {
            id: now + Math.random(),
            createdAt: now,
            leftPct: 28 + Math.random() * 44,
            drift: (Math.random() - 0.5) * 16,
            scale: 0.55 + Math.random() * 0.55,
          }
          return [...prev.filter((p) => now - p.createdAt < 2000), next].slice(-5)
        })
        schedulePuff()
      }, delay)
    }

    schedulePuff()
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Engine smoke — below ship, rises and fades */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 overflow-visible">
        {puffs.map((puff) => (
          <span
            key={puff.id}
            className="animate-spaceship-smoke absolute bottom-0 block rounded-full bg-gradient-to-t from-slate-400/50 to-slate-200/25 blur-[2px]"
            style={
              {
                left: `${puff.leftPct}%`,
                width: smokeSize * puff.scale,
                height: smokeSize * puff.scale,
                "--smoke-drift": `${puff.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="animate-spaceship-hover relative z-10 size-full">
        <Image
          src={minuSpaceship}
          alt=""
          width={size}
          height={size}
          className="size-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
          draggable={false}
        />
      </div>
    </div>
  )
}