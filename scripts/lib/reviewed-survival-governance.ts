import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import type { FileSurvivalRolloutDefinition } from "../config/afenda-config.js"
import { toPosixPath, workspaceRoot } from "../config/afenda-config.js"

export const REVIEWED_EXCEPTIONS_LEDGER_WORKSPACE_PATH =
  "rules/filesystem-governance/reviewed-exceptions.json"

const REVIEWED_SURVIVAL_TAG = "@afenda-reviewed-survival"
const REVIEWED_SURVIVAL_ALLOWED_ROLES = [
  "reviewed-exception",
  "intentional-alias",
  "transitional-compat",
  "retained-legacy",
] as const
const REVIEWED_SURVIVAL_ALLOWED_ACTIONS = [
  "delete",
  "merge",
  "replace",
] as const

type ReviewedSurvivalRole = (typeof REVIEWED_SURVIVAL_ALLOWED_ROLES)[number]
type ReviewedSurvivalActionIfStale =
  (typeof REVIEWED_SURVIVAL_ALLOWED_ACTIONS)[number]

type ReviewedSurvivalMarkerSource = "inline" | "sidecar"

interface ReviewedExceptionLedgerItem {
  readonly path: string
  readonly owner: string
  readonly role: ReviewedSurvivalRole
  readonly reason: string
  readonly reviewedOn: string
  readonly reviewBy: string
  readonly actionIfStale: ReviewedSurvivalActionIfStale
  readonly evidence: string
  readonly plannedResolution: string
}

interface ReviewedExceptionsLedger {
  readonly schemaVersion: number
  readonly items: readonly ReviewedExceptionLedgerItem[]
}

interface ParsedReviewedSurvivalMarker {
  readonly source: ReviewedSurvivalMarkerSource
  readonly role: string | null
  readonly owner: string | null
  readonly reason: string | null
  readonly reviewedOn: string | null
  readonly reviewBy: string | null
  readonly actionIfStale: string | null
  readonly evidence?: string
  readonly supersedes?: string
  readonly plannedReplacement?: string
}

export interface ReviewedSurvivalIssue {
  readonly code:
    | "missing-marker"
    | "invalid-marker"
    | "expired-marker"
    | "marker-ledger-mismatch"
    | "forbidden-marker"
  readonly path: string
  readonly message: string
}

export interface ReviewedSurvivalAudit {
  readonly rolloutId: string
  readonly ledgerPath: string
  readonly reviewedExceptionCount: number
  readonly issueCount: number
  readonly issues: readonly ReviewedSurvivalIssue[]
}

export function validateReviewedSurvivalForRollout(
  rollout: FileSurvivalRolloutDefinition,
  options: { readonly repoRoot?: string } = {}
): ReviewedSurvivalAudit {
  const repoRoot = options.repoRoot ?? workspaceRoot
  const ledgerPath = path.join(
    repoRoot,
    REVIEWED_EXCEPTIONS_LEDGER_WORKSPACE_PATH
  )
  const ledger = loadReviewedExceptionsLedger(ledgerPath)
  const reviewedExceptionSet = new Set(
    rollout.reviewedExceptions.map(normalizeWorkspacePath)
  )
  const ledgerEntriesByPath = new Map(
    ledger.items.map((item) => [normalizeWorkspacePath(item.path), item])
  )
  const knownOwners = new Set(rollout.ownerTruth.map((entry) => entry.owner))
  const scopedFiles = collectScopedFiles({
    repoRoot,
    scopeRoot: rollout.scopeRoot,
    ignorePatterns: rollout.ignore,
  })
  const issues: ReviewedSurvivalIssue[] = []

  for (const filePath of reviewedExceptionSet) {
    const ledgerEntry = ledgerEntriesByPath.get(filePath)
    const marker = parseReviewedSurvivalMarker({
      repoRoot,
      filePath,
    })

    if (!ledgerEntry) {
      issues.push({
        code: "marker-ledger-mismatch",
        path: filePath,
        message:
          "Reviewed exception is configured but missing from the ledger.",
      })
      continue
    }

    if (!marker) {
      issues.push({
        code: "missing-marker",
        path: filePath,
        message:
          "Reviewed exception is configured but the file has no reviewed-survival marker.",
      })
      continue
    }

    issues.push(
      ...validateMarker({
        filePath,
        marker,
        ledgerEntry,
        knownOwners,
      })
    )
  }

  for (const ledgerEntry of ledger.items) {
    const filePath = normalizeWorkspacePath(ledgerEntry.path)
    if (!pathMatchesRoot(filePath, rollout.scopeRoot)) {
      continue
    }

    if (!reviewedExceptionSet.has(filePath)) {
      issues.push({
        code: "marker-ledger-mismatch",
        path: filePath,
        message:
          "Ledger entry exists for a file that is not declared in rollout.reviewedExceptions.",
      })
    }
  }

  for (const filePath of scopedFiles) {
    const marker = parseReviewedSurvivalMarker({
      repoRoot,
      filePath,
    })
    if (!marker) {
      continue
    }

    if (!reviewedExceptionSet.has(filePath)) {
      issues.push({
        code: "forbidden-marker",
        path: filePath,
        message:
          "Reviewed-survival marker is present on a file that is not declared as a reviewed exception.",
      })
    }
  }

  return {
    rolloutId: rollout.id,
    ledgerPath: normalizeWorkspacePath(path.relative(repoRoot, ledgerPath)),
    reviewedExceptionCount: reviewedExceptionSet.size,
    issueCount: issues.length,
    issues: issues.sort((left, right) => left.path.localeCompare(right.path)),
  }
}

