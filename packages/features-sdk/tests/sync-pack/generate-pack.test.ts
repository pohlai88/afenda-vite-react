import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  findWorkspaceRoot,
  generateCandidateReport,
  generateFeaturePack,
  getRequiredPackFileNames,
  groupCandidates,
  checkGeneratedPacks,
  type AppCandidate,
  runSyncPackValidate,
} from "../../src/index.js"

const candidate = {
  id: "ai-work-assistant",
  name: "AI Work Assistant",
  source: "openalternative",
  sourceUrl: "https://openalternative.co/categories",
  sourceCategory: "AI & Machine Learning",
  internalCategory: "communication-ai-ml",
  lane: "intelligence",
  priority: "essential",
  buildMode: "inspire",
  internalUseCase:
    "Provide an AI assistant pattern for internal communication and knowledge workflows.",
  openSourceReferences: ["https://openalternative.co/categories"],
  licenseReviewRequired: false,
  securityReviewRequired: true,
  dataSensitivity: "medium",
  ownerTeam: "AI Enablement",
  status: "approved",
} as const satisfies AppCandidate

describe("generateFeaturePack", () => {
  it("writes exactly the 11 required files with stable numbered names", async () => {
    const outputDirectory = await mkdtemp(
      path.join(os.tmpdir(), "feature-sync-pack-")
    )

    try {
      const result = await generateFeaturePack({
        candidate,
        outputDirectory,
      })
      const files = await readdir(result.packDirectory)

      expect(files).toEqual(getRequiredPackFileNames())
      expect(result.writtenFiles).toHaveLength(11)

      const candidateJson = JSON.parse(
        await readFile(
          path.join(result.packDirectory, "00-candidate.json"),
          "utf8"
        )
      ) as AppCandidate
      const technicalDesign = await readFile(
        path.join(result.packDirectory, "03-technical-design.md"),
        "utf8"
      )

      expect(candidateJson).toEqual(candidate)
      expect(technicalDesign).toContain("Product Pack and Technical Pack")
      expect(technicalDesign).toContain("Provider abstraction")
    } finally {
      await rm(outputDirectory, { recursive: true, force: true })
    }
  })
})

describe("generateCandidateReport", () => {
  it("groups by lane, category, priority, build mode, and status", () => {
    const groups = groupCandidates([candidate])
    const report = generateCandidateReport([candidate])

    expect(groups.byLane.intelligence).toBe(1)
    expect(groups.byCategory["communication-ai-ml"]).toBe(1)
    expect(groups.byPriority.essential).toBe(1)
    expect(groups.byBuildMode.inspire).toBe(1)
    expect(groups.byStatus.approved).toBe(1)
    expect(report).toContain("## By Lane")
    expect(report).toContain("| communication-ai-ml | 1 |")
  })
})

describe("checkGeneratedPacks", () => {
  it("accepts valid generated packs and rejects missing required files", async () => {
    const outputDirectory = await mkdtemp(
      path.join(os.tmpdir(), "feature-sync-check-")
    )

    try {
      const result = await generateFeaturePack({
        candidate,
        outputDirectory,
      })
      const validCheck = await checkGeneratedPacks({
        packsRoot: outputDirectory,
      })

      expect(validCheck.checkedPackCount).toBe(1)
      expect(validCheck.errorCount).toBe(0)

      await rm(path.join(result.packDirectory, "10-handoff.md"), {
        force: true,
      })

      const invalidCheck = await checkGeneratedPacks({
        packsRoot: outputDirectory,
      })

      expect(invalidCheck.errorCount).toBe(1)
      expect(invalidCheck.findings[0]?.code).toBe("pack-file-contract-mismatch")
      expect(invalidCheck.findings[0]?.remediation).toMatchObject({
        action: expect.stringContaining("Regenerate the pack"),
      })
    } finally {
      await rm(outputDirectory, { recursive: true, force: true })
    }
  })

  it("returns a structured finding when 00-candidate.json is invalid", async () => {
    const outputDirectory = await mkdtemp(
      path.join(os.tmpdir(), "feature-sync-check-invalid-")
    )

    try {
      const result = await generateFeaturePack({
        candidate,
        outputDirectory,
      })

      await writeFile(
        path.join(result.packDirectory, "00-candidate.json"),
        "{ invalid json }\n",
        "utf8"
      )

      const invalidCheck = await checkGeneratedPacks({
        packsRoot: outputDirectory,
      })

      expect(invalidCheck.errorCount).toBe(1)
      expect(invalidCheck.findings[0]).toMatchObject({
        code: "invalid-candidate-json",
        remediation: {
          command: "pnpm run feature-sync:check",
          doc: "docs/sync-pack/finding-remediation-catalog.md",
        },
      })
    } finally {
      await rm(outputDirectory, { recursive: true, force: true })
    }
  })
})

