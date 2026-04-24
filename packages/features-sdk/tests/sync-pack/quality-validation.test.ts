import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  runSyncPackQualityValidation,
  type ExternalCommandResult,
  type ExternalCommandRunner,
  type ExternalCommandSpec,
} from "../../src/index.js"

async function writeText(filePath: string, value: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, value, "utf8")
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

async function createQualityValidationFixture(): Promise<{
  readonly workspaceRoot: string
  readonly packageRoot: string
}> {
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "fsdk-quality-"))
  const packageRoot = path.join(workspaceRoot, "packages", "features-sdk")

  await writeJson(path.join(workspaceRoot, "package.json"), {
    name: "quality-validation-fixture",
    private: true,
  })
  await writeText(
    path.join(workspaceRoot, "pnpm-workspace.yaml"),
    "packages:\n  - 'packages/*'\n"
  )
  await writeText(
    path.join(packageRoot, "docs", "README.md"),
    "feature-sync\nfinding-remediation-catalog.md\n"
  )
  await writeText(
    path.join(packageRoot, "docs", "getting-started.md"),
    "feature-sync:verify\nfeature-sync:quality-validate\n"
  )
  await writeText(
    path.join(packageRoot, "docs", "junior-developer-usage-guide.md"),
    "feature-sync:generate\nfeature-sync:quality-validate\n"
  )
  await writeText(
    path.join(packageRoot, "docs", "junior-devops-quickstart.md"),
    "feature-sync:verify\nfeature-sync:quality-validate\n"
  )
  await writeText(
    path.join(packageRoot, "README.md"),
    "feature-sync:quality-validate\nfeature-sync:verify\n"
  )
  await writeText(
    path.join(packageRoot, "docs", "sync-pack", "README.md"),
    "feature-sync:quality-validate\nfeature-sync:verify\n"
  )
  await writeText(
    path.join(packageRoot, "docs", "sync-pack", "command-handbook.md"),
    "quality-validate\n--category\n--lane\n--owner\n--pack\n"
  )
  await writeText(
    path.join(
      packageRoot,
      "docs",
      "sync-pack",
      "INTERNAL_OPERATING_CONTRACT.md"
    ),
    "feature-sync:quality-validate\nfeature-sync:verify\n"
  )
  await writeText(
    path.join(
      packageRoot,
      "docs",
      "sync-pack",
      "finding-remediation-catalog.md"
    ),
    "invalid-seed-candidate\ncatalog-not-used\n"
  )
  await writeText(
    path.join(packageRoot, "docs", "sync-pack", "INTERNAL_ROADMAP.md"),
    "richer remediation in gated findings\ninternal change-intent discipline\n"
  )
  await writeText(
    path.join(
      packageRoot,
      "docs",
      "sync-pack",
      "QUALITY_VALIDATION_EXECUTION_PLAN.md"
    ),
    "Features SDK Quality Validation Execution Plan\nClosure Rule\n"
  )
  await writeText(
    path.join(packageRoot, "rules", "sync-pack", "FEATURE_SYNC_PACK_DOD.md"),
    "feature-sync:quality-validate\n"
  )
  await writeJson(
    path.join(packageRoot, "rules", "sync-pack", "openalternative.seed.json"),
    [
      {
        id: "internal-support-crm",
        name: "Internal Support CRM",
        source: "openalternative",
        sourceUrl: "https://openalternative.co/business-saas",
        sourceCategory: "Business Software",
        internalCategory: "business-saas",
        lane: "operate",
        priority: "critical",
        buildMode: "adapt",
        internalUseCase: "Support workspace",
        openSourceReferences: ["https://openalternative.co/business-saas"],
        licenseReviewRequired: true,
        securityReviewRequired: true,
        dataSensitivity: "high",
        ownerTeam: "Business Operations",
        status: "candidate",
      },
    ]
  )

  return {
    workspaceRoot,
    packageRoot,
  }
}

