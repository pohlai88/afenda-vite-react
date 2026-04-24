import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  createTechStackScaffoldManifest,
  runSyncPackDoctor,
  writeTechStackScaffold,
} from "../../src/index.js"

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

async function createWorkspaceFixture(): Promise<string> {
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "sync-pack-ws-"))

  await writeFile(
    path.join(workspaceRoot, "pnpm-workspace.yaml"),
    `packages:
  - "apps/*"
  - "packages/*"

catalog:
  zod: ^4.3.6
  vite: 7.3.2
  vitest: ^4.1.4
  typescript: ~5.9.3
  drizzle-orm: ^0.45.1
  "@types/node": ^24.12.2
  "@types/react": ^19.2.14
  "@types/react-dom": ^19.2.3
  eslint: ^9.39.4
`,
    "utf8"
  )
  await writeJson(path.join(workspaceRoot, "package.json"), {
    name: "fixture",
    private: true,
    devDependencies: {
      eslint: "catalog:",
      tsx: "^4.21.0",
    },
  })
  await writeJson(path.join(workspaceRoot, "apps", "web", "package.json"), {
    name: "@afenda/web-fixture",
    dependencies: {
      react: "^19.2.4",
      "react-dom": "^19.2.4",
      "@tanstack/react-query": "^5.96.2",
      "react-router-dom": "^7.14.0",
      "radix-ui": "^1.4.3",
      "class-variance-authority": "catalog:",
      hono: "^4.12.10",
      zod: "catalog:",
    },
    devDependencies: {
      tailwindcss: "^4.2.2",
      "@tailwindcss/vite": "^4.2.2",
      "@vitejs/plugin-react": "^5.2.0",
      vite: "catalog:",
      vitest: "catalog:",
      typescript: "catalog:",
    },
  })

  return workspaceRoot
}

describe("Tech stack scaffold", () => {
  it("uses workspace catalog versions when available", async () => {
    const workspaceRoot = await createWorkspaceFixture()

    try {
      const manifest = await createTechStackScaffoldManifest({
        workspaceRoot,
        appId: "internal-support-crm",
        category: "business-saas",
      })
      const zodDependency = manifest.dependencies.find(
        (dependency) => dependency.name === "zod"
      )
      const reactDependency = manifest.dependencies.find(
        (dependency) => dependency.name === "react"
      )

      expect(zodDependency?.versionSpec).toBe("catalog:")
      expect(zodDependency?.source).toBe("workspace-catalog")
      expect(reactDependency?.versionSpec).toBe("^19.2.4")
      expect(reactDependency?.source).toBe("workspace-package")
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true })
    }
  })

  it("writes scaffold package files", async () => {
    const workspaceRoot = await createWorkspaceFixture()
    const outputDirectory = path.join(workspaceRoot, ".artifacts", "scaffold")

    try {
      const result = await writeTechStackScaffold({
        workspaceRoot,
        outputDirectory,
        appId: "internal-support-crm",
        category: "business-saas",
      })
      const packageJson = JSON.parse(
        await readFile(path.join(outputDirectory, "package.json"), "utf8")
      ) as { dependencies?: Record<string, string> }

      expect(result.writtenFiles).toHaveLength(3)
      expect(packageJson.dependencies?.zod).toBe("catalog:")
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true })
    }
  })
})

describe("Sync-Pack doctor", () => {
  it("detects Zod and Tailwind guarded major-version mismatches", async () => {
    const workspaceRoot = await createWorkspaceFixture()
    const targetPath = path.join(workspaceRoot, "packages", "bad-stack")

    try {
      await writeJson(path.join(targetPath, "package.json"), {
        name: "@afenda/bad-stack",
        dependencies: {
          zod: "^3.25.0",
        },
        devDependencies: {
          tailwindcss: "^3.4.17",
          "@tailwindcss/vite": "^4.2.2",
        },
      })

      const result = await runSyncPackDoctor({
        workspaceRoot,
        targetPath,
      })

      expect(result.errorCount).toBeGreaterThanOrEqual(2)
      expect(result.findings.map((finding) => finding.code)).toContain(
        "guarded-major-version-mismatch"
      )
      expect(
        result.findings
          .filter((finding) => finding.severity === "error")
          .every((finding) => finding.remediation)
      ).toBe(true)
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true })
    }
  })

  it("adds remediation to actionable catalog drift warnings", async () => {
    const workspaceRoot = await createWorkspaceFixture()
    const targetPath = path.join(workspaceRoot, "packages", "catalog-drift")

    try {
      await writeJson(path.join(targetPath, "package.json"), {
        name: "@afenda/catalog-drift",
        dependencies: {
          vite: "^7.3.2",
        },
      })

      const result = await runSyncPackDoctor({
        workspaceRoot,
        targetPath,
      })
      const warning = result.findings.find(
        (finding) => finding.code === "catalog-not-used"
      )

      expect(warning).toMatchObject({
        severity: "warning",
        remediation: {
          action: expect.stringContaining("Replace the explicit version"),
        },
      })
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true })
    }
  })
})
