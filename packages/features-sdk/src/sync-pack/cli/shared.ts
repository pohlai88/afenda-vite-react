import { ZodError, z } from "zod"

import { createCliErrorResult, isJsonOutput } from "../cli-output.js"

export interface CliFlagDefinition {
  readonly name: `--${string}` | "-h"
  readonly description: string
  readonly value?: boolean
}

export interface CliCommandDefinition {
  readonly name: string
  readonly summary: string
  readonly usage: string
  readonly group: "start" | "workflow" | "gate" | "operator"
  readonly gate?: boolean
  readonly hidden?: boolean
  readonly flags: readonly CliFlagDefinition[]
  readonly examples: readonly string[]
  readonly troubleshooting?: readonly string[]
  readonly load?: () => Promise<unknown>
}

export const syncPackReleaseGateCliContractId = "FSDK-CLI-001" as const
export const syncPackOperatorWorkflowCliContractId = "FSDK-CLI-002" as const
export const syncPackCommandTreeContractId = "FSDK-CLI-003" as const
export const syncPackRootCommandContractId = "FSDK-CLI-004" as const

export interface ParsedCliCommand {
  readonly helpRequested: boolean
  readonly hasFlag: (name: string) => boolean
  readonly getOptionValue: (name: string) => string | undefined
}

export class CliUsageError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "CliUsageError"
    this.code = code
  }
}

const helpFlags = [
  {
    name: "--help",
    description: "Print command usage.",
  },
  {
    name: "-h",
    description: "Print command usage.",
  },
] as const satisfies readonly CliFlagDefinition[]

const ciJsonFlags = [
  {
    name: "--json",
    description: "Print machine-readable JSON only.",
  },
  {
    name: "--ci",
    description: "Use CI exit-code behavior; warnings remain non-blocking.",
  },
] as const satisfies readonly CliFlagDefinition[]

