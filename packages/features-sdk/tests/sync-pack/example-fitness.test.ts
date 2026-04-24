import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  checkGoldenExampleFitness,
  syncGoldenExampleFitness,
} from "../../src/index.js"

async function writeText(filePath: string, value: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, value, "utf8")
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

const candidates = [
  {
    id: "internal-support-crm",
    name: "Internal Support CRM",
    internalCategory: "business-saas",
    lane: "operate",
    status: "approved",
  },
  {
    id: "bi-reporting-starter",
    name: "BI Reporting Starter",
    internalCategory: "data-analytics",
    lane: "intelligence",
    status: "approved",
  },
  {
    id: "iam-sso-control-plane",
    name: "IAM SSO Control Plane",
    internalCategory: "security-privacy",
    lane: "platform",
    status: "approved",
  },
  {
    id: "uptime-monitoring-workbench",
    name: "Uptime Monitoring Workbench",
    internalCategory: "infrastructure-operations",
    lane: "platform",
    status: "approved",
  },
  {
    id: "ai-work-assistant",
    name: "AI Work Assistant",
    internalCategory: "communication-ai-ml",
    lane: "intelligence",
    status: "candidate",
  },
  {
    id: "document-publishing-flow",
    name: "Document Publishing Flow",
    internalCategory: "content-publishing",
    lane: "operate",
    status: "candidate",
  },
  {
    id: "internal-app-builder-sandbox",
    name: "Internal App Builder Sandbox",
    internalCategory: "mini-developer",
    lane: "platform",
    status: "candidate",
  },
  {
    id: "knowledge-workflow-hub",
    name: "Knowledge Workflow Hub",
    internalCategory: "productivity-utilities",
    lane: "operate",
    status: "candidate",
  },
].map((candidate) => ({
  source: "openalternative",
  sourceUrl: "https://openalternative.co/categories",
  sourceCategory: "Fixture",
  priority: "critical",
  buildMode: "adapt",
  internalUseCase: "Fixture use case",
  openSourceReferences: ["https://openalternative.co/categories"],
  licenseReviewRequired: true,
  securityReviewRequired: true,
  dataSensitivity: "medium",
  ownerTeam: "Fixture Team",
  ...candidate,
})) as const

async function writeGeneratedPack(
  packageRoot: string,
  candidate: (typeof candidates)[number]
): Promise<void> {
  const packRoot = path.join(
    packageRoot,
    "docs",
    "sync-pack",
    "generated-packs",
    candidate.internalCategory,
    candidate.id
  )

  await writeJson(path.join(packRoot, "00-candidate.json"), candidate)

  for (const fileName of [
    "01-feature-brief.md",
    "02-product-requirement.md",
    "03-technical-design.md",
    "04-data-contract.md",
    "05-api-contract.md",
    "06-ui-contract.md",
    "07-security-risk-review.md",
    "08-implementation-plan.md",
    "09-test-plan.md",
    "10-handoff.md",
  ]) {
    await writeText(
      path.join(packRoot, fileName),
      `# ${candidate.name}\n\nGoverned content.\n`
    )
  }
}

async function createExampleFixture(): Promise<{
  readonly workspaceRoot: string
  readonly packageRoot: string
}> {
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "fsdk-examples-"))
  const packageRoot = path.join(workspaceRoot, "packages", "features-sdk")

  await writeJson(path.join(workspaceRoot, "package.json"), {
    name: "fixture-root",
    private: true,
  })
  await writeText(
    path.join(workspaceRoot, "pnpm-workspace.yaml"),
    "packages:\n  - 'packages/*'\n"
  )
  await writeJson(path.join(packageRoot, "package.json"), {
    name: "@afenda/features-sdk",
    version: "9.5.0",
  })
  await writeJson(
    path.join(packageRoot, "rules", "sync-pack", "openalternative.seed.json"),
    candidates
  )

  for (const candidate of candidates) {
    await writeGeneratedPack(packageRoot, candidate)
  }

  return {
    workspaceRoot,
    packageRoot,
  }
}

describe("golden example fitness", () => {
  it("syncs deterministic registry and guide output for all governed examples", async () => {
    const fixture = await createExampleFixture()

    try {
      const result = await syncGoldenExampleFitness({
        packageRoot: fixture.packageRoot,
        now: () => new Date("2026-04-24T00:00:00.000Z"),
      })

      expect(result.packCount).toBe(8)
      expect(result.registry).toHaveLength(8)
      expect(
        result.registry.filter((entry) => entry.maturity === "golden")
      ).toHaveLength(4)
      expect(result.errorCount).toBe(0)
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("passes health checks after syncing a valid example set", async () => {
    const fixture = await createExampleFixture()

    try {
      await syncGoldenExampleFitness({
        packageRoot: fixture.packageRoot,
        now: () => new Date("2026-04-24T00:00:00.000Z"),
      })

      const result = await checkGoldenExampleFitness({
        packageRoot: fixture.packageRoot,
      })

      expect(result.errorCount).toBe(0)
      expect(result.registry).toHaveLength(8)
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when a golden example registry entry is missing", async () => {
    const fixture = await createExampleFixture()

    try {
      const syncResult = await syncGoldenExampleFitness({
        packageRoot: fixture.packageRoot,
        now: () => new Date("2026-04-24T00:00:00.000Z"),
      })

      await writeJson(
        syncResult.registryPath,
        syncResult.registry.filter(
          (entry) => entry.packId !== "internal-support-crm"
        )
      )

      const result = await checkGoldenExampleFitness({
        packageRoot: fixture.packageRoot,
      })

      expect(result.findings.map((finding) => finding.code)).toContain(
        "missing-golden-example-entry"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when a golden example maturity or sdk version becomes stale", async () => {
    const fixture = await createExampleFixture()

    try {
      const syncResult = await syncGoldenExampleFitness({
        packageRoot: fixture.packageRoot,
        now: () => new Date("2026-04-24T00:00:00.000Z"),
      })

      await writeJson(
        syncResult.registryPath,
        syncResult.registry.map((entry) =>
          entry.packId === "internal-support-crm"
            ? {
                ...entry,
                maturity: "secondary",
                fitness: {
                  ...entry.fitness,
                  sdkVersion: "0.1.0",
                },
              }
            : entry
        )
      )

      const result = await checkGoldenExampleFitness({
        packageRoot: fixture.packageRoot,
      })

      expect(result.findings.map((finding) => finding.code)).toEqual(
        expect.arrayContaining([
          "invalid-golden-example-maturity",
          "stale-example-fitness-sdk-version",
        ])
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when a golden example pack becomes broken after sync", async () => {
    const fixture = await createExampleFixture()

    try {
      await syncGoldenExampleFitness({
        packageRoot: fixture.packageRoot,
        now: () => new Date("2026-04-24T00:00:00.000Z"),
      })

      await writeText(
        path.join(
          fixture.packageRoot,
          "docs",
          "sync-pack",
          "generated-packs",
          "business-saas",
          "internal-support-crm",
          "01-feature-brief.md"
        ),
        ""
      )

      const result = await checkGoldenExampleFitness({
        packageRoot: fixture.packageRoot,
      })

      expect(result.findings.map((finding) => finding.code)).toContain(
        "broken-golden-example-pack"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })
})
