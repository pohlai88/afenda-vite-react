import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
)

const domainTerms = [
  "tenant",
  "membership",
  "role",
  "permission",
  "legal entity",
  "legalEntity",
  "org unit",
  "orgUnit",
  "audit",
]

function listFiles(root: string): string[] {
  const files: string[] = []

  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      const fullPath = path.join(current, entry)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        walk(fullPath)
        continue
      }
      files.push(fullPath)
    }
  }

  walk(root)
  return files
}

describe("root helper and constant boundary", () => {
  it("keeps schema helpers and constants free of domain semantics", () => {
    const roots = ["schema/constants", "schema/helpers"].map((directory) =>
      path.join(packageRoot, "src", directory)
    )
    const offenders = roots.flatMap((root) =>
      listFiles(root).flatMap((filePath) => {
        const text = readFileSync(filePath, "utf8")
        const matchedTerms = domainTerms.filter((term) =>
          text.toLowerCase().includes(term.toLowerCase())
        )
        return matchedTerms.length > 0
          ? [
              `${path.relative(packageRoot, filePath)}: ${matchedTerms.join(", ")}`,
            ]
          : []
      })
    )

    expect(offenders).toEqual([])
  })
})
