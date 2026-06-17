"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { minuPoses, type MinuPose } from "@/lib/minu-config"
import { cn } from "@/lib/utils"

type MinuAvatarProps = {
  /** Current pose key */
  pose: MinuPose
  /** Size of the avatar in pixels (default: 120) */
  size?: number
  /** Position class for floating Minu on screen */
  className?: string
}

/**
 * Minu character avatar with pose switching.
 * Handles smooth transitions between poses.
 */
export function MinuAvatar({ pose, size = 120, className }: MinuAvatarProps) {
  const [currentPose, setCurrentPose] = useState(pose)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (pose !== currentPose) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setCurrentPose(pose)
        setIsTransitioning(false)
      }, 150) // Short transition delay
      return () => clearTimeout(timer)
    }
  }, [pose, currentPose])

  const src = minuPoses[currentPose] || minuPoses.idle

  return (
    <div className={className}>
      <Image
        src={src || "/placeholder.svg"}
        alt={`Minu - ${currentPose}`}
        width={size}
        height={size}
        className={cn(
          "drop-shadow-2xl transition-all duration-200",
          isTransitioning && "scale-95 opacity-60",
          !isTransitioning && "animate-float",
        )}
        priority={false}
      />
    </div>
  )
}

// ─── Helper: determine Minu's reaction pose from slider values ──

export function getReactionPose(
  sliders: { id: string; value: number; min: number; max: number }[],
  reactions: { trigger: string; sliderId?: string; pose: MinuPose; text?: string }[],
): { pose: MinuPose; text?: string } | null {
  // Check extreme values first (most dramatic)
  for (const reaction of reactions) {
    if (reaction.trigger === "slider_extreme_min") {
      const slider = sliders.find((s) => s.id === reaction.sliderId)
      if (slider && slider.value <= slider.min + (slider.max - slider.min) * 0.1) {
        return { pose: reaction.pose, text: reaction.text }
      }
    }
    if (reaction.trigger === "slider_extreme_max") {
      const slider = sliders.find((s) => s.id === reaction.sliderId)
      if (slider && slider.value >= slider.max - (slider.max - slider.min) * 0.1) {
        return { pose: reaction.pose, text: reaction.text }
      }
    }
  }

  // Check slider_change (generic reaction)
  for (const reaction of reactions) {
    if (reaction.trigger === "slider_change") {
      return { pose: reaction.pose, text: reaction.text }
    }
  }

  return null
}
