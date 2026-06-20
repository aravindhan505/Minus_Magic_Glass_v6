import type { TraceDot } from "@/lib/level3-edge-detection"

type Pixel = { x: number; y: number }

function isGreenOutline(r: number, g: number, b: number): boolean {
  return g > 160 && g > r + 60 && g > b + 60
}

function chainOutlinePixels(points: Pixel[]): Pixel[] {
  if (points.length === 0) return []

  const key = (p: Pixel) => `${p.x},${p.y}`
  const map = new Map(points.map((p) => [key(p), p]))
  const remaining = new Set(points.map((p) => key(p)))

  const start = points.reduce((best, p) =>
    p.y < best.y || (p.y === best.y && p.x < best.x) ? p : best,
  )

  const chain: Pixel[] = [start]
  remaining.delete(key(start))
  let current = start
  const maxJumpSq = 36 // ≤6px steps along the stroke

  while (remaining.size > 0) {
    let nearest: Pixel | null = null
    let nearestDist = Infinity

    for (const k of remaining) {
      const p = map.get(k)!
      const d = (p.x - current.x) ** 2 + (p.y - current.y) ** 2
      if (d < nearestDist && d <= maxJumpSq) {
        nearestDist = d
        nearest = p
      }
    }

    if (!nearest) {
      // Disconnected segment (e.g. antenna) — jump to next topmost leftover pixel
      let next: Pixel | null = null
      for (const k of remaining) {
        const p = map.get(k)!
        if (!next || p.y < next.y || (p.y === next.y && p.x < next.x)) next = p
      }
      if (!next) break
      nearest = next
    }

    chain.push(nearest)
    remaining.delete(key(nearest))
    current = nearest
  }

  return chain
}

function subsampleChain(chain: Pixel[], target: number): TraceDot[] {
  if (chain.length === 0) return []
  if (chain.length <= target) return chain.map(({ x, y }) => ({ x, y }))

  const result: TraceDot[] = []
  for (let i = 0; i < target; i++) {
    const p = chain[Math.floor((i * chain.length) / target)]
    result.push({ x: p.x, y: p.y })
  }
  return result
}

/**
 * Sample the green outline from a silhouette PNG and return dot positions
 * in the image's native pixel coordinates (matches object-contain + SVG viewBox).
 */
export async function extractTraceDotsFromSilhouette(
  imageSrc: string,
  targetDots = 96,
): Promise<{ dots: TraceDot[]; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas unavailable"))
        return
      }

      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, width, height).data

      const greenMask = new Set<string>()
      const greenPixels: Pixel[] = []

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4
          if (isGreenOutline(data[i], data[i + 1], data[i + 2])) {
            const k = `${x},${y}`
            greenMask.add(k)
            greenPixels.push({ x, y })
          }
        }
      }

      const edgePixels = greenPixels.filter(({ x, y }) => {
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          if (!greenMask.has(`${x + dx},${y + dy}`)) return true
        }
        return false
      })

      const chain = chainOutlinePixels(edgePixels)
      const dots = subsampleChain(chain, targetDots)
      resolve({ dots, width, height })
    }
    img.onerror = () => reject(new Error(`Failed to load ${imageSrc}`))
    img.src = imageSrc
  })
}

/** Touch radius and dot size scaled to image dimensions. */
export function traceMetricsForImage(width: number, height: number) {
  const scale = Math.min(width, height)
  return {
    traceRadius: Math.max(5, scale / 70),
    dotLit: Math.max(2.5, scale / 160),
    dotUnlit: Math.max(1.8, scale / 220),
  }
}