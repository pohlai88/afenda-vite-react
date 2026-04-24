import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { checkFeatureSdkPackageContract } from "../../src/index.js"

const requiredFixturePackageFiles = [
  "README.md",
  "docs/sync-pack/README.md",
  "docs/sync-pack/CLI_OPERATOR_BENCHMARK_NOTE.md",
  "docs/sync-pack/FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md",
  "docs/sync-pack/FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md",
  "docs/sync-pack/FSDK-CLI-003_COMMAND_TREE_CONTRACT.md",
  "docs/sync-pack/FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md",
  "docs/sync-pack/FSDK-CLI_SCORECARD.md",
  "docs/sync-pack/FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md",
  "docs/sync-pack/INTERNAL_OPERATING_CONTRACT.md",
  "rules/sync-pack/FEATURE_APPROVAL_GATE.md",
  "rules/sync-pack/FEATURE_PRIORITY_MATRIX.md",
  "rules/sync-pack/FEATURE_SYNC_PACK_DOD.md",
  "rules/sync-pack/FEATURE_SYNC_PACK_RULES.md",
  "rules/sync-pack/TECH_STACK_MATRIX.md",
  "rules/sync-pack/openalternative.seed.json",
] as const

const requiredFixtureTemplateFiles = [
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
] as const

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

async function writeText(filePath: string, value: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, value, "utf8")
}

async function createPackageContractFixture(
  mutatePackageJson?: (packageJson: Record<string, unknown>) => void
): Promise<{ packageRoot: string; workspaceRoot: string }> {
  const workspaceRoot = await mkdtemp(path.join(os.tmpdir(), "fsdk-contract-"))
  const packageRoot = path.join(workspaceRoot, "packages", "features-sdk")
  const rootNodeEngine = "^20.19.0 || >=22.12.0"
  const packageJson = {
    name: "@afenda/features-sdk",
    version: "0.0.0",
    type: "module",
    description: "Fixture Features SDK package.",
    license: "UNLICENSED",
    keywords: ["afenda", "features-sdk", "sync-pack"],
    repository: {
      type: "git",
      url: "git+https://example.com/afenda.git",
      directory: "packages/features-sdk",
    },
    bugs: {
      url: "https://example.com/issues",
    },
    homepage: "https://example.com/packages/features-sdk",
    engines: {
      node: rootNodeEngine,
    },
    publishConfig: {
      access: "restricted",
    },
    files: [
      "dist",
      "docs/sync-pack/README.md",
      "docs/sync-pack/*.md",
      "README.md",
      "rules/sync-pack/*.md",
      "rules/sync-pack/openalternative.seed.json",
    ],
    bin: {
      "afenda-sync-pack": "./dist/sync-pack/cli/sync-pack.js",
    },
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
      "./sync-pack": {
        types: "./dist/sync-pack/index.d.ts",
        import: "./dist/sync-pack/index.js",
      },
    },
    dependencies: {
      zod: "catalog:",
    },
  } satisfies Record<string, unknown>

  mutatePackageJson?.(packageJson)

  await writeJson(path.join(workspaceRoot, "package.json"), {
    name: "fixture-root",
    engines: {
      node: rootNodeEngine,
    },
  })
  await writeJson(path.join(packageRoot, "package.json"), packageJson)
  await writeText(path.join(packageRoot, "dist", "index.js"), "export {}\n")
  await writeText(path.join(packageRoot, "dist", "index.d.ts"), "export {}\n")
  await writeText(
    path.join(packageRoot, "dist", "sync-pack", "index.js"),
    "export {}\n"
  )
  await writeText(
    path.join(packageRoot, "dist", "sync-pack", "index.d.ts"),
    "export {}\n"
  )
  await writeText(
    path.join(packageRoot, "dist", "sync-pack", "cli", "sync-pack.js"),
    "#!/usr/bin/env node\nexport {}\n"
  )
  for (const target of requiredFixturePackageFiles) {
    if (target.endsWith(".json")) {
      await writeJson(path.join(packageRoot, target), [])
    } else {
      await writeText(path.join(packageRoot, target), "# Fixture\n")
    }
  }
  for (const template of requiredFixtureTemplateFiles) {
    await writeText(
      path.join(packageRoot, "dist", "sync-pack", "templates", template),
      "# Template\n"
    )
  }

  return { packageRoot, workspaceRoot }
}