export const syncPackCommands = {
  help: {
    name: "help",
    summary: "Show grouped Sync-Pack help or help for a specific command.",
    usage: "afenda-sync-pack help [command]",
    group: "start",
    gate: false,
    hidden: true,
    flags: [...helpFlags],
    examples: [
      "pnpm run feature-sync:help",
      "afenda-sync-pack help",
      "afenda-sync-pack help verify",
    ],
  },
  quickstart: {
    name: "quickstart",
    summary: "Show the internal Sync-Pack operator starting path.",
    usage: "afenda-sync-pack quickstart",
    group: "start",
    gate: false,
    hidden: true,
    flags: [...helpFlags],
    examples: [
      "pnpm run feature-sync",
      "pnpm --filter @afenda/features-sdk sync-pack:quickstart",
      "afenda-sync-pack quickstart",
    ],
    load: () => import("./quickstart.js"),
  },
  check: {
    name: "check",
    summary: "Validate generated Feature Sync-Pack documents.",
    usage: "afenda-sync-pack check [--pack <path>] [--json] [--ci]",
    group: "gate",
    gate: true,
    flags: [
      {
        name: "--pack",
        description: "Generated packs root to inspect.",
        value: true,
      },
      ...ciJsonFlags,
      ...helpFlags,
    ],
    examples: [
      "pnpm run feature-sync:check",
      "pnpm run feature-sync:check -- --json --ci",
      "afenda-sync-pack check --json --ci",
    ],
    troubleshooting: [
      "Invalid pack files: rerun pnpm run feature-sync:generate or repair the listed file.",
      "Candidate mismatch: align the generated pack path with candidate category and id.",
    ],
    load: () => import("./check.js"),
  },
  verify: {
    name: "verify",
    summary: "Run the internal operator workflow across all release gates.",
    usage: "afenda-sync-pack verify [--json] [--ci]",
    group: "workflow",
    gate: false,
    flags: [...ciJsonFlags, ...helpFlags],
    examples: [
      "pnpm run feature-sync:verify",
      "pnpm --filter @afenda/features-sdk sync-pack:verify",
      "pnpm run feature-sync:verify -- --json --ci",
      "afenda-sync-pack verify --json --ci",
    ],
    troubleshooting: [
      "release-check failures: run pnpm --filter @afenda/features-sdk build and restore required docs, rules, or templates.",
      "doctor warnings remain non-blocking; focus first on any failed step in the verify summary.",
    ],
    load: () => import("./verify.js"),
  },
  doctor: {
    name: "doctor",
    summary: "Inspect stack and dependency-version drift.",
    usage: "afenda-sync-pack doctor [--target <path>] [--json] [--ci]",
    group: "gate",
    gate: true,
    flags: [
      {
        name: "--target",
        description: "Package or workspace path to inspect.",
        value: true,
      },
      ...ciJsonFlags,
      ...helpFlags,
    ],
    examples: [
      "pnpm run feature-sync:doctor",
      "pnpm run feature-sync:doctor -- --json --ci",
      "afenda-sync-pack doctor --target packages/features-sdk",
    ],
    troubleshooting: [
      "Catalog drift warnings are non-blocking unless errorCount is greater than 0.",
      "Version mismatch errors: align the package dependency with the workspace catalog policy.",
    ],
    load: () => import("./doctor.js"),
  },
  "release-check": {
    name: "release-check",
    summary: "Validate FSDK-CONTRACT-001 package publication integrity.",
    usage: "afenda-sync-pack release-check [--json] [--ci]",
    group: "gate",
    gate: true,
    flags: [...ciJsonFlags, ...helpFlags],
    examples: [
      "pnpm run feature-sync:release-check",
      "pnpm run feature-sync:release-check -- --json --ci",
      "afenda-sync-pack release-check --json --ci",
    ],
    troubleshooting: [
      "Missing built assets: run pnpm --filter @afenda/features-sdk build.",
      "Missing package files: restore required docs, rules, seed, or package metadata.",
    ],
    load: () => import("./release-check.js"),
  },
  validate: {
    name: "validate",
    summary: "Validate curated Sync-Pack seed input.",
    usage: "afenda-sync-pack validate [--json] [--ci]",
    group: "gate",
    gate: true,
    flags: [...ciJsonFlags, ...helpFlags],
    examples: [
      "pnpm run feature-sync:validate",
      "pnpm run feature-sync:validate -- --json --ci",
      "afenda-sync-pack validate --json --ci",
    ],
    troubleshooting: [
      "Seed parse errors: fix rules/sync-pack/openalternative.seed.json against the candidate schema.",
      "Workspace discovery errors: run from inside the Afenda pnpm workspace.",
    ],
    load: () => import("./validate.js"),
  },
  rank: {
    name: "rank",
    summary: "Print candidate priority scoring table.",
    usage: "afenda-sync-pack rank",
    group: "operator",
    gate: false,
    flags: [...helpFlags],
    examples: ["pnpm run feature-sync:rank", "afenda-sync-pack rank"],
    load: () => import("./rank.js"),
  },
  report: {
    name: "report",
    summary: "Print the candidate portfolio report.",
    usage: "afenda-sync-pack report",
    group: "operator",
    gate: false,
    flags: [...helpFlags],
    examples: ["pnpm run feature-sync:report", "afenda-sync-pack report"],
    load: () => import("./report.js"),
  },
  generate: {
    name: "generate",
    summary: "Generate planning packs from the curated seed.",
    usage: "afenda-sync-pack generate",
    group: "operator",
    gate: false,
    flags: [...helpFlags],
    examples: ["pnpm run feature-sync:generate", "afenda-sync-pack generate"],
    troubleshooting: [
      "Generated pack validation failures: run pnpm run feature-sync:check after generation.",
    ],
    load: () => import("./generate.js"),
  },
  scaffold: {
    name: "scaffold",
    summary: "Generate a tech-stack scaffold manifest.",
    usage:
      "afenda-sync-pack scaffold [--app-id <id>] [--category <category>] [--package-name <name>] [--out <path>]",
    group: "operator",
    gate: false,
    flags: [
      {
        name: "--app-id",
        description: "Application id for the scaffold.",
        value: true,
      },
      {
        name: "--category",
        description: "Feature category for stack recommendations.",
        value: true,
      },
      {
        name: "--package-name",
        description: "Package name to write into the scaffold contract.",
        value: true,
      },
      {
        name: "--out",
        description: "Output directory.",
        value: true,
      },
      ...helpFlags,
    ],
    examples: [
      "pnpm run feature-sync:scaffold -- --app-id internal-support --category business-saas",
      "afenda-sync-pack scaffold --app-id internal-support --category business-saas",
    ],
    troubleshooting: [
      "Workspace discovery errors: run from inside the Afenda pnpm workspace.",
      "Category errors: use one of the governed Sync-Pack feature categories.",
    ],
    load: () => import("./scaffold.js"),
  },
} as const satisfies Record<string, CliCommandDefinition>

export const syncPackCommandDefinitions: readonly CliCommandDefinition[] = (
  Object.values(syncPackCommands) as readonly CliCommandDefinition[]
).filter((command) => !command.hidden)

export type SyncPackCommandName = keyof typeof syncPackCommands

export type ResolvedSyncPackCliRequest =
  | {
      readonly kind: "execute"
      readonly command: CliCommandDefinition
    }
  | {
      readonly kind: "help-root"
    }
  | {
      readonly kind: "help-command"
      readonly command: CliCommandDefinition
    }
  | {
      readonly kind: "unknown-command"
      readonly input: string
    }

