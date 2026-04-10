/**
 * GOVERNANCE VALIDATOR — validate-shell-state-policy
 * Doctrine consistency for shell UI state declarations vs vocabulary; optional repo scan for dotted
 * string literals that look like shell state keys but are not governed.
 * Scope: static checks; complements Zod parsing on `shellStatePolicy`.
 * Consumption: validate-constants, CI (`pnpm run script:check-shell-state-policy`).
 *
 * **Governance checklist (shell state policy validator)**
 * - Vocabulary ↔ declarations bijection (`validateShellStateDoctrine` / typed issue codes).
 * - Reset triggers non-empty; governed enum values for triggers, isolation, persistence.
 * - Isolation / persistence classification when policy flags require them.
 * - Optional repo scan for quoted dotted literals that are neither state keys nor slot ids (narrow roots).
 * - Type issue `code` with {@link ShellStatePolicyIssueCode} via {@link ShellStatePolicyIssue}.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { shellSlotIdValues } from "../policy/shell-slot-policy"
import { shellStatePolicy } from "../policy/shell-state-policy"
import { shellStateKeyValues } from "../shell-state-key-vocabulary"

import { ShellStatePolicyIssueCode } from "./shell-state-policy-issue-codes"
import type { ShellStatePolicyIssue, ShellStatePolicyReport } from "./shell-state-policy-types"
import { validateShellStateDoctrine } from "./shell-state-doctrine"
import type { ShellStateDoctrineInput } from "./shell-state-doctrine"

export type { ShellStatePolicyIssue, ShellStatePolicyReport } from "./shell-state-policy-types"
export { ShellStatePolicyTypes } from "./shell-state-policy-types"
export { ShellStatePolicyIssueCode } from "./shell-state-policy-issue-codes"
export {
  ShellStateDoctrineUtils,
  validateShellStateDoctrine,
} from "./shell-state-doctrine"
export type {
  ShellStateDoctrineDeclarationInput,
  ShellStateDoctrineInput,
} from "./shell-state-doctrine"

const STATE_KEY_SET = new Set<string>(shellStateKeyValues)
const SLOT_ID_SET = new Set<string>(shellSlotIdValues)

/**
 * First segment of dotted strings ignored in the regex scan (i18n namespaces, etc.).
 * **Governance:** extend only when `script:check-shell-state-policy` flags a false positive in
 * shell doctrine roots; prefer fixing call sites to use non–dotted-string APIs long-term.
 * Regex scan is **interim**; an AST pass should replace this list.
 */
const DOTTED_LITERAL_FIRST_SEGMENT_IGNORE = new Set([
  "common",
  "errors",
  "validation",
  "i18n",
  "format",
  "api",
  "ui",
  "docs",
  "types",
  "node",
  "react",
  "import",
])

export interface ValidateShellStatePolicyOptions {
  /**
   * When true, scan **shell doctrine surfaces only** (`apps/web/.../shell-ui`, shadcn-ui
   * `policy/shell/runtime`) for quoted dotted literals that are neither governed state keys nor slot
   * ids. Broader scans catch i18n keys; keep roots narrow until a blessed API + AST pass exists.
   */
  scanRepo?: boolean
  /**
   * When set (e.g. unit tests), run doctrine validation on this input instead of live
   * `shellStatePolicy` + vocabulary. Do not use in production validation paths.
   */
  doctrineInputOverride?: ShellStateDoctrineInput
}

/** Paths (file path contains) where dotted strings are expected and not checked. */
const SCAN_PATH_SKIP_SUBSTRINGS = [
  `${path.sep}shell-state-policy.ts`,
  `${path.sep}shell-state-key-vocabulary.ts`,
  `${path.sep}validate-shell-state-policy.ts`,
  `${path.sep}shell-slot-policy.ts`,
  `${path.sep}shell-slot-registry.ts`,
  `${path.sep}validate-shell-registry.ts`,
  `${path.sep}shell-slot-contract.ts`,
  ".test.ts",
  ".spec.ts",
  `${path.sep}__tests__${path.sep}`,
  `${path.sep}__test__${path.sep}`,
]

function shouldSkipFileForScan(filePath: string): boolean {
  const normalized = filePath.replace(/\//g, path.sep)
  return SCAN_PATH_SKIP_SUBSTRINGS.some((s) => normalized.includes(s))
}

function findRepoRoot(start = process.cwd()): string {
  let dir = path.resolve(start)
  for (let i = 0; i < 14; i++) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return path.resolve(start)
}

function* walkSourceFiles(dir: string): Generator<string> {
  if (!existsSync(dir)) return
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "dist" || e.name === ".git") continue
      yield* walkSourceFiles(p)
    } else if (e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx"))) {
      yield p
    }
  }
}

