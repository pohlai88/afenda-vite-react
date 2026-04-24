import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  createSyncPackChangeIntentTemplate,
  runSyncPackIntentCheck,
} from "../../src/index.js"

async function writeText(filePath: string, value: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, value, "utf8")
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

async function createIntentFixture(): Promise<{
  readonly workspaceRoot: string
  readonly packageRoot: string
  readonly changeIntentsRoot: string
}> {
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "fsdk-intent-"))
  const packageRoot = path.join(workspaceRoot, "packages", "features-sdk")
  const changeIntentsRoot = path.join(
    packageRoot,
    "docs",
    "sync-pack",
    "change-intents"
  )

  await writeJson(path.join(workspaceRoot, "package.json"), {
    name: "fixture-root",
    private: true,
  })
  await writeText(
    path.join(workspaceRoot, "pnpm-workspace.yaml"),
    "packages:\n  - 'packages/*'\n"
  )
  await writeText(
    path.join(packageRoot, "docs", "sync-pack", "README.md"),
    "# Sync-Pack\n"
  )
  await writeText(
    path.join(
      packageRoot,
      "docs",
      "sync-pack",
      "FSDK-INTENT-001_CHANGE_INTENT_CONTRACT.md"
    ),
    "# Intent contract\n"
  )
  await writeText(
    path.join(packageRoot, "tests", "sync-pack", "intent.test.ts"),
    "// evidence\n"
  )
  await writeText(
    path.join(changeIntentsRoot, "README.md"),
    "# Change intents\n"
  )

  return {
    workspaceRoot,
    packageRoot,
    changeIntentsRoot,
  }
}

function repoRelativeIntentPath(id: string): string {
  return `packages/features-sdk/docs/sync-pack/change-intents/${id}.intent.json`
}

function createAcceptedIntent(
  id: string,
  overrides: Partial<ReturnType<typeof createSyncPackChangeIntentTemplate>> = {}
) {
  return {
    ...createSyncPackChangeIntentTemplate({
      id,
      title: "Fixture intent",
      owner: "governance-toolchain",
      summary: "Fixture summary",
    }),
    status: "accepted" as const,
    changedSurface: ["src"] as const,
    commandsAffected: ["feature-sync:intent-check"],
    truthBinding: {
      doctrineRefs: ["packages/features-sdk/docs/sync-pack/README.md"],
      invariantRefs: ["FSDK-INTENT-001"] as const,
      expectedDiffScope: ["packages/features-sdk/src/**"],
      expectedGeneratedOutputs: [
        "packages/features-sdk/docs/sync-pack/example-pack-registry.json",
      ],
      evidenceRefs: ["packages/features-sdk/tests/sync-pack/intent.test.ts"],
    },
    validationPlan: ["pnpm run feature-sync:intent-check"],
    reviewNote: "Fixture review note",
    ...overrides,
  }
}

