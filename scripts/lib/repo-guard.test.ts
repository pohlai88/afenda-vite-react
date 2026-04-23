import assert from "node:assert/strict"
import fs from "node:fs/promises"
import { readFileSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import test from "node:test"

import { workspaceRoot } from "../config/afenda-config.js"
import { loadAfendaConfig } from "../config/afenda-config.js"
import { repoGuardPolicy } from "../repo-integrity/repo-guard-policy.js"
import {
  evaluateBoundaryImportFindings,
  isAllowedWorkspacePackageImport,
  normalizeImportTarget,
  parseImportsFromSource,
} from "./boundary-import-guard.js"
import { evaluateDuplicateOverlapFindings } from "./duplicate-overlap-guard.js"
import {
  computeCombinedContentHash,
  evaluateGeneratedArtifactAuthenticityFindings,
  normalizeGeneratedJsonContent,
} from "./generated-artifact-authenticity-guard.js"
import {
  buildPlacementOwnershipScopes,
  evaluatePlacementOwnershipFindings,
} from "./placement-ownership-guard.js"
import {
  buildRepoGuardCoverage,
  buildRepoGuardReport,
  evaluateDirtyFileCandidates,
  evaluateWorkingTreeFindings,
  type RepoGuardCheckResult,
} from "./repo-guard.js"
import {
  applyRepoGuardWaivers,
  buildRepoGuardWaiverCheckResult,
  evaluateRepoGuardWaiverRegistry,
} from "./repo-guard-waivers.js"
import {
  evaluateStrongerDocumentControlFindings,
  parseFrontmatter,
} from "./stronger-document-control-guard.js"
import { evaluateSourceEvidenceMismatchFindings } from "./source-evidence-mismatch-guard.js"

test("buildRepoGuardReport rolls up pass warn and fail counts", () => {
  const waiverReport = evaluateRepoGuardWaiverRegistry({
    registry: {
      version: 1,
      waivers: [],
    },
    registryPath: "rules/repo-integrity/repo-guard-waivers.json",
    knownCheckKeys: [],
    referenceDate: new Date("2026-04-23T00:00:00.000Z"),
    soonToExpireDays: 14,
  })
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
    "2026-04-23T00:00:00.000Z",
    waiverReport
  )

  assert.equal(report.status, "fail")
  assert.deepEqual(report.contractBinding, {
    adr: "ADR-0008",
    atc: "ATC-0005",
    status: "bound",
  })
  assert.equal(
    report.waivers.registryPath,
    "rules/repo-integrity/repo-guard-waivers.json"
  )
  assert.deepEqual(report.summary, {
    passCount: 1,
    warnCount: 1,
    failCount: 1,
    findingCount: 2,
  })
})

