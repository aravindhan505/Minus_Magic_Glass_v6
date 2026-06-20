# Minu's Magic Glasses — Project Status & Session Tracker

**Last Updated:** June 20, 2026
**Last Session:** Pushed to GitHub `aravindhan505/Minus_Magic_Glass_v5` — Level 2 audio (19 MP3s), reveal spec, Vercel LFS fix

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
| Planet Map (solar-system carousel) | ✅ Done | Single-planet focus, neighbors visible on orbit, tap to start |
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
| Welcome audio (first-time/returning) | ✅ Done | `minu-visited` set after first-time clip ends; Strict Mode debounce |
| Planet map planet narrator (no duplicate) | ✅ Done | Single effect after map intro; 2s debounce per planet index |
| Sound ON narrator confirmation | ✅ Done | `home-screen.tsx` — plays before mute toggle (audible) |
| Sound OFF narrator confirmation | ✅ Done | `home-screen.tsx` — plays via `temporarilyEnableSound()` before mute, with 200ms restore delay |
| `temporarilyEnableSound()` / `restoreSoundState()` | ✅ Done | `lib/audio.ts` — helpers for playing confirmation sounds when sound is off |
| Map explanation narrator (once per session) | ✅ Done | `lib/audio.ts` `playMapExplainOnce()` — session guard, not on every re-mount |
| Quiz correct/incorrect narrator | ✅ Done | `level-quiz.tsx` — alternates between 2 clips randomly |
| Level complete narrator | ✅ Done | `page.tsx` — waits for MP3 `onEnd` before returning to map (15s fallback) |
| All levels complete narrator | ✅ Done | `page.tsx` — plays when all 5 levels done |
| Narrator audio files wired (61/58) | ✅ Done | 11 shared `audio/minu/` + 31 L5 + 19 L2 |
| Level 2 narrator triggers | ✅ Done | `playLevel2Narrator()` — bridges, rounds, hints, reveal, quiz |
| Level 5 narrator triggers | ✅ Done | `playLevel5Narrator()` — intro chain, rounds, hints, hierarchy, quiz |
| Planet name narrator (5 clips) | ✅ Done | `public/audio/planets/*.mp3` — plays on Planet Map navigation |
| Level complete timeout fix | ✅ Done | Replaced fixed timeout with `playNarratorFile({ onEnd })` so audio never cuts off |

### Planet Map UI Redesign ✅ COMPLETE (June 18)
| Feature | Status | Notes |
|---------|--------|-------|
| Card grid → Planet Map carousel | ✅ Done | Renamed "Calibration Lab" → "Planet Map" |
| Single-planet focus view | ✅ Done | One active planet centered, tap to start |
| Left/right solar-system navigation | ✅ Done | Arrow buttons + dot indicators + tap neighbor planets |
| Adjacent planets visible on orbit | ✅ Done | Planets ±1 and ±2 shown smaller on circular orbit path |
| Circular wrap-around orbit | ✅ Done | L5 appears left of L1; L1 appears right of L5; arrows loop both ways |
| Responsive wide orbit layout | ✅ Done | `ResizeObserver` scales orbit radius to ~46–54% of orbit container width |
| Keyboard planet navigation | ✅ Done | ← → arrow keys on laptop navigate planets (wraps circularly) |
| No-scroll Planet Map layout | ✅ Done | `h-dvh` + flex `min-h-0`; orbit scales from width AND height; compact footer |
| Planet orbit (clean) | ✅ Done | No background ring or link lines — planets slide on circular path only |
| Planet PNG assets wired | ✅ Done | `public/images/planets/*.png` — bounce, neon glow, drop shadow (`globals.css`) |
| Planet display size enlarged | ✅ Done | Center 280px, neighbor 180px, distant 120px; orbit scale bumped |
| Wider horizontal planet spacing | ✅ Done | `orbitRadiiFromContainer` — radiusX up to ~54% width; orbit section full-width (no max-w-7xl cap) |
| Planet bounce animation (all) | ✅ Done | Gentle `animate-planet-bounce` (8px) + synced shadow, staggered per planet |
| Testing: all levels unlocked | 🟡 TEMP | `TESTING_UNLOCK_ALL_LEVELS = true` in `lib/minu-config.ts` — set `false` before release |
| Kid-friendly fonts app-wide | ✅ Done | Fredoka headings, Nunito body, Pixelify arcade title only |
| Minu spaceship header companion | ✅ Done | `minu_spaceship.png` + `MinuSpaceship` — hover bob + engine smoke in level headers |
| Minu spaceship Planet Map flyer | ✅ Done | `MinuSpaceshipFlyer` — random cruise paths over orbit between planets |
| Focus persists after level complete | ✅ Done | `mapFocusLevelId` in `page.tsx` — completing planet 3 returns to planet 3 |
| Focus persists on back navigation | ✅ Done | Back from level keeps same planet focused |
| Narrator map explain once per session | ✅ Done | `playMapExplainOnce()` in `lib/audio.ts` |
| Level intro narrator on enter | ✅ Done | `level-screen.tsx` plays `narrator_levelN_intro.mp3` (silent until files exist) |

