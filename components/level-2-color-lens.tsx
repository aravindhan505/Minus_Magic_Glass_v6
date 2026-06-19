"use client"

import { cn } from "@/lib/utils"
import { itemSilhouetteSrc, rgbCss, type PotionItem, type RgbColor } from "@/lib/level2-color-potion"

type Props = {
  label: string
  color: RgbColor
  item: PotionItem
  variant: "target" | "mix"
  className?: string
}

export function ColorLens({ label, color, item, variant, className }: Props) {
  const ringColor = variant === "target" ? "#eab308" : "#6366f1"
  const silhouette = itemSilhouetteSrc(item)

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <span
        className={cn(
          "font-heading rounded-full border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wide sm:text-[9px]",
          variant === "target"
            ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
            : "border-indigo-400/40 bg-indigo-500/15 text-indigo-200",
        )}
      >
        {label}
      </span>

      <div
        className="relative aspect-square w-[min(34vw,26dvh,9.5rem)] rounded-full border-[6px] bg-slate-950 shadow-lg sm:w-[min(30vw,28dvh,10.5rem)] sm:border-[8px]"
        style={{
          borderColor: ringColor,
          boxShadow: `0 0 22px ${rgbCss(color)}55, inset 0 2px 6px rgba(255,255,255,0.15)`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div
            className="animate-slosh-2 pointer-events-none absolute bottom-[-35%] left-[-60%] h-[115%] w-[220%] rounded-[39%] opacity-40 transition-colors duration-300"
            style={{ backgroundColor: rgbCss(color) }}
          />
          <div
            className="animate-slosh-1 pointer-events-none absolute bottom-[-40%] left-[-60%] h-[115%] w-[220%] rounded-[41%] transition-colors duration-300"
            style={{ backgroundColor: rgbCss(color) }}
          />
          <div
            className="pointer-events-none absolute inset-3 opacity-85 sm:inset-3.5"
            style={{
              WebkitMaskImage: `url(${silhouette})`,
              maskImage: `url(${silhouette})`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              backgroundColor: "#0f172a",
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-white/12 via-transparent to-white/10" />
        </div>
      </div>
    </div>
  )
}