# Magic Glasses for Minu — Product Specification

**Version:** 2.2
**Date:** June 16, 2026
**Status:** Active Development — Foundation + Shared Components Complete, Level Modules Ready for Parallel Build
**Pedagogy Update:** Two-voice system — Narrator teaches the child, Minu reacts emotionally

---

## 1. Overview

**Magic Glasses for Minu** is an educational web application that teaches elementary-age children (5–8 years old) how computer vision works. The child helps a friendly alien character named "Minu" calibrate her "magic glasses" by progressing through 5 levels, each covering a core computer-vision concept. Activities are image-manipulation–based: kids adjust sliders, explore split views, and inspect pixels while Minu reacts dynamically to their actions.

### 1.1 Core Metaphor
Minu is a friendly alien who sees the world as **raw numbers** (0–255 pixel values) — she cannot see images like we do. The child's role is to **help Minu** calibrate her "magic glasses" so she can see properly. After successfully completing each level, one lens segment of the glasses is "polished," giving children a tangible sense of progression. After all 5 levels, the glasses are fully calibrated and Minu can finally see the world!

### 1.2 Learning Pedagogy
- **Helper role:** The child is helping Minu, not being taught by her. Minu is the one who doesn't understand — the child is the expert guiding her.
- **Two voices:** A warm **Narrator** teaches the child concepts and gives instructions. **Minu** reacts emotionally to what the child does (confused, surprised, grateful).
- **Minu never teaches** — she only reacts. She sees numbers, gets confused, and the child's actions help her understand.

### 1.3 Key Differentiators
- **Reactive character:** Minu reacts emotionally to the child's help — confused when she sees numbers, amazed when she starts "seeing," grateful when the child succeeds.
- **Tactile exploration:** Kids learn by doing — adjusting real sliders and seeing immediate visual feedback on images.
- **Glasses calibration narrative:** A clear, visual metaphor for progress that young children understand.
- **Two-voice audio:** Narrator (teaches) + Minu (reacts) — pre-recorded MP3 files for consistent, high-quality audio.

---

## 2. Target Audience

| Attribute        | Detail                                      |
|------------------|---------------------------------------------|
| Age range        | 5–8 years old (elementary / kindergarten)   |
| Reading level    | Minimal — mostly pre-readers                |
| Guidance         | Two-voice audio: Narrator teaches, Minu reacts (pre-recorded MP3s) |
| Device usage     | Classroom tablets (primary), phone/desktop (secondary) |
| Prior knowledge  | None — first exposure to how computers "see" |

---

## 3. Tech Stack

| Layer         | Technology                                    |
|---------------|-----------------------------------------------|
| Framework     | Next.js 16 (App Router, client-side only)     |
| UI library    | React 19                                      |
| Styling       | Tailwind CSS 4 + shadcn/ui                    |
| Fonts         | Pixelify Sans (headings), Nunito (body)       |
| Icons         | Lucide React                                  |
| Analytics     | Vercel Analytics (production only)            |
| Persistence   | `localStorage` — no backend                   |
| Voice         | Pre-recorded MP3 files (Narrator + Minu voices) |
| Sound         | Minimal SFX (Web Audio API or HTML5 Audio)    |
| Deployment    | Static / Vercel (no server-side logic needed) |

---

## 4. Screen Flow

```
┌──────────┐     ┌──────────┐     ┌────────────────┐     ┌──────────────┐
│  Intro   │────▶│   Home   │────▶│ Calibration Map │────▶│ Level Screen │
│ (video)  │     │  Screen  │     │  (level select) │     │ (activity)   │
└──────────┘     └──────────┘     └────────────────┘     └──────┬───────┘
       ▲                                                         │
       │                    ┌────────────────┐                   │
       └────────────────────│   Celebration  │◀──── (on complete)
                            │     Screen     │
                            └────────────────┘
```

### 4.1 Existing Screens (to be retained & enhanced)

| Screen          | Current State | Status |
|-----------------|---------------|--------|
| IntroScreen     | Video player with fallback, Skip Intro button | ✅ Complete |
| HomeScreen      | Title, Minu waving, Play button, Settings panel | ✅ Complete (branding removed) |
| CalibrationMap  | 5 level cards with lock/complete states | ✅ Complete (needs glasses progress UI) |
| LevelScreen     | Placeholder stub | ❌ **Major rewrite needed** — each module is a new level |

### 4.2 New/Enhanced Screens

