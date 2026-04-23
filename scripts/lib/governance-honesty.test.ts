import assert from "node:assert/strict"
import test from "node:test"

import type { AfendaConfig } from "../afenda-config.js"
import {
  buildGovernanceAggregateReport,
  buildGovernanceRegisterSnapshot,
  evaluateGovernanceRegisterConsistency,
} from "./governance-spine.js"
import { evaluateAtcHonesty, parseAtcContract } from "./governance-honesty.js"

test("ATCs cannot claim stronger enforcement than their bound domain", () => {
  const config = createFixtureConfig()
  const atc = parseAtcContract(`
- **Contract ID:** ATC-0001
- **Bound domain ID:** GOV-ARCH-001
- **Decision anchor:** ADR-0001
- **Lifecycle status:** enforced
- **Enforcement maturity:** runtime-enforced
- **Evidence path:** \`.artifacts/reports/governance/architecture-contracts.report.json\`
- **Check command:** \`pnpm run script:check-architecture-contracts\`
- **Report command:** \`pnpm run script:generate-governance-report\`
`)

  const issues = evaluateAtcHonesty({
    config,
    relativePath:
      "docs/architecture/atc/ATC-0001-core-web-architecture-baseline.md",
    atc,
    knownAdrIds: new Set(["ADR-0001"]),
    evidenceExists: false,
  })

  assert.match(issues.join("\n"), /stronger than bound domain maturity/u)
  assert.match(issues.join("\n"), /stronger than bound domain lifecycle/u)
  assert.match(issues.join("\n"), /ciBehavior "block"/u)
  assert.match(issues.join("\n"), /evidence file does not exist/u)
})

test("ATC honesty fails on ADR mismatch and evidence mismatch", () => {
  const config = createFixtureConfig()
  const atc = parseAtcContract(`
- **Contract ID:** ATC-0001
- **Bound domain ID:** GOV-ARCH-001
- **Decision anchor:** ADR-9999
- **Lifecycle status:** partial
- **Enforcement maturity:** warned
- **Evidence path:** \`.artifacts/reports/governance/wrong.report.json\`
- **Check command:** \`pnpm run script:check-architecture-contracts\`
- **Report command:** \`pnpm run script:generate-governance-report\`
`)

  const issues = evaluateAtcHonesty({
    config,
    relativePath:
      "docs/architecture/atc/ATC-0001-core-web-architecture-baseline.md",
    atc,
    knownAdrIds: new Set(["ADR-0001"]),
  })

  assert.match(issues.join("\n"), /references missing decision anchor/u)
  assert.match(issues.join("\n"), /does not match bound domain evidence path/u)
})

test("aggregate verdict cannot overstate pass when evidence is missing", () => {
  const config = createFixtureConfig()
  const report = buildGovernanceAggregateReport(
    config,
    [],
    {
      generatedAt: "2026-04-23T00:00:00.000Z",
      registryPath: "rules/governance/waivers.json",
      waiverCount: 0,
      activeWaiverCount: 0,
      expiredWaiverCount: 0,
      activeWaivers: [],
      valid: true,
      violations: [],
    },
    new Date("2026-04-23T00:00:00.000Z")
  )

  assert.equal(report.summary.finalVerdict, "block")
  assert.match(
    report.summary.finalVerdictExplanation,
    /required evidence is missing/u
  )
})

test("config enforced domain without evidence cannot pass", () => {
  const config = createFixtureConfig()
  config.governance.domains = [
    {
      ...config.governance.domains[0],
      lifecycleStatus: "enforced",
      enforcementMaturity: "blocking",
      ciBehavior: "block",
      tier: "tier-3",
    },
  ]

  const aggregate = buildGovernanceAggregateReport(
    config,
    [],
    {
      generatedAt: "2026-04-23T00:00:00.000Z",
      registryPath: "rules/governance/waivers.json",
      waiverCount: 0,
      activeWaiverCount: 0,
      expiredWaiverCount: 0,
      activeWaivers: [],
      valid: true,
      violations: [],
    },
    new Date("2026-04-23T00:00:00.000Z")
  )

  assert.equal(aggregate.summary.finalVerdict, "block")
  assert.match(aggregate.summary.finalVerdictExplanation, /evidence/i)
})