/** Quoted dotted identifiers: `foo.bar`, `a.b.c` (shell state and slot ids share this shape). */
const QUOTED_DOTTED = /["']([a-z][a-z0-9]*(?:\.[a-z][a-z0-9]*)+)["']/g

/**
 * Scans a single source string for quoted dotted literals that are neither governed state keys nor
 * slot ids (same rules as the narrow repo scan). Pure; no I/O. Use in unit tests and tooling.
 */
export function collectUndeclaredDottedLiteralIssuesFromSource(
  relativeFilePath: string,
  content: string
): ShellStatePolicyIssue[] {
  const issues: ShellStatePolicyIssue[] = []
  const lines = content.split(/\r?\n/)
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]
    if (line === undefined) continue
    const matches = line.matchAll(QUOTED_DOTTED)
    for (const match of matches) {
      const literal = match[1]
      const first = literal?.split(".")[0]
      if (literal === undefined || first === undefined) continue
      if (STATE_KEY_SET.has(literal) || SLOT_ID_SET.has(literal)) {
        continue
      }
      if (DOTTED_LITERAL_FIRST_SEGMENT_IGNORE.has(first)) {
        continue
      }
      issues.push({
        code: ShellStatePolicyIssueCode.UNDECLARED_DOTTED_LITERAL,
        message: `Dotted string "${literal}" is neither a governed shell state key nor a shell slot id; use shellStateKeyValues or shell slot vocabulary, or add the first segment to DOTTED_LITERAL_FIRST_SEGMENT_IGNORE if this is not shell state.`,
        file: relativeFilePath,
        line: lineIndex + 1,
      })
    }
  }
  return issues
}

function validateDoctrineFromPolicy(): ShellStatePolicyIssue[] {
  return validateShellStateDoctrine({
    declaredStateKeys: shellStatePolicy.declaredStateKeys,
    vocabularyKeys: shellStateKeyValues,
    requireIsolationClassification: shellStatePolicy.requireIsolationClassification,
    requirePersistenceClassification: shellStatePolicy.requirePersistenceClassification,
  })
}

function scanRepoForUndeclaredStateLikeLiterals(repoRoot: string): ShellStatePolicyIssue[] {
  const issues: ShellStatePolicyIssue[] = []
  const scanRoots = [
    path.join(repoRoot, "apps", "web", "src", "share", "components", "shell-ui"),
    path.join(
      repoRoot,
      "packages",
      "shadcn-ui",
      "src",
      "lib",
      "constant",
      "policy",
      "shell",
      "runtime"
    ),
  ]

  for (const root of scanRoots) {
    if (!existsSync(root)) continue

    for (const filePath of walkSourceFiles(root)) {
      if (shouldSkipFileForScan(filePath)) continue

      const content = readFileSync(filePath, "utf8")
      issues.push(
        ...collectUndeclaredDottedLiteralIssuesFromSource(
          path.relative(repoRoot, filePath),
          content
        )
      )
    }
  }

  return issues
}

/**
 * Collects shell state policy issues (doctrine, then optional repo scan). Prefer for tests and
 * tooling; {@link validateShellStatePolicy} wraps this into a report.
 */
export function collectShellStatePolicyIssues(
  options?: ValidateShellStatePolicyOptions
): ShellStatePolicyIssue[] {
  const doctrineIssues: ShellStatePolicyIssue[] = options?.doctrineInputOverride
    ? validateShellStateDoctrine(options.doctrineInputOverride)
    : validateDoctrineFromPolicy()

  const issues: ShellStatePolicyIssue[] = [...doctrineIssues]

  const runScan =
    options?.scanRepo === true &&
    shellStatePolicy.forbidUndeclaredShellStateKeys &&
    issues.length === 0

  if (runScan) {
    issues.push(...scanRepoForUndeclaredStateLikeLiterals(findRepoRoot()))
  }

  return issues
}

/**
 * Validates shell state doctrine. Optional repo scan when `options.scanRepo === true` and
 * `forbidUndeclaredShellStateKeys` is set (see {@link ValidateShellStatePolicyOptions}).
 */
export function validateShellStatePolicy(
  options?: ValidateShellStatePolicyOptions
): ShellStatePolicyReport {
  const issues = collectShellStatePolicyIssues(options)
  return {
    ok: issues.length === 0,
    issues,
  }
}

/**
 * Frozen alias for discoverability (`ShellStatePolicyUtils.validate`, `collectIssues`, …).
 * Named exports remain preferred for tree-shaking clarity.
 */
export const ShellStatePolicyUtils = Object.freeze({
  validate: validateShellStatePolicy,
  collectIssues: collectShellStatePolicyIssues,
  collectUndeclaredDottedLiteralIssuesFromSource,
})
