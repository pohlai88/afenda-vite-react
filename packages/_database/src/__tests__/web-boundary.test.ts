import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
)
const repoRoot = path.resolve(packageRoot, "../..")
const webSrcRoot = path.join(repoRoot, "apps/web/src")

const ignoredDirectoryNames = new Set(["node_modules", "dist", "coverage"])

function listFiles(root: string, predicate: (filePath: string) => boolean) {
  const files: string[] = []

  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      if (ignoredDirectoryNames.has(entry)) {
        continue
      }
      if (entry === "__tests__" || entry === "__test__") {
        continue
      }
      const fullPath = path.join(current, entry)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        walk(fullPath)
        continue
      }
      if (predicate(fullPath)) {
        files.push(fullPath)
      }
    }
  }

  walk(root)
  return files
}

describe("web database boundary", () => {
  it("keeps server database packages out of the Vite browser source", () => {
    const files = listFiles(webSrcRoot, (filePath) =>
      /\.(?:ts|tsx)$/.test(filePath)
    )

    const offenders = files.flatMap((filePath) => {
      const text = readFileSync(filePath, "utf8")
      return /from\s+["'](?:@afenda\/database|drizzle-orm|pg)["']/.test(text)
        ? [path.relative(repoRoot, filePath)]
        : []
    })

    expect(offenders).toEqual([])
  })

  it("keeps feature db-schema folders as documentation-only persistence intent", () => {
    const featureFiles = listFiles(
      path.join(webSrcRoot, "app/_features"),
      (filePath) => filePath.includes(`${path.sep}db-schema${path.sep}`)
    )

    expect(featureFiles.every((filePath) => filePath.endsWith(".md"))).toBe(
      true
    )
  })
})