function createRunner(
  overrides: Partial<
    Record<ExternalCommandSpec["id"], ExternalCommandResult>
  > = {}
): ExternalCommandRunner {
  return async (spec) => {
    if (overrides[spec.id]) {
      return overrides[spec.id] as ExternalCommandResult
    }

    switch (spec.id) {
      case "typecheck":
      case "build":
      case "test:run":
      case "lint":
        return { exitCode: 0, stdout: "", stderr: "" }
      case "root-quickstart":
        return {
          exitCode: 0,
          stdout:
            "Afenda Sync-Pack Quickstart\npnpm run feature-sync:verify\nIt never auto-runs verify.\n",
          stderr: "",
        }
      case "root-help":
        return {
          exitCode: 0,
          stdout: "Afenda Sync-Pack CLI\nOperator Workflow:\nRelease Gates:\n",
          stderr: "",
        }
      case "verify":
        return {
          exitCode: 0,
          stdout:
            "Feature Sync-Pack verify\nWhat ran?\nWhat passed?\nWhat warned?\nWhat failed?\nWhat to fix next?\nFinal verdict:\n",
          stderr: "",
        }
      case "release-check":
      case "check":
      case "validate":
        return {
          exitCode: 0,
          stdout: JSON.stringify({
            findings: [],
            errorCount: 0,
            warningCount: 0,
          }),
          stderr: "",
        }
      case "verify-json":
        return {
          exitCode: 0,
          stdout: JSON.stringify({
            findings: [],
            errorCount: 0,
            warningCount: 0,
            steps: [
              { name: "release-check" },
              { name: "check" },
              { name: "doctor" },
              { name: "validate" },
            ],
            verdict: "pass",
          }),
          stderr: "",
        }
      case "doctor":
        return {
          exitCode: 0,
          stdout: JSON.stringify({
            findings: [],
            errorCount: 0,
            warningCount: 0,
          }),
          stderr: "",
        }
      case "rank-filter":
        return {
          exitCode: 0,
          stdout:
            "Applied filters: category=business-saas\n| internal-support-crm |\n",
          stderr: "",
        }
      case "report-filter":
        return {
          exitCode: 0,
          stdout: "# Feature Sync-Pack Report\nApplied filters: lane=operate\n",
          stderr: "",
        }
      case "generate-filter":
        return {
          exitCode: 0,
          stdout:
            "Generated 11 Feature Sync-Pack files for 1 candidates.\nApplied filters: pack=internal-support-crm\nOutput: docs/sync-pack/generated-packs\ninternal-support-crm\n",
          stderr: "",
        }
      case "rank-zero-match":
        return {
          exitCode: 1,
          stdout: "",
          stderr:
            "No candidates matched the requested filters (pack=missing-quality-validation-pack).\n",
        }
      case "scaffold":
        return {
          exitCode: 0,
          stdout:
            "Planning pack: packages/features-sdk/docs/sync-pack/generated-packs/business-saas/internal-support-crm\nWeb feature: apps/web/src/app/_features/internal-support-crm\nAPI module: apps/api/src/modules/internal-support-crm\nAPI route: apps/api/src/routes/internal-support-crm.ts\n",
          stderr: "",
        }
      case "install":
        return {
          exitCode: 0,
          stdout: "Lockfile up to date\n",
          stderr: "",
        }
      default:
        throw new Error(`Unexpected step ${spec.id}`)
    }
  }
}

describe("runSyncPackQualityValidation", () => {
  it("returns pass when all package-first validation steps are green", async () => {
    const fixture = await createQualityValidationFixture()

    try {
      const result = await runSyncPackQualityValidation({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        commandRunner: createRunner(),
      })

      expect(result.verdict).toBe("pass")
      expect(result.errorCount).toBe(0)
      expect(result.warningCount).toBe(0)
      expect(result.selectedCandidate).toMatchObject({
        id: "internal-support-crm",
        category: "business-saas",
      })
      expect(result.evidencePaths).toContain(
        "tests/sync-pack/built-cli-smoke.test.ts"
      )
      expect(result.steps.map((step) => step.name)).toContain("docs-surface")
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("returns warn when only non-blocking doctor warnings remain outside features-sdk", async () => {
    const fixture = await createQualityValidationFixture()

    try {
      const warningResult = {
        exitCode: 0,
        stdout: JSON.stringify({
          findings: [
            {
              severity: "warning",
              code: "catalog-not-used",
              message: "Prefer catalog: for zod.",
              filePath: path.join(
                fixture.workspaceRoot,
                "apps",
                "web",
                "package.json"
              ),
              remediation: {
                action: "Replace the explicit version with catalog:.",
              },
            },
          ],
          errorCount: 0,
          warningCount: 1,
        }),
        stderr: "",
      } satisfies ExternalCommandResult
      const result = await runSyncPackQualityValidation({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        commandRunner: createRunner({
          doctor: warningResult,
          "verify-json": {
            exitCode: 0,
            stdout: JSON.stringify({
              findings: [
                {
                  severity: "warning",
                  code: "catalog-not-used",
                  message: "Prefer catalog: for zod.",
                  filePath: path.join(
                    fixture.workspaceRoot,
                    "apps",
                    "web",
                    "package.json"
                  ),
                  remediation: {
                    action: "Replace the explicit version with catalog:.",
                  },
                },
              ],
              errorCount: 0,
              warningCount: 1,
              steps: [
                { name: "release-check" },
                { name: "check" },
                { name: "doctor" },
                { name: "validate" },
              ],
              verdict: "warn",
            }),
            stderr: "",
          },
        }),
      })

      expect(result.verdict).toBe("warn")
      expect(result.errorCount).toBe(0)
      expect(result.warningCount).toBeGreaterThan(0)
      expect(result.nonBlockingFindings[0]).toMatchObject({
        owner: "apps/web",
        disposition: "out-of-package-scope",
      })
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("treats release-check warnings as blocking fix-now findings", async () => {
    const fixture = await createQualityValidationFixture()

    try {
      const result = await runSyncPackQualityValidation({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        commandRunner: createRunner({
          "release-check": {
            exitCode: 0,
            stdout: JSON.stringify({
              findings: [
                {
                  severity: "warning",
                  code: "package-warning",
                  message: "A package warning should block closure.",
                  filePath: path.join(fixture.packageRoot, "README.md"),
                },
              ],
              errorCount: 0,
              warningCount: 1,
            }),
            stderr: "",
          },
        }),
      })

      expect(result.verdict).toBe("fail")
      expect(result.errorCount).toBeGreaterThan(0)
      expect(result.blockingFindings[0]).toMatchObject({
        step: "release-check",
        severity: "warning",
        owner: "features-sdk",
        disposition: "fix-now",
        blocking: true,
      })
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("adds the preflight step only when requested", async () => {
    const fixture = await createQualityValidationFixture()

    try {
      const result = await runSyncPackQualityValidation({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        includePreflight: true,
        commandRunner: createRunner(),
      })

      expect(result.steps[0]?.name).toBe("install")
      expect(result.executedCommands[0]).toBe("pnpm install --frozen-lockfile")
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })
})
