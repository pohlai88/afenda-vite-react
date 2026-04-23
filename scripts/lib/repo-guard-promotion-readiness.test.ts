import assert from "node:assert/strict"
import fs from "node:fs/promises"
import path from "node:path"
import test from "node:test"

import { loadAfendaConfig, workspaceRoot } from "../afenda-config.js"
import type { RepoGuardEvidenceReport } from "./repo-guard.js"
import {
  evaluatePromotionReadiness,
  formatPromotionReadinessHumanReport,
  formatPromotionReadinessMarkdownReport,
} from "./repo-guard-promotion-readiness.js"

test("promotion readiness fails when repo guard evidence is failing", async () => {
  const config = await loadAfendaConfig()
  const report = await evaluatePromotionReadiness({
    repoRoot: workspaceRoot,
    config,
    repoGuardReport: createRepoGuardEvidenceReport({
      status: "fail",
      checks: [
        {
          key: "working-tree-legitimacy",
          title: "Working tree legitimacy",
          status: "fail",
          source: "native",
          findings: [
            {
              severity: "error",
              ruleId: "WORKTREE-002",
              filePath:
                "docs/architecture/governance/generated/governance-register.md",
              message:
                "Protected generated surface is modified in the working tree.",
            },
          ],
        },
      ],
      summary: {
        passCount: 0,
        warnCount: 0,
        failCount: 1,
        findingCount: 1,
      },
    }),
  })

  assert.equal(report.status, "fail")
  assert.equal(report.scorecard.readyForPromotion, false)
  assert.equal(
    report.checks.find((check) => check.key === "repo-guard-verdict")?.status,
    "fail"
  )
})

test("promotion readiness warns when static manual criteria remain unresolved", async () => {
  const config = await loadAfendaConfig()
  const report = await evaluatePromotionReadiness({
    repoRoot: workspaceRoot,
    config,
    repoGuardReport: createRepoGuardEvidenceReport({
      status: "pass",
      checks: [],
      summary: {
        passCount: 10,
        warnCount: 0,
        failCount: 0,
        findingCount: 0,
      },
    }),
  })

  assert.equal(report.status, "warn")
  assert.equal(report.scorecard.readyForPromotion, false)
  assert.equal(
    report.checks.find((check) => check.key === "coverage-model")?.status,
    "pass"
  )
  assert.equal(
    report.checks.find((check) => check.key === "manual-promotion-criteria")
      ?.status,
    "warn"
  )
})

test("promotion readiness formatter includes scorecard and domain", async () => {
  const config = await loadAfendaConfig()
  const report = await evaluatePromotionReadiness({
    repoRoot: workspaceRoot,
    config,
    repoGuardReport: createRepoGuardEvidenceReport({
      status: "pass",
      checks: [],
      summary: {
        passCount: 10,
        warnCount: 0,
        failCount: 0,
        findingCount: 0,
      },
    }),
  })

  const human = formatPromotionReadinessHumanReport(report)
  const markdown = formatPromotionReadinessMarkdownReport(report)

  assert.match(human, /Repository Guard Promotion Readiness:/u)
  assert.match(human, /Ready for promotion:/u)
  assert.match(markdown, /# Repository guard promotion readiness review/u)
  assert.match(markdown, /Domain: `GOV-TRUTH-001`/u)
})

test("promotion readiness reports missing architecture binding surfaces", async () => {
  const config = await loadAfendaConfig()
  const fixtureRoot = path.join(
    workspaceRoot,
    ".artifacts/tmp/repo-guard-promotion-readiness"
  )
  await fs.rm(fixtureRoot, { recursive: true, force: true })
  await fs.mkdir(fixtureRoot, { recursive: true })

  const report = await evaluatePromotionReadiness({
    repoRoot: fixtureRoot,
    config,
    repoGuardReport: createRepoGuardEvidenceReport({
      status: "pass",
      checks: [],
      summary: {
        passCount: 10,
        warnCount: 0,
        failCount: 0,
        findingCount: 0,
      },
    }),
  })

  assert.equal(
    report.checks.find((check) => check.key === "architecture-binding")?.status,
    "fail"
  )

  await fs.rm(fixtureRoot, { recursive: true, force: true })
})

function createRepoGuardEvidenceReport(input: {
  status: "pass" | "warn" | "fail"
  checks: RepoGuardEvidenceReport["checks"]
  summary: RepoGuardEvidenceReport["summary"]
}): RepoGuardEvidenceReport {
  return {
    status: input.status,
    mode: "ci",
    generatedAt: "2026-04-23T00:00:00.000Z",
    contractBinding: {
      adr: "ADR-0008",
      atc: "ATC-0005",
      status: "bound",
    },
    waivers: {
      generatedAt: "2026-04-23T00:00:00.000Z",
      registryPath: "rules/repo-integrity/repo-guard-waivers.json",
      waiverCount: 0,
      activeWaiverCount: 0,
      expiredWaiverCount: 0,
      soonToExpireCount: 0,
      valid: true,
      violations: [],
      soonToExpireWaivers: [],
      applicableWaivers: [],
    },
    checks: input.checks,
    coverage: {
      implementedCount: 9,
      partialCount: 6,
      missingCount: 0,
      entries: [],
    },
    summary: input.summary,
    governanceDomain: {
      domainId: "GOV-TRUTH-001",
      title: "Repository integrity guard",
      owner: "governance-toolchain",
      generatedAt: "2026-04-23T00:00:00.000Z",
      lifecycleStatus: "partial",
      enforcementMaturity: "warned",
      defaultSeverity: "warn",
      tier: "tier-2",
      ciBehavior: "warn",
      localConfig: "scripts/repo-integrity/repo-guard-policy.ts",
      checks: [],
      violations: [],
      evidenceComplete: true,
      driftDetected: input.status !== "pass",
      ciOutcome:
        input.status === "fail"
          ? "warned"
          : input.status === "warn"
            ? "warned"
            : "passed",
    },
  }
}