**Files modified:**
- `components/calibration-map.tsx` — full Planet Map solar-system rewrite
- `app/page.tsx` — `mapFocusLevelId` state, focus on complete/back
- `app/layout.tsx` — Fredoka + Pixelify arcade fonts
- `app/globals.css` — planet animations, improved text contrast
- `lib/audio.ts` — `playMapExplainOnce()`, narrator `onEnd` callback
- `components/home-screen.tsx`, `speech-bubble.tsx`, `level-screen.tsx` — typography

### Documentation ✅ COMPLETE
| File | Status | Notes |
|------|--------|-------|
| `magic-glasses-spec.md` (v2.2) | ✅ Done | Pedagogy updated: Narrator teaches, Minu reacts |
| `minu-dialogues.txt` (v2) | ✅ Done | 58 dialogue lines (28 narrator + 30 Minu) |
| `minu-pose-prompts.txt` | ✅ Done | Prompts for 6 remaining Minu poses |
| `jobs.md` (this file) | ✅ Done | Project status tracker |

### Level 2: Color Potion Time (RGB Mixing) ✅ COMPLETE (June 19)
| Feature | Status | Notes |
|---------|--------|-------|
| Reference port | ✅ Done | Adapted from `references/minu's-magic-laboratory` |
| Dual magic lenses (Target + My Mix) | ✅ Done | `components/level-2-color-lens.tsx` — silhouette masked in colored liquid |
| RGB sliders (R/G/B 0–255) | ✅ Done | `LevelSlider` — kid-friendly potion mixing |
| 3 color-matching rounds | ✅ Done | Random item + target color per round; progressive difficulty |
| Check Match + Hint | ✅ Done | ±28 RGB tolerance; 3-tier hints + glowing slider highlight |
| Hidden object surprise | ✅ Done | Round text says "hidden object" — name only on reveal |
| Reveal screen | ✅ Done | Shows `*-revealed.png` collectible on success |
| Final RGB quiz (3 hands-on Qs) | ✅ Done | `LEVEL2_QUIZ` in `lib/level2-color-potion.ts` |
| Item assets (100 PNGs) | ✅ Done | `public/images/level2/items/` — 50 silhouette + 50 revealed |
| Wired in level-screen | ✅ Done | Lazy-loaded like Level 5 |
| **Level 2 narrator audio (19 MP3s)** | ✅ Done | `public/audio/level_2/` — all clips from `level2_assets/level2audio.txt` |
| Level 2 audio triggers wired | ✅ Done | `lib/level2-audio.ts` + `playLevel2Then()` chains |
| Level 2 bridge screens | ✅ Done | Intro + Quiz Time bridges; `activity_intro` plays on round 1 start |
| Level 2 audio timing (no cutoffs) | ✅ Done | Match success / all-rounds-done wait for narrator before phase change |

**Level 2 flow:** Intro bridge → 3 potion rounds (`activity_intro` on round 1, `round_start` on 2–3) → Quiz bridge → RGB hands-on quiz (80% pass) → level complete

**Files:**
- `lib/level2-color-potion.ts` — 50 items, target colors, hints, quiz pool
- `lib/level2-audio.ts` — Level 2 narrator path + hint/quiz maps + `playLevel2Narrator()`
- `components/level-2-color-lens.tsx` — circular lens UI with slosh animation
- `components/level-2-brightness-in-color.tsx` — full level orchestrator + L2 audio
- `components/level-screen.tsx` — routes `level.id === 2` to Level 2 module (intro handled in module)