test("buildRepoGuardCoverage classifies implemented, partial, and missing surfaces deterministically", () => {
  const coverage = buildRepoGuardCoverage([
    {
      key: "filesystem-governance",
      title: "Filesystem governance",
      status: "pass",
      source: "adapter",
      findings: [],
    },
    {
      key: "generated-artifact-governance",
      title: "Generated artifact governance",
      status: "pass",
      source: "adapter",
      findings: [],
    },
    {
      key: "storage-governance",
      title: "Storage governance",
      status: "pass",
      source: "adapter",
      findings: [],
    },
    {
      key: "naming-convention",
      title: "Naming convention",
      status: "pass",
      source: "adapter",
      findings: [],
    },
    {
      key: "documentation-governance",
      title: "Documentation governance",
      status: "pass",
      source: "adapter",
      findings: [],
    },
    {
      key: "workspace-topology",
      title: "Workspace and package topology",
      status: "pass",
      source: "adapter",
      findings: [],
    },
    {
      key: "file-survival",
      title: "File survival and reviewed survival",
      status: "pass",
      source: "adapter",
      findings: [],
    },
    {
      key: "dirty-file-scan",
      title: "Dirty file scan",
      status: "pass",
      source: "native",
      findings: [],
    },
    {
      key: "working-tree-legitimacy",
      title: "Working tree legitimacy",
      status: "pass",
      source: "native",
      findings: [],
    },
    {
      key: "placement-ownership",
      title: "Placement and ownership",
      status: "pass",
      source: "native",
      findings: [],
    },
    {
      key: "generated-artifact-authenticity",
      title: "Generated artifact authenticity",
      status: "pass",
      source: "native",
      findings: [],
    },
    {
      key: "boundary-import-regression",
      title: "Boundary and import regression",
      status: "pass",
      source: "native",
      findings: [],
    },
    {
      key: "source-evidence-mismatch",
      title: "Source and evidence mismatch",
      status: "pass",
      source: "native",
      findings: [],
    },
    {
      key: "duplicate-overlap",
      title: "Duplicate and overlap hygiene",
      status: "pass",
      source: "native",
      findings: [],
    },
    {
      key: "stronger-document-control",
      title: "Stronger document control",
      status: "pass",
      source: "native",
      findings: [],
    },
  ] satisfies RepoGuardCheckResult[])

  assert.deepEqual(
    {
      implemented: coverage.implementedCount,
      partial: coverage.partialCount,
      missing: coverage.missingCount,
    },
    {
      implemented: 9,
      partial: 6,
      missing: 0,
    }
  )
  assert.equal(
    coverage.entries.find((entry) => entry.id === "RG-STRUCT-003")?.status,
    "partial"
  )
  assert.equal(
    coverage.entries.find((entry) => entry.id === "FOUND-WORKTREE-LEGITIMACY")
      ?.status,
    "implemented"
  )
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
        id: "waiver-1",
        checkKey: "dirty-file-scan",
        ruleId: "DIRTY-FILE-001",
        pathPattern: "notes-final.bak",
        severityCap: "error",
        reason: "fixture",
        owner: "governance-toolchain",
        approvedBy: "governance-toolchain",
        createdAt: "2026-04-20T00:00:00.000Z",
        expiresOn: "2026-05-01T00:00:00.000Z",
      },
    ],
    "2026-04-23T00:00:00.000Z"
  )

  assert.equal(waived.status, "pass")
  assert.equal(waived.findings[0]?.waived, true)
})

test("waiver registry reports invalid and soon-to-expire waivers", () => {
  const report = evaluateRepoGuardWaiverRegistry({
    registry: {
      version: 1,
      waivers: [
        {
          id: "repo-guard-waiver-1",
          checkKey: "dirty-file-scan",
          ruleId: "DIRTY-FILE-001",
          pathPattern: "notes-final.bak",
          severityCap: "error",
          reason: "temporary fixture",
          owner: "governance-toolchain",
          approvedBy: "governance-toolchain",
          createdAt: "2026-04-20T00:00:00.000Z",
          expiresOn: "2026-04-25T00:00:00.000Z",
        },
        {
          id: "repo-guard-waiver-2",
          checkKey: "unknown-check",
          ruleId: "DIRTY-FILE-001",
          pathPattern: "*",
          severityCap: "warn",
          reason: "invalid",
          owner: "governance-toolchain",
          approvedBy: "governance-toolchain",
          createdAt: "2026-04-20T00:00:00.000Z",
          expiresOn: "2026-04-26T00:00:00.000Z",
        },
      ],
    },
    registryPath: "rules/repo-integrity/repo-guard-waivers.json",
    knownCheckKeys: ["dirty-file-scan"],
    referenceDate: new Date("2026-04-23T00:00:00.000Z"),
    soonToExpireDays: 14,
  })

  assert.equal(report.waiverCount, 2)
  assert.equal(report.activeWaiverCount, 1)
  assert.equal(report.soonToExpireCount, 2)
  assert.equal(report.valid, false)
  assert.match(
    report.violations.map((violation) => violation.message).join("\n"),
    /not a known repo-guard native check/u
  )
})

test("waiver registry check result surfaces invalid and soon-to-expire state", () => {
  const report = evaluateRepoGuardWaiverRegistry({
    registry: {
      version: 1,
      waivers: [
        {
          id: "repo-guard-waiver-1",
          checkKey: "dirty-file-scan",
          ruleId: "DIRTY-FILE-001",
          pathPattern: "notes-final.bak",
          severityCap: "error",
          reason: "temporary fixture",
          owner: "governance-toolchain",
          approvedBy: "governance-toolchain",
          createdAt: "2026-04-20T00:00:00.000Z",
          expiresOn: "2026-04-25T00:00:00.000Z",
        },
      ],
    },
    registryPath: "rules/repo-integrity/repo-guard-waivers.json",
    knownCheckKeys: ["dirty-file-scan"],
    referenceDate: new Date("2026-04-23T00:00:00.000Z"),
    soonToExpireDays: 14,
  })

  const check = buildRepoGuardWaiverCheckResult(report)
  assert.equal(check.status, "warn")
  assert.match(check.findings[0]?.message ?? "", /approaching expiry/u)
})

