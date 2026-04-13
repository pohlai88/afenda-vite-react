/**
 * CI / GOVERNANCE CHECK — design-system imports
 *
 * Enforces:
 * - deprecated design-system surfaces are not imported casually
 * - package-local sources and root maintenance scripts only import allowed
 *   `@afenda/design-system/*` subpaths
 *
 * Driven by:
 * - `design-architecture/src/governance/import-allowlist.ts`
 * - `design-architecture/src/governance/deprecated-surface.ts`
 *
 * Notes:
 * - intentionally simple and file-path driven
 * - governance check, not a TypeScript compiler replacement
 * - resolves monorepo root from this file (run via `pnpm run check:imports` from `@afenda/design-system`)
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import fg from 'fast-glob'

import { getDeprecatedSurfaceByTarget } from '../src/governance/deprecated-surface'
import {
  DESIGN_SYSTEM_IMPORT_ALLOWLIST,
  isAllowedDesignSystemImport,
} from '../src/governance/import-allowlist'

type Violation = {
  readonly filePath: string
  readonly message: string
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Monorepo root: …/packages/design-system/design-architecture/scripts → four levels up. */
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..')

const SCAN_ROOTS = [
  'packages/design-system/**/*.{ts,tsx,js,jsx,mjs,cjs}',
  'scripts/**/*.{ts,tsx,js,jsx,mjs,cjs}',
] as const

const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.turbo/**',
  '**/.next/**',
  '**/coverage/**',
  '**/generated/**',
] as const

const DESIGN_SYSTEM_IMPORT_RE =
  /(?:import\s+[\s\S]*?\s+from\s+|import\s*\(\s*|export\s+[\s\S]*?\s+from\s+)["'](@afenda\/design-system(?:\/[^"']+)?)["']/g

function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, '/')
}

function getConsumerFromFilePath(filePath: string): string | null {
  const normalized = normalizeSlashes(filePath)

  if (
    normalized.includes('/__tests__/') ||
    normalized.includes('/__test__/') ||
    /\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs)$/.test(normalized)
  ) {
    return 'tests'
  }

  if (normalized.startsWith('packages/design-system/')) {
    return 'packages/design-system'
  }

  if (normalized.startsWith('scripts/')) {
    return 'scripts'
  }

  return null
}

function extractImports(sourceText: string): string[] {
  const imports: string[] = []
  const regex = new RegExp(DESIGN_SYSTEM_IMPORT_RE)

  let match: RegExpExecArray | null
  while ((match = regex.exec(sourceText)) !== null) {
    const specifier = match[1]
    if (specifier) {
      imports.push(specifier)
    }
  }

  return imports
}

function collectViolationsForFile(filePath: string): Violation[] {
  const relativePath = normalizeSlashes(path.relative(REPO_ROOT, filePath))
  const sourceText = readFileSync(filePath, 'utf8')
  const imports = extractImports(sourceText)

  if (imports.length === 0) {
    return []
  }

  const consumer = getConsumerFromFilePath(relativePath)
  const violations: Violation[] = []

  for (const specifier of imports) {
    const deprecated = getDeprecatedSurfaceByTarget(specifier)
    if (deprecated) {
      violations.push({
        filePath: relativePath,
        message: [
          `Imports deprecated surface "${specifier}".`,
          `Status: ${deprecated.status}.`,
          deprecated.replacement
            ? `Use "${deprecated.replacement}" instead.`
            : 'No replacement declared.',
          deprecated.note,
        ].join(' '),
      })
      continue
    }

    if (!consumer) {
      continue
    }

    const isAllowed = isAllowedDesignSystemImport(consumer, specifier)
    if (!isAllowed) {
      const allowlistEntry = DESIGN_SYSTEM_IMPORT_ALLOWLIST.find(
        (entry) => entry.consumer === consumer,
      )

      violations.push({
        filePath: relativePath,
        message: [
          `Consumer "${consumer}" is not allowed to import "${specifier}".`,
          allowlistEntry
            ? `Allowed subpaths: ${allowlistEntry.allowedSubpaths.join(', ')}.`
            : `No allowlist entry found for consumer "${consumer}".`,
        ].join(' '),
      })
    }
  }

  return violations
}

async function main(): Promise<void> {
  const files = await fg([...SCAN_ROOTS], {
    cwd: REPO_ROOT,
    absolute: true,
    ignore: [...IGNORE_PATTERNS],
    onlyFiles: true,
  })

  const violations = files.flatMap(collectViolationsForFile)

  if (violations.length === 0) {
    console.log('design-system import governance check passed')
    return
  }

  console.error('design-system import governance check failed\n')

  for (const violation of violations) {
    console.error(`- ${violation.filePath}`)
    console.error(`  ${violation.message}\n`)
  }

  process.exitCode = 1
}

void main()
