import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
)
const repoRoot = path.resolve(packageRoot, "../..")

const forbiddenPackageDirectories = [
  "packages/database",
  "packages/db",
  "packages/postgres",
]

const forbiddenCodeImportPatterns = [
  /from\s+["']@afenda\/_database["']/,
  /from\s+["'][^"']*packages\/_database\/src[^"']*["']/,
  /from\s+["'][^"']*_database\/src[^"']*["']/,
]

const ignoredDirectoryNames = new Set([
  ".git",
  ".turbo",
  "coverage",
  "dist",
  "drizzle",
  "node_modules",
])

function listFiles(root: string, predicate: (filePath: string) => boolean) {
  const files: string[] = []

  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      if (ignoredDirectoryNames.has(entry)) {
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

describe("database package doctrine", () => {
  it("uses the governed filesystem path and clean public package name", () => {
    const manifest = JSON.parse(
      readFileSync(path.join(packageRoot, "package.json"), "utf8")
    ) as { name?: string }

    expect(path.basename(packageRoot)).toBe("_database")
    expect(manifest.name).toBe("@afenda/database")
  })

  it("does not allow sibling database package drift", () => {
    expect(
      forbiddenPackageDirectories.filter((directory) =>
        existsSync(path.join(repoRoot, directory))
      )
    ).toEqual([])
  })

  it("does not allow package-wide dumping-ground directories", () => {
    const forbidden = ["_shared", "shared", "common", "utils"].filter(
      (directory) => existsSync(path.join(packageRoot, "src", directory))
    )

    expect(forbidden).toEqual([])
  })

  it(
    "does not use forbidden database import paths in code",
    { timeout: 120_000 },
    () => {
      const files = listFiles(repoRoot, (filePath) =>
        /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(filePath)
      )
      const offenders = files.flatMap((filePath) => {
        const text = readFileSync(filePath, "utf8")
        return forbiddenCodeImportPatterns.some((pattern) => pattern.test(text))
          ? [path.relative(repoRoot, filePath)]
          : []
      })

      expect(offenders).toEqual([])
    }
  )
})
