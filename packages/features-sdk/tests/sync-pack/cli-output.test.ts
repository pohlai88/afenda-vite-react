import { afterEach, describe, expect, it, vi } from "vitest"

import { writeCliResult } from "../../src/sync-pack/cli-output.js"
import {
  CliUsageError,
  parseCliCommand,
  printCommandHelp,
  printQuickstart,
  printSyncPackUsage,
  resolveSyncPackCliRequest,
  requireSyncPackCommandDefinition,
  syncPackCommandDefinitions,
  syncPackCommandTreeContractId,
  syncPackOperatorWorkflowCliContractId,
  syncPackReleaseGateCliContractId,
  syncPackRootCommandContractId,
} from "../../src/sync-pack/cli/shared.js"
import * as intentModule from "../../src/sync-pack/intent/index.js"

const originalExitCode = process.exitCode

afterEach(() => {
  process.exitCode = originalExitCode
  vi.restoreAllMocks()
})

describe("writeCliResult", () => {
  it("prints JSON only when --json is passed", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)

    writeCliResult({
      argv: ["node", "cli", "--json"],
      result: {
        findings: [],
        errorCount: 0,
        warningCount: 0,
      },
      renderText: () => {
        throw new Error("Text renderer should not run in JSON mode.")
      },
    })

    expect(log).toHaveBeenCalledTimes(1)
    expect(JSON.parse(String(log.mock.calls[0]?.[0]))).toEqual({
      findings: [],
      errorCount: 0,
      warningCount: 0,
    })
  })

  it("does not fail CI when only warnings exist", () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined)

    writeCliResult({
      argv: ["node", "cli", "--json", "--ci"],
      result: {
        findings: [
          {
            severity: "warning",
            code: "catalog-not-used",
            message: "Prefer catalog:.",
          },
        ],
        errorCount: 0,
        warningCount: 1,
      },
      renderText: () => undefined,
    })

    expect(process.exitCode).toBe(originalExitCode)
  })

  it("fails CI when errors exist", () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined)

    writeCliResult({
      argv: ["node", "cli", "--json", "--ci"],
      result: {
        findings: [
          {
            severity: "error",
            code: "missing-bin-target",
            message: "Missing bin.",
          },
        ],
        errorCount: 1,
        warningCount: 0,
      },
      renderText: () => undefined,
    })

    expect(process.exitCode).toBe(1)
  })
})

describe("parseCliCommand", () => {
  it("rejects unknown flags", () => {
    const command = requireSyncPackCommandDefinition("check")

    expect(() =>
      parseCliCommand(command, ["node", "cli", "--unknown"])
    ).toThrow(CliUsageError)
  })

  it("rejects missing option values", () => {
    const command = requireSyncPackCommandDefinition("check")

    expect(() => parseCliCommand(command, ["node", "cli", "--pack"])).toThrow(
      /requires a value/
    )
  })

  it("rejects unsupported JSON and CI flags on human-oriented commands", () => {
    const command = requireSyncPackCommandDefinition("rank")

    expect(() => parseCliCommand(command, ["node", "cli", "--json"])).toThrow(
      /Unknown option --json/
    )
    expect(() => parseCliCommand(command, ["node", "cli", "--ci"])).toThrow(
      /Unknown option --ci/
    )
  })

  it("rejects help combined with other flags", () => {
    const command = requireSyncPackCommandDefinition("check")

    expect(() =>
      parseCliCommand(command, ["node", "cli", "--help", "--json"])
    ).toThrow(/help cannot be combined/)
  })

  it("accepts inline option values", () => {
    const command = requireSyncPackCommandDefinition("doctor")
    const parsed = parseCliCommand(command, [
      "node",
      "cli",
      "--target=packages/features-sdk",
      "--json",
    ])

    expect(parsed.getOptionValue("--target")).toBe("packages/features-sdk")
    expect(parsed.hasFlag("--json")).toBe(true)
  })

  it("parses dispatcher-style command arguments", () => {
    const command = requireSyncPackCommandDefinition("doctor")
    const parsed = parseCliCommand(command, [
      "node",
      "dist/sync-pack/cli/sync-pack.js",
      "doctor",
      "--target",
      "packages/features-sdk",
      "--json",
      "--ci",
    ])

    expect(parsed.getOptionValue("--target")).toBe("packages/features-sdk")
    expect(parsed.hasFlag("--json")).toBe(true)
    expect(parsed.hasFlag("--ci")).toBe(true)
  })
})