- **Celebration Screen:** Shown after all 5 levels complete. Minu wearing fully calibrated glowing glasses. Congratulatory message. Option to replay levels. ❌ Not started.
- **Level Complete Overlay:** After each level's quiz, show Minu celebrating + glasses lens segment filling in + transition back to map. ❌ Not started.

---

## 5. Level Specifications

Each level follows a common structure:

### Common Level Structure
1. **Narrator Intro** — Narrator explains the concept to the child and tells them how to help Minu.
2. **Minu's Reaction** — Minu expresses confusion about what she sees (numbers, not images), reaching out for help.
3. **Interactive Activity** — Full-screen image with split view (before/after), sliders at the bottom, pixel inspector enabled.
4. **Reactive Minu** — Minu floats on screen, reacts emotionally to slider changes and the child's exploration (surprised, confused, grateful).
5. **Quiz/Challenge** — Narrator presents the challenge. Minu reacts to correct/incorrect answers with emotion.
6. **Level Complete** — Narrator congratulates. Minu celebrates and expresses gratitude. Glasses lens fills in, progress updates.

### 5.1 Level 1: Numbers to Brightness

**Concept:** Computers store light as numbers (0–255). Bright pixels = high numbers, dark pixels = low numbers.
**Assigned to:** _[Team member TBD]_
**Status:** ❌ Not started

**Bundled Images Needed:**
- A bright, colorful space scene (e.g., colorful nebula)
- A dark scene (e.g., night sky with dim stars)

**Interactive Activity:**
- Split view: left = original image, right = grayscale version
- **Slider: Brightness (0–255)** — as the child slides, the grayscale image gets brighter/dimmer
- **Pixel Inspector:** Tap any pixel to see its number value (displayed in a glowing badge next to Minu)
- **Narrator:** Explains that Minu sees numbers, guides the child to use the slider and tap pixels
- Minu reactions:
  - Normal position → idle pose (confused, looking at numbers)
  - Slider near 0 → Minu squinting, "Everything is so dark! The numbers are all low!"
  - Slider near 255 → Minu shields eyes, "Too bright! My sensors are going crazy!"
  - Tapping a pixel → Minu holds magnifying glass, "What number is it? Can you read it to me?"

**Quiz/Challenge:**
- Narrator: "Which image is brighter?" (show 2 thumbnails — one bright, one dark)
- Narrator: "Move the slider to make this dark picture match the bright one!"
- Minu reacts: "Yes! You got it! Thank you!" (correct) / "Hmm, not quite. Let's try again!" (incorrect)

### 5.2 Level 2: Brightness in Color

**Concept:** Every color is made of Red, Green, and Blue (RGB) channels. Adjusting one channel changes the whole image.
**Assigned to:** _[Team member TBD]_
**Status:** ❌ Not started

**Bundled Images Needed:**
- A colorful photo (e.g., a rainbow, a flower garden, or a cartoon landscape)
- A simple reference color grid showing primary colors

**Interactive Activity:**
- Split view: left = original, right = channel-adjusted
- **3 Sliders: R, G, B** (each 0–255, with color-coded track — red, green, blue)
- The right image updates in real-time as channels are adjusted
- **Pixel Inspector:** Tap a pixel to see its R, G, B values displayed as three colored bars/badges
- **Narrator:** Explains RGB colors, guides the child to use three sliders
- Minu reactions:
  - Normal → confused, "Every color is THREE numbers?"
  - All sliders at 255 → surprised, "Everything is white! All numbers at maximum!"
  - All sliders at 0 → scared, "It's pitch black! All numbers are zero!"
  - One slider extreme → amazed, "So much [red/green/blue]!"

**Quiz/Challenge:**
- Narrator: "Which slider makes the image more red?"
- Narrator: "Mix the right colors to make this picture look like the original!"
- Minu reacts: "Wow! You really understand colors! Thank you!" (correct) / "Almost! Let's try once more!" (incorrect)

### 5.3 Level 3: Edge Detection

**Concept:** Computers find edges by looking for places where pixel values change sharply.
**Assigned to:** _[Team member TBD]_
**Status:** ❌ Not started

**Bundled Images Needed:**
- A simple, bold-line illustration (e.g., a cartoon spaceship, a house, or an animal outline)
- A photograph with clear edges (e.g., a building, a car)

**Interactive Activity:**
- Split view: left = original, right = edge-detected (Sobel-like or threshold-based edge output)
- **Slider: Threshold / Sensitivity** — controls how strict the edge detection is
- **Slider: Brightness offset** — adjusts the edge image brightness
- **Pixel Inspector:** Tap near an edge to see the before/after pixel values
- **Narrator:** Explains edges as where numbers change fast, guides slider use
- Minu reactions:
  - Normal → detective pose, curious about the lines
  - High threshold (few edges) → confused, "Where did the lines go?"
  - Low threshold (many edges) → excited, "So many edges! The numbers change really fast!"
  - Tapping an edge → amazed, "You found an edge! See how the numbers jump?"