export function getSyncPackCommandDefinition(
  name: string
): CliCommandDefinition | undefined {
  return syncPackCommands[name as SyncPackCommandName]
}

export function requireSyncPackCommandDefinition(
  name: SyncPackCommandName
): CliCommandDefinition {
  const command = getSyncPackCommandDefinition(name)

  if (!command) {
    throw new Error(`Missing Sync-Pack command definition for ${name}.`)
  }

  return command
}

export function resolveSyncPackCliRequest(
  argv: readonly string[] = process.argv
): ResolvedSyncPackCliRequest {
  const args = argv.slice(2)
  const commandName = args[0]

  if (!commandName) {
    return {
      kind: "execute",
      command: requireSyncPackCommandDefinition("quickstart"),
    }
  }

  if (commandName === "--help" || commandName === "-h") {
    return {
      kind: "help-root",
    }
  }

  if (commandName === "help") {
    const targetCommand = args[1]

    if (!targetCommand) {
      return {
        kind: "help-root",
      }
    }

    const command = getSyncPackCommandDefinition(targetCommand)

    if (!command) {
      return {
        kind: "unknown-command",
        input: targetCommand,
      }
    }

    return {
      kind: "help-command",
      command,
    }
  }

  const command = getSyncPackCommandDefinition(commandName)

  if (!command) {
    return {
      kind: "unknown-command",
      input: commandName,
    }
  }

  return {
    kind: "execute",
    command,
  }
}

export function printCommandHelp(command: CliCommandDefinition): void {
  const contractLabel =
    command.group === "gate"
      ? `${syncPackReleaseGateCliContractId} release-gate command`
      : command.group === "workflow"
        ? `${syncPackOperatorWorkflowCliContractId} operator workflow command`
        : command.group === "start"
          ? "start-here command"
          : "non-gated operator command"

  console.log(`${command.summary}

Usage:
  ${command.usage}

Contract:
  ${contractLabel}

Options:`)

  for (const flag of command.flags) {
    const value = flag.value ? " <value>" : ""
    console.log(`  ${flag.name}${value}`)
    console.log(`    ${flag.description}`)
  }

  console.log("")
  console.log("Examples:")

  for (const example of command.examples) {
    console.log(`  ${example}`)
  }

  if (command.troubleshooting?.length) {
    console.log("")
    console.log("Troubleshooting:")

    for (const item of command.troubleshooting) {
      console.log(`  - ${item}`)
    }
  }
}

export function printSyncPackUsage(): void {
  console.log("Afenda Sync-Pack CLI")
  console.log("")
  console.log("Contracts:")
  console.log(`  ${syncPackReleaseGateCliContractId} release-gate commands`)
  console.log(
    `  ${syncPackOperatorWorkflowCliContractId} operator workflow command`
  )
  console.log(`  ${syncPackCommandTreeContractId} command tree routing`)
  console.log(`  ${syncPackRootCommandContractId} deterministic root command`)
  console.log("")
  console.log("Start Here:")
  console.log("  pnpm run feature-sync")
  console.log("  pnpm run feature-sync:help")
  console.log(
    "  Shows what Sync-Pack is, the deterministic start-here path, and which command to run next."
  )
  console.log("")
  console.log("Daily Path:")
  console.log("  pnpm run feature-sync:verify")
  console.log(
    "  Runs release-check, check, doctor, and validate in the supported order."
  )
  console.log("")
  console.log("Usage:")
  console.log("  afenda-sync-pack <command> [options]")
  console.log("")
  console.log("Operator Workflow:")

  for (const command of syncPackCommandDefinitions.filter(
    (definition) => definition.group === "workflow"
  )) {
    console.log(`  ${command.name.padEnd(14)} ${command.summary}`)
  }

  console.log("")
  console.log("Release Gates:")

  for (const command of syncPackCommandDefinitions.filter(
    (definition) => definition.group === "gate"
  )) {
    console.log(`  ${command.name.padEnd(14)} ${command.summary}`)
  }

  console.log("")
  console.log("Operator Utilities:")

  for (const command of syncPackCommandDefinitions.filter(
    (definition) => definition.group === "operator"
  )) {
    console.log(`  ${command.name.padEnd(14)} ${command.summary}`)
  }

  console.log("")
  console.log("Help:")
  console.log("  pnpm run feature-sync:help")
  console.log("  afenda-sync-pack help <command>")
}

