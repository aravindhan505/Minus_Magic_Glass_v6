# Minu's Magic Glasses — Project Status & Session Tracker

**Last Updated:** June 17, 2026
**Last Session:** Fixed audio bugs — sound toggle on/off sounds, map narrator repeat, level complete timing

---

## What Is This File?

This is the **single source of truth** for project status. If a session terminates, read this file first to understand exactly where we left off, what's been done, and what's waiting on whom.

---

## 1. What We've Done So Far

### Phase 1: Foundation ✅ COMPLETE
| Task | Status | Notes |
|------|--------|-------|
| Project setup (Next.js 16, Tailwind 4, shadcn/ui) | ✅ Done | `pnpm` package manager |
| Theme & CSS (globals.css, color variables, animations) | ✅ Done | Dark retro arcade theme |
| Intro screen (video player with fallback) | ✅ Done | Uses `/Intro.mp4`, fallback to poster |
| Home screen (title, Minu, Play, Settings) | ✅ Done | Sound toggle, reset progress |
| Calibration map (5 level cards, lock/complete) | ✅ Done | Levels lock/unlock based on completion |
| Level screen placeholder | ✅ Done | "Coming soon" stub |
| Minu pose config (14 poses mapped) | ✅ Done | `lib/minu-config.ts` |
| Starfield component (hydration fix) | ✅ Done | `components/starfield.tsx` |
| Responsive viewport (device-width, dvh) | ✅ Done | `min-h-dvh` used everywhere |
| Spec file (magic-glasses-spec.md) | ✅ Done | Now at v2.2 |

### Phase 2: Shared Components ✅ COMPLETE
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Glasses progress | `components/glasses-progress.tsx` | ✅ Done | SVG glasses + 5 lens segments + progress bar |
| Speech bubble | `components/speech-bubble.tsx` | ✅ Done | Retro arcade style, neon glow border |
| Minu avatar | `components/minu-avatar.tsx` | ✅ Done | Pose switching + reaction logic |
| Split view | `components/split-view.tsx` | ✅ Done | Before/after image comparison, draggable divider |
| Pixel inspector | `components/pixel-inspector.tsx` | ✅ Done | Tap to inspect pixel values (canvas-based) |
| Level quiz | `components/level-quiz.tsx` | ✅ Done | Visual choice + hands-on slider quiz, score tracking, pass/fail results screen, onFail callback for retries |
| Slider | `components/ui/slider.tsx` | ✅ Done | Large touch-friendly (44px handle) |
| Audio helpers | `lib/audio.ts` | ✅ Done | SFX (Web Audio API) + master sound toggle |
| Level data types | `lib/level-data.ts` | ✅ Done | LevelConfig, SliderConfig, MinuReaction, QuizQuestion types |

### Audio Integration ✅ COMPLETE
| Task | Status | Notes |
|------|--------|-------|
| `playClick()` on all buttons | ✅ Done | All screens: home, intro, calibration-map, level-screen |
| `playFanfare()` on level complete | ✅ Done | In `app/page.tsx` handleComplete |
| Master sound toggle (`_soundEnabled`) | ✅ Done | `lib/audio.ts` — gates all SFX + BGM |
| Sound toggle wired to UI | ✅ Done | `useEffect` syncs `soundOn` state to `setSoundEnabled()` |
| Default sound ON | ✅ Done | `soundOn` defaults to `true` in page.tsx and audio.ts |
| Ambient background music | ✅ Done | Web Audio API — 3 detuned sine oscillators + LFO pad |
| BGM auto-starts on load | ✅ Done | `startBGM()` in useEffect on mount, cleanup on unmount |
| BGM fades with sound toggle | ✅ Done | `updateBGMVolume()` ramps gain, stops when muted |
| Volume controls in Settings | ✅ Done | 3 sliders: Music (0–100), Effects (0–100), Voice (0–100) |
| BGM volume control | ✅ Done | `setBGMVolume()` adjusts master gain, scales 0–1 → 0–0.12 |
| SFX volume control | ✅ Done | `setSFXVolume()` multiplies all tone volumes |
| Voice volume control | ✅ Done | `setVoiceVolume()` multiplier (ready for MP3 playback) |
| Volume sliders hide when muted | ✅ Done | Settings panel conditionally shows sliders when soundOn |
| Unit conversion fix | ✅ Done | Initial slider state: `Math.round(getXVolume() * 100)`, converters `/100` |
| Browser tested | ✅ Done | All sounds working, no console errors |
| `playNarratorFile()` MP3 playback | ✅ Done | `lib/audio.ts` — HTML5 Audio API, respects voice volume, stops previous |
| `stopNarrator()` | ✅ Done | Stops any currently playing narrator MP3 |
| Welcome audio (first-time/returning) | ✅ Done | `home-screen.tsx` — localStorage `minu-visited` flag |
| Sound ON narrator confirmation | ✅ Done | `home-screen.tsx` — plays before mute toggle (audible) |
| Sound OFF narrator confirmation | ✅ Done | `home-screen.tsx` — plays via `temporarilyEnableSound()` before mute, with 200ms restore delay |
| `temporarilyEnableSound()` / `restoreSoundState()` | ✅ Done | `lib/audio.ts` — helpers for playing confirmation sounds when sound is off |
| Map explanation narrator (once per session) | ✅ Done | `calibration-map.tsx` — plays once via `useRef` guard, not on every re-mount |
| Quiz correct/incorrect narrator | ✅ Done | `level-quiz.tsx` — alternates between 2 clips randomly |
| Level complete narrator | ✅ Done | `page.tsx` — 6000ms timeout gives narrator audio time to finish before map transition |
| All levels complete narrator | ✅ Done | `page.tsx` — plays when all 5 levels done |
| Narrator audio files wired (11/58) | ✅ Done | All 11 existing MP3 files integrated into app |
| Level complete timeout fix | ✅ Done | Increased from 2500ms → 6000ms so narrator audio isn't cut off |