**Quiz/Challenge:**
- Narrator: "Which of these is an edge-detected image?"
- Narrator: "Adjust the slider to find the most edges!"
- Minu reacts: "You're becoming a real detective! Thank you!" (correct) / "Not quite! Let's try again!" (incorrect)

### 5.4 Level 4: Feature Recognition

**Concept:** Computers group pixels into regions and recognize shapes (circles, rectangles, blobs).
**Assigned to:** _[Team member TBD]_
**Status:** ❌ Not started

**Bundled Images Needed:**
- Simple geometric shapes on a solid background (circles, squares, triangles)
- A photo with recognizable regions (e.g., a landscape with sky, ground, and object)

**Interactive Activity:**
- Split view: left = original, right = region/segmentation overlay (color-coded regions)
- **Slider: Region size / granularity** — controls how many regions the image is split into
- **Slider: Color similarity threshold** — how similar pixels must be to merge into a region
- **Pixel Inspector:** Tap a region to see it highlighted and get a label (e.g., "bright region", "dark region")
- **Narrator:** Explains grouping similar pixels, guides slider use
- Minu reactions:
  - Normal → thinking pose, processing the regions
  - Many small regions → surprised, "So many pieces! The computer is really picky!"
  - Few large regions → thoughtful, "Everything is grouped together!"
  - Tapping a region → amazed, "You tapped a region! The computer grouped those pixels!"

**Quiz/Challenge:**
- Narrator: "How many regions can you see?"
- Narrator: "Adjust the slider to split this image into exactly 3 regions!"
- Minu reacts: "That's right! You're teaching the computer to group things!" (correct) / "Hmm, not quite. Try again!" (incorrect)

### 5.5 Level 5: Image Classification

**Concept:** Computers use all the previous techniques together to sort and label images.
**Assigned to:** _[Team member TBD]_
**Status:** ❌ Not started

**Bundled Images Needed:**
- A set of 6–8 simple category images (e.g., animal, vehicle, food, space, nature, building)
- A "confusion matrix" style visual (simplified for kids)

**Interactive Activity:**
- Split view: left = image, right = "classification bar chart" (bars showing confidence for each category)
- **Sliders: Feature weights** (e.g., "color importance", "shape importance", "brightness importance") — these affect how the classifier "thinks"
- **Pixel Inspector:** Tap a region to see what features the classifier is "looking at"
- **Narrator:** Explains that computers use all previous techniques together to classify images
- Minu reactions:
  - Normal → amazed, "All those things work together?"
  - Correct classification → excited, "It figured it out! Thank you for helping!"
  - Wrong classification → confused, "Hmm, that doesn't seem right. Can you help?"
  - Adjusting sliders → thinking, adjusting glasses, "I'm starting to understand!"

**Quiz/Challenge:**
- Narrator: "What do you think this image is?"
- Narrator: "Adjust the sliders to help the computer classify this image correctly!"
- Minu reacts: "You did it! I can see the world now! Thank you!" (correct) / "Almost! Try adjusting the sliders!" (incorrect)

---

## 6. Minu Character System

### 6.1 Poses — Asset Map (14 files on disk)

| Spec Pose | Config Key | File | Status |
|-----------|-----------|------|--------|
| `idle` | `idle` | `minu_idle.png` | ✅ In config |
| `waving` | `waving` | `minu_waving.png` | ✅ In config |
| `celebrating` | `celebrating` | `minu_celebrating.png` | ✅ In config |
| `thinking` | `thinking` | `minu_thinking.png` | ✅ In config |
| `clapping` | `clapping` | `minu_clapping.png` | ✅ In config |
| `surprised-wow` | `surprised` | `minu_surprised.png` | ✅ In config |
| `pointing-right` | `pointing` | `minu_pointing.png` | ✅ In config |
| `magnifying-glass` | `holdingLens` | `minu_holding_lens.png` | ✅ In config |
| — (level 5 visual) | `holding255` | `minu_holding_255.png` | ✅ In config |
| — (level 4 region) | `holdingMatrix` | `minu_holding_matrix.png` | ✅ In config |
| `confused` | `empathetic` | `minu_empathetic.png` | ✅ In config |
| `shrug` | `oops` | `minu_oops.png` | ✅ In config |
| — (lever interaction) | `pullingLever` | `minu_pulling_lever.png` | ✅ In config |
| — (idle alternate) | `afkYawning` | `minu_afk_yawning.png` | ✅ In config |
| `holding-glasses` | — | — | ❌ **Needs generation** |
| `wearing-glasses` | — | — | ❌ **Needs generation** |
| `excited-jump` | — | — | ❌ **Needs generation** |
| `thumbs-up` | — | — | ❌ **Needs generation** |
| `presenting` | — | — | ❌ **Needs generation** |
| `peeking` | — | — | ❌ **Needs generation** |

