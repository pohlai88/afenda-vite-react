import fs from "node:fs/promises"
import path from "node:path"

import type {
  RepoGuardCheckResult,
  RepoGuardFinding,
  RepoGuardStatus,
} from "./repo-guard.js"

export interface RepoGuardWaiver {
  readonly id: string
  readonly checkKey: string
  readonly ruleId: string
  readonly pathPattern: string
  readonly severityCap: RepoGuardFinding["severity"]
  readonly reason: string
  readonly owner: string
  readonly approvedBy: string
  readonly createdAt: string
  readonly expiresOn: string
}

export interface RepoGuardWaiverRegistry {
  readonly version: number
  readonly waivers: readonly RepoGuardWaiver[]
}

export interface RepoGuardWaiverViolation {
  readonly waiverId: string
  readonly severity: "warn" | "error"
  readonly message: string
}

export interface RepoGuardWaiverSoonToExpire {
  readonly waiverId: string
  readonly checkKey: string
  readonly ruleId: string
  readonly pathPattern: string
  readonly expiresOn: string
}

export interface RepoGuardWaiverReport {
  readonly generatedAt: string
  readonly registryPath: string
  readonly waiverCount: number
  readonly activeWaiverCount: number
  readonly expiredWaiverCount: number
  readonly soonToExpireCount: number
  readonly valid: boolean
  readonly violations: readonly RepoGuardWaiverViolation[]
  readonly soonToExpireWaivers: readonly RepoGuardWaiverSoonToExpire[]
  readonly applicableWaivers: readonly RepoGuardWaiver[]
}

export async function loadRepoGuardWaiverRegistry(
  repoRoot: string,
  relativePath: string
): Promise<RepoGuardWaiverRegistry> {
  const raw = await fs.readFile(path.join(repoRoot, relativePath), "utf8")
  return JSON.parse(raw) as RepoGuardWaiverRegistry
}

export function evaluateRepoGuardWaiverRegistry(options: {
  readonly registry: RepoGuardWaiverRegistry
  readonly registryPath: string
  readonly knownCheckKeys: readonly string[]
  readonly referenceDate: Date
  readonly soonToExpireDays: number
}): RepoGuardWaiverReport {
  const violations: RepoGuardWaiverViolation[] = []
  const soonToExpireWaivers: RepoGuardWaiverSoonToExpire[] = []
  const applicableWaivers: RepoGuardWaiver[] = []
  const seenIds = new Set<string>()
  const knownCheckKeys = new Set(options.knownCheckKeys)
  let expiredWaiverCount = 0

  for (const waiver of options.registry.waivers) {
    let waiverValid = true

    if (seenIds.has(waiver.id)) {
      violations.push({
        waiverId: waiver.id,
        severity: "error",
        message: `Waiver id "${waiver.id}" is duplicated.`,
      })
      waiverValid = false
    }
    seenIds.add(waiver.id)

    for (const [field, value] of [
      ["id", waiver.id],
      ["checkKey", waiver.checkKey],
      ["ruleId", waiver.ruleId],
      ["pathPattern", waiver.pathPattern],
      ["reason", waiver.reason],
      ["owner", waiver.owner],
      ["approvedBy", waiver.approvedBy],
    ] as const) {
      if (!value.trim()) {
        violations.push({
          waiverId: waiver.id || "<missing-id>",
          severity: "error",
          message: `Waiver field "${field}" must be non-empty.`,
        })
        waiverValid = false
      }
    }

    if (!knownCheckKeys.has(waiver.checkKey)) {
      violations.push({
        waiverId: waiver.id,
        severity: "error",
        message: `Waiver checkKey "${waiver.checkKey}" is not a known repo-guard native check.`,
      })
      waiverValid = false
    }

    const createdAt = Date.parse(waiver.createdAt)
    const expiresAt = Date.parse(waiver.expiresOn)
    if (Number.isNaN(createdAt) || Number.isNaN(expiresAt)) {
      violations.push({
        waiverId: waiver.id,
        severity: "error",
        message: "Waiver createdAt and expiresOn must be valid ISO dates.",
      })
      waiverValid = false
    } else {
      if (expiresAt <= createdAt) {
        violations.push({
          waiverId: waiver.id,
          severity: "error",
          message: "Waiver expiresOn must be later than createdAt.",
        })
        waiverValid = false
      }

      if (options.referenceDate.getTime() > expiresAt) {
        expiredWaiverCount += 1
        violations.push({
          waiverId: waiver.id,
          severity: "error",
          message: `Waiver expired on ${waiver.expiresOn}.`,
        })
        waiverValid = false
      } else {
        const msUntilExpiry = expiresAt - options.referenceDate.getTime()
        const soonToExpireMs = options.soonToExpireDays * 24 * 60 * 60 * 1000
        if (msUntilExpiry <= soonToExpireMs) {
          soonToExpireWaivers.push({
            waiverId: waiver.id,
            checkKey: waiver.checkKey,
            ruleId: waiver.ruleId,
            pathPattern: waiver.pathPattern,
            expiresOn: waiver.expiresOn,
          })
        }
      }
    }

    if (waiverValid) {
      applicableWaivers.push(waiver)
    }
  }

  return {
    generatedAt: options.referenceDate.toISOString(),
    registryPath: options.registryPath,
    waiverCount: options.registry.waivers.length,
    activeWaiverCount: applicableWaivers.length,
    expiredWaiverCount,
    soonToExpireCount: soonToExpireWaivers.length,
    valid: violations.length === 0,
    violations,
    soonToExpireWaivers,
    applicableWaivers,
  }
}

