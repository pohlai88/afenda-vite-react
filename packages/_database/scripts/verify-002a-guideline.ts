/**
 * Verifies on-disk files match the ```text``` directory trees in
 * `docs/guideline/002A-foundation-inventory-architecture.md`.
 *
 * Run: `pnpm run db:002a:verify` (or `tsx scripts/verify-002a-guideline.ts`).
 *
 * This is structural/schema documentation parity (database-testing skill: validate structure).
 * It does not connect to PostgreSQL.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgRoot = path.join(__dirname, "..")
const guidelinePath = path.join(
  pkgRoot,
  "docs",
  "guideline",
  "002A-foundation-inventory-architecture.md"
)

const PREFIX_LINE = /^packages\/_database\/(.+)\/\s*$/
const ROOT_ONLY = /^packages\/_database\/\s*$/

type ParseResult = { expected: Set<string>; errors: string[] }

function normalizeRel(p: string): string {
  return p.replace(/\\/g, "/")
}

function parseBlock(block: string, blockIndex: number): ParseResult {
  const expected = new Set<string>()
  const errors: string[] = []
  const lines = block.split(/\r?\n/).filter((l) => l.trim().length > 0)

  if (lines.length === 0) {
    return { expected, errors }
  }

  const first = lines[0].trim()
  let baseSegments: string[] = []

  if (ROOT_ONLY.test(first)) {
    baseSegments = []
  } else {
    const m = first.match(PREFIX_LINE)
    if (!m) {
      errors.push(
        `Block ${blockIndex}: first line must be packages/_database/ or packages/_database/<path>/ — got: ${first.slice(0, 80)}`
      )
      return { expected, errors }
    }
    baseSegments = m[1].split("/").filter(Boolean)
  }

  const innerStack: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const leading = line.match(/^(\s*)/)?.[1] ?? ""
    const relDepth = leading.length / 2
    if (!Number.isInteger(relDepth)) {
      errors.push(
        `Block ${blockIndex} line ${i + 1}: indent must be multiple of 2 spaces — ${line.slice(0, 60)}`
      )
      continue
    }

    let name = line.trim()
    if (!name) continue
    const isDir = name.endsWith("/")
    if (isDir) name = name.slice(0, -1)

    innerStack.splice(relDepth - 1)
    if (isDir) {
      innerStack[relDepth - 1] = name
      innerStack.length = relDepth
    } else {
      const parts = [
        ...baseSegments,
        ...innerStack.slice(0, relDepth - 1),
        name,
      ]
      const rel = normalizeRel(parts.join("/"))
      expected.add(rel)
    }
  }

  return { expected, errors }
}

function main(): void {
  if (!existsSync(guidelinePath)) {
    console.error(
      `verify-002a-guideline: missing ${path.relative(pkgRoot, guidelinePath)}`
    )
    process.exit(1)
  }

  const md = readFileSync(guidelinePath, "utf8")
  const blockRe = /```text\r?\n([\s\S]*?)```/g
  let m: RegExpExecArray | null
  const allExpected = new Set<string>()
  const parseErrors: string[] = []
  let blockIndex = 0

  while ((m = blockRe.exec(md)) !== null) {
    const content = m[1].trimEnd()
    const { expected, errors } = parseBlock(content, blockIndex)
    parseErrors.push(...errors)
    for (const p of expected) allExpected.add(p)
    blockIndex++
  }

  if (parseErrors.length > 0) {
    console.error(
      "verify-002a-guideline: parse errors:\n" + parseErrors.join("\n")
    )
    process.exit(1)
  }

  const missing: string[] = []
  for (const rel of [...allExpected].sort()) {
    const full = path.join(pkgRoot, ...rel.split("/"))
    if (!existsSync(full)) {
      missing.push(rel)
    }
  }

  if (missing.length > 0) {
    console.error(
      "verify-002a-guideline: files listed in 002A trees but missing on disk:\n" +
        missing.join("\n")
    )
    process.exit(1)
  }

  console.log(
    `verify-002a-guideline: ok (${allExpected.size} paths from ${blockIndex} \`\`\`text\`\`\` blocks in 002A)`
  )
}

main()