test("boundary import parser captures static, export-from, and dynamic imports", () => {
  const imports = parseImportsFromSource(`
import { foo } from "@/app/_features/orders/orders.api"
export { bar } from "@afenda/contracts"
const modulePromise = import("../marketing/marketing-page-registry")
`)

  assert.deepEqual(imports, [
    {
      importPath: "@/app/_features/orders/orders.api",
      line: 2,
    },
    {
      importPath: "@afenda/contracts",
      line: 3,
    },
    {
      importPath: "../marketing/marketing-page-registry",
      line: 4,
    },
  ])
})

test("boundary import target normalization preserves app aliases and package targets", () => {
  assert.equal(
    normalizeImportTarget(
      "apps/web/src/share/auth/use-auth-session.ts",
      "@/app/_platform/auth/auth-client"
    ),
    "apps/web/src/app/_platform/auth/auth-client"
  )
  assert.equal(
    normalizeImportTarget(
      "apps/web/src/share/auth/use-auth-session.ts",
      "@afenda/contracts"
    ),
    "@afenda/contracts"
  )
  assert.equal(
    normalizeImportTarget(
      "apps/web/src/share/auth/use-auth-session.ts",
      "../marketing/marketing-page-registry"
    ),
    "apps/web/src/share/marketing/marketing-page-registry"
  )
})

test("workspace package import helper allows bare and exported wildcard subpaths only", () => {
  const exportSurface = {
    packageName: "@afenda/demo-public",
    allowBareImport: true,
    allowedSubpathPatterns: ["public", "public/*"],
  }

  assert.equal(
    isAllowedWorkspacePackageImport({
      importPath: "@afenda/demo-public",
      exportSurface,
    }),
    true
  )
  assert.equal(
    isAllowedWorkspacePackageImport({
      importPath: "@afenda/demo-public/public/button",
      exportSurface,
    }),
    true
  )
  assert.equal(
    isAllowedWorkspacePackageImport({
      importPath: "@afenda/demo-public/internal/secret",
      exportSurface,
    }),
    false
  )
})

test("boundary import findings do not treat package-local coverage directories as machine-noise roots", async () => {
  const fixtureRoot = path.join(
    workspaceRoot,
    ".artifacts/tmp/repo-guard-package-local-coverage"
  )
  const packageManifestPath = path.join(
    fixtureRoot,
    "packages/governance-toolchain/package.json"
  )
  const packageIndexPath = path.join(
    fixtureRoot,
    "packages/governance-toolchain/src/index.ts"
  )
  const coverageModulePath = path.join(
    fixtureRoot,
    "packages/governance-toolchain/src/coverage/repo-guard-coverage.ts"
  )

  await fs.mkdir(path.dirname(packageManifestPath), { recursive: true })
  await fs.mkdir(path.dirname(coverageModulePath), { recursive: true })
  await fs.writeFile(
    packageManifestPath,
    JSON.stringify(
      {
        name: "@afenda/governance-toolchain",
        type: "module",
        exports: {
          ".": "./src/index.ts",
        },
      },
      null,
      2
    ),
    "utf8"
  )
  await fs.writeFile(
    packageIndexPath,
    `export * from "./coverage/repo-guard-coverage.js"\n`,
    "utf8"
  )
  await fs.writeFile(
    coverageModulePath,
    `export const coverageCatalog = [] as const\n`,
    "utf8"
  )

  const findings = await evaluateBoundaryImportFindings({
    repoRoot: fixtureRoot,
    filePaths: ["packages/governance-toolchain/src/index.ts"],
    policy: repoGuardPolicy.boundaryImport,
  })

  assert.equal(findings.length, 0)

  await fs.rm(fixtureRoot, { recursive: true, force: true })
})

