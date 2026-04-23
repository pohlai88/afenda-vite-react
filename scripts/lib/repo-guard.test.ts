import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import test from "node:test"

import { workspaceRoot } from "../afenda-config.js"
import { repoGuardPolicy } from "../repo-integrity/repo-guard-policy.js"
import {
  applyRepoGuardWaivers,
  buildRepoGuardReport,
  evaluateDirtyFileCandidates,
  evaluateWorkingTreeFindings,
  type RepoGuardCheckResult,
} from "./repo-guard.js"

test("buildRepoGuardReport rolls up pass warn and fail counts", () => {
  const report = buildRepoGuardReport(
    [
      {
        key: "pass-check",
        title: "Pass check",
        status: "pass",
        source: "adapter",
        findings: [],
      },
      {
        key: "warn-check",
        title: "Warn check",
        status: "warn",
        source: "native",
        findings: [
          {
            severity: "warn",
            ruleId: "WARN-001",
            message: "warning",
          },
        ],
      },
      {
        key: "fail-check",
        title: "Fail check",
        status: "fail",
        source: "adapter",
        findings: [
          {
            severity: "error",
            ruleId: "FAIL-001",
            message: "failure",
          },
        ],
      },
    ] satisfies RepoGuardCheckResult[],
    "ci",
    "2026-04-23T00:00:00.000Z"
  )

  assert.equal(report.status, "fail")
  assert.deepEqual(report.summary, {
    passCount: 1,
    warnCount: 1,
    failCount: 1,
    findingCount: 2,
  })
})

test("evaluateDirtyFileCandidates flags high-confidence junk and weaker drift names", () => {
  const findings = evaluateDirtyFileCandidates(
    ["apps/web/src/temp-file.ts", "notes-final.bak"],
    repoGuardPolicy
  )

  assert.equal(findings.length, 2)
  assert.match(
    findings.map((finding) => finding.ruleId).join("\n"),
    /DIRTY-FILE-001/u
  )
  assert.match(
    findings.map((finding) => finding.ruleId).join("\n"),
    /DIRTY-FILE-002/u
  )
})

test("evaluateWorkingTreeFindings warns on normal dirty files and fails protected/generated drift", () => {
  const humanFindings = evaluateWorkingTreeFindings(
    [
      {
        code: " M",
        path: "apps/web/src/app/example.ts",
        modifiedTracked: true,
        previousPath: undefined,
        untracked: false,
      },
      {
        code: " M",
        path: "docs/README.md",
        modifiedTracked: true,
        previousPath: undefined,
        untracked: false,
      },
    ],
    repoGuardPolicy,
    "human"
  )

  assert.match(
    humanFindings.map((finding) => finding.ruleId).join("\n"),
    /WORKTREE-002/u
  )
  assert.match(
    humanFindings.map((finding) => finding.ruleId).join("\n"),
    /WORKTREE-003/u
  )
})

test("waivers apply only to matching unexpired native findings", () => {
  const check: RepoGuardCheckResult = {
    key: "dirty-file-scan",
    title: "Dirty file scan",
    status: "fail",
    source: "native",
    findings: [
      {
        severity: "error",
        ruleId: "DIRTY-FILE-001",
        filePath: "notes-final.bak",
        message: "High-confidence backup or temp artifact detected.",
      },
    ],
  }

  const waived = applyRepoGuardWaivers(
    check,
    [
      {
        ruleId: "DIRTY-FILE-001",
        path: "notes-final.bak",
        reason: "fixture",
        expiresOn: "2026-05-01T00:00:00.000Z",
      },
    ],
    "2026-04-23T00:00:00.000Z"
  )

  assert.equal(waived.status, "pass")
  assert.equal(waived.findings[0]?.waived, true)
})

test("repo guard CLI commands produce stable operator output and evidence", () => {
  const reportJsonPath = path.join(
    workspaceRoot,
    ".artifacts/reports/governance/repo-integrity-guard.report.json"
  )
  const reportMarkdownPath = path.join(
    workspaceRoot,
    ".artifacts/reports/governance/repo-integrity-guard.report.md"
  )

  const humanResult = spawnSync("pnpm run repo:guard", {
    cwd: workspaceRoot,
    encoding: "utf8",
    shell: true,
  })
  assert.equal(humanResult.status, 0, humanResult.stderr || humanResult.stdout)
  assert.match(humanResult.stdout, /Repository Integrity Guard:/u)

  const ciResult = spawnSync("pnpm run repo:guard:ci", {
    cwd: workspaceRoot,
    encoding: "utf8",
    shell: true,
  })
  assert.equal(ciResult.status, 0, ciResult.stderr || ciResult.stdout)

  const reportResult = spawnSync("pnpm run repo:guard:report", {
    cwd: workspaceRoot,
    encoding: "utf8",
    shell: true,
  })
  assert.equal(
    reportResult.status,
    0,
    reportResult.stderr || reportResult.stdout
  )

  const jsonReport = JSON.parse(readFileSync(reportJsonPath, "utf8")) as {
    status: string
    checks: unknown[]
    governanceDomain: { domainId: string }
  }
  const markdownReport = readFileSync(reportMarkdownPath, "utf8")

  assert.ok(Array.isArray(jsonReport.checks))
  assert.equal(jsonReport.governanceDomain.domainId, "GOV-TRUTH-001")
  assert.match(markdownReport, /# Repository integrity guard/u)
})