describe("runSyncPackIntentCheck", () => {
  it("passes on a clean tree without package-owned changes", async () => {
    const fixture = await createIntentFixture()

    try {
      const result = await runSyncPackIntentCheck({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        worktreeState: {
          workspaceStatus: "clean",
          changedFiles: [],
          packageOwnedFiles: [],
          changedIntentFiles: [],
        },
      })

      expect(result.verdict).toBe("pass")
      expect(result.errorCount).toBe(0)
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when package-owned changes exist without a changed non-draft intent", async () => {
    const fixture = await createIntentFixture()

    try {
      const result = await runSyncPackIntentCheck({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        worktreeState: {
          workspaceStatus: "dirty",
          changedFiles: ["packages/features-sdk/src/sync-pack/example.ts"],
          packageOwnedFiles: ["packages/features-sdk/src/sync-pack/example.ts"],
          changedIntentFiles: [],
        },
      })

      expect(result.verdict).toBe("fail")
      expect(result.findings.map((finding) => finding.code)).toContain(
        "missing-change-intent"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when only a draft intent changed", async () => {
    const fixture = await createIntentFixture()

    try {
      await writeJson(
        path.join(fixture.changeIntentsRoot, "draft-only.intent.json"),
        createSyncPackChangeIntentTemplate({
          id: "draft-only",
          title: "Draft only",
          owner: "governance-toolchain",
        })
      )

      const result = await runSyncPackIntentCheck({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        worktreeState: {
          workspaceStatus: "dirty",
          changedFiles: [
            "packages/features-sdk/src/sync-pack/example.ts",
            repoRelativeIntentPath("draft-only"),
          ],
          packageOwnedFiles: ["packages/features-sdk/src/sync-pack/example.ts"],
          changedIntentFiles: [repoRelativeIntentPath("draft-only")],
        },
      })

      expect(result.verdict).toBe("fail")
      expect(result.findings.map((finding) => finding.code)).toContain(
        "draft-intent-only"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("passes when a changed accepted intent covers the package-owned diff", async () => {
    const fixture = await createIntentFixture()

    try {
      await writeJson(
        path.join(fixture.changeIntentsRoot, "cover-src.intent.json"),
        createAcceptedIntent("cover-src")
      )

      const result = await runSyncPackIntentCheck({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        worktreeState: {
          workspaceStatus: "dirty",
          changedFiles: [
            "packages/features-sdk/src/sync-pack/example.ts",
            repoRelativeIntentPath("cover-src"),
          ],
          packageOwnedFiles: ["packages/features-sdk/src/sync-pack/example.ts"],
          changedIntentFiles: [repoRelativeIntentPath("cover-src")],
        },
      })

      expect(result.verdict).toBe("pass")
      expect(result.errorCount).toBe(0)
      expect(result.matchedIntentIds).toContain("cover-src")
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when the diff is not covered by expectedDiffScope", async () => {
    const fixture = await createIntentFixture()

    try {
      await writeJson(
        path.join(fixture.changeIntentsRoot, "cover-docs.intent.json"),
        createAcceptedIntent("cover-docs", {
          truthBinding: {
            doctrineRefs: ["packages/features-sdk/docs/sync-pack/README.md"],
            invariantRefs: ["FSDK-INTENT-001"],
            expectedDiffScope: ["packages/features-sdk/docs/**"],
            expectedGeneratedOutputs: [],
            evidenceRefs: [
              "packages/features-sdk/tests/sync-pack/intent.test.ts",
            ],
          },
        })
      )

      const result = await runSyncPackIntentCheck({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        worktreeState: {
          workspaceStatus: "dirty",
          changedFiles: [
            "packages/features-sdk/src/sync-pack/example.ts",
            repoRelativeIntentPath("cover-docs"),
          ],
          packageOwnedFiles: ["packages/features-sdk/src/sync-pack/example.ts"],
          changedIntentFiles: [repoRelativeIntentPath("cover-docs")],
        },
      })

      expect(result.verdict).toBe("fail")
      expect(result.findings.map((finding) => finding.code)).toContain(
        "uncovered-change-scope"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when doctrine or evidence refs do not exist", async () => {
    const fixture = await createIntentFixture()

    try {
      await writeJson(
        path.join(fixture.changeIntentsRoot, "bad-refs.intent.json"),
        createAcceptedIntent("bad-refs", {
          truthBinding: {
            doctrineRefs: ["packages/features-sdk/docs/sync-pack/missing.md"],
            invariantRefs: ["FSDK-INTENT-001"],
            expectedDiffScope: ["packages/features-sdk/src/**"],
            expectedGeneratedOutputs: [],
            evidenceRefs: [
              "packages/features-sdk/tests/sync-pack/missing.test.ts",
            ],
          },
        })
      )

      const result = await runSyncPackIntentCheck({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        worktreeState: {
          workspaceStatus: "dirty",
          changedFiles: [repoRelativeIntentPath("bad-refs")],
          packageOwnedFiles: [],
          changedIntentFiles: [repoRelativeIntentPath("bad-refs")],
        },
      })

      expect(result.verdict).toBe("fail")
      expect(result.findings.map((finding) => finding.code)).toEqual(
        expect.arrayContaining([
          "missing-intent-doctrine-ref",
          "missing-intent-evidence-ref",
        ])
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when an intent file violates the schema", async () => {
    const fixture = await createIntentFixture()

    try {
      await writeJson(
        path.join(fixture.changeIntentsRoot, "invalid.intent.json"),
        {
          id: "invalid",
          title: "Invalid",
        }
      )

      const result = await runSyncPackIntentCheck({
        workspaceRoot: fixture.workspaceRoot,
        packageRoot: fixture.packageRoot,
        worktreeState: {
          workspaceStatus: "dirty",
          changedFiles: [repoRelativeIntentPath("invalid")],
          packageOwnedFiles: [],
          changedIntentFiles: [repoRelativeIntentPath("invalid")],
        },
      })

      expect(result.verdict).toBe("fail")
      expect(result.findings.map((finding) => finding.code)).toContain(
        "invalid-intent-schema"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })
})
