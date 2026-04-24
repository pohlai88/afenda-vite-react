import { execFile } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

import { describe, expect, it } from "vitest"

const execFileAsync = promisify(execFile)
const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
)

async function runBuiltCli(
  entrypoint: string,
  args: readonly string[]
): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync(
    process.execPath,
    [path.join(packageRoot, "dist", "sync-pack", "cli", entrypoint), ...args],
    {
      cwd: packageRoot,
      windowsHide: true,
    }
  )
}

describe("built Sync-Pack CLIs", () => {
  it("runs bare afenda-sync-pack as deterministic quickstart only", async () => {
    const { stdout, stderr } = await runBuiltCli("sync-pack.js", [])

    expect(stderr).toBe("")
    expect(stdout).toContain("Afenda Sync-Pack Quickstart")
    expect(stdout).toContain("What should I run first?")
    expect(stdout).toContain("Common explicit paths:")
    expect(stdout).toContain("pnpm run feature-sync:verify")
    expect(stdout).toContain("Root contract:")
    expect(stdout).toContain("It never auto-runs verify.")
    expect(stdout).not.toContain("Feature Sync-Pack verify")
  })

  it("prints dispatcher help with exit code 0", async () => {
    const { stdout, stderr } = await runBuiltCli("sync-pack.js", ["--help"])

    expect(stderr).toBe("")
    expect(stdout).toContain("Afenda Sync-Pack CLI")
    expect(stdout).toContain("FSDK-CLI-001")
    expect(stdout).toContain("FSDK-CLI-002")
    expect(stdout).toContain("FSDK-CLI-003")
    expect(stdout).toContain("FSDK-CLI-004")
    expect(stdout).toContain("Start Here:")
    expect(stdout).toContain("Operator Workflow:")
    expect(stdout).toContain("Release Gates:")
  })

  it("prints command-specific help from the dispatcher", async () => {
    const { stdout, stderr } = await runBuiltCli("sync-pack.js", [
      "help",
      "verify",
    ])

    expect(stderr).toBe("")
    expect(stdout).toContain(
      "Run the internal operator workflow across all release gates."
    )
    expect(stdout).toContain("Examples:")
    expect(stdout).toContain("pnpm run feature-sync:verify")
  })

  it("prints quality-validate help from the dispatcher", async () => {
    const { stdout, stderr } = await runBuiltCli("sync-pack.js", [
      "help",
      "quality-validate",
    ])

    expect(stderr).toBe("")
    expect(stdout).toContain("afenda-sync-pack quality-validate")
    expect(stdout).toContain("--preflight")
    expect(stdout).toContain("pnpm run feature-sync:quality-validate")
  })

  it("runs verify as JSON-only output", async () => {
    const { stdout, stderr } = await runBuiltCli("sync-pack.js", [
      "verify",
      "--json",
      "--ci",
    ])
    const result = JSON.parse(stdout) as {
      findings: unknown[]
      errorCount: number
      warningCount: number
      steps: Array<{ name: string }>
      verdict: string
    }

    expect(stderr).toBe("")
    expect(Array.isArray(result.findings)).toBe(true)
    expect(result.errorCount).toBe(0)
    expect(typeof result.warningCount).toBe("number")
    expect(typeof result.verdict).toBe("string")
    expect(result.steps.map((step) => step.name)).toEqual([
      "release-check",
      "check",
      "doctor",
      "validate",
    ])
  })

  it("runs release-check as JSON-only output", async () => {
    const { stdout, stderr } = await runBuiltCli("release-check.js", [
      "--json",
      "--ci",
    ])
    const result = JSON.parse(stdout) as {
      findings: unknown[]
      errorCount: number
      warningCount: number
    }

    expect(stderr).toBe("")
    expect(Array.isArray(result.findings)).toBe(true)
    expect(result.errorCount).toBe(0)
    expect(typeof result.warningCount).toBe("number")
  })

  it("runs check as a CI gate without warnings failing", async () => {
    const { stdout } = await runBuiltCli("check.js", ["--json", "--ci"])
    const result = JSON.parse(stdout) as {
      findings: unknown[]
      errorCount: number
      warningCount: number
    }

    expect(Array.isArray(result.findings)).toBe(true)
    expect(result.errorCount).toBe(0)
    expect(typeof result.warningCount).toBe("number")
  })

  it("runs doctor as a CI gate with errors-only failure behavior", async () => {
    const { stdout } = await runBuiltCli("doctor.js", ["--json", "--ci"])
    const result = JSON.parse(stdout) as {
      findings: unknown[]
      errorCount: number
      warningCount: number
    }

    expect(Array.isArray(result.findings)).toBe(true)
    expect(result.errorCount).toBe(0)
    expect(typeof result.warningCount).toBe("number")
  })

  it("runs validate as JSON-only output", async () => {
    const { stdout } = await runBuiltCli("validate.js", ["--json", "--ci"])
    const result = JSON.parse(stdout) as {
      findings: unknown[]
      errorCount: number
      warningCount: number
    }

    expect(Array.isArray(result.findings)).toBe(true)
    expect(result.errorCount).toBe(0)
    expect(typeof result.warningCount).toBe("number")
  })

  it("rejects unknown dispatcher commands with JSON when requested", async () => {
    await expect(
      runBuiltCli("sync-pack.js", ["unknown", "--json"])
    ).rejects.toMatchObject({
      code: 1,
      stdout: expect.stringContaining("unknown-sync-pack-command"),
    })
  })

  it("rejects unsupported JSON flags on human-oriented commands", async () => {
    await expect(
      runBuiltCli("sync-pack.js", ["rank", "--json"])
    ).rejects.toMatchObject({
      code: 1,
      stdout: expect.stringContaining("unknown-cli-option"),
    })
  })

  it("rejects missing option values on release-gate commands", async () => {
    await expect(runBuiltCli("check.js", ["--pack"])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(
        "Option --pack for command check requires a value."
      ),
    })
  })

  it("rejects help combined with other flags", async () => {
    await expect(
      runBuiltCli("check.js", ["--help", "--json"])
    ).rejects.toMatchObject({
      code: 1,
      stdout: expect.stringContaining("unsupported-cli-flag-combination"),
    })
  })
})