export function printQuickstart(): void {
  console.log("Afenda Sync-Pack Quickstart")
  console.log("")
  console.log("What is Sync-Pack?")
  console.log(
    "  Sync-Pack turns curated software discovery into governed, build-ready internal feature planning packs."
  )
  console.log("")
  console.log("What should I run first?")
  console.log("  pnpm run feature-sync:verify")
  console.log("")
  console.log("Common explicit paths:")
  console.log("  pnpm run feature-sync:release-check")
  console.log("  pnpm run feature-sync:check")
  console.log("  pnpm run feature-sync:doctor")
  console.log("  pnpm run feature-sync:validate")
  console.log("  pnpm run feature-sync:help")
  console.log("")
  console.log("What do the commands mean?")
  console.log(
    "  verify         Runs release-check, check, doctor, and validate in one operator workflow."
  )
  console.log("  release-check  Verifies the SDK package/build contract.")
  console.log("  check          Validates generated feature-pack files.")
  console.log("  doctor         Finds stack and dependency-version drift.")
  console.log("  validate       Validates curated seed input.")
  console.log("  rank/report    Human-readable portfolio review commands.")
  console.log(
    "  generate       Writes generated planning packs from seed data."
  )
  console.log(
    "  scaffold       Writes a tech-stack scaffold for a candidate app."
  )
  console.log("")
  console.log("What does green mean?")
  console.log(
    "  verify:        release-check/check/validate pass, doctor has no errors"
  )
  console.log("  release-check: 0 errors, 0 warnings")
  console.log("  check:         0 errors, 0 warnings")
  console.log("  doctor:        0 errors; warnings are allowed")
  console.log("  validate:      seed parses successfully")
  console.log("")
  console.log("Canonical workflow:")
  console.log("  pnpm run feature-sync:verify")
  console.log("")
  console.log("Root contract:")
  console.log("  feature-sync is always quickstart only.")
  console.log("  It never auto-runs verify.")
}

function rawCommandArgs(
  command: CliCommandDefinition,
  argv: readonly string[] = process.argv
): string[] {
  const rawArgs = argv.slice(2)

  if (rawArgs[0] === command.name) {
    return rawArgs.slice(1)
  }

  return rawArgs
}

export function parseCliCommand(
  command: CliCommandDefinition,
  argv: readonly string[] = process.argv
): ParsedCliCommand {
  const args = rawCommandArgs(command, argv)
  const flags = new Map<string, CliFlagDefinition>(
    command.flags.map((flag) => [flag.name, flag])
  )
  const values = new Map<string, string | true>()

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]

    if (!argument) {
      continue
    }

    if (!argument.startsWith("-")) {
      throw new CliUsageError(
        "unsupported-cli-positional-argument",
        `Command ${command.name} does not accept positional argument ${argument}.`
      )
    }

    const equalsIndex = argument.indexOf("=")
    const name = equalsIndex === -1 ? argument : argument.slice(0, equalsIndex)
    const inlineValue =
      equalsIndex === -1 ? undefined : argument.slice(equalsIndex + 1)
    const flag = flags.get(name)

    if (!flag) {
      throw new CliUsageError(
        "unknown-cli-option",
        `Unknown option ${name} for command ${command.name}.`
      )
    }

    if (flag.value) {
      const value = inlineValue ?? args[index + 1]

      if (!value || value.startsWith("-")) {
        throw new CliUsageError(
          "missing-cli-option-value",
          `Option ${name} for command ${command.name} requires a value.`
        )
      }

      values.set(name, value)

      if (inlineValue === undefined) {
        index += 1
      }

      continue
    }

    if (inlineValue !== undefined) {
      throw new CliUsageError(
        "cli-flag-does-not-accept-value",
        `Flag ${name} for command ${command.name} does not accept a value.`
      )
    }

    values.set(name, true)
  }

  const helpRequested = values.has("--help") || values.has("-h")

  if (helpRequested && values.size > 1) {
    throw new CliUsageError(
      "unsupported-cli-flag-combination",
      `Command ${command.name} help cannot be combined with other options.`
    )
  }

  return {
    helpRequested,
    hasFlag: (name) => values.has(name),
    getOptionValue: (name) => {
      const value = values.get(name)
      return typeof value === "string" ? value : undefined
    },
  }
}

export function formatCliError(error: unknown): string {
  if (error instanceof ZodError) {
    return JSON.stringify(z.treeifyError(error), null, 2)
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export async function runCli(
  action: () => Promise<void>,
  label: string
): Promise<void> {
  try {
    await action()
  } catch (error) {
    if (isJsonOutput()) {
      console.log(JSON.stringify(createCliErrorResult(label, error), null, 2))
    } else {
      console.error(`${label} failed:`)
      console.error(formatCliError(error))
    }

    process.exitCode = 1
  }
}