describe("runSyncPackValidate", () => {
  it("returns a stable gated result shape for valid seed input", async () => {
    const packageRoot = await mkdtemp(
      path.join(os.tmpdir(), "feature-sync-validate-")
    )
    const seedPath = path.join(
      packageRoot,
      "rules",
      "sync-pack",
      "openalternative.seed.json"
    )

    try {
      await mkdir(path.dirname(seedPath), { recursive: true })
      await writeFile(
        seedPath,
        `${JSON.stringify([candidate], null, 2)}\n`,
        "utf8"
      )

      const result = await runSyncPackValidate({ packageRoot })

      expect(result).toMatchObject({
        findings: [],
        errorCount: 0,
        warningCount: 0,
        candidateCount: 1,
        seedPath,
      })
    } finally {
      await rm(packageRoot, { recursive: true, force: true })
    }
  })

  it("returns a structured error finding for invalid seed candidate data", async () => {
    const packageRoot = await mkdtemp(
      path.join(os.tmpdir(), "feature-sync-validate-invalid-")
    )
    const seedPath = path.join(
      packageRoot,
      "rules",
      "sync-pack",
      "openalternative.seed.json"
    )

    try {
      await mkdir(path.dirname(seedPath), { recursive: true })
      await writeFile(
        seedPath,
        `${JSON.stringify([{ ...candidate, lane: "operate" }], null, 2)}\n`,
        "utf8"
      )

      const result = await runSyncPackValidate({ packageRoot })

      expect(result.errorCount).toBe(1)
      expect(result.warningCount).toBe(0)
      expect(result.candidateCount).toBe(0)
      expect(result.findings[0]).toMatchObject({
        severity: "error",
        code: "invalid-seed-candidate",
        filePath: seedPath,
        remediation: {
          command: "pnpm run feature-sync:validate",
          doc: "docs/sync-pack/metadata-reference.md",
        },
      })
    } finally {
      await rm(packageRoot, { recursive: true, force: true })
    }
  })
})

describe("root delegated scripts", () => {
  it("resolve through Turbo package tasks", async () => {
    const repoRoot = findWorkspaceRoot()
    const rootPackageJson = JSON.parse(
      await readFile(path.join(repoRoot, "package.json"), "utf8")
    ) as { scripts?: Record<string, string> }

    expect(rootPackageJson.scripts?.["feature-sync:verify"]).toBe(
      "pnpm exec turbo run sync-pack:verify --filter=@afenda/features-sdk --"
    )
    expect(rootPackageJson.scripts?.["feature-sync:quality-validate"]).toBe(
      "pnpm exec turbo run sync-pack:quality-validate --filter=@afenda/features-sdk --"
    )
    expect(rootPackageJson.scripts?.["feature-sync"]).toBe(
      "pnpm exec turbo run sync-pack:quickstart --filter=@afenda/features-sdk --"
    )
    expect(rootPackageJson.scripts?.["feature-sync:help"]).toBe(
      "pnpm exec turbo run sync-pack:help --filter=@afenda/features-sdk --"
    )
    expect(rootPackageJson.scripts?.["feature-sync:validate"]).toBe(
      "pnpm exec turbo run sync-pack:validate --filter=@afenda/features-sdk --"
    )
    expect(rootPackageJson.scripts?.["feature-sync:rank"]).toBe(
      "pnpm exec turbo run sync-pack:rank --filter=@afenda/features-sdk"
    )
    expect(rootPackageJson.scripts?.["feature-sync:generate"]).toBe(
      "pnpm exec turbo run sync-pack:generate --filter=@afenda/features-sdk"
    )
    expect(rootPackageJson.scripts?.["feature-sync:report"]).toBe(
      "pnpm exec turbo run sync-pack:report --filter=@afenda/features-sdk"
    )
    expect(rootPackageJson.scripts?.["feature-sync:check"]).toBe(
      "pnpm exec turbo run sync-pack:check --filter=@afenda/features-sdk --"
    )
    expect(rootPackageJson.scripts?.["feature-sync:doctor"]).toBe(
      "pnpm exec turbo run sync-pack:doctor --filter=@afenda/features-sdk --"
    )
    expect(rootPackageJson.scripts?.["feature-sync:release-check"]).toBe(
      "pnpm exec turbo run sync-pack:release-check --filter=@afenda/features-sdk --"
    )
    expect(rootPackageJson.scripts?.["feature-sync:scaffold"]).toBe(
      "pnpm exec turbo run sync-pack:scaffold --filter=@afenda/features-sdk --"
    )
  })
})