test("register snapshot cannot diverge from aggregate evidence", () => {
  const config = createFixtureConfig()
  const aggregate = buildGovernanceAggregateReport(
    config,
    [
      {
        domainId: "GOV-ARCH-001",
        title: "Architecture contracts",
        owner: "web-architecture",
        generatedAt: "2026-04-23T00:00:00.000Z",
        lifecycleStatus: "partial",
        enforcementMaturity: "warned",
        defaultSeverity: "error",
        tier: "tier-2",
        ciBehavior: "warn",
        localConfig: "docs/architecture/atc",
        checks: [
          {
            id: "architecture-contract-check",
            command: "pnpm run script:check-architecture-contracts",
            scriptPath: "scripts/check-architecture-contracts.ts",
            status: "failed",
            exitCode: 1,
            durationMs: 1,
          },
        ],
        violations: [
          {
            checkId: "architecture-contract-check",
            severity: "error",
            message: "Architecture contract drift",
          },
        ],
        evidenceComplete: true,
        driftDetected: true,
        ciOutcome: "warned",
      },
    ],
    {
      generatedAt: "2026-04-23T00:00:00.000Z",
      registryPath: "rules/governance/waivers.json",
      waiverCount: 0,
      activeWaiverCount: 0,
      expiredWaiverCount: 0,
      activeWaivers: [],
      valid: true,
      violations: [],
    },
    new Date("2026-04-23T00:00:00.000Z")
  )
  const snapshot = buildGovernanceRegisterSnapshot(config, aggregate)
  const staleSnapshot = {
    ...snapshot,
    aggregateGeneratedAt: "2026-04-22T00:00:00.000Z",
    finalVerdict: "pass" as const,
    domainRows: [
      {
        domainId: "GOV-ARCH-001",
        evidencePath: ".artifacts/reports/governance/other.report.json",
        ciBehavior: "block" as const,
      },
    ],
  }

  const issues = evaluateGovernanceRegisterConsistency(
    config,
    aggregate,
    staleSnapshot
  )

  assert.match(
    issues.map((issue) => issue.message).join("\n"),
    /does not match the aggregate report/u
  )
  assert.match(
    issues.map((issue) => issue.message).join("\n"),
    /does not match aggregate summary finalVerdict/u
  )
  assert.match(
    issues.map((issue) => issue.message).join("\n"),
    /does not match afenda\.config/u
  )
})

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
    readmeTargets: [{ path: "docs", mode: "docs-root" }],
    fileSurvival: { rollouts: [] },
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
      idFamilies: ["GOV-ARCH"],
      domains: [
        {
          id: "GOV-ARCH-001",
          title: "Architecture contracts",
          owner: "web-architecture",
          lifecycleStatus: "partial",
          enforcementMaturity: "warned",
          defaultSeverity: "error",
          tier: "tier-2",
          docs: {
            primary:
              "docs/architecture/atc/ATC-0001-core-web-architecture-baseline.md",
            references: [
              "docs/architecture/adr/ADR-0001-core-web-architecture-baseline.md",
            ],
          },
          localConfig: "docs/architecture/atc",
          checks: [
            {
              id: "architecture-contract-check",
              command: "pnpm run script:check-architecture-contracts",
              scriptPath: "scripts/check-architecture-contracts.ts",
            },
          ],
          report: {
            command: "pnpm run script:generate-governance-report",
            scriptPath: "scripts/generate-governance-report.ts",
          },
          evidencePath:
            ".artifacts/reports/governance/architecture-contracts.report.json",
          ciBehavior: "warn",
          reviewCadence: "30d",
        },
      ],
      gates: [
        {
          id: "GOV-CI-GATE-A",
          title: "Governance checks",
          description: "Run governance checks.",
          command: "pnpm run script:run-governance-checks",
          scriptPath: "scripts/run-governance-checks.ts",
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
