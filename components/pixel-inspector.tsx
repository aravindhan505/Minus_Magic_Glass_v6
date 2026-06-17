"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { playInspect } from "@/lib/audio"

type PixelInspectorProps = {
  /** Image source path */
  src: string
  /** Alt text */
  alt: string
  /** Called when a pixel is tapped, with the pixel data */
  onPixelTap?: (pixel: PixelData) => void
  className?: string
}

export type PixelData = {
  x: number
  y: number
  r: number
  g: number
  b: number
  a: number
  /** Grayscale brightness value (0-255) */
  brightness: number
}

/**
 * Tap-to-inspect pixel values on an image.
 * Renders the image on a hidden canvas, then lets kids tap to see pixel data.
 */
export function PixelInspector({
  src,
  alt,
  onPixelTap,
  className,
}: PixelInspectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pixelInfo, setPixelInfo] = useState<PixelData | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  // Draw the image onto the hidden canvas so we can read pixel data
  const imgRef = useRef<HTMLImageElement | null>(null)

  const handleImageLoad = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (ctx) {
      ctx.drawImage(img, 0, 0)
    }
  }, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) return

      const rect = container.getBoundingClientRect()
      const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width)
      const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height)

      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return

      const imageData = ctx.getImageData(x, y, 1, 1)
      const [r, g, b, a] = imageData.data
      const brightness = Math.round((r + g + b) / 3)

      const pixel: PixelData = { x, y, r, g, b, a, brightness }
      setPixelInfo(pixel)
      setShowInfo(true)
      onPixelTap?.(pixel)

      // Play inspect sound
      playInspect()

      // Auto-hide after 3 seconds
      setTimeout(() => setShowInfo(false), 3000)
    },
    [onPixelTap],
  )

  return (
    <div className={cn("relative select-none", className)}>
      {/* Hidden canvas for pixel reading */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Visible image with tap handler */}
      <div
        ref={containerRef}
        className="relative cursor-crosshair touch-none"
        onPointerUp={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="w-full rounded-xl object-cover"
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
        />

        {/* Tap instruction overlay (shown briefly) */}
        {!showInfo && !pixelInfo && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-background/30">
            <span className="font-heading text-sm font-bold text-foreground/80">
              👆 Tap anywhere to inspect pixels!
            </span>
          </div>
        )}

        {/* Pixel info popup */}
        {showInfo && pixelInfo && (
          <div className="animate-pop-in absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-xl border border-primary/40 bg-card px-4 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              {/* Color swatch */}
              <div
                className="h-8 w-8 rounded-lg border border-white/20"
                style={{ backgroundColor: `rgb(${pixelInfo.r},${pixelInfo.g},${pixelInfo.b})` }}
              />
              <div className="flex flex-col">
                <span className="font-heading text-xs font-bold text-muted-foreground">
                  Position: ({pixelInfo.x}, {pixelInfo.y})
                </span>
                <div className="flex gap-2">
                  <span className="font-heading text-xs font-bold" style={{ color: "#ff4444" }}>
                    R:{pixelInfo.r}
                  </span>
                  <span className="font-heading text-xs font-bold" style={{ color: "#44ff44" }}>
                    G:{pixelInfo.g}
                  </span>
                  <span className="font-heading text-xs font-bold" style={{ color: "#4444ff" }}>
                    B:{pixelInfo.b}
                  </span>
                </div>
                <span className="font-heading text-xs font-bold text-secondary">
                  Brightness: {pixelInfo.brightness}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
