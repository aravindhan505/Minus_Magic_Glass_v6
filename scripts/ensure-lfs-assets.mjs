import { execSync } from "node:child_process"
import { existsSync, statSync } from "node:fs"
import { join } from "node:path"

const INTRO_PATH = join(process.cwd(), "public", "Intro.mp4")
const MIN_INTRO_BYTES = 1_000_000

function introBytes() {
  if (!existsSync(INTRO_PATH)) return 0
  return statSync(INTRO_PATH).size
}

let size = introBytes()

if (size < MIN_INTRO_BYTES) {
  console.log(`Intro.mp4 is ${size} bytes — likely a Git LFS pointer. Pulling LFS objects...`)
  try {
    execSync("git lfs install", { stdio: "inherit" })
    execSync("git lfs pull", { stdio: "inherit" })
  } catch (error) {
    console.warn("git lfs pull failed:", error instanceof Error ? error.message : error)
  }
  size = introBytes()
}

if (size < MIN_INTRO_BYTES) {
  console.error(
    "\nBuild failed: public/Intro.mp4 is still only",
    size,
    "bytes after git lfs pull.\n" +
      "Enable Git LFS for this Vercel project:\n" +
      "  Project Settings → Git → Git Large File Storage (LFS) → ON\n" +
      "Then redeploy.\n",
  )
  process.exit(1)
}

console.log(`Intro.mp4 OK (${(size / 1_048_576).toFixed(1)} MB)`)