### Documentation ✅ COMPLETE
| File | Status | Notes |
|------|--------|-------|
| `magic-glasses-spec.md` (v2.2) | ✅ Done | Pedagogy updated: Narrator teaches, Minu reacts |
| `minu-dialogues.txt` (v2) | ✅ Done | 58 dialogue lines (28 narrator + 30 Minu) |
| `minu-pose-prompts.txt` | ✅ Done | Prompts for 6 remaining Minu poses |
| `jobs.md` (this file) | ✅ Done | Project status tracker |

### Level 5: Image Classification ✅ COMPLETE
| Feature | Status | Notes |
|---------|--------|-------|
| 12 images across 5 categories | ✅ Done | animal (cat, dog), vehicle (car, bicycle), food (pizza, apple, sandwich), space (rocket, planet, star), nature (flower, tree) |
| 4-step analysis pipeline | ✅ Done | brightness, color, edges, features — connects to Levels 1-4 concepts |
| 80% threshold quiz gate | ✅ Done | Must classify ALL 12 images with ≥80% accuracy to unlock quiz |
| Dynamic quiz generation | ✅ Done | 5+ questions from 12-question concept pool + classification questions, shuffled each attempt |
| Quiz pass/fail tracking | ✅ Done | Score display, pass/fail results screen with progress bar |
| Quiz retakes | ✅ Done | Failed quiz → retry with fresh questions via onFail callback |
| Level calibration gate | ✅ Done | Level only marked complete on successful quiz pass |
| Score indicator in header | ✅ Done | Live correct/total count and accuracy % shown during exploration |
| Classification status badges | ✅ Done | ✓ Correct / ✗ Try again badge on each image card |

**Files modified:**
- `components/level-5-image-classification.tsx` — full rewrite with 12 images, threshold logic, dynamic quiz, retry flow
- `components/level-quiz.tsx` — added onFail prop, score tracking, pass/fail results screen

---

## 2. What's Left To Do

### Phase 3: Level Modules — 🔵 IN PROGRESS
Each teammate builds ONE level module independently.

| Module | Assigned To | Status | File Name |
|--------|-------------|--------|-----------|
| Level 1: Numbers to Brightness | _[TBD]_ | 🔵 Ready to start | `level-1-numbers-to-brightness.tsx` |
| Level 2: Brightness in Color | _[TBD]_ | 🔵 Ready to start | `level-2-brightness-in-color.tsx` |
| Level 3: Edge Detection | _[TBD]_ | 🔵 Ready to start | `level-3-edge-detection.tsx` |
| Level 4: Feature Recognition | _[TBD]_ | 🔵 Ready to start | `level-4-feature-recognition.tsx` |
| Level 5: Image Classification | You (user) | ✅ Module complete | `level-5-image-classification.tsx` — 12 images, 80% threshold quiz gate, dynamic quiz with 5+ questions, pass/fail retry flow |

**⚠️ IMPORTANT:** Each module builder MUST read:
1. `magic-glasses-spec.md` — Section 19.2 (Shared Conventions) and 19.3 (Module Interface Contract)
2. The LevelModule interface they must implement

