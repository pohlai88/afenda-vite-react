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
  args: readonly string[]
): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync(
    process.execPath,
    [
      path.join(packageRoot, "dist", "sync-pack", "cli", "sync-pack.js"),
      ...args,
    ],
    {
      cwd: packageRoot,
      windowsHide: true,
    }
  )
}

describe("Sync-Pack CLI transcripts", () => {
  it("prints the bare afenda-sync-pack quickstart transcript", async () => {
    const { stdout, stderr } = await runBuiltCli([])

    expect(stderr).toBe("")
    expect(stdout).toContain("What is Sync-Pack?")
    expect(stdout).toContain("What should I run first?")
    expect(stdout).toContain("Common explicit paths:")
    expect(stdout).toContain("What do the commands mean?")
    expect(stdout).toContain("What does green mean?")
    expect(stdout).toContain("pnpm run feature-sync:verify")
    expect(stdout).toContain("It never auto-runs verify.")
    expect(stdout).not.toContain("Feature Sync-Pack verify")
  })

  it("prints the feature-sync:help transcript", async () => {
    const { stdout, stderr } = await runBuiltCli(["--help"])

    expect(stderr).toBe("")
    expect(stdout).toContain("Start Here:")
    expect(stdout).toContain("Daily Path:")
    expect(stdout).toContain("Operator Workflow:")
    expect(stdout).toContain("Release Gates:")
    expect(stdout).toContain("Operator Utilities:")
  })

  it("prints the feature-sync:verify transcript", async () => {
    const { stdout, stderr } = await runBuiltCli(["verify"])

    expect(stderr).toBe("")
    expect(stdout).toContain("Feature Sync-Pack verify")
    expect(stdout).toContain("What ran?")
    expect(stdout).toContain("What passed?")
    expect(stdout).toContain("What warned?")
    expect(stdout).toContain("What failed?")
    expect(stdout).toContain("What to fix next?")
    expect(stdout).toContain("Final verdict:")
  })

  it("prints afenda-sync-pack help verify transcript", async () => {
    const { stdout, stderr } = await runBuiltCli(["help", "verify"])

    expect(stderr).toBe("")
    expect(stdout).toContain("afenda-sync-pack verify [--json] [--ci]")
    expect(stdout).toContain("FSDK-CLI-002")
    expect(stdout).toContain("pnpm run feature-sync:verify")
  })

  it("prints a representative failure transcript for invalid option usage", async () => {
    await expect(runBuiltCli(["check", "--pack"])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining(
        "Option --pack for command check requires a value."
      ),
    })
  })
})