### Level 5: Object Detection — Two Parts + CV Quiz 🟡 IN PROGRESS (June 18)
| Feature | Status | Notes |
|---------|--------|-------|
| **Part 1 — Object Detection** | | |
| Reference + 16-tile multi-select | ✅ Done | 4×4 grid — unchanged gameplay (team loved it) |
| **3 random rounds** from pool of 5 | ✅ Done | `getRandomDetectionRounds(3)` — cats/dogs/cars/apples/rockets |
| Code transforms (rotate/flip/invert) | ✅ Done | CSS transforms on colour variants |
| 7 correct tiles per round | ✅ Done | 4 colour PNGs + 3 transforms |
| Part 1 character assets (65 PNGs) | ✅ Done | `public/images/level5/characters/` |
| Part 1 asset guide | ✅ Done | `level5_assets/level5_asset.txt` |
| **Part 2 — Hierarchical Feature Matching** | | |
| **Macro body** then **Micro head** (single human) | ✅ Done | `lib/level5-hierarchy.ts` — 2 phases, no random picker |
| Drag-and-drop layer stack | ✅ Done | Legs → torso → hands → head; then face features → hair |
| Touch/pointer drag | ✅ Done | Compact horizontal tray; silhouette drop zone |
| Viewport-safe layout (no scroll) | ✅ Done | CSS grid + `min(68vw, 30dvh)` square; tray single-row scroll |
| Part 2 assets (14 PNGs) | ✅ Done | `public/images/level5/hierarchy/` — flat folder, exact filenames |
| Part 2 asset guide | ✅ Done | `level5_assets/lvl5Hierachicalassets.txt` |
| **Final Quiz — Computer Vision** | | |
| After Part 1 + Part 2 | ✅ Done | Quiz is last step before level complete |
| **5 random** from pool of **10** | ✅ Done | CV topics: detection, transforms, localization, hierarchy |
| Quiz pass: **4 of 5** (80%) | ✅ Done | `LEVEL5_QUIZ_PASS_PERCENT = 80`; reshuffle on retry |
| Transform previews in quiz | ✅ Done | `flipH` / `rotate90` / `invert` / `tilt` on options |
| Quiz picture-only options (no labels) | ✅ Done | `hideOptionLabels` on `LevelQuiz` — kids pick by image only |
| **Level 5 narrator audio (31 MP3s)** | ✅ Done | `public/audio/level_5/` — all required clips from `level5_assets/level5audio.txt` |
| Level 5 audio triggers wired | ✅ Done | `lib/level5-audio.ts` + Part 1 / Part 2 / quiz components |
| Level 5 audio timing (no cutoffs) | ✅ Done | `playLevel5Then()` chains clips; quiz intro gates question narrator |
| Level 5 part bridge screens | ✅ Done | `level-5-part-bridge.tsx` — Part 1, Part 2 & Quiz Time title + intro before gameplay |
| Optional Minu L5 reactions (6) | ⏭ Skipped | User skipped — no wiring needed |

**Level 5 flow:** Part 1 (3 random detection rounds) → Part 2 Macro body → Part 2 Micro head → Final CV quiz (5 random Qs, 4/5 pass) → level complete

**Files:**
- `lib/level5-object-detection.ts` — Part 1 rounds, tile mapping, quiz pool + random picker
- `lib/level5-hierarchy.ts` — Part 2 macro/micro phase config + asset paths
- `lib/level5-audio.ts` — Level 5 narrator path + round/hint maps + `playLevel5Narrator()`
- `components/level-5-image-classification.tsx` — orchestrates Part 1 → Part 2 → quiz + L5 audio
- `components/level-5-hierarchy-matching.tsx` — Part 2 drag-and-drop UI + hierarchy audio
- `components/level-quiz.tsx` — `passPercent`, `successMessage`, `onQuestionStart` / `onPass` / `onQuizFail`