export function buildRepoGuardWaiverCheckResult(
  report: RepoGuardWaiverReport
): RepoGuardCheckResult {
  const findings: RepoGuardFinding[] = [
    ...report.violations.map((violation) => ({
      severity: violation.severity,
      ruleId: "REPO-GUARD-WAIVER",
      message: violation.message,
      evidence: `waiverId=${violation.waiverId}`,
      suggestedFix:
        "Fix or remove the invalid waiver entry before relying on repo-guard suppression.",
    })),
    ...report.soonToExpireWaivers.map((waiver) => ({
      severity: "warn" as const,
      ruleId: "REPO-GUARD-WAIVER",
      message:
        "Waiver is approaching expiry and should be reviewed or removed.",
      evidence: `waiverId=${waiver.waiverId}; checkKey=${waiver.checkKey}; ruleId=${waiver.ruleId}; expiresOn=${waiver.expiresOn}`,
      suggestedFix:
        "Review the underlying drift, renew the waiver explicitly if still justified, or remove the waiver after remediation.",
    })),
  ]

  return {
    key: "waiver-registry",
    title: "Repo guard waivers",
    status: statusFromFindings(findings),
    source: "native",
    findings,
  }
}

export function applyRepoGuardWaivers(
  check: RepoGuardCheckResult,
  waivers: readonly RepoGuardWaiver[],
  generatedAt: string
): RepoGuardCheckResult {
  if (
    check.source !== "native" ||
    check.key === "waiver-registry" ||
    waivers.length === 0
  ) {
    return check
  }

  const nextFindings = check.findings.map((finding) => {
    const waiver = waivers.find((item) =>
      waiverMatchesFinding(item, check.key, finding, generatedAt)
    )

    return waiver ? { ...finding, waived: true } : finding
  })

  return {
    ...check,
    status: statusFromFindings(nextFindings),
    findings: nextFindings,
  }
}

function waiverMatchesFinding(
  waiver: RepoGuardWaiver,
  checkKey: string,
  finding: RepoGuardFinding,
  generatedAt: string
): boolean {
  if (waiver.checkKey !== checkKey || waiver.ruleId !== finding.ruleId) {
    return false
  }

  const expiresAt = Date.parse(waiver.expiresOn)
  if (Number.isNaN(expiresAt) || Date.parse(generatedAt) > expiresAt) {
    return false
  }

  if (severityRank(finding.severity) > severityRank(waiver.severityCap)) {
    return false
  }

  if (!finding.filePath) {
    return waiver.pathPattern === "*"
  }

  return (
    waiver.pathPattern === "*" ||
    path.matchesGlob(finding.filePath, waiver.pathPattern)
  )
}

function severityRank(severity: RepoGuardFinding["severity"]): number {
  if (severity === "info") {
    return 0
  }
  if (severity === "warn") {
    return 1
  }
  return 2
}

function statusFromFindings(
  findings: readonly RepoGuardFinding[]
): RepoGuardStatus {
  const activeFindings = findings.filter((finding) => !finding.waived)
  if (activeFindings.some((finding) => finding.severity === "error")) {
    return "fail"
  }
  if (activeFindings.some((finding) => finding.severity === "warn")) {
    return "warn"
  }
  return "pass"
}