### Phase 4: Integration — ⏳ WAITING ON PHASE 3
| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Wire all 5 modules into `level-screen.tsx` | ❌ Pending | Buffy | After all modules received |
| Update `level-data.ts` with all level configs | ❌ Pending | Buffy | After all modules received |
| Update CalibrationMap with glasses progress UI | ❌ Pending | Buffy | |
| Build `celebration-screen.tsx` (final screen) | ❌ Pending | Buffy | After all 5 levels complete |
| Build `level-complete-overlay.tsx` | ❌ Pending | Buffy | Per-level completion |
| Add localStorage persistence | ❌ Pending | Buffy | Save progress across sessions |
| Replace Web Speech API TTS with MP3 audio | 🟡 Partial | Buffy | 11/58 narrator files wired. `playNarratorFile()` ready. Remaining: level intros (14) + Minu reactions (30) + idle (5) |
| Wire narrator + Minu audio to triggers | 🟡 Partial | Buffy | 11 narrator triggers wired. Minu triggers pending (need Minu MP3 files). Level intros pending (need narrator level intro files) |
| Update LevelConfig type for new audio fields | ❌ Pending | Buffy | Match spec v2.2 (narratorIntro, minuIntro, etc.) |

### Phase 5: Polish & QA — ⏳ WAITING ON PHASE 4
| Task | Status | Owner |
|------|--------|-------|
| Cross-browser testing | ❌ Pending | Team |
| Mobile/tablet testing | ❌ Pending | Team |
| Accessibility audit | ❌ Pending | Team |
| Performance audit | ❌ Pending | Team |
| Final code review | ❌ Pending | Team |

---

## 3. What We're Waiting For

### 🎵 Audio MP3 Files (58 files)
**Waiting on:** User (you)
**Status:** 🟡 11/58 files received and wired — 47 remaining
**Reference file:** `minu-dialogues.txt` (contains all 58 dialogues with emotions)

**Files received and wired (11):**
```
public/audio/minu/
├── narrator_welcome_first_time.mp3  ✅ → home screen (first-time)
├── narrator_welcome_return.mp3      ✅ → home screen (returning)
├── narrator_sound_on.mp3            ✅ → sound toggle on
├── narrator_sound_off.mp3           ✅ → exists (not wired, can't hear after mute)
├── narrator_map_explain.mp3         ✅ → calibration map mount
├── narrator_quiz_correct.mp3        ✅ → Level 5 quiz (alternating)
├── narrator_quiz_correct_amazing.mp3 ✅ → Level 5 quiz (alternating)
├── narrator_quiz_incorrect.mp3      ✅ → Level 5 quiz (alternating)
├── narrator_quiz_incorrect_try.mp3  ✅ → Level 5 quiz (alternating)
├── narrator_level_complete.mp3      ✅ → level completion
└── narrator_all_complete.mp3        ✅ → all levels complete
```

**Files still needed (47):**
- Section 2: 14 narrator level intro files (`narrator_level1_intro.mp3` through `narrator_level5_quiz_hands_on.mp3`)
- Section 5: 30 Minu reaction files (`minu_first_sees_numbers.mp3` through `minu_encouragement_try_pixel.mp3`)
- Section 6: 5 Minu idle/special files (`minu_idle_long_time.mp3` through `minu_settings_welcome.mp3`)

**File naming convention:**
- `narrator_welcome_first_time.mp3`
- `narrator_level1_intro.mp3`
- `minu_first_sees_numbers.mp3`
- `minu_slider_extreme_dark.mp3`
- etc.