**Level 5 audio map (`public/audio/level_5/`):**
| Trigger | File |
|---------|------|
| Part 1 bridge screen | `narrator_level5_intro.mp3` → activity (`part1_intro` → round clip) |
| Round start (cats/dogs/cars/apples/rockets) | `narrator_level5_round_*.mp3` |
| Hint tiers 1–4 | `hint_count` / `hint_colors` / `hint_transform` / `hint_glow` |
| Check match wrong / missing / too many / success | `wrong_pick` / `missing` / `too_many` / `round_success` |
| Part 1 complete → Part 2 | `part1_complete.mp3` |
| Part 2 bridge screen | `narrator_level5_part2_intro.mp3` → hierarchy (`macro_intro` or `micro_intro`) |
| Hierarchy idle 8s | `macro_instruction` / `micro_instruction` |
| Part placed / drop miss / phase complete | `part_placed` / `drop_miss` / `macro_complete` / `micro_complete` |
| Macro → micro transition | `macro_transition.mp3` |
| Part 2 → quiz | `part2_complete.mp3` |
| Quiz bridge screen | `narrator_level5_quiz_intro.mp3` → quiz (`quiz_question` / pass / fail) |
| Per-answer correct/incorrect | shared `public/audio/minu/narrator_quiz_*.mp3` (unchanged) |
| Level complete (leaving level) | shared `narrator_level_complete.mp3` (unchanged) |