function validateMarker({
  filePath,
  marker,
  ledgerEntry,
  knownOwners,
}: {
  filePath: string
  marker: ParsedReviewedSurvivalMarker
  ledgerEntry: ReviewedExceptionLedgerItem
  knownOwners: ReadonlySet<string>
}): ReviewedSurvivalIssue[] {
  const issues: ReviewedSurvivalIssue[] = []
  const normalizedLedgerEntry = normalizeLedgerEntry(ledgerEntry)

  if (
    marker.role === null ||
    marker.owner === null ||
    marker.reason === null ||
    marker.reviewedOn === null ||
    marker.reviewBy === null ||
    marker.actionIfStale === null
  ) {
    issues.push({
      code: "invalid-marker",
      path: filePath,
      message:
        "Reviewed-survival marker is missing one or more required fields.",
    })
    return issues
  }

  if (
    !REVIEWED_SURVIVAL_ALLOWED_ROLES.includes(
      marker.role as ReviewedSurvivalRole
    )
  ) {
    issues.push({
      code: "invalid-marker",
      path: filePath,
      message: `Marker role "${marker.role}" is not allowed.`,
    })
  }

  if (!knownOwners.has(marker.owner)) {
    issues.push({
      code: "invalid-marker",
      path: filePath,
      message: `Marker owner "${marker.owner}" is not a known rollout owner.`,
    })
  }

  if (
    !REVIEWED_SURVIVAL_ALLOWED_ACTIONS.includes(
      marker.actionIfStale as ReviewedSurvivalActionIfStale
    )
  ) {
    issues.push({
      code: "invalid-marker",
      path: filePath,
      message: `Marker action-if-stale "${marker.actionIfStale}" is not allowed.`,
    })
  }

  if (!isIsoDate(marker.reviewedOn) || !isIsoDate(marker.reviewBy)) {
    issues.push({
      code: "invalid-marker",
      path: filePath,
      message:
        "Marker reviewed-on and review-by must be ISO dates (YYYY-MM-DD).",
    })
  } else if (marker.reviewBy < marker.reviewedOn) {
    issues.push({
      code: "invalid-marker",
      path: filePath,
      message: "Marker review-by cannot be earlier than reviewed-on.",
    })
  }

  if (isIsoDate(marker.reviewBy) && marker.reviewBy < todayUtc()) {
    issues.push({
      code: "expired-marker",
      path: filePath,
      message: `Reviewed-survival marker expired on ${marker.reviewBy}.`,
    })
  }

  const mismatchFields: string[] = []
  if (normalizedLedgerEntry.role !== marker.role) mismatchFields.push("role")
  if (normalizedLedgerEntry.owner !== marker.owner) mismatchFields.push("owner")
  if (normalizedLedgerEntry.reason !== marker.reason)
    mismatchFields.push("reason")
  if (normalizedLedgerEntry.reviewedOn !== marker.reviewedOn)
    mismatchFields.push("reviewedOn")
  if (normalizedLedgerEntry.reviewBy !== marker.reviewBy)
    mismatchFields.push("reviewBy")
  if (normalizedLedgerEntry.actionIfStale !== marker.actionIfStale)
    mismatchFields.push("actionIfStale")

  if (mismatchFields.length > 0) {
    issues.push({
      code: "marker-ledger-mismatch",
      path: filePath,
      message: `Marker fields do not match the reviewed-exception ledger: ${mismatchFields.join(", ")}.`,
    })
  }

  return issues
}

function normalizeLedgerEntry(
  entry: ReviewedExceptionLedgerItem
): ReviewedExceptionLedgerItem {
  return {
    ...entry,
    path: normalizeWorkspacePath(entry.path),
    owner: entry.owner.trim(),
    role: entry.role,
    reason: entry.reason.trim(),
    reviewedOn: entry.reviewedOn.trim(),
    reviewBy: entry.reviewBy.trim(),
    actionIfStale: entry.actionIfStale,
    evidence: entry.evidence.trim(),
    plannedResolution: entry.plannedResolution.trim(),
  }
}

function loadReviewedExceptionsLedger(
  ledgerAbsolutePath: string
): ReviewedExceptionsLedger {
  if (!existsSync(ledgerAbsolutePath)) {
    throw new Error(
      `Missing reviewed-exception ledger: ${normalizeWorkspacePath(ledgerAbsolutePath)}`
    )
  }

  const parsed = JSON.parse(
    readFileSync(ledgerAbsolutePath, "utf8")
  ) as ReviewedExceptionsLedger
  if (!Array.isArray(parsed.items)) {
    throw new Error("Reviewed-exception ledger must contain an items array.")
  }

  return {
    schemaVersion: parsed.schemaVersion,
    items: parsed.items.map((item) => normalizeLedgerEntry(item)),
  }
}

