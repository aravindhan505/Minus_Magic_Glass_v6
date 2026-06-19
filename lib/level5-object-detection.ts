import type { QuizQuestion } from "@/lib/level-data"

/** Base path for user-provided character PNGs (512×512, transparent). */
export const L5_CHAR = "/images/level5/characters"

export type TileTransform = "none" | "rotate90" | "flipH" | "invert" | "tilt"

export type DetectionTile = {
  id: string
  /** Filename without path, e.g. "black_cat" */
  character: string
  transform?: TileTransform
  isCorrect: boolean
}

export type DetectionRound = {
  id: string
  label: string
  noun: string
  /** Plural for kids, e.g. "cats" */
  nounPlural: string
  referenceCharacter: string
  /** Colour variants + code transforms on reference */
  correct: Array<{ character: string; transform?: TileTransform }>
  wrong: string[]
  /** Kid-friendly copy (ages 5–9) */
  kidTitle: string
  kidInstruction: string
  referenceCaption: string
  hintCount: string
  hintColors: string
  hintUpsideDown: string
}

function charPath(name: string): string {
  return `${L5_CHAR}/${name}.png`
}

function buildTiles(round: DetectionRound): DetectionTile[] {
  const correctTiles: DetectionTile[] = round.correct.map((c, i) => ({
    id: `${round.id}-c-${i}-${c.transform ?? "none"}`,
    character: c.character,
    transform: c.transform ?? "none",
    isCorrect: true,
  }))
  const wrongTiles: DetectionTile[] = round.wrong.map((name, i) => ({
    id: `${round.id}-w-${i}`,
    character: name,
    transform: "none",
    isCorrect: false,
  }))
  return [...correctTiles, ...wrongTiles]
}

