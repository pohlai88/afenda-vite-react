import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)

const leakedTestsDist = path.join(packageRoot, "dist", "tests")

if (fs.existsSync(leakedTestsDist)) {
  console.error(
    `RG-PKG-BOUNDARY-001: build output leaked test artifacts at ${leakedTestsDist}.`
  )
  process.exit(1)
}

process.exit(0)
