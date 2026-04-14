import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

const shellRoot = join(dirname(fileURLToPath(import.meta.url)), "..")

function walkTsFiles(dir: string, skipTests: boolean): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (skipTests && name === "__tests__") {
      continue
    }
    if (statSync(full).isDirectory()) {
      out.push(...walkTsFiles(full, skipTests))
    } else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts")) {
      out.push(full)
    }
  }
  return out
}

const forbiddenSubstrings = [
  "packages/design-system/.idea",
  "@afenda/database",
  "drizzle-orm",
  'from "pg"',
  "from 'pg'",
]

describe("_platform/shell import boundary", () => {
  it("does not reference forbidden modules or paths in shell sources", () => {
    const files = walkTsFiles(shellRoot, true)
    expect(files.length).toBeGreaterThan(0)

    for (const file of files) {
      const text = readFileSync(file, "utf8")
      for (const bad of forbiddenSubstrings) {
        expect(text, file).not.toContain(bad)
      }
    }
  })

  it("does not import feature internals (only public feature roots are composed at router)", () => {
    const files = walkTsFiles(shellRoot, true)
    const featureDeepImport =
      /@\/app\/_features\/[^/]+\/(actions|services|hooks|utils|components|types)\//

    for (const file of files) {
      const text = readFileSync(file, "utf8")
      expect(text, file).not.toMatch(featureDeepImport)
    }
  })
})