export const DETECTION_ROUNDS: DetectionRound[] = [
  {
    id: "cats",
    label: "Find all the cats!",
    noun: "cat",
    nounPlural: "cats",
    referenceCharacter: "black_cat",
    kidTitle: "Question 1: Find ALL the Cats!",
    kidInstruction:
      "Look at the big cat on the left. Tap every small picture that is a cat — even if it is white, grey, upside-down, or sideways. Do NOT tap dogs, horses, or other animals!",
    referenceCaption: "This is a cat!",
    hintCount: "Hint: There are 7 cat pictures to find!",
    hintColors: "Hint: Different colour cats still count — white and orange cats are cats too!",
    hintUpsideDown: "Hint: A cat that is flipped or upside-down is still a cat!",
    correct: [
      { character: "black_cat" },
      { character: "white_cat" },
      { character: "grey_cat" },
      { character: "orange_cat" },
      { character: "black_cat", transform: "rotate90" },
      { character: "black_cat", transform: "flipH" },
      { character: "black_cat", transform: "invert" },
    ],
    wrong: [
      "golden_dog",
      "brown_horse",
      "white_rabbit",
      "orange_fox",
      "green_parrot",
      "grey_mouse",
      "brown_bear",
      "cow_face",
      "green_frog",
    ],
  },
  {
    id: "dogs",
    label: "Find all the dogs!",
    noun: "dog",
    nounPlural: "dogs",
    referenceCharacter: "brown_dog",
    kidTitle: "Question 2: Find ALL the Dogs!",
    kidInstruction:
      "Look at the big dog on the left. Tap every picture that is a dog — any colour, even if it is turned around. Do NOT tap cats, pigs, or other animals!",
    referenceCaption: "This is a dog!",
    hintCount: "Hint: There are 7 dog pictures to find!",
    hintColors: "Hint: Black, white, and spotted dogs all count!",
    hintUpsideDown: "Hint: A dog on its side or upside-down is still a dog!",
    correct: [
      { character: "brown_dog" },
      { character: "white_dog" },
      { character: "black_dog" },
      { character: "spotted_dog" },
      { character: "brown_dog", transform: "rotate90" },
      { character: "brown_dog", transform: "flipH" },
      { character: "brown_dog", transform: "invert" },
    ],
    wrong: [
      "black_cat",
      "brown_horse",
      "white_rabbit",
      "red_chicken",
      "pink_pig",
      "white_sheep",
      "yellow_duck",
      "brown_hamster",
      "orange_fish",
    ],
  },
  {
    id: "cars",
    label: "Find all the cars!",
    noun: "car",
    nounPlural: "cars",
    referenceCharacter: "red_car",
    kidTitle: "Question 3: Find ALL the Cars!",
    kidInstruction:
      "Look at the big car on the left. Tap every picture that is a car — red, blue, yellow, or green, even if it is flipped. Do NOT tap buses, bikes, or planes!",
    referenceCaption: "This is a car!",
    hintCount: "Hint: There are 7 car pictures to find!",
    hintColors: "Hint: Cars can be different colours and still be cars!",
    hintUpsideDown: "Hint: A car that is sideways or upside-down is still a car!",
    correct: [
      { character: "red_car" },
      { character: "blue_car" },
      { character: "yellow_car" },
      { character: "green_car" },
      { character: "red_car", transform: "rotate90" },
      { character: "red_car", transform: "flipH" },
      { character: "red_car", transform: "invert" },
    ],
    wrong: [
      "red_bicycle",
      "yellow_bus",
      "blue_truck",
      "white_plane",
      "orange_boat",
      "green_train",
      "red_rocket",
      "silver_ufo",
      "purple_skateboard",
    ],
  },
  {
    id: "apples",
    label: "Find all the apples!",
    noun: "apple",
    nounPlural: "apples",
    referenceCharacter: "red_apple",
    kidTitle: "Question 4: Find ALL the Apples!",
    kidInstruction:
      "Look at the big apple on the left. Tap every picture that is an apple — green, yellow, or dark red too, even if it is turned. Do NOT tap bananas, pizza, or other food!",
    referenceCaption: "This is an apple!",
    hintCount: "Hint: There are 7 apple pictures to find!",
    hintColors: "Hint: Green and yellow apples still count as apples!",
    hintUpsideDown: "Hint: An apple that is flipped around is still an apple!",
    correct: [
      { character: "red_apple" },
      { character: "green_apple" },
      { character: "yellow_apple" },
      { character: "dark_red_apple" },
      { character: "red_apple", transform: "rotate90" },
      { character: "red_apple", transform: "flipH" },
      { character: "red_apple", transform: "invert" },
    ],
    wrong: [
      "orange_fruit",
      "yellow_banana",
      "pizza_slice",
      "sandwich",
      "orange_carrot",
      "purple_grapes",
      "watermelon_slice",
      "chocolate_cookie",
      "pink_cupcake",
    ],
  },
  {
    id: "rockets",
    label: "Find all the rockets!",
    noun: "rocket",
    nounPlural: "rockets",
    referenceCharacter: "red_rocket",
    kidTitle: "Question 5: Find ALL the Rockets!",
    kidInstruction:
      "Look at the big rocket on the left. Tap every picture that is a rocket — any colour, even if it is upside-down. Do NOT tap planets, stars, or moons!",
    referenceCaption: "This is a rocket!",
    hintCount: "Hint: There are 7 rocket pictures to find!",
    hintColors: "Hint: Blue, yellow, and purple rockets all count!",
    hintUpsideDown: "Hint: A rocket on its side is still a rocket!",
    correct: [
      { character: "red_rocket" },
      { character: "blue_rocket" },
      { character: "yellow_rocket" },
      { character: "purple_rocket" },
      { character: "red_rocket", transform: "rotate90" },
      { character: "red_rocket", transform: "flipH" },
      { character: "red_rocket", transform: "invert" },
    ],
    wrong: [
      "ringed_planet",
      "yellow_star",
      "grey_moon",
      "silver_satellite",
      "grey_asteroid",
      "blue_comet",
      "green_alien_head",
      "cartoon_telescope",
      "space_station",
    ],
  },
]

export function getRoundTiles(round: DetectionRound): DetectionTile[] {
  return buildTiles(round)
}

function shufflePick<T>(pool: T[], count: number): T[] {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(count, pool.length))
}

/** Part 1: pick `count` random rounds from the full pool (5 categories). */
export function getRandomDetectionRounds(count = 3): DetectionRound[] {
  return shufflePick(DETECTION_ROUNDS, count)
}

export function tileImageSrc(tile: DetectionTile): string {
  return charPath(tile.character)
}

export function referenceImageSrc(round: DetectionRound): string {
  return charPath(round.referenceCharacter)
}

export const TILE_TRANSFORM_CLASS: Record<TileTransform, string> = {
  none: "",
  rotate90: "rotate-90",
  flipH: "-scale-x-100",
  invert: "rotate-180",
  tilt: "-rotate-12",
}