describe("checkFeatureSdkPackageContract", () => {
  it("passes when FSDK-CONTRACT-001 package targets are valid", async () => {
    const fixture = await createPackageContractFixture()

    try {
      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.contractId).toBe("FSDK-CONTRACT-001")
      expect(result.errorCount).toBe(0)
      expect(result.warningCount).toBe(0)
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when an export target is missing", async () => {
    const fixture = await createPackageContractFixture()

    try {
      await rm(path.join(fixture.packageRoot, "dist", "index.d.ts"))

      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "missing-export-target"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when required package metadata is missing", async () => {
    const fixture = await createPackageContractFixture((packageJson) => {
      delete packageJson.license
    })

    try {
      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "invalid-package-license"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when a required files entry is missing", async () => {
    const fixture = await createPackageContractFixture((packageJson) => {
      packageJson.files = ["dist", "README.md"]
    })

    try {
      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "missing-files-entry"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when required docs, rules, or seed files are missing", async () => {
    const fixture = await createPackageContractFixture()

    try {
      await rm(
        path.join(
          fixture.packageRoot,
          "rules",
          "sync-pack",
          "TECH_STACK_MATRIX.md"
        )
      )

      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "missing-required-package-file"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when required built non-code assets are missing", async () => {
    const fixture = await createPackageContractFixture()

    try {
      await rm(
        path.join(
          fixture.packageRoot,
          "dist",
          "sync-pack",
          "templates",
          "10-handoff.md"
        )
      )

      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "missing-required-build-asset"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when a bin target is missing", async () => {
    const fixture = await createPackageContractFixture()

    try {
      await rm(
        path.join(
          fixture.packageRoot,
          "dist",
          "sync-pack",
          "cli",
          "sync-pack.js"
        )
      )

      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "missing-bin-target"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when a bin target is not JavaScript", async () => {
    const fixture = await createPackageContractFixture((packageJson) => {
      packageJson.bin = {
        "afenda-sync-pack": "./dist/sync-pack/cli/sync-pack.mjs",
      }
    })

    try {
      await writeText(
        path.join(
          fixture.packageRoot,
          "dist",
          "sync-pack",
          "cli",
          "sync-pack.mjs"
        ),
        "#!/usr/bin/env node\nexport {}\n"
      )

      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "bin-target-not-js"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when a bin target lacks the Node shebang", async () => {
    const fixture = await createPackageContractFixture()

    try {
      await writeText(
        path.join(
          fixture.packageRoot,
          "dist",
          "sync-pack",
          "cli",
          "sync-pack.js"
        ),
        "export {}\n"
      )

      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "bin-target-missing-shebang"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when zod is missing from runtime dependencies", async () => {
    const fixture = await createPackageContractFixture((packageJson) => {
      packageJson.dependencies = {}
    })

    try {
      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "missing-runtime-zod-dependency"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("fails when package node engine differs from root policy", async () => {
    const fixture = await createPackageContractFixture((packageJson) => {
      packageJson.engines = {
        node: ">=22.12.0",
      }
    })

    try {
      const result = await checkFeatureSdkPackageContract(fixture)

      expect(result.findings.map((finding) => finding.code)).toContain(
        "node-engine-policy-mismatch"
      )
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })

  it("adds remediation for every package-contract error finding", async () => {
    const fixture = await createPackageContractFixture((packageJson) => {
      delete packageJson.description
      delete packageJson.homepage
      delete packageJson.version
      delete packageJson.bugs
      packageJson.repository = {
        type: "git",
        url: "git+https://example.com/afenda.git",
        directory: "packages/wrong-sdk",
      }
    })

    try {
      const result = await checkFeatureSdkPackageContract(fixture)
      const errorFindings = result.findings.filter(
        (finding) => finding.severity === "error"
      )

      expect(errorFindings.length).toBeGreaterThan(0)
      expect(errorFindings.every((finding) => finding.remediation)).toBe(true)
    } finally {
      await rm(fixture.workspaceRoot, { recursive: true, force: true })
    }
  })
})
