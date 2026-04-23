import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import test from "node:test"

import type { AfendaConfig } from "../config/afenda-config.js"
import { evaluateAfendaWorkspaceGovernance } from "./afenda-workspace-governance.js"

test("boundary surface governance allows owner-local docs, rules, scripts, and tests", async () => {
  const repoRoot = createFixtureRepo({
    "package.json": "{}",
    "apps/web/package.json": "{}",
    "apps/web/docs/README.md": "# Web docs",
    "apps/web/rules/policy.md": "# Rules",
    "apps/web/scripts/check.ts": "export {}",
    "apps/web/tests/example.test.ts": "export {}",
    "apps/web/src/app/_features/example/index.ts": "export {}",
    "packages/example/package.json": "{}",
    "packages/example/docs/README.md": "# Package docs",
    "packages/example/rules/policy.md": "# Rules",
    "packages/example/scripts/check.ts": "export {}",
    "packages/example/tests/example.test.ts": "export {}",
  })

  try {
    const issues = await evaluateAfendaWorkspaceGovernance(
      createFixtureConfig(),
      repoRoot
    )

    assert.equal(
      issues.filter((issue) => issue.rule === "boundary-surfaces").length,
      0
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

test("boundary surface governance warns on root doctrine roots and owner-local doctrine folders", async () => {
  const repoRoot = createFixtureRepo({
    "package.json": "{}",
    "doctrine/README.md": "# Bad root doctrine",
    "apps/web/package.json": "{}",
    "apps/web/doctrine/README.md": "# Bad app doctrine",
    "apps/web/src/app/_features/example/doctrine/README.md":
      "# Bad feature doctrine",
    "packages/example/package.json": "{}",
  })

  try {
    const issues = await evaluateAfendaWorkspaceGovernance(
      createFixtureConfig(),
      repoRoot
    )

    const warnings = issues.filter(
      (issue) => issue.rule === "boundary-surfaces" && issue.severity === "warn"
    )

    assert.match(warnings.map((issue) => issue.path).join("\n"), /doctrine/u)
    assert.match(
      warnings.map((issue) => issue.message).join("\n"),
      /Owner-local doctrine must live under/u
    )
  } finally {
    cleanupFixtureRepo(repoRoot)
  }
})

function createFixtureRepo(files: Record<string, string>): string {
  const repoRoot = mkdtempSync(path.join(os.tmpdir(), "afenda-boundaries-"))

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
    readmeTargets: [{ path: "docs", mode: "docs-root" }],
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
        allowedHiddenRootDirectories: [],
        storageDirectories: [],
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
            allowedDirectories: ["docs", "rules", "scripts", "src", "tests"],
            allowedFiles: ["package.json"],
          },
          {
            name: "package",
            allowedDirectories: ["docs", "rules", "scripts", "src", "tests"],
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
          {
            path: "packages/example",
            profile: "package",
            extraAllowedDirectories: [],
            extraAllowedFiles: [],
          },
        ],
      },
      featureTemplate: {
        featuresRoot: "apps/web/src/app/_features",
        requiredDirectories: [],
        requiredFiles: [],
        enforceWhenFeatureExists: false,
      },
      sharedPackageTemplate: {
        packagePath: "packages/shared",
        requiredDirectories: [],
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
      idFamilies: [],
      domains: [],
      gates: [],
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