/** CV quiz pool (10) — after Part 1 + Part 2; 5 picked at random per attempt. */
export const LEVEL5_QUIZ: QuizQuestion[] = [
  {
    type: "visual_choice",
    question: "Object detection: tap the picture that is a CAT.",
    options: [
      { imageSrc: charPath("white_cat"), label: "Cat", correct: true },
      { imageSrc: charPath("golden_dog"), label: "Dog", correct: false },
      { imageSrc: charPath("brown_horse"), label: "Horse", correct: false },
      { imageSrc: charPath("green_frog"), label: "Frog", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question: "Different colours, same object! Tap another DOG.",
    options: [
      { imageSrc: charPath("black_cat"), label: "Cat", correct: false },
      { imageSrc: charPath("spotted_dog"), label: "Dog", correct: true },
      { imageSrc: charPath("white_sheep"), label: "Sheep", correct: false },
      { imageSrc: charPath("pink_pig"), label: "Pig", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question:
      "Transformations: this cat is MIRRORED (flipped). CV still sees a cat — tap it!",
    options: [
      { imageSrc: charPath("black_cat"), label: "Flipped cat", correct: true, transform: "flipH" },
      { imageSrc: charPath("golden_dog"), label: "Dog", correct: false },
      { imageSrc: charPath("white_rabbit"), label: "Rabbit", correct: false },
      { imageSrc: charPath("cow_face"), label: "Cow", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question:
      "Transformations: this car is ROTATED sideways. It's still a car — tap it!",
    options: [
      { imageSrc: charPath("red_car"), label: "Rotated car", correct: true, transform: "rotate90" },
      { imageSrc: charPath("red_bicycle"), label: "Bicycle", correct: false },
      { imageSrc: charPath("blue_truck"), label: "Truck", correct: false },
      { imageSrc: charPath("green_train"), label: "Train", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question:
      "Transformations: upside-down rocket! Flip & rotation don't fool detection — tap the ROCKET.",
    options: [
      { imageSrc: charPath("ringed_planet"), label: "Planet", correct: false },
      { imageSrc: charPath("red_rocket"), label: "Upside-down rocket", correct: true, transform: "invert" },
      { imageSrc: charPath("grey_moon"), label: "Moon", correct: false },
      { imageSrc: charPath("yellow_star"), label: "Star", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question:
      "Localization: eyes are a small face feature. Tap the animal FACE with eyes!",
    options: [
      { imageSrc: charPath("black_cat"), label: "Cat face", correct: true },
      { imageSrc: charPath("red_car"), label: "Car", correct: false },
      { imageSrc: charPath("pizza_slice"), label: "Pizza", correct: false },
      { imageSrc: charPath("yellow_star"), label: "Star", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question:
      "Hierarchy: the BODY is the biggest base layer. Tap the main HORSE body shape!",
    options: [
      { imageSrc: charPath("brown_horse"), label: "Horse body", correct: true },
      { imageSrc: charPath("grey_mouse"), label: "Mouse", correct: false },
      { imageSrc: charPath("green_frog"), label: "Frog", correct: false },
      { imageSrc: charPath("orange_fish"), label: "Fish", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question:
      "Feature matching: wheels are a car part. Tap the picture of a CAR!",
    options: [
      { imageSrc: charPath("yellow_bus"), label: "Bus", correct: false },
      { imageSrc: charPath("white_plane"), label: "Plane", correct: false },
      { imageSrc: charPath("blue_car"), label: "Car", correct: true },
      { imageSrc: charPath("orange_boat"), label: "Boat", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question:
      "Object detection ignores distractors! Tap the picture that is NOT an apple.",
    options: [
      { imageSrc: charPath("green_apple"), label: "Green apple", correct: false },
      { imageSrc: charPath("red_apple"), label: "Red apple", correct: false },
      { imageSrc: charPath("yellow_banana"), label: "Banana", correct: true },
      { imageSrc: charPath("dark_red_apple"), label: "Dark apple", correct: false },
    ],
  },
  {
    type: "visual_choice",
    question:
      "Skew & tilt: this apple is tilted. CV still classifies it — tap the TILTED APPLE!",
    options: [
      { imageSrc: charPath("yellow_banana"), label: "Banana", correct: false },
      { imageSrc: charPath("red_apple"), label: "Tilted apple", correct: true, transform: "tilt" },
      { imageSrc: charPath("orange_fruit"), label: "Orange", correct: false },
      { imageSrc: charPath("watermelon_slice"), label: "Watermelon", correct: false },
    ],
  },
]

export const LEVEL5_QUIZ_POOL = LEVEL5_QUIZ

/** Final quiz pass: 4 of 5 correct (80%). */
export const LEVEL5_QUIZ_PASS_PERCENT = 80

export function getRandomLevel5Quiz(count = 5): QuizQuestion[] {
  return shufflePick(LEVEL5_QUIZ_POOL, count)
}