### Asset sync — G: drive vs dev worktree (June 19)
| Item | Detail |
|------|--------|
| **You edit assets here** | `G:\Cursor\FreeBuff\minu-s-magic-glasses\public\` |
| **Dev server runs here** | `C:\Users\lanni\.grok\worktrees\freebuff-minu-s-magic-glasses\minu\` |
| **Why changes didn't show** | Browser served from worktree; G: edits need mirroring |
| **Sync command** | `robocopy "G:\Cursor\FreeBuff\minu-s-magic-glasses\public" "C:\Users\lanni\.grok\worktrees\freebuff-minu-s-magic-glasses\minu\public" /MIR /XD node_modules .next` |
| **Intro video cache** | Bump `?v=` in `lib/minu-config.ts` `introVideo.src` after replacing `Intro.mp4` |
| **Hard refresh** | `Ctrl+Shift+R` in browser after asset sync |

---

## 2. What's Left To Do

### Phase 3: Level Modules — 🔵 IN PROGRESS
Each teammate builds ONE level module independently.

| Module | Assigned To | Status | File Name |
|--------|-------------|--------|-----------|
| Level 1: Numbers to Brightness | _[TBD]_ | 🔵 Ready to start | `level-1-numbers-to-brightness.tsx` |
| Level 2: Brightness in Color | Buffy | ✅ Done | `level-2-brightness-in-color.tsx` — Color Potion RGB mixing |
| Level 3: Edge Detection | Buffy | ✅ Done | Silhouette-first tracing · 3 random/6 · 100% reveals color · edge quiz 2/3 |
| Level 4: Feature Recognition | Buffy | ✅ Done | `level-4-feature-recognition.tsx` — shape/color/texture rounds + visual quiz 2/3 |
| Level 5: Object Detection | ✅ Done | Part 1 + Part 2 + CV quiz + full narrator audio wired |

**⚠️ IMPORTANT:** Each module builder MUST read:
1. `magic-glasses-spec.md` — Section 19.2 (Shared Conventions) and 19.3 (Module Interface Contract)
2. The LevelModule interface they must implement

### Phase 4: Integration — ⏳ WAITING ON PHASE 3
| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Wire all 5 modules into `level-screen.tsx` | 🟡 Partial | Buffy | Levels 2, 3, 4, 5 wired; Level 1 placeholder |
| Update `level-data.ts` with all level configs | ❌ Pending | Buffy | After all modules received |
| Update CalibrationMap with glasses progress UI | ❌ Pending | Buffy | |
| Build `celebration-screen.tsx` (final screen) | ❌ Pending | Buffy | After all 5 levels complete |
| Build `level-complete-overlay.tsx` | ❌ Pending | Buffy | Per-level completion |
| Add localStorage persistence | ❌ Pending | Buffy | Save progress across sessions |
| Replace Web Speech API TTS with MP3 audio | 🟡 Partial | Buffy | 42/58 narrator files wired. Remaining: L1–L4 intros + L2 audio (20 files) + Minu reactions (30) |
| Wire narrator + Minu audio to triggers | 🟡 Partial | Buffy | Global + Level 5 narrator wired. L2 audio pending files. Minu reactions pending |
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

### 🎵 Audio MP3 Files (58 files in minu-dialogues + level-specific packs)
**Waiting on:** User (you) — Level 1/3/4 narrator packs + 30 Minu reaction files
**Status:** 🟡 Level 2 complete (19/19). Level 5 complete (31/31). 11 shared wired. 16 global + 30 Minu remaining.

**Shared files (`public/audio/minu/`) — 11 wired:**
```
public/audio/minu/
├── narrator_welcome_first_time.mp3  ✅ → home screen (first-time)
├── narrator_welcome_return.mp3      ✅ → home screen (returning)
├── narrator_sound_on.mp3            ✅ → sound toggle on
├── narrator_sound_off.mp3           ✅ → exists (not wired, can't hear after mute)
├── narrator_map_explain.mp3         ✅ → calibration map mount
├── narrator_quiz_correct.mp3        ✅ → all quizzes (alternating)
├── narrator_quiz_correct_amazing.mp3  ✅ → all quizzes (alternating)
├── narrator_quiz_incorrect.mp3        ✅ → all quizzes (alternating)
├── narrator_quiz_incorrect_try.mp3    ✅ → all quizzes (alternating)
├── narrator_level_complete.mp3        ✅ → level completion
└── narrator_all_complete.mp3          ✅ → all levels complete
```

**Level 5 files (`public/audio/level_5/`) — 31/31 received and wired ✅**
- Spec: `level5_assets/level5audio.txt`
- User path: `G:\Cursor\FreeBuff\minu-s-magic-glasses\public\audio\level_5\`
- Helper: `lib/level5-audio.ts` → `playLevel5Narrator()`
- Optional 6 Minu L5 reactions: skipped by user

**Level 2 files (`public/audio/level_2/`) — 19/19 received and wired ✅**
- Spec: `level2_assets/level2audio.txt`
- User path: `G:\Cursor\FreeBuff\minu-s-magic-glasses\public\audio\level_2\`
- Helper: `lib/level2-audio.ts` → `playLevel2Narrator()` / `playLevel2Then()`
- Optional 4 Minu L2 reactions: not generated (skipped)

**Level 3 files (`public/audio/level_3/`) — 0/8, spec ready:**
- `level3_assets/level3audio.txt`

**Level 4 files (`public/audio/level_4/`) — 0/9, spec ready:**
- `level4_assets/level4audio.txt`

**Files still needed (Level 1 narrator + 30 Minu):**
- Level 1 intro/instruction/quiz narrator files (see `minu-dialogues.txt`)
- 30 Minu reaction files + 5 idle/special (see `minu-dialogues.txt` Sections 5–6)

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

### 🖼️ Level 5 Part 1 Character Images (65 PNG files)
**Waiting on:** User (you)
**Status:** ✅ DONE — placed in `public/images/level5/characters/`
**Reference file:** `level5_assets/level5_asset.txt`

**Wired in:** `lib/level5-object-detection.ts` + `components/level-5-image-classification.tsx`

### 🖼️ Level 5 Part 2 Hierarchy Images (14 PNG files)
**Waiting on:** User (you)
**Status:** ✅ DONE — placed in `public/images/level5/hierarchy/` (flat folder)
**Reference file:** `level5_assets/lvl5Hierachicalassets.txt`

**Macro body:** `full_body_shilloute.png`, `full_legs.png`, `full_torso.png`, `full_hands.png`, `full_head.png`, `full_body_reveal.png`

**Micro head:** `head_shilloute.png`, `head_empty.png`, `ears.png`, `eyes.png`, `nose.png`, `mouth.png`, `hair.png`, `head_reveal.png`

**Wired in:** `lib/level5-hierarchy.ts` + `components/level-5-hierarchy-matching.tsx`

**After replacing files:** Run the robocopy sync (Section 1) and hard-refresh the browser.

### 🖼️ Level 3 Trace Pictures (12 PNGs — 6 pairs)
**Waiting on:** User (you)
**Status:** ✅ DONE — color + silhouette pairs wired (6 rounds)
**Reference file:** `level3_assets/level3images.txt`

```
public/images/level3/
├── trace-butterfly-color.png / trace-butterfly-silhouette.png
├── trace-house-color.png / trace-house-silhouette.png
├── trace-rocket-color.png / trace-rocket-silhouette.png
├── trace-teddybear-color.png / trace-teddybear-silhouette.png
├── trace-soccerball-color.png / trace-soccerball-silhouette.png
└── trace-car-color.png / trace-car-silhouette.png
```

### 🖼️ Level 4 Comparison Images (5 files)
**Waiting on:** User (you) — core set done from friend's reference
**Status:** ✅ DONE — `public/images/level4/` (5 pairs, kebab-case names)
**Reference file:** `level4_assets/level4images.txt` (optional pure S/C/T pairs listed)

```
public/images/level4/
├── apple-vs-tomato.png
├── orange-vs-tennis-ball.png
├── coconut-vs-basketball.png
├── dolphin.png
└── football-vs-golf.png
```

### 🖼️ Other Level Images (Level 1 + legacy spec)
**Waiting on:** User (you)
**Status:** ❌ NOT STARTED (Level 1 brightness pair)

```
public/images/
├── level1-bright.png
└── level1-dark.png
```

### 🪐 Planet Map Planet PNGs (5 files)
**Waiting on:** User (you)
**Status:** ✅ DONE — wired in `calibration-map.tsx` via `lib/minu-config.ts` `planetImages`
**Reference file:** `planet_asset.txt`

**Where to put the files:**
```
public/images/planets/
├── planet-1-brightness.png
├── planet-2-color.png
├── planet-3-edges.png
├── planet-4-features.png
└── planet-5-classification.png
```

**After placing files, tell Buffy:** "I've placed the planet PNGs"

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
| Map narrator one-shot | June 17 | `playMapExplainOnce()` in `lib/audio.ts` — session-level guard so map explain doesn't replay after level complete. |
| Level complete timeout fix | June 17 | `playNarratorFile({ onEnd })` waits for MP3 to finish before returning to Planet Map. |
| Planet Map solar-system UI | June 18 | Replaced 5-card grid with orbit carousel: center planet + neighbors visible, idle animations, `mapFocusLevelId` persists focus after complete/back. |
| Circular wrap-around orbit | June 18 | Planets on a closed ring — level 5 sits left of level 1, navigation wraps infinitely in both directions. |
| Wide orbit + keyboard nav | June 18 | Orbit radius scales with screen width; ← → arrow keys navigate planets on Planet Map. |
| Planet PNGs + larger display | June 18 | User assets in `public/images/planets/`; sizes 280/180/120px; bounce + glow effects. |
| Testing unlock all levels | June 18 | `TESTING_UNLOCK_ALL_LEVELS` flag bypasses planet locks until release. |
| Kid-friendly fonts | June 18 | Fredoka for headings app-wide; Pixelify retained for home title neon only; larger body text. |
| Level 5 Object Detection redesign | June 18 | Reference + 16-tile multi-select × 5 rounds; quiz 4/5 pass. User: 16×4-pack sheets → 57 PNGs; dev: transforms + grid in code. Spec: `level5_assets/level5_asset.txt`. |
| Level 5 module implemented | June 18 | 65 character PNGs wired; `lib/level5-object-detection.ts`; activity + quiz live. |
| Level 5 UI theme polish | June 18 | Left mission column (reference, Minu, status card, star counter, hints); arcade neon styling. |
| Level 5 two-part redesign | June 18 | Part 1 kept; Part 2 hierarchy; quiz moved to end. |
| Level 5 flow v2 | June 18 | Part 1: 3 random rounds / 5. Part 2: 3 random puzzles / 5 (cat,car,human,house,horse). Quiz: 5 random / 10 CV questions, 4/5 pass. Sheets: 1536×1024 → 6×512 crops. Spec: `lvl5Hierachicalassets.txt`. |
| Level 5 Part 2 code | June 18 | 5 hierarchy puzzles; random picker; placeholders until 30 PNGs. |
| Level 2 Color Potion module | June 19 | Ported from `minu's-magic-laboratory` reference; 3 rounds + RGB quiz. |
| Level 5 Part 2 human redesign | June 19 | Single human: Macro body (4 parts) → Micro head (6 parts); flat asset folder. |
| Asset sync G: → worktree | June 19 | Dev serves C: worktree; robocopy `public/` after G: asset edits. |
| Part 2 viewport layout fix | June 19 | CSS grid + bounded square drop zone; compact horizontal drag tray. |
| Intro video cache-bust | June 19 | `introVideo.src` uses `?v=` query param — bump when replacing `Intro.mp4`. |

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
│   ├── calibration-map.tsx   # Planet Map — solar-system orbit carousel
│   ├── level-screen.tsx      # Stub — "coming soon"
│   ├── level-5-image-classification.tsx  # ✅ Level 5 orchestrator (Part 1 + quiz + Part 2)
│   ├── level-5-hierarchy-matching.tsx    # ✅ Level 5 Part 2 drag-and-drop hierarchy
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
│   ├── level-data.ts         # ✅ Shared types
│   ├── level5-object-detection.ts  # ✅ Level 5 Part 1 rounds + quiz pool
│   ├── level5-hierarchy.ts         # ✅ Level 5 Part 2 cat/car puzzles
│   ├── audio.ts              # ✅ NEW — SFX + master toggle
│   └── utils.ts              # cn() helper
├── public/
│   ├── Intro.mp4             # Intro video
│   ├── minu/                 # 14 pose PNGs
│   └── audio/minu/           # ❌ NEEDS 58 MP3 files
├── magic-glasses-spec.md     # Product spec (v2.2)
├── minu-dialogues.txt        # All 58 dialogue lines
├── minu-pose-prompts.txt     # Prompts for 6 remaining poses
├── level5-prompts.txt        # ⚠️ SUPERSEDED — see level5_assets/
├── level5_assets/
│   ├── level5_asset.txt              # ✅ Part 1 Object Detection asset guide
│   └── lvl5Hierachicalassets.txt       # ✅ Part 2 hierarchy sheets (5×1536×1024 → 30 PNGs)
├── planet_asset.txt          # Planet Map PNG prompts
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

```powershell
# Sync assets after editing on G: drive
robocopy "G:\Cursor\FreeBuff\minu-s-magic-glasses\public" "C:\Users\lanni\.grok\worktrees\freebuff-minu-s-magic-glasses\minu\public" /MIR /XD node_modules .next

# Start dev server (webpack — stable on Windows; runs from worktree)
cd C:\Users\lanni\.grok\worktrees\freebuff-minu-s-magic-glasses\minu; pnpm run dev

# Typecheck
cd C:\Users\lanni\.grok\worktrees\freebuff-minu-s-magic-glasses\minu; pnpm exec tsc --noEmit

# Check if dev server is running
netstat -ano | findstr :3001
```

---

## 8. Progress Summary

```
Phase 1 (Foundation):     ████████████████████ 100%  ✅ DONE
Phase 2 (Shared):         ████████████████████ 100%  ✅ DONE
Phase 3 (Modules):        ████████████░░░░░░░░  60%  🟡 Levels 2 + 5 live; Levels 1, 3, 4 waiting
Phase 4 (Integration):    ░░░░░░░░░░░░░░░░░░░░   0%  ⏳ Waiting on Phase 3 + MP3s
Phase 5 (Polish & QA):    ░░░░░░░░░░░░░░░░░░░░   0%  ⏳ Waiting on Phase 4

Audio Assets:             █████░░░░░░░░░░░░░░░░  19%  🟡 11/58 MP3s received & wired
Minu Poses:               ████████████░░░░░░░░  70%  ❌ Waiting on you (6 PNGs)
Level 5 Part 1 Images:    ████████████████████ 100%  ✅ 65 character PNGs in public/images/level5/characters/
Level 5 Part 2 Images:    ████████████████████ 100%  ✅ 14 hierarchy PNGs in public/images/level5/hierarchy/
Other Level Images:       ░░░░░░░░░░░░░░░░░░░░   0%  ❌ Waiting on you + teammates
Planet Map PNGs:          ████████████████████ 100%  ✅ All 5 planets wired
Glasses Asset:            ░░░░░░░░░░░░░░░░░░░░   0%  ❌ Waiting on you (1 SVG/PNG)

Level 2 Potion Assets:    ████████████████████ 100%  ✅ 100 PNGs in public/images/level2/items/

Overall Progress: ~62% (foundation + shared + Planet Map + Levels 2 & 5 live; Levels 1, 3, 4 + MP3s pending)
```