**Voice direction:**
- Narrator: Warm, friendly adult (PBS/Blue's Clues host)
- Minu: Childlike alien (higher pitch, quirky, genuine)

**After placing files, tell Buffy:** "I've placed the MP3 files in public/audio/minu/"

### 🖼️ Minu Pose PNGs (6 files)
**Waiting on:** User (you)
**Status:** ❌ NOT STARTED
**Reference file:** `minu-pose-prompts.txt` (contains prompts for Zimage Turbo)

**Where to put the files:**
```
public/minu/
├── minu_holding_glasses.png
├── minu_wearing_glasses.png
├── minu_excited_jump.png
├── minu_thumbs_up.png
├── minu_presenting.png
└── minu_peeking.png
```

**After placing files, tell Buffy:** "I've generated the 6 Minu poses"

### 🖼️ Level 5 Images (12+ files)
**Waiting on:** User (you)
**Status:** ❌ NOT STARTED — emoji placeholders in use
**Reference file:** `level5-prompts.txt` (prompts + dimensions for Zimage Turbo)

**Note:** Level 5 now has **12 images** across 5 categories (was 5). Images needed:
```
public/images/level5/
├── level5-cat.png           # 512x512 — cute cartoon cat
├── level5-dog.png           # 512x512 — friendly dog
├── level5-car.png           # 512x512 — red cartoon car
├── level5-bicycle.png       # 512x512 — bicycle
├── level5-pizza.png         # 512x512 — pizza slice
├── level5-apple.png         # 512x512 — red apple
├── level5-rocket.png        # 512x512 — rocket ship
├── level5-planet.png        # 512x512 — ringed planet
├── level5-flower.png        # 512x512 — cartoon flower
├── level5-tree.png          # 512x512 — tall tree
├── level5-star.png          # 512x512 — shining star
└── level5-sandwich.png      # 512x512 — sandwich
```

**After placing files, update:** `components/level-5-image-classification.tsx` (uncomment `src` paths on each `ImageEntry`)

### 🖼️ Other Level Images (20+ files)
**Waiting on:** User (you) + teammates
**Status:** ❌ NOT STARTED

**Where to put the files:**
```
public/images/
├── level1-bright.png
├── level1-dark.png
├── level2-colorful.png
├── level2-grid.png
├── level3-cartoon.png
├── level3-edges.png
├── level4-shapes.png
├── level4-regions.png
└── quiz/
    ├── q1-bright.png, q1-dark.png
    ├── q2-red.png, q2-green.png, q2-blue.png
    ├── q3-edges.png, q3-original.png
    └── q4-3regions.png, q4-many.png, q4-1region.png
```

**After placing files, tell Buffy:** "I've generated the level images"

### 🤓 Glasses SVG/PNG Asset (1 file)
**Waiting on:** User (you)
**Status:** ❌ NOT STARTED

**Where to put the file:**
```
public/glasses.svg (or glasses.png)
```

### 👥 Level Module Files (5 files)
**Waiting on:** Teammates
**Status:** 🔵 Ready to start (shared components are done)

**Where teammates should send the files:**
Each module is a single `.tsx` file placed in:
```
components/
├── level-1-numbers-to-brightness.tsx
├── level-2-brightness-in-color.tsx
├── level-3-edge-detection.tsx
├── level-4-feature-recognition.tsx
└── level-5-image-classification.tsx
```

**After receiving modules, tell Buffy:** "I've received the level modules from my teammates"

---

## 4. Key Decisions Made

| Decision | Date | Details |
|----------|------|---------|
| Pedagogy: Narrator teaches, Minu reacts | June 16 | Minu never teaches — she only reacts emotionally. Narrator is the teacher. |
| Two-voice audio system | June 16 | Pre-recorded MP3 files instead of Web Speech API TTS |
| 58 dialogue lines total | June 16 | 28 narrator + 30 Minu lines (see `minu-dialogues.txt`) |
| Team-based module building | June 16 | Each teammate builds one level independently, Buffy integrates |
| Module interface contract | June 16 | LevelModule type with levelId, config, component |
| Sound toggle gates all audio | June 16 | Master `_soundEnabled` flag in `lib/audio.ts` |
| Responsive: `min-h-dvh` not `min-h-screen` | June 16 | For proper mobile viewport handling |
| Level 5 redesign: analysis pipeline | June 16 | Replaced abstract importance sliders with 4-step analysis pipeline (brightness, color, edges, features) that directly connects to Levels 1-4 concepts |
| Level 5: 12 images, 80% threshold, dynamic quiz | June 17 | Expanded from 5 to 12 images across 5 categories. Quiz unlocks only after all images classified with ≥80% accuracy. Quiz generates 5+ dynamic questions from a 12-question pool (shuffled each attempt). Level only marked calibrated on quiz success. |
| Narrator MP3 audio integration | June 17 | Added `playNarratorFile()` to `lib/audio.ts` using HTML5 Audio API. Wired 11 existing narrator MP3s: welcome (first-time/returning via localStorage), sound toggle confirmation, map explanation, quiz feedback (alternating clips), level complete, all-complete. Sound toggle plays "on" before mute so it's audible. |
| Sound toggle fix: on/off confirmation | June 17 | Added `temporarilyEnableSound()` and `restoreSoundState()` to `lib/audio.ts`. Sound toggle now plays `narrator_sound_off.mp3` BEFORE muting (with 200ms delay to let audio start). Both on and off confirmation sounds are now audible. |
| Map narrator one-shot | June 17 | `calibration-map.tsx` uses `useRef` guard so `narrator_map_explain.mp3` plays once per session, not on every mount. |
| Level complete timeout fix | June 17 | `page.tsx` celebration timeout increased from 2500ms → 6000ms so narrator audio finishes before returning to map. |

---

## 5. File Structure (Current)

```
minu-s-magic-glasses/
├── app/
│   ├── page.tsx              # Screen routing, celebration overlay, audio triggers
│   ├── globals.css           # Theme, animations, responsive
│   └── layout.tsx            # Viewport, fonts, analytics
├── components/
│   ├── intro-screen.tsx      # Video player with fallback
│   ├── home-screen.tsx       # Title, Minu, Play, Settings (with playClick)
│   ├── calibration-map.tsx   # 5 level cards (with playClick)
│   ├── level-screen.tsx      # Stub — "coming soon"
│   ├── level-5-image-classification.tsx  # ✅ NEW — Level 5 module
│   ├── starfield.tsx         # Background stars
│   ├── speech-bubble.tsx     # ✅ NEW — Retro speech bubble
│   ├── minu-avatar.tsx       # ✅ NEW — Pose switching
│   ├── split-view.tsx        # ✅ NEW — Before/after comparison
│   ├── pixel-inspector.tsx   # ✅ NEW — Tap to inspect
│   ├── level-quiz.tsx        # ✅ NEW — Visual + hands-on quiz
│   ├── glasses-progress.tsx  # ✅ NEW — Glasses icon + progress
│   └── ui/
│       ├── button.tsx        # shadcn/ui button
│       └── slider.tsx        # ✅ NEW — Touch-friendly slider
├── lib/
│   ├── minu-config.ts        # 14 poses, 5 levels
│   ├── level-data.ts         # ✅ NEW — Shared types
│   ├── audio.ts              # ✅ NEW — SFX + master toggle
│   └── utils.ts              # cn() helper
├── public/
│   ├── Intro.mp4             # Intro video
│   ├── minu/                 # 14 pose PNGs
│   └── audio/minu/           # ❌ NEEDS 58 MP3 files
├── magic-glasses-spec.md     # Product spec (v2.2)
├── minu-dialogues.txt        # All 58 dialogue lines
├── minu-pose-prompts.txt     # Prompts for 6 remaining poses
├── level5-prompts.txt        # ✅ NEW — Image gen prompts for Level 5
├── jobs.md                   # This file
└── package.json              # pnpm, Next.js 16
```

---

## 6. How to Resume After Session Termination

1. **Read this file** (`jobs.md`) — it has everything
2. **Check what's waiting** — Section 3 tells you exactly what files to provide
3. **Tell Buffy** what you've completed (e.g., "I placed the MP3 files")
4. **Buffy will pick up** from where we left off

---

## 7. Commands Reference

```bash
# Start dev server
cd G:/Cursor/FreeBuff/minu-s-magic-glasses && npx next dev --port 3001

# Typecheck
cd G:/Cursor/FreeBuff/minu-s-magic-glasses && npx tsc --noEmit

# Check if dev server is running
netstat -ano | findstr :3001
```

---

## 8. Progress Summary

```
Phase 1 (Foundation):     ████████████████████ 100%  ✅ DONE
Phase 2 (Shared):         ████████████████████ 100%  ✅ DONE
Phase 3 (Modules):        ████░░░░░░░░░░░░░░░░  20%  🔵 Level 5 redesigned (analysis pipeline), 4 waiting on teammates
Phase 4 (Integration):    ░░░░░░░░░░░░░░░░░░░░   0%  ⏳ Waiting on Phase 3 + MP3s
Phase 5 (Polish & QA):    ░░░░░░░░░░░░░░░░░░░░   0%  ⏳ Waiting on Phase 4

Audio Assets:             █████░░░░░░░░░░░░░░░░  19%  🟡 11/58 MP3s received & wired
Minu Poses:               ████████████░░░░░░░░  70%  ❌ Waiting on you (6 PNGs)
Level 5 Images:           ░░░░░░░░░░░░░░░░░░░░   0%  ❌ Waiting on you (12 PNGs, emoji placeholders in use)
Other Level Images:       ░░░░░░░░░░░░░░░░░░░░   0%  ❌ Waiting on you + teammates
Glasses Asset:            ░░░░░░░░░░░░░░░░░░░░   0%  ❌ Waiting on you (1 SVG/PNG)

Overall Progress: ~45% (foundation + shared + Level 5 redesigned)
```