describe("printSyncPackUsage", () => {
  it("prints the active CLI contract ids", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)

    printSyncPackUsage()

    const output = log.mock.calls.map((call) => String(call[0])).join("\n")

    expect(output).toContain(syncPackReleaseGateCliContractId)
    expect(output).toContain(syncPackOperatorWorkflowCliContractId)
    expect(output).toContain(syncPackCommandTreeContractId)
    expect(output).toContain(syncPackRootCommandContractId)
  })

  it("prints the start-here path and command sections", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)

    printSyncPackUsage()

    const output = log.mock.calls.map((call) => String(call[0])).join("\n")

    expect(output).toContain("Start Here:")
    expect(output).toContain("Daily Operator:")
    expect(output).toContain("SDK/package Maintainer:")
    expect(output).toContain("Workflow:")
    expect(output).toContain("Release Gates:")
    expect(output).toContain("Operator Utilities:")
    expect(output).toContain("pnpm run feature-sync")
    expect(output).toContain("pnpm run feature-sync:verify")
    expect(output).toContain("intent-check")
    expect(output).toContain("sync-examples")
  })
})

describe("resolveSyncPackCliRequest", () => {
  it("routes bare afenda-sync-pack to quickstart only", () => {
    const request = resolveSyncPackCliRequest(["node", "sync-pack.js"])

    expect(request).toMatchObject({
      kind: "execute",
      command: expect.objectContaining({
        name: "quickstart",
      }),
    })
  })

  it("routes --help to grouped help output", () => {
    const request = resolveSyncPackCliRequest([
      "node",
      "sync-pack.js",
      "--help",
    ])

    expect(request).toEqual({
      kind: "help-root",
    })
  })

  it("routes help for a known command through the command tree", () => {
    const request = resolveSyncPackCliRequest([
      "node",
      "sync-pack.js",
      "help",
      "verify",
    ])

    expect(request).toMatchObject({
      kind: "help-command",
      command: expect.objectContaining({
        name: "verify",
      }),
    })
  })

  it("routes a known command through the command tree", () => {
    const request = resolveSyncPackCliRequest([
      "node",
      "sync-pack.js",
      "doctor",
    ])

    expect(request).toMatchObject({
      kind: "execute",
      command: expect.objectContaining({
        name: "doctor",
      }),
    })
  })

  it("keeps unknown command handling stable", () => {
    const request = resolveSyncPackCliRequest([
      "node",
      "sync-pack.js",
      "unknown",
    ])

    expect(request).toEqual({
      kind: "unknown-command",
      input: "unknown",
    })
  })
})

describe("command metadata", () => {
  it("defines examples and command classes for every command", () => {
    for (const command of syncPackCommandDefinitions) {
      expect(command.summary.length).toBeGreaterThan(0)
      expect(command.usage.length).toBeGreaterThan(0)
      expect(command.examples.length).toBeGreaterThan(0)
      expect(["start", "workflow", "maintainer", "gate", "operator"]).toContain(
        command.group
      )
    }
  })

  it("prints command examples and troubleshooting guidance", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)
    const command = requireSyncPackCommandDefinition("doctor")

    printCommandHelp(command)

    const output = log.mock.calls.map((call) => String(call[0])).join("\n")

    expect(output).toContain("Examples:")
    expect(output).toContain("pnpm run feature-sync:doctor")
    expect(output).toContain("Troubleshooting:")
  })

  it("prints the operator workflow contract for verify help", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)
    const command = requireSyncPackCommandDefinition("verify")

    printCommandHelp(command)

    const output = log.mock.calls.map((call) => String(call[0])).join("\n")

    expect(output).toContain(syncPackOperatorWorkflowCliContractId)
    expect(output).toContain("pnpm run feature-sync:verify")
  })
})

describe("printQuickstart", () => {
  it("prints the read-only control console", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined)
    vi.spyOn(
      intentModule,
      "inspectSyncPackControlConsoleState"
    ).mockResolvedValue({
      workspace: "dirty",
      sdkChangesDetected: "yes",
      intentCoverage: "required",
    })

    await printQuickstart()

    const output = log.mock.calls.map((call) => String(call[0])).join("\n")

    expect(output).toContain("Feature Sync — Start Here")
    expect(output).toContain("Daily operator:")
    expect(output).toContain("SDK/package maintainer:")
    expect(output).toContain("Golden examples:")
    expect(output).toContain("Current state:")
    expect(output).toContain("Workspace: dirty")
    expect(output).toContain("SDK changes detected: yes")
    expect(output).toContain("Intent coverage: required")
    expect(output).toContain("pnpm run feature-sync:intent-check")
    expect(output).toContain("pnpm run feature-sync:sync-examples")
    expect(output).toContain("Root contract:")
    expect(output).toContain("It never auto-runs verify.")
    expect(output).toContain("Externalization:")
  })
})