test("boundary import findings still fail on imports into repo-root machine-noise coverage", async () => {
  const fixtureRoot = path.join(
    workspaceRoot,
    ".artifacts/tmp/repo-guard-root-coverage-import"
  )
  const importerPath = path.join(
    fixtureRoot,
    "apps/web/src/share/ui/blocked-coverage-import.ts"
  )
  const coveragePath = path.join(fixtureRoot, "coverage/generated/report.ts")

  await fs.mkdir(path.dirname(importerPath), { recursive: true })
  await fs.mkdir(path.dirname(coveragePath), { recursive: true })
  await fs.writeFile(
    importerPath,
    `import { report } from "../../../../../coverage/generated/report"\n`,
    "utf8"
  )
  await fs.writeFile(
    coveragePath,
    `export const report = "generated"\n`,
    "utf8"
  )

  const findings = await evaluateBoundaryImportFindings({
    repoRoot: fixtureRoot,
    filePaths: ["apps/web/src/share/ui/blocked-coverage-import.ts"],
    policy: repoGuardPolicy.boundaryImport,
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-STRUCT-003")
  assert.match(findings[0]?.message ?? "", /machine-noise boundary/u)

  await fs.rm(fixtureRoot, { recursive: true, force: true })
})

test("boundary import findings fail on blocked shared-to-feature dependency and ignore tests", async () => {
  const fixtureRoot = path.join(
    workspaceRoot,
    ".artifacts/tmp/repo-guard-boundary"
  )
  const shareFile = path.join(
    fixtureRoot,
    "apps/web/src/share/ui/shared-shell.ts"
  )
  const testFile = path.join(
    fixtureRoot,
    "apps/web/src/share/__tests__/shared-shell.test.ts"
  )
  const marketingFile = path.join(
    fixtureRoot,
    "apps/web/src/marketing/marketing-page.tsx"
  )

  await fs.mkdir(path.dirname(shareFile), { recursive: true })
  await fs.mkdir(path.dirname(testFile), { recursive: true })
  await fs.mkdir(path.dirname(marketingFile), { recursive: true })
  await fs.writeFile(
    shareFile,
    `import { ordersApi } from "@/app/_features/orders/orders.api"\n`,
    "utf8"
  )
  await fs.writeFile(
    testFile,
    `import { ordersApi } from "@/app/_features/orders/orders.api"\n`,
    "utf8"
  )
  await fs.writeFile(
    marketingFile,
    `import { themeProvider } from "@/app/_platform/theme/theme.provider"\n`,
    "utf8"
  )

  const findings = await evaluateBoundaryImportFindings({
    repoRoot: fixtureRoot,
    filePaths: [
      "apps/web/src/share/ui/shared-shell.ts",
      "apps/web/src/share/__tests__/shared-shell.test.ts",
      "apps/web/src/marketing/marketing-page.tsx",
    ],
    policy: repoGuardPolicy.boundaryImport,
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-STRUCT-003")
  assert.equal(findings[0]?.filePath, "apps/web/src/share/ui/shared-shell.ts")
  assert.match(findings[0]?.message ?? "", /Shared code must not depend/u)

  await fs.rm(fixtureRoot, { recursive: true, force: true })
})

test("boundary import findings fail on non-exported internal package subpaths", async () => {
  const fixtureRoot = path.join(
    workspaceRoot,
    ".artifacts/tmp/repo-guard-package-export-boundary"
  )
  const packageManifestPath = path.join(
    fixtureRoot,
    "packages/demo-public/package.json"
  )
  const allowedImporterPath = path.join(
    fixtureRoot,
    "apps/web/src/share/ui/allowed-import.ts"
  )
  const blockedImporterPath = path.join(
    fixtureRoot,
    "apps/web/src/share/ui/blocked-import.ts"
  )

  await fs.mkdir(path.dirname(packageManifestPath), { recursive: true })
  await fs.mkdir(path.dirname(allowedImporterPath), { recursive: true })
  await fs.writeFile(
    packageManifestPath,
    JSON.stringify(
      {
        name: "@afenda/demo-public",
        type: "module",
        exports: {
          ".": "./src/index.ts",
          "./public": "./src/public/index.ts",
          "./public/*": "./src/public/*",
        },
      },
      null,
      2
    ),
    "utf8"
  )
  await fs.writeFile(
    allowedImporterPath,
    `import { Button } from "@afenda/demo-public/public/button"\n`,
    "utf8"
  )
  await fs.writeFile(
    blockedImporterPath,
    `import { secret } from "@afenda/demo-public/internal/secret"\n`,
    "utf8"
  )

  const findings = await evaluateBoundaryImportFindings({
    repoRoot: fixtureRoot,
    filePaths: [
      "apps/web/src/share/ui/allowed-import.ts",
      "apps/web/src/share/ui/blocked-import.ts",
    ],
    policy: repoGuardPolicy.boundaryImport,
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-STRUCT-003")
  assert.match(findings[0]?.message ?? "", /declared public export surface/u)
  assert.match(findings[0]?.evidence ?? "", /@afenda\/demo-public\/internal/u)

  await fs.rm(fixtureRoot, { recursive: true, force: true })
})

test("placement ownership scopes reuse rollout owner truth and runtime/shared roots", async () => {
  const config = await loadAfendaConfig()
  const scopes = buildPlacementOwnershipScopes(config)
  const marketingScope = scopes.find((scope) => scope.id === "marketing")

  assert.ok(marketingScope)
  assert.ok(
    marketingScope.rules.some(
      (rule) =>
        rule.kind === "runtime-owner" &&
        rule.root === "apps/web/src/marketing/marketing-page-registry.ts"
    )
  )
  assert.ok(
    marketingScope.rules.some(
      (rule) =>
        rule.kind === "shared-root" &&
        rule.root === "apps/web/src/marketing/components"
    )
  )
  assert.ok(
    marketingScope.rules.some(
      (rule) =>
        rule.kind === "owner-root" &&
        rule.root === "apps/web/src/marketing/pages/company" &&
        rule.owner === "marketing-route:company"
    )
  )
  const withStaticScopes = buildPlacementOwnershipScopes(config, [
    {
      id: "web-client-roots",
      scopeRoot: "apps/web/src",
      ignorePatterns: [],
      rules: [
        {
          owner: "apps/web:share",
          root: "apps/web/src/share",
          kind: "owner-root",
          matchMode: "prefix",
        },
      ],
    },
  ])
  assert.ok(withStaticScopes.some((scope) => scope.id === "web-client-roots"))
})

test("placement ownership findings fail for unowned governed files", () => {
  const findings = evaluatePlacementOwnershipFindings({
    filePaths: ["apps/web/src/marketing/pages/company/unowned-helper.ts"],
    scopes: [
      {
        id: "marketing",
        scopeRoot: "apps/web/src/marketing",
        ignorePatterns: [],
        rules: [
          {
            owner: "marketing-route:company",
            root: "apps/web/src/marketing/pages/company/about",
            kind: "owner-root",
            matchMode: "prefix",
          },
        ],
      },
    ],
    ignoredPathPatterns: [],
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-STRUCT-001")
  assert.match(
    findings[0]?.message ?? "",
    /does not map to any declared owner/u
  )
})

test("placement ownership findings fail for ambiguous equally specific owners", () => {
  const findings = evaluatePlacementOwnershipFindings({
    filePaths: ["apps/web/src/marketing/pages/company/about/about-page.tsx"],
    scopes: [
      {
        id: "marketing",
        scopeRoot: "apps/web/src/marketing",
        ignorePatterns: [],
        rules: [
          {
            owner: "marketing-route:company",
            root: "apps/web/src/marketing/pages/company/about",
            kind: "owner-root",
            matchMode: "prefix",
          },
          {
            owner: "marketing-route:conflict",
            root: "apps/web/src/marketing/pages/company/about",
            kind: "owner-root",
            matchMode: "prefix",
          },
        ],
      },
    ],
    ignoredPathPatterns: [],
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-STRUCT-001")
  assert.match(
    findings[0]?.message ?? "",
    /multiple equally specific owner roots/u
  )
})

test("placement ownership findings stay clean for properly owned governed files", () => {
  const findings = evaluatePlacementOwnershipFindings({
    filePaths: [
      "apps/web/src/marketing/marketing-page-registry.ts",
      "apps/web/src/marketing/components/marketing-page-shell.tsx",
      "apps/web/src/marketing/pages/company/about/about-page.tsx",
      "apps/web/src/marketing/__tests__/about-page.test.tsx",
    ],
    scopes: [
      {
        id: "marketing",
        scopeRoot: "apps/web/src/marketing",
        ignorePatterns: ["**/__tests__/**"],
        rules: [
          {
            owner: "marketing:runtime",
            root: "apps/web/src/marketing/marketing-page-registry.ts",
            kind: "runtime-owner",
            matchMode: "exact",
          },
          {
            owner: "marketing:shared",
            root: "apps/web/src/marketing/components",
            kind: "shared-root",
            matchMode: "prefix",
          },
          {
            owner: "marketing-route:company",
            root: "apps/web/src/marketing/pages/company",
            kind: "owner-root",
            matchMode: "prefix",
          },
        ],
      },
    ],
    ignoredPathPatterns: [],
  })

  assert.equal(findings.length, 0)
})

test("placement ownership findings fail for unowned web top-level roots under static app scope", () => {
  const findings = evaluatePlacementOwnershipFindings({
    filePaths: ["apps/web/src/experimental/rogue-surface.ts"],
    scopes: [
      {
        id: "web-client-roots",
        scopeRoot: "apps/web/src",
        ignorePatterns: [],
        rules: [
          {
            owner: "apps/web:app",
            root: "apps/web/src/app",
            kind: "owner-root",
            matchMode: "prefix",
          },
          {
            owner: "apps/web:marketing",
            root: "apps/web/src/marketing",
            kind: "owner-root",
            matchMode: "prefix",
          },
          {
            owner: "apps/web:routes",
            root: "apps/web/src/routes",
            kind: "owner-root",
            matchMode: "prefix",
          },
          {
            owner: "apps/web:rpc",
            root: "apps/web/src/rpc",
            kind: "owner-root",
            matchMode: "prefix",
          },
          {
            owner: "apps/web:share",
            root: "apps/web/src/share",
            kind: "owner-root",
            matchMode: "prefix",
          },
        ],
      },
    ],
    ignoredPathPatterns: [],
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-STRUCT-001")
  assert.match(
    findings[0]?.message ?? "",
    /does not map to any declared owner/u
  )
})

test("placement ownership findings stay clean for package-local roots covered by static scopes", () => {
  const findings = evaluatePlacementOwnershipFindings({
    filePaths: [
      "apps/api/src/app.ts",
      "apps/api/src/index.ts",
      "packages/contracts/src/index.ts",
      "packages/_database/scripts/sync-schema-inventory.ts",
      "apps/api/src/routes/health.ts",
    ],
    scopes: repoGuardPolicy.placementOwnershipStaticScopes,
    ignoredPathPatterns: [],
  })

  assert.equal(findings.length, 0)
})

test("generated authenticity detects orphan generated files in guarded roots", async () => {
  const findings = await evaluateGeneratedArtifactAuthenticityFindings({
    repoRoot: workspaceRoot,
    trackedFiles: [
      "docs/architecture/governance/generated/untracked-orphan.md",
    ],
    policy: {
      bindings: [],
      orphanRoots: [
        {
          root: "docs/architecture/governance/generated",
          allowedGeneratedPaths: [],
        },
      ],
    },
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-TRUTH-002")
  assert.match(findings[0]?.message ?? "", /without an authenticity binding/u)
})

test("generated authenticity detects missing provenance sources", async () => {
  const findings = await evaluateGeneratedArtifactAuthenticityFindings({
    repoRoot: workspaceRoot,
    trackedFiles: [],
    policy: {
      bindings: [
        {
          id: "missing-source",
          kind: "governance-register-markdown",
          targetPath:
            "docs/architecture/governance/generated/governance-register.md",
          requiredSources: ["does/not/exist.json"],
        },
      ],
      orphanRoots: [],
    },
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-TRUTH-002")
  assert.match(findings[0]?.message ?? "", /missing provenance source/u)
})

test("generated authenticity hash helper is deterministic for source inputs", async () => {
  const hashA = await computeCombinedContentHash(workspaceRoot, [
    "scripts/afenda.config.json",
  ])
  const hashB = await computeCombinedContentHash(workspaceRoot, [
    "scripts/afenda.config.json",
  ])

  assert.equal(hashA, hashB)
  assert.match(hashA, /^[a-f0-9]{64}$/u)
})

test("generated authenticity JSON normalization ignores formatting-only drift", () => {
  const compact = `{"roots":["src/schema","src/7w1h-audit"],"count":2}`
  const expanded = `{
  "roots": [
    "src/schema",
    "src/7w1h-audit"
  ],
  "count": 2
}
`

  assert.equal(
    normalizeGeneratedJsonContent(compact),
    normalizeGeneratedJsonContent(expanded)
  )
})

test("generated authenticity stays clean for calibrated design-system and database bindings", async () => {
  const findings = await evaluateGeneratedArtifactAuthenticityFindings({
    repoRoot: workspaceRoot,
    trackedFiles: [
      "packages/design-system/generated/component-manifests.json",
      "packages/design-system/generated/component-variants.json",
      "packages/design-system/generated/component-coverage.json",
      "packages/design-system/generated/schemas/component-manifests.schema.json",
      "packages/design-system/generated/schemas/component-variants.schema.json",
      "packages/design-system/generated/schemas/component-coverage.schema.json",
    ],
    policy: {
      bindings: repoGuardPolicy.generatedAuthenticity.bindings.filter(
        (binding) =>
          binding.id === "design-system-component-manifests" ||
          binding.id === "design-system-component-variants" ||
          binding.id === "design-system-component-coverage" ||
          binding.id === "database-schema-inventory" ||
          binding.id === "database-glossary-snapshot"
      ),
      orphanRoots: repoGuardPolicy.generatedAuthenticity.orphanRoots.filter(
        (root) => root.root === "packages/design-system/generated"
      ),
    },
  })

  assert.equal(findings.length, 0)
})

test("duplicate overlap warns on suspicious tracked variant names", () => {
  const findings = evaluateDuplicateOverlapFindings({
    filePaths: ["docs/architecture/governance/repo-guard-final.md"],
    policy: repoGuardPolicy.duplicateOverlap,
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-HYGIENE-005")
  assert.match(
    findings[0]?.message ?? "",
    /looks like a duplicate or temporary variant/u
  )
})

test("duplicate overlap warns on duplicate governed basenames in sensitive surfaces", () => {
  const findings = evaluateDuplicateOverlapFindings({
    filePaths: [
      "docs/architecture/governance/repository-integrity-guard.md",
      "docs/architecture/atc/repository-integrity-guard.md",
      "docs/architecture/governance/README.md",
    ],
    policy: repoGuardPolicy.duplicateOverlap,
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-HYGIENE-005")
  assert.match(
    findings[0]?.message ?? "",
    /Multiple governed files share the same basename/u
  )
})

test("duplicate overlap ignores allowed duplicate basenames in governed scopes", () => {
  const findings = evaluateDuplicateOverlapFindings({
    filePaths: [
      "docs/architecture/governance/README.md",
      "docs/architecture/atc/README.md",
      "scripts/index.ts",
      "apps/web/scripts/index.ts",
    ],
    policy: repoGuardPolicy.duplicateOverlap,
  })

  assert.equal(findings.length, 0)
})

test("document control frontmatter parser reads simple governance metadata", () => {
  const frontmatter = parseFrontmatter(`---
title: Sample
owner: governance-toolchain
truthStatus: canonical
---

# Sample
`)

  assert.equal(frontmatter.present, true)
  assert.equal(frontmatter.fields.title, "Sample")
  assert.equal(frontmatter.fields.owner, "governance-toolchain")
})

test("stronger document control warns on missing frontmatter metadata", async () => {
  const fixtureRoot = path.join(
    workspaceRoot,
    ".artifacts/tmp/repo-guard-document-control-metadata"
  )
  const docPath = path.join(
    fixtureRoot,
    "docs/architecture/governance/example.md"
  )

  await fs.mkdir(path.dirname(docPath), { recursive: true })
  await fs.writeFile(
    docPath,
    `---
title: Example
owner: governance-toolchain
---

# Example
`,
    "utf8"
  )

  const findings = await evaluateStrongerDocumentControlFindings({
    repoRoot: fixtureRoot,
    filePaths: ["docs/architecture/governance/example.md"],
    policy: repoGuardPolicy.strongerDocumentControl,
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-ADVISORY-006")
  assert.match(
    findings[0]?.message ?? "",
    /frontmatter is missing required governance metadata fields/u
  )

  await fs.rm(fixtureRoot, { recursive: true, force: true })
})

test("stronger document control warns on missing ADR linkage anchors", async () => {
  const fixtureRoot = path.join(
    workspaceRoot,
    ".artifacts/tmp/repo-guard-document-control-anchors"
  )
  const docPath = path.join(
    fixtureRoot,
    "docs/architecture/adr/ADR-9000-example.md"
  )

  await fs.mkdir(path.dirname(docPath), { recursive: true })
  await fs.writeFile(
    docPath,
    `---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
---

# ADR-9000: Example
`,
    "utf8"
  )

  const findings = await evaluateStrongerDocumentControlFindings({
    repoRoot: fixtureRoot,
    filePaths: ["docs/architecture/adr/ADR-9000-example.md"],
    policy: repoGuardPolicy.strongerDocumentControl,
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-ADVISORY-006")
  assert.match(
    findings[0]?.message ?? "",
    /missing expected contract\/linkage markers/u
  )

  await fs.rm(fixtureRoot, { recursive: true, force: true })
})

test("stronger document control stays clean for a fully formed governed doc", async () => {
  const fixtureRoot = path.join(
    workspaceRoot,
    ".artifacts/tmp/repo-guard-document-control-clean"
  )
  const docPath = path.join(
    fixtureRoot,
    "docs/architecture/atc/ATC-9000-example.md"
  )

  await fs.mkdir(path.dirname(docPath), { recursive: true })
  await fs.writeFile(
    docPath,
    `---
title: ATC-9000 example
description: Example contract.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 99
---

# ATC-9000: Example

- **Bound domain ID:** GOV-EXAMPLE-001
- **Decision anchor:** ADR-9000
`,
    "utf8"
  )

  const findings = await evaluateStrongerDocumentControlFindings({
    repoRoot: fixtureRoot,
    filePaths: ["docs/architecture/atc/ATC-9000-example.md"],
    policy: repoGuardPolicy.strongerDocumentControl,
  })

  assert.equal(findings.length, 0)

  await fs.rm(fixtureRoot, { recursive: true, force: true })
})

test("source/evidence mismatch fails when source changes without evidence refresh", () => {
  const findings = evaluateSourceEvidenceMismatchFindings({
    entries: [
      {
        path: "packages/_database/scripts/sync-schema-inventory.ts",
        modifiedTracked: true,
        previousPath: undefined,
        untracked: false,
      },
    ],
    policy: repoGuardPolicy.sourceEvidenceMismatch,
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-TRUTH-004")
  assert.match(findings[0]?.message ?? "", /source changed without refreshing/u)
})

test("source/evidence mismatch fails when evidence changes without bound source change", () => {
  const findings = evaluateSourceEvidenceMismatchFindings({
    entries: [
      {
        path: "packages/_database/docs/guideline/schema-inventory.json",
        modifiedTracked: true,
        previousPath: undefined,
        untracked: false,
      },
    ],
    policy: repoGuardPolicy.sourceEvidenceMismatch,
  })

  assert.equal(findings.length, 1)
  assert.equal(findings[0]?.ruleId, "RG-TRUTH-004")
  assert.match(
    findings[0]?.message ?? "",
    /Evidence surface changed without a matching source-side change/u
  )
})

test("source/evidence mismatch stays clean when a full binding refresh is present", () => {
  const findings = evaluateSourceEvidenceMismatchFindings({
    entries: [
      {
        path: "packages/design-system/ui-primitives/_registry.ts",
        modifiedTracked: true,
        previousPath: undefined,
        untracked: false,
      },
      {
        path: "packages/design-system/generated/component-manifests.json",
        modifiedTracked: true,
        previousPath: undefined,
        untracked: false,
      },
      {
        path: "packages/design-system/generated/component-variants.json",
        modifiedTracked: true,
        previousPath: undefined,
        untracked: false,
      },
      {
        path: "packages/design-system/generated/component-coverage.json",
        modifiedTracked: true,
        previousPath: undefined,
        untracked: false,
      },
    ],
    policy: repoGuardPolicy.sourceEvidenceMismatch,
  })

  assert.equal(findings.length, 0)
})

test("source/evidence mismatch ignores design-system generator implementation-only changes", () => {
  const findings = evaluateSourceEvidenceMismatchFindings({
    entries: [
      {
        path: "packages/design-system/scripts/component-governance/core.ts",
        modifiedTracked: true,
        previousPath: undefined,
        untracked: false,
      },
    ],
    policy: repoGuardPolicy.sourceEvidenceMismatch,
  })

  assert.equal(findings.length, 0)
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

  const ciResult = spawnSync("pnpm run repo:guard:ci", {
    cwd: workspaceRoot,
    encoding: "utf8",
    shell: true,
  })

  const jsonReport = JSON.parse(readFileSync(reportJsonPath, "utf8")) as {
    status: string
    checks: unknown[]
    governanceDomain: { domainId: string }
    contractBinding: { adr: string; atc: string; status: string }
    waivers: { registryPath: string; valid: boolean }
  }
  const markdownReport = readFileSync(reportMarkdownPath, "utf8")

  assert.ok(Array.isArray(jsonReport.checks))
  assert.deepEqual(jsonReport.contractBinding, {
    adr: "ADR-0008",
    atc: "ATC-0005",
    status: "bound",
  })
  assert.equal(
    jsonReport.waivers.registryPath,
    "rules/repo-integrity/repo-guard-waivers.json"
  )
  assert.equal(ciResult.status, jsonReport.status === "fail" ? 1 : 0)
  assert.equal(jsonReport.governanceDomain.domainId, "GOV-TRUTH-001")
  assert.match(markdownReport, /# Repository integrity guard/u)
})