**Summary:** 14 of 20 core poses are covered. 6 poses still need Zimage Turbo generation.

#### Pose Usage by Level

| Trigger | Config Key | Spec Label |
|---------|-----------|------------|
| Level starts | `pointing` | `presenting` (use pointing until generating presenting) |
| Kid adjusts slider | `thinking` | `thinking` |
| Extreme slider value | `surprised` | `surprised-wow` |
| Kid taps pixel | `holdingLens` | `magnifying-glass` |
| Quiz correct | `clapping` | `thumbs-up` (use clapping until generating thumbs-up) |
| Quiz incorrect | `oops` | `shrug` |
| Kid completes level | `celebrating` | `celebrating` |
| Glasses lens fills in | `holdingLens` | `wearing-glasses` (use holdingLens until generating) |
| Idle / resting | `idle` | `idle` |
| Intro greeting | `waving` | `waving` |
| Empathy / soft moment | `empathetic` | `confused` |
| Level 5 visual aid | `holding255` | — |
| Level 4 region aid | `holdingMatrix` | — |
| Pulling lever / activating | `pullingLever` | — |
| Tired / timeout | `afkYawning` | — |

### 6.2 Two-Voice Audio System

**Narrator** (warm adult voice): Teaches the child, explains concepts, gives instructions.
**Minu** (childlike alien voice): Reacts emotionally, expresses confusion/surprise/gratitude.

Minu should be positioned on-screen (not blocking the image) and react based on:

| Trigger | Minu Pose | Minu Speech (emotional reaction) |
|---------|-----------|----------------------------------|
| Level starts | `pointing` | "Everything looks... weird? I only see numbers! Can you help me?" |
| Kid adjusts slider | `thinking` | "Whoa! The numbers are changing! Keep going!" |
| Extreme slider value (0) | `empathetic` | "Everything is so dark! The numbers are all low!" |
| Extreme slider value (255) | `surprised` | "Too bright! My sensors are going crazy!" |
| Kid taps pixel | `holdingLens` | "You tapped a pixel! What number is it? Tell me!" |
| Kid answers quiz correctly | `clapping` | "Yes! You got it! Thank you so much!" |
| Kid answers quiz incorrectly | `oops` | "Hmm, not quite. But that's okay — we're still learning!" |
| Kid completes level | `celebrating` | "You did it! I can see better now! Thank you!" |
| Glasses lens fills in | `holdingLens` | "Look! One of my lenses is working! I can see that part!" |
| All levels complete | `celebrating` | "I can see! I can really see! Thank you for helping me!" |

### 6.3 Speech Bubbles

- Speech bubbles should use the retro arcade theme (rounded corners, neon glow border)
- Text should be large, high-contrast, and short (max ~15 words)
- Bubbles appear with a pop-in animation

---

## 7. Audio Design

### 7.1 Two-Voice Audio System

The app uses **pre-recorded MP3 files** with two distinct voices:

