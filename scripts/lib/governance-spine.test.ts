import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"

import type { AfendaConfig } from "../config/afenda-config.js"
import {
  buildGovernanceAggregateReport,
  evaluateGovernanceBindings,
  evaluateGovernanceRegistry,
  evaluateGovernanceWaivers,
  loadGovernanceDomainReports,
  renderGovernanceRegisterMarkdown,
} from "./governance-spine.js"

test("registry validation catches duplicate ids and invalid ci semantics", () => {
  const config = createFixtureConfig()
  config.governance.domains = [
    config.governance.domains[0],
    {
      ...config.governance.domains[0],
      title: "Duplicate filesystem governance",
      ciBehavior: "warn",
    },
  ]

  const issues = evaluateGovernanceRegistry(config)

  assert.match(
    issues.map((issue) => issue.message).join("\n"),
    /Duplicate governance domain id/u
  )
  assert.match(
    issues.map((issue) => issue.message).join("\n"),
    /must use ciBehavior "block"/u
  )
})

test("registry validation catches enforced domains with invalid evidence and report bindings", () => {
  const config = createFixtureConfig()
  config.governance.domains = [
    {
      ...config.governance.domains[0],
      evidencePath: "reports/outside-root.json",
      report: {
        command: "",
        scriptPath: "",
      },
    },
  ]

  const issues = evaluateGovernanceRegistry(config)

  assert.match(
    issues.map((issue) => issue.message).join("\n"),
    /must live under governance\.evidence\.root/u
  )
})

