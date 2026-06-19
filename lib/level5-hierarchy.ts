/** Flat asset folder — filenames match user-provided PNGs exactly. */
export const L5_HIERARCHY = "/images/level5/hierarchy"

export type MacroPartId = "full_legs" | "full_torso" | "full_hands" | "full_head"
export type MicroPartId = "head_empty" | "ears" | "eyes" | "nose" | "mouth" | "hair"
export type HierarchyPartId = MacroPartId | MicroPartId

export type HierarchyLayerPart = {
  id: HierarchyPartId
  label: string
  file: string
  /** Stacking order — lower = drawn first (behind). */
  zIndex: number
}

export type HierarchyPhaseConfig = {
  id: "macro" | "micro"
  kidTitle: string
  kidInstruction: string
  successMessage: string
  /** Shown in modal before micro phase (macro only). */
  transitionMessage?: string
  silhouetteFile: string
  revealFile: string
  parts: HierarchyLayerPart[]
}

function src(file: string): string {
  return `${L5_HIERARCHY}/${file}`
}

export function hierarchyAssetSrc(file: string): string {
  return src(file)
}

/** Phase 1 — macro body: legs → torso → hands → head. */
export const MACRO_BODY_PHASE: HierarchyPhaseConfig = {
  id: "macro",
  kidTitle: "Build the Body!",
  kidInstruction:
    "Drag each body part onto the silhouette. Stack the legs, torso, hands, and head to build the full person!",
  successMessage: "Amazing! You built the whole body!",
  transitionMessage:
    "Good job! You learned the hierarchy of the human body. Now let's see if you can find the hierarchy of his head!",
  silhouetteFile: "full_body_shilloute.png",
  revealFile: "full_body_reveal.png",
  parts: [
    { id: "full_legs", label: "Legs", file: "full_legs.png", zIndex: 1 },
    { id: "full_torso", label: "Torso", file: "full_torso.png", zIndex: 2 },
    { id: "full_hands", label: "Hands", file: "full_hands.png", zIndex: 3 },
    { id: "full_head", label: "Head", file: "full_head.png", zIndex: 4 },
  ],
}

/** Phase 2 — micro head: empty head base → features → hair on top. */
export const MICRO_HEAD_PHASE: HierarchyPhaseConfig = {
  id: "micro",
  kidTitle: "Build the Face!",
  kidInstruction:
    "Now zoom in on the head! Drag the head shape first, then ears, eyes, nose, mouth, and hair onto the silhouette.",
  successMessage: "Perfect portrait! You mastered facial feature hierarchy!",
  silhouetteFile: "head_shilloute.png",
  revealFile: "head_reveal.png",
  parts: [
    { id: "head_empty", label: "Head", file: "head_empty.png", zIndex: 1 },
    { id: "ears", label: "Ears", file: "ears.png", zIndex: 2 },
    { id: "eyes", label: "Eyes", file: "eyes.png", zIndex: 3 },
    { id: "nose", label: "Nose", file: "nose.png", zIndex: 4 },
    { id: "mouth", label: "Mouth", file: "mouth.png", zIndex: 5 },
    { id: "hair", label: "Hair", file: "hair.png", zIndex: 6 },
  ],
}

export const HIERARCHY_PHASES = [MACRO_BODY_PHASE, MICRO_HEAD_PHASE] as const