| Voice | Role | Tone |
|-------|------|------|
| **Narrator** | Teaches the child, explains concepts, gives instructions | Warm, friendly adult (PBS/Blue's Clues host style) |
| **Minu** | Reacts emotionally to the child's help | Childlike alien (higher pitch, quirky, genuine) |

**Pedagogy rule:** Minu never teaches. She only reacts. The Narrator teaches.

### 7.2 Narrator Lines

| When | What Narrator Says |
|------|-------------------|
| Level intro | Explains the concept and how to help Minu |
| Instruction | Guides the child to use sliders, tap pixels, etc. |
| Quiz intro | Presents the challenge question |
| Quiz feedback | Confirms correct / encourages retry |
| Level complete | Congratulates the child |

### 7.3 Minu Lines

| When | What Minu Says |
|------|----------------|
| Level start | Expresses confusion about what she sees (numbers) |
| Slider extreme | Reacts emotionally (surprised, scared, amazed) |
| Pixel tap | Asks the child to read the number to her |
| Quiz correct | Expresses gratitude and excitement |
| Quiz incorrect | Encourages trying again, not disappointed |
| Level complete | Celebrates and thanks the child |
| All levels complete | Overwhelmed with joy, can finally see! |

**Full dialogue list:** See `minu-dialogues.txt` (58 MP3 files)

### 7.4 Audio File Structure

```
public/audio/minu/
├── narrator_*.mp3          # Narrator voice lines
├── minu_*.mp3              # Minu voice lines
└── (sfx files)
```

**File naming:** `narrator_[category]_[variant].mp3` and `minu_[category]_[variant].mp3`

### 7.5 Sound Effects (Minimal)

| Sound | Trigger |
|-------|---------|
| Button click | Any button tap |
| Level complete fanfare | After quiz success, before celebration |
| Slider change tick | Subtle tick sound as slider moves (throttled) |
| Error buzz | Wrong quiz answer |
| Ambient space music | Optional — toggleable in settings (off by default) |

**SFX Format:** Web Audio API oscillator for simple tones (click, fanfare, tick, error).

### 7.6 Audio Playback Implementation

- Use HTML5 `<Audio>` element for MP3 playback (not Web Speech API)
- Preload audio files on level start for zero-latency playback
- Sound toggle mutes/unmutes all audio (narrator, minu, sfx)
- Graceful fallback: If audio files missing, show speech bubbles only (text)

---

## 8. Glasses Calibration UI

### 8.1 Glasses Icon
- A large SVG/PNG glasses graphic displayed on the Calibration Map screen (top area)
- 5 lens segments (one per level), initially dim/grayed out
- As each level completes, the corresponding segment fills with a glowing color (matching the level's accent color)
- After all 5, the glasses glow fully with a sparkle animation

### 8.2 Progress Bar
- A secondary progress bar displayed below the glasses icon
- Fills from 0% to 100% as levels complete
- Uses the retro neon theme colors
- Shows "X / 5 Calibrated" text

### 8.3 Level Complete Animation
After each level's quiz:
1. Full-screen overlay with Minu in `celebrating` pose
2. Glasses icon appears, one lens segment fills with color + glow effect
3. Progress bar updates
4. "Level [X] Calibrated!" text with pop-in animation
5. After 2–3 seconds, transitions back to Calibration Map

---

## 9. Responsive Design

### 9.1 Breakpoints
| Device | Width | Layout |
|--------|-------|--------|
| Phone | < 640px | Stacked: Minu at top, image center, controls bottom |
| Tablet | 640–1024px | Side-by-side: Minu on left, image center, controls bottom |
| Desktop | > 1024px | Full layout: Minu side panel, large image, controls sidebar |

### 9.2 Touch Considerations (5–8 year olds)
- Minimum touch target: 48px × 48px
- Slider handles: Large (at least 44px)
- Generous padding between interactive elements
- Swipe gestures disabled (prevent accidental navigation)
- Pinch-to-zoom disabled on the app

### 9.3 Image Display
- Images scale to fit the viewport while maintaining aspect ratio
- Split view divider is draggable on touch devices
- Pixel inspector works on both touch (tap) and mouse (hover/click)

---

## 10. Accessibility

- **ARIA labels** on all interactive elements
- **Keyboard navigation** support (Tab, Enter, Arrow keys for sliders)
- **High contrast** text on all backgrounds (WCAG AA minimum)
- **Reduced motion** support: respect `prefers-reduced-motion` — disable float/twinkle animations
- **Screen reader** compatibility: describe image changes in text form
- **Font scaling:** text should not break layout at 200% browser zoom

---

## 11. State Management

### 11.1 App State (In-Memory)
```typescript
type AppState = {
  screen: "intro" | "home" | "map" | "level" | "celebration"
  activeLevel: Level | null
  completed: number[]
  soundOn: boolean
  voiceOn: boolean
}
```

### 11.2 Persisted State (localStorage)
```typescript
type PersistedState = {
  completed: number[]          // [1, 2, 3] — completed level IDs
  soundOn: boolean
  voiceOn: boolean
  highScores: Record<number, number>  // level ID → best quiz score
}
```

- State is loaded from localStorage on mount
- State is saved to localStorage on every completion/settings change
- "Reset Progress" clears localStorage and resets in-memory state

### 11.3 Per-Level State
```typescript
type LevelState = {
  sliderValues: Record<string, number>  // e.g., { brightness: 128 } or { r: 200, g: 100, b: 50 }
  quizCompleted: boolean
  quizScore: number
  pixelsInspected: number
  explorationTime: number  // seconds spent on the level
}
```

---

## 12. File Structure

### 12.1 Current File Tree (what exists)
```
app/
  page.tsx                    # ✅ Complete — screen routing, celebration overlay
  globals.css                 # ✅ Complete — theme, animations, responsive fixes
  layout.tsx                  # ✅ Complete — viewport config, fonts, analytics
components/
  intro-screen.tsx            # ✅ Complete — video player with fallback
  home-screen.tsx             # ✅ Complete — title, Minu, Play, Settings
  calibration-map.tsx         # ✅ Complete — 5 level cards with lock/complete
  level-screen.tsx            # ✅ Stub only — placeholder "coming soon" shell
  starfield.tsx               # ✅ Complete — fixed hydration mismatch
  ui/
    button.tsx                # ✅ Complete — shadcn/ui button
lib/
  minu-config.ts              # ✅ Complete — 14 poses mapped, 5 levels defined
  utils.ts                    # ✅ Complete — cn() helper
public/
  minu/                       # ✅ 14 pose PNGs on disk
```

### 12.2 Files Still Needed (per spec)
```
components/
  level-activity.tsx          # [NEW] Core image manipulation component
  pixel-inspector.tsx         # [NEW] Pixel inspector overlay
  split-view.tsx              # [NEW] Before/after split view
  level-quiz.tsx              # [NEW] End-of-level quiz component
  glasses-progress.tsx        # [NEW] Glasses icon + progress bar
  celebration-screen.tsx      # [NEW] Final celebration screen
  level-complete-overlay.tsx  # [NEW] Per-level completion overlay
  speech-bubble.tsx           # [NEW] Minu speech bubble component
  minu-avatar.tsx             # [NEW] Minu character with pose switching + reactions
  ui/
    slider.tsx                # [NEW] Large touch-friendly slider
lib/
  level-data.ts               # [NEW] Level-specific content (quiz questions, slider configs, image paths)
  audio.ts                    # [NEW] TTS + SFX helpers
public/
  images/                     # [NEW] Bundled level images (user-provided)
  audio/                      # [NEW] Sound effect files (if using bundled audio)
```

---

## 13. Image Requirements

The user will generate all images using **Zimage Turbo**. Below are the required image sets:

### 13.1 Minu Poses (6 PNGs still needed)
- `minu_holding_glasses.png`
- `minu_wearing_glasses.png`
- `minu_excited_jump.png`
- `minu_thumbs_up.png`
- `minu_presenting.png`
- `minu_peeking.png`

(Reference prompts are in `minu-pose-prompts.txt`)

### 13.2 Level Images
- **Level 1:** 2 images — one bright space scene, one dark scene
- **Level 2:** 2 images — one colorful photo, one simple color grid
- **Level 3:** 2 images — one bold-line cartoon, one photograph with clear edges
- **Level 4:** 2 images — one geometric shapes composition, one landscape with regions
- **Level 5:** 6–8 category images for classification (animals, vehicles, food, space, nature, buildings)

### 13.3 Glasses Asset
- A glasses SVG/PNG for the calibration progress indicator (5 segments)

---

## 14. Level Data Structure

```typescript
type LevelConfig = {
  id: number
  slug: string
  title: string
  subtitle: string
  description: string
  color: string
  icon: string

  // Interactive configuration
  imageSrc: string              // Primary image path
  referenceSrc?: string         // Reference/comparison image (for split view)
  sliders: SliderConfig[]       // Array of sliders for this level
  pixelInspectorEnabled: boolean
  splitViewEnabled: boolean

  // Minu reactions
  minuReactions: MinuReaction[]

  // Quiz data
  quiz: QuizQuestion[]

  // Audio lines (MP3 file references)
  narratorIntro: string           // Narrator introduces the concept
  narratorQuizIntro: string       // Narrator presents the quiz
  narratorComplete: string        // Narrator congratulates
  minuIntro: string               // Minu reacts to seeing numbers
  minuComplete: string            // Minu celebrates and thanks
}

type SliderConfig = {
  id: string                    // e.g., "brightness", "r", "g", "b"
  label: string                 // Kid-friendly label
  min: number
  max: number
  defaultValue: number
  color: string                 // Slider track color
}

type MinuReaction = {
  trigger: "slider_extreme_min" | "slider_extreme_max" | "pixel_tap" | "slider_change" | "idle"
  sliderId?: string             // Which slider triggers this
  pose: MinuPose
  text?: string                 // Speech bubble text (supports {value} template)
}

type QuizQuestion = {
  type: "visual_choice" | "hands_on"
  question: string              // TTS + display text
  // For visual_choice:
  options?: { imageSrc: string; label: string; correct: boolean }[]
  // For hands_on:
  targetSliderValues?: Record<string, number>
  tolerance?: number            // How close the kid needs to get
}
```

---

## 15. Performance Considerations

- **Image optimization:** Use Next.js `<Image>` with proper sizing and lazy loading
- **Audio preloading:** Preload MP3 files on level start for zero-latency playback
- **Animation performance:** Use CSS transforms (not layout-triggering properties) for animations
- **Bundle size:** Keep the app under 500KB gzipped (excluding images)
- **Offline support:** Consider adding a service worker for offline-first experience (optional, not required for v1)

---

## 16. Open Questions / Future Considerations

- [ ] Should we add a "sandbox mode" after all levels are complete where kids can freely experiment with all tools?
- [ ] Should we add a "teacher mode" or "parent dashboard" to track progress?
- [ ] Should we support multiple languages (i18n)?
- [ ] Should we add a "share your creation" feature (export manipulated image)?
- [ ] Should we add sound effects for the ambient space music toggle?
- [ ] Should we consider a service worker for offline-first support?

---

## 17. Success Metrics

- **Completion rate:** % of kids who complete all 5 levels
- **Engagement time:** Average time spent per level
- **Quiz pass rate:** % of kids who pass each level's quiz on first attempt
- **Return rate:** % of kids who come back to play again

---

## 18. Constraints

1. **No backend** — everything must work client-side with localStorage
2. **No external APIs** — TTS via Web Speech API only, no third-party services
3. **Dark retro arcade theme** — all new UI must match the existing aesthetic
4. **Touch-first** — designed for 5-year-old fingers on tablets
5.  **Voice-dependent** — Two-voice audio (Narrator + Minu) is essential for the target age group. Pre-recorded MP3s for consistent quality.
6. **Image generation** — user provides all images via Zimage Turbo; we use placeholders until then

---

## 19. Workplan & Team Assignments

### 19.1 Development Model
Each of the 5 level modules will be built **independently** by a different team member. When all modules are complete, they will be integrated into the app following the shared conventions below. This allows parallel development while maintaining a consistent user experience.

### 19.2 Shared Conventions (all module builders MUST follow)
1. **Theme:** Dark retro arcade — use existing CSS variables from `globals.css` (primary, secondary, accent, muted, card, background, foreground colors)
2. **Fonts:** `font-heading` for headings, default body font for text
3. **Animations:** Use existing `animate-pop-in`, `animate-float`, `animate-twinkle` from globals.css
4. **Component imports:** Use `@/components/ui/button` for buttons, `@/lib/minu-config` for poses/levels
5. **Level data:** Each module should export its config in the `LevelConfig` format (Section 14)
6. **Minu reactions:** Use the config keys from Section 6.1 (e.g., `thinking`, `surprised`, `holdingLens`)
7. **Image processing:** Use HTML Canvas API for pixel manipulation (client-side, no server)
8. **Responsive:** Use `min-h-dvh` (not `min-h-screen`), Tailwind responsive classes, 48px min touch targets
9. **File naming:** `level-{id}-{slug}.tsx` (e.g., `level-1-numbers-to-brightness.tsx`)

### 19.3 Module Interface Contract
Each level module must implement this interface:

```typescript
type LevelModule = {
  /** The level ID (1-5) */
  levelId: number
  /** The level configuration */
  config: LevelConfig
  /** The React component that renders the level activity */
  component: React.FC<LevelActivityProps>
}

type LevelActivityProps = {
  /** Called when the level is completed (quiz passed) */
  onComplete: () => void
  /** Called to go back to the map */
  onBack: () => void
}
```

### 19.4 Task Breakdown

#### Phase 1: Foundation (DONE ✅)
| Task | Status | Owner |
|------|--------|-------|
| Project setup (Next.js 16, Tailwind 4, shadcn/ui) | ✅ Done | — |
| Theme & CSS (globals.css, color variables, animations) | ✅ Done | — |
| Intro screen (video player with fallback) | ✅ Done | — |
| Home screen (title, Minu, Play, Settings) | ✅ Done | — |
| Calibration map (5 level cards, lock/complete) | ✅ Done | — |
| Level screen placeholder | ✅ Done | — |
| Minu pose config (14 poses mapped) | ✅ Done | — |
| Starfield component (hydration fix) | ✅ Done | — |
| Responsive viewport (device-width, dvh) | ✅ Done | — |
| Spec file (magic-glasses-spec.md) | ✅ Done | — |

#### Phase 2: Shared Components (DONE ✅)
| Task | Status | Owner |
|------|--------|-------|
| `glasses-progress.tsx` — glasses icon + progress bar | ✅ Done | Buffy |
| `speech-bubble.tsx` — Minu speech bubble component | ✅ Done | Buffy |
| `minu-avatar.tsx` — Minu character with pose switching | ✅ Done | Buffy |
| `split-view.tsx` — before/after image comparison | ✅ Done | Buffy |
| `pixel-inspector.tsx` — tap-to-inspect pixel values | ✅ Done | Buffy |
| `level-quiz.tsx` — visual choice + hands-on quiz | ✅ Done | Buffy |
| `ui/slider.tsx` — large touch-friendly slider | ✅ Done | Buffy |
| `audio.ts` — TTS + SFX helpers | ✅ Done | Buffy |
| `level-data.ts` — shared types + level configs | ✅ Done | Buffy |
| Glasses SVG/PNG asset (5-segment progress graphic) | ❌ Pending | User (Zimage Turbo) |

#### Phase 3: Level Modules (PARALLEL — each team member builds one)
| Module | Assigned To | Status | Dependencies |
|--------|-------------|--------|-------------|
| Level 1: Numbers to Brightness | _[TBD]_ | 🔵 Ready to start | Phase 2 ✅ Complete |
| Level 2: Brightness in Color | _[TBD]_ | 🔵 Ready to start | Phase 2 ✅ Complete |
| Level 3: Edge Detection | _[TBD]_ | 🔵 Ready to start | Phase 2 ✅ Complete |
| Level 4: Feature Recognition | _[TBD]_ | 🔵 Ready to start | Phase 2 ✅ Complete |
| Level 5: Image Classification | _[TBD]_ | 🔵 Ready to start | Phase 2 ✅ Complete |

#### Phase 4: Integration (AFTER all modules complete)
| Task | Status | Owner |
|------|--------|-------|
| Wire all 5 modules into `level-screen.tsx` | ❌ Pending | Buffy |
| Add `level-data.ts` with all level configs | ❌ Pending | Buffy |
| Update CalibrationMap with glasses progress UI | ❌ Pending | Buffy |
| Update HomeScreen with glasses progress indicator | ❌ Pending | Buffy |
| Build `celebration-screen.tsx` (final screen) | ❌ Pending | Buffy |
| Build `level-complete-overlay.tsx` | ❌ Pending | Buffy |
| Add localStorage persistence | ❌ Pending | Buffy |
| Integrate pre-recorded MP3 audio (Narrator + Minu) | ❌ Pending | Buffy |
| Add SFX sound effects (Web Audio API) | ❌ Pending | Buffy |
| Generate 58 MP3 dialogue files | ❌ Pending | User |
| Generate remaining 6 Minu pose PNGs | ❌ Pending | User (Zimage Turbo) |
| Generate level images for all 5 levels | ❌ Pending | User (Zimage Turbo) |

#### Phase 5: Polish & QA
| Task | Status | Owner |
|------|--------|-------|
| Cross-browser testing (Edge, Chrome, Safari, Firefox) | ❌ Pending | Team |
| Mobile/tablet testing | ❌ Pending | Team |
| Accessibility audit (ARIA, keyboard nav, contrast) | ❌ Pending | Team |
| Performance audit (bundle size, image optimization) | ❌ Pending | Team |
| Typecheck all modules | ❌ Pending | Team |
| Final code review | ❌ Pending | Team |

### 19.5 Current Status Summary

```
Phase 1 (Foundation):     ████████████████████ 100%  DONE
Phase 2 (Shared):         ████████████████████ 100%  DONE
Phase 3 (Modules):        🔵 Ready to start — waiting on team assignments
Phase 4 (Integration):    ░░░░░░░░░░░░░░░░░░░░   0%  NOT STARTED (waiting on Phase 3)
Phase 5 (Polish & QA):    ░░░░░░░░░░░░░░░░░░░░   0%  NOT STARTED (waiting on Phase 4)
```

**Overall Progress: ~40%** (foundation + shared components complete, modules ready for parallel build)

### 19.6 Next Steps
1. **Team** assigns who builds which level module (all 5 are ready)
2. **Module builders** start Phase 3 in parallel — all shared components are available
3. **User** generates remaining 6 Minu pose PNGs and level images via Zimage Turbo
4. **Module builders** export their component following the LevelModule interface (Section 19.3)
5. **Buffy** integrates all modules in Phase 4 once all modules are submitted