test("binding validation catches missing files and missing package scripts", async () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify(
      {
        name: "fixture",
        private: true,
        scripts: {
          "script:check-governance-registry":
            "tsx scripts/governance/check-governance-registry.ts",
        },
      },
      null,
      2
    ),
    "docs/governance/GOVERNANCE_CONSTITUTION.md": "# Constitution",
    "rules/governance/waivers.json": JSON.stringify(
      { version: 1, waivers: [] },
      null,
      2
    ),
    "scripts/governance/check-governance-registry.ts": "console.log('ok')",
    "scripts/governance/generate-governance-report.ts": "console.log('ok')",
  })

  try {
    const config = createFixtureConfig()
    const issues = await evaluateGovernanceBindings(config, repoRoot)

    assert.match(
      issues.map((issue) => issue.message).join("\n"),
      /does not exist/u
    )
    assert.match(
      issues.map((issue) => issue.message).join("\n"),
      /references missing package\.json script/u
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("binding validation catches drifted domains with broken bindings", async () => {
  const repoRoot = createFixtureRepo({
    "package.json": JSON.stringify(
      {
        name: "fixture",
        private: true,
        scripts: {
          "script:check-governance-registry":
            "tsx scripts/governance/check-governance-registry.ts",
          "script:generate-governance-report":
            "tsx scripts/governance/generate-governance-report.ts",
        },
      },
      null,
      2
    ),
    "docs/governance/GOVERNANCE_CONSTITUTION.md": "# Constitution",
    "rules/governance/waivers.json": JSON.stringify(
      { version: 1, waivers: [] },
      null,
      2
    ),
    "scripts/governance/check-governance-registry.ts": "console.log('ok')",
  })

  try {
    const config = createFixtureConfig()
    config.governance.domains = [
      {
        ...config.governance.domains[0],
        lifecycleStatus: "drifted",
        report: {
          command: "pnpm run script:missing-report",
          scriptPath: "scripts/missing-report.ts",
        },
      },
    ]

    const issues = await evaluateGovernanceBindings(config, repoRoot)

    assert.match(
      issues.map((issue) => issue.message).join("\n"),
      /missing-report/u
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("waiver evaluation fails expired waivers and unknown domains", () => {
  const config = createFixtureConfig()
  const report = evaluateGovernanceWaivers(
    config,
    {
      version: 1,
      waivers: [
        {
          id: "waiver-expired",
          policyId: "GOV-CI-001",
          domainId: "GOV-CI-999",
          paths: ["scripts/afenda.config.json"],
          reason: "temporary",
          owner: "governance-toolchain",
          approvedBy: "platform",
          createdAt: "2026-04-01T00:00:00.000Z",
          expiresAt: "2026-04-02T00:00:00.000Z",
          severityCap: "error",
          remediationPlan: "remove after migration",
        },
      ],
    },
    "rules/governance/waivers.json",
    new Date("2026-04-23T00:00:00.000Z")
  )

  assert.equal(report.valid, false)
  assert.match(
    report.violations.map((violation) => violation.message).join("\n"),
    /not registered/u
  )
  assert.match(
    report.violations.map((violation) => violation.message).join("\n"),
    /expired/u
  )
})

test("aggregate report blocks enforced domains without evidence files", () => {
  const config = createFixtureConfig()
  const generatedAt = new Date("2026-04-23T12:00:00.000Z")
  const aggregate = buildGovernanceAggregateReport(
    config,
    [],
    {
      generatedAt: generatedAt.toISOString(),
      registryPath: "rules/governance/waivers.json",
      waiverCount: 0,
      activeWaiverCount: 0,
      expiredWaiverCount: 0,
      activeWaivers: [],
      valid: true,
      violations: [],
    },
    generatedAt
  )

  assert.equal(aggregate.summary.finalVerdict, "block")
  assert.match(
    aggregate.summary.finalVerdictExplanation,
    /required evidence is missing/u
  )
})

test("waiver severity caps do not suppress higher-severity violations", () => {
  const config = createFixtureConfig()
  const generatedAt = new Date("2026-04-23T12:00:00.000Z")
  const aggregate = buildGovernanceAggregateReport(
    config,
    [
      {
        domainId: "GOV-CI-001",
        title: "Governance registry integrity",
        owner: "governance-toolchain",
        generatedAt: generatedAt.toISOString(),
        lifecycleStatus: "enforced",
        enforcementMaturity: "blocking",
        defaultSeverity: "fatal",
        tier: "tier-3",
        ciBehavior: "block",
        localConfig: "scripts/afenda.config.json",
        checks: [
          {
            id: "registry-check",
            command: "pnpm run script:check-governance-registry",
            scriptPath: "scripts/governance/check-governance-registry.ts",
            status: "failed",
            exitCode: 1,
            durationMs: 1,
          },
        ],
        violations: [
          {
            checkId: "registry-check",
            severity: "fatal",
            message: "Blocking governance failure",
          },
        ],
        evidenceComplete: true,
        driftDetected: true,
        ciOutcome: "blocked",
      },
    ],
    {
      generatedAt: generatedAt.toISOString(),
      registryPath: "rules/governance/waivers.json",
      waiverCount: 1,
      activeWaiverCount: 1,
      expiredWaiverCount: 0,
      activeWaivers: [
        {
          id: "waiver-1",
          policyId: "GOV-CI-001",
          domainId: "GOV-CI-001",
          paths: ["scripts/afenda.config.json"],
          reason: "temporary downgrade",
          owner: "governance-toolchain",
          approvedBy: "platform",
          createdAt: "2026-04-20T00:00:00.000Z",
          expiresAt: "2026-05-01T00:00:00.000Z",
          severityCap: "warn",
          remediationPlan: "remove after follow-up",
        },
      ],
      valid: true,
      violations: [],
    },
    generatedAt
  )

  assert.equal(aggregate.summary.finalVerdict, "block")
  assert.match(
    aggregate.summary.finalVerdictExplanation,
    /blocking domains failed/u
  )
})

test("aggregate report and register are deterministic for fixed input", () => {
  const config = createFixtureConfig()
  const generatedAt = new Date("2026-04-23T12:00:00.000Z")
  const aggregate = buildGovernanceAggregateReport(
    config,
    [
      {
        domainId: "GOV-CI-001",
        title: "Governance registry integrity",
        owner: "governance-toolchain",
        generatedAt: generatedAt.toISOString(),
        lifecycleStatus: "enforced",
        enforcementMaturity: "blocking",
        defaultSeverity: "fatal",
        tier: "tier-3",
        ciBehavior: "block",
        localConfig: "scripts/afenda.config.json",
        checks: [
          {
            id: "registry-check",
            command: "pnpm run script:check-governance-registry",
            scriptPath: "scripts/governance/check-governance-registry.ts",
            status: "passed",
            exitCode: 0,
            durationMs: 1,
          },
        ],
        violations: [],
        evidenceComplete: true,
        driftDetected: false,
        ciOutcome: "passed",
      },
    ],
    {
      generatedAt: generatedAt.toISOString(),
      registryPath: "rules/governance/waivers.json",
      waiverCount: 0,
      activeWaiverCount: 0,
      expiredWaiverCount: 0,
      activeWaivers: [],
      valid: true,
      violations: [],
    },
    generatedAt
  )

  const register = renderGovernanceRegisterMarkdown(config, aggregate)

  assert.equal(aggregate.summary.totalDomains, 1)
  assert.equal(aggregate.summary.passedDomains, 1)
  assert.match(register, /# Governance register/u)
  assert.match(register, /GOV-CI-001/u)
  assert.match(register, /\.artifacts\/reports\/governance/u)
})

test("loadGovernanceDomainReports accepts self-managed evidence wrappers", async () => {
  const generatedAt = "2026-04-23T12:00:00.000Z"
  const repoRoot = createFixtureRepo({
    ".artifacts/reports/governance/registry-integrity.report.json":
      JSON.stringify(
        {
          status: "warn",
          mode: "ci",
          generatedAt,
          checks: [],
          summary: {
            passCount: 0,
            warnCount: 1,
            failCount: 0,
            findingCount: 1,
          },
          governanceDomain: {
            domainId: "GOV-CI-001",
            title: "Governance registry integrity",
            owner: "governance-toolchain",
            generatedAt,
            lifecycleStatus: "enforced",
            enforcementMaturity: "blocking",
            defaultSeverity: "fatal",
            tier: "tier-3",
            ciBehavior: "block",
            localConfig: "scripts/afenda.config.json",
            checks: [],
            violations: [],
            evidenceComplete: true,
            driftDetected: false,
            ciOutcome: "passed",
          },
        },
        null,
        2
      ),
  })

  try {
    const reports = await loadGovernanceDomainReports(
      createFixtureConfig(),
      repoRoot
    )

    assert.equal(reports.length, 1)
    assert.equal(reports[0]?.domainId, "GOV-CI-001")
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

function createFixtureRepo(files: Record<string, string>): string {
  const repoRoot = mkdtempSync(path.join(os.tmpdir(), "governance-spine-"))

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(repoRoot, relativePath)
    mkdirSync(path.dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, `${content}\n`, "utf8")
  }

  return repoRoot
}

function cleanupFixtureRepo(repoRoot: string) {
  rmSync(repoRoot, { recursive: true, force: true })
}

function createFixtureConfig(): AfendaConfig {
  return {
    $schema: "./afenda.config.schema.json",
    schemaVersion: 1,
    product: {
      name: "Fixture",
      description: "Fixture governance config",
    },
    workspace: {
      packageManager: "pnpm",
      rootPackageName: "fixture",
      defaultPackageScope: "@fixture/",
    },
    paths: {
      webApp: "apps/web",
      typescriptSharedConfig: "packages/typescript-config",
    },
    readmeTargets: [
      {
        path: "docs",
        mode: "docs-root",
      },
    ],
    fileSurvival: {
      rollouts: [],
    },
    workspaceGovernance: {
      rootTopology: {
        primaryProductDirectories: ["apps", "packages"],
        allowedRootDirectories: [
          "apps",
          "docs",
          "packages",
          "rules",
          "scripts",
        ],
        allowedHiddenRootDirectories: [".artifacts"],
        storageDirectories: ["archives"],
        requiredRootFiles: ["package.json"],
      },
      packageTopology: {
        workspaceRootDirectories: ["apps", "packages"],
        allowedManifestlessDirectories: [],
      },
      packageRoots: {
        profiles: [
          {
            name: "app",
            allowedDirectories: ["src"],
            allowedFiles: ["package.json"],
          },
        ],
        packages: [
          {
            path: "apps/web",
            profile: "app",
            extraAllowedDirectories: [],
            extraAllowedFiles: [],
          },
        ],
      },
      featureTemplate: {
        featuresRoot: "apps/web/src/features",
        requiredDirectories: [],
        requiredFiles: [],
        enforceWhenFeatureExists: false,
      },
      sharedPackageTemplate: {
        packagePath: "packages/shared",
        requiredDirectories: ["src"],
        requireDirectoriesWhenPackageExists: false,
      },
      webClientSrc: {
        srcRoot: "apps/web/src",
        allowedTopLevelDirectories: ["app"],
        requiredShareSubdirectories: [],
        enforce: false,
      },
    },
    governance: {
      version: 1,
      idFamilies: ["GOV-CI"],
      domains: [
        {
          id: "GOV-CI-001",
          title: "Governance registry integrity",
          owner: "governance-toolchain",
          lifecycleStatus: "enforced",
          enforcementMaturity: "blocking",
          defaultSeverity: "fatal",
          tier: "tier-3",
          docs: {
            primary: "docs/governance/GOVERNANCE_CONSTITUTION.md",
            references: [],
          },
          localConfig: "scripts/afenda.config.json",
          checks: [
            {
              id: "registry-check",
              command: "pnpm run script:check-governance-registry",
              scriptPath: "scripts/governance/check-governance-registry.ts",
            },
          ],
          report: {
            command: "pnpm run script:generate-governance-report",
            scriptPath: "scripts/governance/generate-governance-report.ts",
          },
          evidencePath:
            ".artifacts/reports/governance/registry-integrity.report.json",
          ciBehavior: "block",
          reviewCadence: "14d",
        },
      ],
      gates: [
        {
          id: "GOV-CI-GATE-A",
          title: "Governance registry integrity",
          description: "Check registry.",
          command: "pnpm run script:check-governance-registry",
          scriptPath: "scripts/governance/check-governance-registry.ts",
          ciBehavior: "block",
        },
      ],
      evidence: {
        root: ".artifacts/reports/governance",
        aggregateReportPath:
          ".artifacts/reports/governance/governance-core.report.json",
        summaryReportPath:
          ".artifacts/reports/governance/governance-summary.report.json",
        registerPath:
          "docs/architecture/governance/generated/governance-register.md",
        registerSnapshotPath:
          ".artifacts/reports/governance/governance-register.snapshot.json",
      },
      waivers: {
        registryPath: "rules/governance/waivers.json",
        reportPath: ".artifacts/reports/governance/waivers.report.json",
      },
    },
  }
}
