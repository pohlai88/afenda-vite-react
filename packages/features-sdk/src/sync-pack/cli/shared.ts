import { ZodError, z } from "zod"

import {
  candidateSelectionSchema,
  type CandidateSelection,
} from "../candidate-selection.js"
import { createCliErrorResult, isJsonOutput } from "../cli-output.js"
import {
  inspectSyncPackControlConsoleState,
  syncPackIntentContractId,
} from "../intent/index.js"
import {
  syncPackExampleContractId,
  syncPackGoldenExamplePackIds,
} from "../example-fitness/index.js"

export interface CliFlagDefinition {
  readonly name: `--${string}` | "-h"
  readonly description: string
  readonly value?: boolean
}

export interface CliCommandDefinition {
  readonly name: string
  readonly summary: string
  readonly usage: string
  readonly group: "start" | "workflow" | "maintainer" | "gate" | "operator"
  readonly gate?: boolean
  readonly hidden?: boolean
  readonly flags: readonly CliFlagDefinition[]
  readonly examples: readonly string[]
  readonly troubleshooting?: readonly string[]
  readonly contractLabel?: string
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

const preflightFlag = [
  {
    name: "--preflight",
    description:
      "Include pnpm install --frozen-lockfile for CI/bootstrap validation.",
  },
] as const satisfies readonly CliFlagDefinition[]

const candidateSelectionFlags = [
  {
    name: "--category",
    description: "Filter candidates by governed feature category.",
    value: true,
  },
  {
    name: "--lane",
    description: "Filter candidates by lane.",
    value: true,
  },
  {
    name: "--owner",
    description: "Filter candidates by owner team.",
    value: true,
  },
  {
    name: "--pack",
    description:
      "Filter candidates by pack id or category/id selector such as business-saas/internal-support-crm.",
    value: true,
  },
] as const satisfies readonly CliFlagDefinition[]

const intentScaffoldFlags = [
  {
    name: "--id",
    description: "Stable kebab-case id for the new intent file.",
    value: true,
  },
  {
    name: "--title",
    description: "Short human title for the change intent.",
    value: true,
  },
  {
    name: "--owner",
    description: "Owner name or team for the change intent.",
    value: true,
  },
  {
    name: "--summary",
    description: "Optional short summary; defaults to the title.",
    value: true,
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
    contractLabel: `${syncPackOperatorWorkflowCliContractId} operator workflow command`,
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
  "quality-validate": {
    name: "quality-validate",
    summary:
      "Run the package-first internal quality validation workflow for @afenda/features-sdk.",
    usage: "afenda-sync-pack quality-validate [--preflight] [--json] [--ci]",
    group: "maintainer",
    gate: false,
    contractLabel: "maintainer closure workflow",
    flags: [...preflightFlag, ...ciJsonFlags, ...helpFlags],
    examples: [
      "pnpm run feature-sync:quality-validate",
      "pnpm run feature-sync:quality-validate -- --preflight",
      "afenda-sync-pack quality-validate --json --ci",
    ],
    troubleshooting: [
      "Quality validation is sequential by design; fix the first blocking step before rerunning.",
      "Doctor warnings outside packages/features-sdk remain visible and tracked, but they do not block package closure.",
    ],
    load: () => import("./quality-validate.js"),
  },
  intent: {
    name: "intent",
    summary: "Scaffold a draft Sync-Pack change-intent truth artifact.",
    usage:
      "afenda-sync-pack intent --id <kebab-case-id> --title <title> --owner <owner> [--summary <summary>]",
    group: "maintainer",
    gate: false,
    contractLabel: `${syncPackIntentContractId} change-intent scaffold utility`,
    flags: [...intentScaffoldFlags, ...helpFlags],
    examples: [
      'pnpm run feature-sync:intent -- --id v95-governance-runtime --title "V95 governance runtime" --owner governance-toolchain',
      'afenda-sync-pack intent --id add-example-fitness --title "Add example fitness" --owner governance-toolchain',
    ],
    troubleshooting: [
      "Intent ids must be kebab-case and match the output filename.",
      "Intent scaffolding writes draft files only; promote status before maintainer closure.",
    ],
    load: () => import("./intent.js"),
  },
  "intent-check": {
    name: "intent-check",
    summary:
      "Validate truth-bound change-intent coverage for package maintainer work.",
    usage: "afenda-sync-pack intent-check [--json] [--ci]",
    group: "maintainer",
    gate: true,
    contractLabel: `${syncPackIntentContractId} maintainer verdict gate`,
    flags: [...ciJsonFlags, ...helpFlags],
    examples: [
      "pnpm run feature-sync:intent-check",
      "pnpm run feature-sync:intent-check -- --json --ci",
      "afenda-sync-pack intent-check --json --ci",
    ],
    troubleshooting: [
      "If package-owned Sync-Pack files changed, at least one changed non-draft intent must exist.",
      "Use truthBinding.expectedDiffScope to cover the exact files you changed.",
    ],
    load: () => import("./intent-check.js"),
  },
  "sync-examples": {
    name: "sync-examples",
    summary:
      "Refresh governed golden-example fitness metadata and guide output.",
    usage: "afenda-sync-pack sync-examples",
    group: "maintainer",
    gate: false,
    contractLabel: `${syncPackExampleContractId} golden example sync utility`,
    flags: [...helpFlags],
    examples: [
      "pnpm run feature-sync:sync-examples",
      "pnpm --filter @afenda/features-sdk sync-pack:sync-examples",
      "afenda-sync-pack sync-examples",
    ],
    troubleshooting: [
      "sync-examples is the only mutating repair path for example fitness metadata.",
      "If a golden example is broken or stale, fix it and rerun sync-examples before quality-validate.",
    ],
    load: () => import("./sync-examples.js"),
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
    usage:
      "afenda-sync-pack rank [--category <category>] [--lane <lane>] [--owner <team>] [--pack <id>]",
    group: "operator",
    gate: false,
    flags: [...candidateSelectionFlags, ...helpFlags],
    examples: [
      "pnpm run feature-sync:rank",
      "pnpm run feature-sync:rank -- --category business-saas",
      'afenda-sync-pack rank --lane platform --owner "Security Platform"',
    ],
    load: () => import("./rank.js"),
  },
  report: {
    name: "report",
    summary: "Print the candidate portfolio report.",
    usage:
      "afenda-sync-pack report [--category <category>] [--lane <lane>] [--owner <team>] [--pack <id>]",
    group: "operator",
    gate: false,
    flags: [...candidateSelectionFlags, ...helpFlags],
    examples: [
      "pnpm run feature-sync:report",
      "pnpm run feature-sync:report -- --lane operate",
      "afenda-sync-pack report --pack business-saas/internal-support-crm",
    ],
    load: () => import("./report.js"),
  },
  generate: {
    name: "generate",
    summary: "Generate planning packs from the curated seed.",
    usage:
      "afenda-sync-pack generate [--category <category>] [--lane <lane>] [--owner <team>] [--pack <id>]",
    group: "operator",
    gate: false,
    flags: [...candidateSelectionFlags, ...helpFlags],
    examples: [
      "pnpm run feature-sync:generate",
      "pnpm run feature-sync:generate -- --category mini-developer",
      "afenda-sync-pack generate --pack internal-app-builder-sandbox",
    ],
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

export function readCandidateSelection(
  cli: ParsedCliCommand
): CandidateSelection {
  return candidateSelectionSchema.parse({
    category: cli.getOptionValue("--category"),
    lane: cli.getOptionValue("--lane"),
    owner: cli.getOptionValue("--owner"),
    pack: cli.getOptionValue("--pack"),
  })
}

export function formatCandidateSelectionSummary(
  selection: CandidateSelection
): string {
  const parts = [
    selection.category ? `category=${selection.category}` : undefined,
    selection.lane ? `lane=${selection.lane}` : undefined,
    selection.owner ? `owner=${selection.owner}` : undefined,
    selection.pack ? `pack=${selection.pack}` : undefined,
  ].filter((value): value is string => Boolean(value))

  return parts.length > 0 ? parts.join(", ") : "none"
}

export function printCommandHelp(command: CliCommandDefinition): void {
  const contractLabel =
    command.contractLabel ??
    (command.group === "gate"
      ? `${syncPackReleaseGateCliContractId} release-gate command`
      : command.group === "workflow"
        ? `${syncPackOperatorWorkflowCliContractId} operator workflow command`
        : command.group === "maintainer"
          ? "maintainer command"
          : command.group === "start"
            ? "start-here command"
            : "non-gated operator command")

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
  console.log(`  ${syncPackIntentContractId} truth-bound change intent`)
  console.log(`  ${syncPackExampleContractId} golden example fitness`)
  console.log("")
  console.log("Start Here:")
  console.log("  pnpm run feature-sync")
  console.log("  pnpm run feature-sync:help")
  console.log(
    "  Shows what Sync-Pack is, the deterministic start-here path, and which command to run next."
  )
  console.log("")
  console.log("Daily Operator:")
  console.log("  pnpm run feature-sync:verify")
  console.log(
    "  Runs release-check, check, doctor, and validate in the supported order."
  )
  console.log("")
  console.log("SDK/package Maintainer:")

  for (const command of syncPackCommandDefinitions.filter(
    (definition) => definition.group === "maintainer"
  )) {
    console.log(`  ${command.name.padEnd(14)} ${command.summary}`)
  }

  console.log("")
  console.log("Usage:")
  console.log("  afenda-sync-pack <command> [options]")
  console.log("")
  console.log("Workflow:")

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

export async function printQuickstart(): Promise<void> {
  const currentState = await inspectSyncPackControlConsoleState()

  console.log("Afenda Sync-Pack Quickstart")
  console.log("")
  console.log("Feature Sync — Start Here")
  console.log("")
  console.log("Daily operator:")
  console.log("  pnpm run feature-sync:verify")
  console.log("")
  console.log("SDK/package maintainer:")
  console.log("  pnpm run feature-sync:intent")
  console.log("  pnpm run feature-sync:intent-check")
  console.log("  pnpm run feature-sync:sync-examples")
  console.log("  pnpm run feature-sync:quality-validate")
  console.log("")
  console.log("Golden examples:")

  for (const packId of syncPackGoldenExamplePackIds) {
    console.log(`  ${packId}`)
  }

  console.log("")
  console.log("Current state:")
  console.log(`  Workspace: ${currentState.workspace}`)
  console.log(`  SDK changes detected: ${currentState.sdkChangesDetected}`)
  console.log(`  Intent coverage: ${currentState.intentCoverage}`)
  console.log("")
  console.log("Common explicit gates:")
  console.log("  pnpm run feature-sync:release-check")
  console.log("  pnpm run feature-sync:check")
  console.log("  pnpm run feature-sync:doctor")
  console.log("  pnpm run feature-sync:validate")
  console.log("  pnpm run feature-sync:help")
  console.log("")
  console.log("Externalization:")
  console.log("  deferred")
  console.log("")
  console.log("Root contract:")
  console.log("  feature-sync is always quickstart only.")
  console.log("  It never auto-runs verify.")
  console.log("")
  console.log("Recommended next action:")
  console.log("  pnpm run feature-sync:verify")
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