function parseReviewedSurvivalMarker({
  repoRoot,
  filePath,
}: {
  repoRoot: string
  filePath: string
}): ParsedReviewedSurvivalMarker | null {
  const absolutePath = path.join(repoRoot, filePath)
  const sidecar = parseReviewedSurvivalSidecar(`${absolutePath}.survival.json`)
  if (sidecar) {
    return sidecar
  }

  if (!existsSync(absolutePath)) {
    return null
  }

  const source = readFileSync(absolutePath, "utf8")
  const block =
    extractAnnotatedBlock(source, /\/\*\*([\s\S]*?)\*\//u) ??
    extractAnnotatedBlock(source, /<!--([\s\S]*?)-->/u)

  if (block === null) {
    return null
  }

  return parseMarkerFields(block, "inline")
}

function parseReviewedSurvivalSidecar(
  sidecarAbsolutePath: string
): ParsedReviewedSurvivalMarker | null {
  if (!existsSync(sidecarAbsolutePath)) {
    return null
  }

  const parsed = JSON.parse(
    readFileSync(sidecarAbsolutePath, "utf8")
  ) as Record<string, string>

  return {
    source: "sidecar",
    role: parsed.role ?? null,
    owner: parsed.owner ?? null,
    reason: parsed.reason ?? null,
    reviewedOn: parsed.reviewedOn ?? null,
    reviewBy: parsed.reviewBy ?? null,
    actionIfStale: parsed.actionIfStale ?? null,
    evidence: parsed.evidence,
    supersedes: parsed.supersedes,
    plannedReplacement: parsed.plannedReplacement,
  }
}

function extractAnnotatedBlock(source: string, pattern: RegExp): string | null {
  const match = source.match(pattern)
  if (!match || !match[1]?.includes(REVIEWED_SURVIVAL_TAG)) {
    return null
  }

  return match[1]
}

function parseMarkerFields(
  block: string,
  source: ReviewedSurvivalMarkerSource
): ParsedReviewedSurvivalMarker {
  const fields = new Map<string, string>()

  for (const line of block.split(/\r?\n/u)) {
    const normalizedLine = line
      .replace(/^\s*\*+\s?/u, "")
      .replace(/^<!--\s*/u, "")
      .replace(/\s*-->$/u, "")
      .trim()

    if (normalizedLine === "" || normalizedLine === REVIEWED_SURVIVAL_TAG) {
      continue
    }

    const separatorIndex = normalizedLine.indexOf(":")
    if (separatorIndex === -1) {
      continue
    }

    const key = normalizedLine.slice(0, separatorIndex).trim().toLowerCase()
    const value = normalizedLine.slice(separatorIndex + 1).trim()
    if (value !== "") {
      fields.set(key, value)
    }
  }

  return {
    source,
    role: fields.get("role") ?? null,
    owner: fields.get("owner") ?? null,
    reason: fields.get("reason") ?? null,
    reviewedOn: fields.get("reviewed-on") ?? fields.get("reviewedon") ?? null,
    reviewBy: fields.get("review-by") ?? fields.get("reviewby") ?? null,
    actionIfStale:
      fields.get("action-if-stale") ?? fields.get("actionifstale") ?? null,
    evidence: fields.get("evidence"),
    supersedes: fields.get("supersedes"),
    plannedReplacement:
      fields.get("planned-replacement") ?? fields.get("plannedreplacement"),
  }
}

function collectScopedFiles({
  repoRoot,
  scopeRoot,
  ignorePatterns,
}: {
  repoRoot: string
  scopeRoot: string
  ignorePatterns: readonly string[]
}): readonly string[] {
  const files: string[] = []
  const scopeRootAbsolutePath = path.join(repoRoot, scopeRoot)

  walk(scopeRootAbsolutePath)
  return files.sort((left, right) => left.localeCompare(right))

  function walk(directoryPath: string) {
    for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
      const absoluteEntryPath = path.join(directoryPath, entry.name)
      const scopeRelativePath = normalizeWorkspacePath(
        path.relative(scopeRootAbsolutePath, absoluteEntryPath)
      )
      const workspaceRelativePath = normalizeWorkspacePath(
        path.relative(repoRoot, absoluteEntryPath)
      )

      if (
        ignorePatterns.some((pattern) =>
          path.matchesGlob(scopeRelativePath, pattern)
        )
      ) {
        continue
      }

      if (entry.isDirectory()) {
        walk(absoluteEntryPath)
        continue
      }

      files.push(workspaceRelativePath)
    }
  }
}

function pathMatchesRoot(filePath: string, root: string): boolean {
  const normalizedPath = normalizeWorkspacePath(filePath)
  const normalizedRoot = normalizeWorkspacePath(root)
  return (
    normalizedPath === normalizedRoot ||
    normalizedPath.startsWith(`${normalizedRoot}/`)
  )
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/u.test(value)
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10)
}

function normalizeWorkspacePath(value: string): string {
  return toPosixPath(value)
}
