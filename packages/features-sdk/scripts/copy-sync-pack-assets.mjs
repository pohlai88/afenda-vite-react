import { cpSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)

const assetCopies = [
  {
    from: path.join(packageRoot, "src", "sync-pack", "templates"),
    to: path.join(packageRoot, "dist", "sync-pack", "templates"),
  },
]

for (const assetCopy of assetCopies) {
  if (!existsSync(assetCopy.from)) {
    throw new Error(`Missing Sync-Pack asset source: ${assetCopy.from}`)
  }

  cpSync(assetCopy.from, assetCopy.to, { recursive: true })
}
