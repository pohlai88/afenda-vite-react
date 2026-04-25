import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const leakedFeaturesSdkDist = path.join(packageRoot, "dist", "features-sdk")

if (fs.existsSync(leakedFeaturesSdkDist)) {
  console.error(
    `RG-PKG-BOUNDARY-001: build output leaked nested features-sdk artifacts at ${leakedFeaturesSdkDist}.`
  )
  process.exit(1)
}

process.exit(0)
