import type { SyncPackFinding, SyncPackFindingRemediation } from "./finding.js"

export interface CliResultLike {
  readonly errorCount: number
  readonly warningCount: number
  readonly findings?: readonly unknown[]
}

export interface CliOutputOptions<TResult extends CliResultLike> {
  readonly result: TResult
  readonly renderText: (result: TResult) => void
  readonly argv?: readonly string[]
}

export interface CliFindingLike extends Pick<
  SyncPackFinding,
  "severity" | "code" | "message"
> {
  readonly filePath?: string
  readonly remediation?: SyncPackFindingRemediation
}

export function isJsonOutput(argv: readonly string[] = process.argv): boolean {
  return argv.includes("--json")
}

export function isCiMode(argv: readonly string[] = process.argv): boolean {
  return argv.includes("--ci")
}

export function writeCliResult<TResult extends CliResultLike>(
  options: CliOutputOptions<TResult>
): void {
  const argv = options.argv ?? process.argv

  if (isJsonOutput(argv)) {
    console.log(JSON.stringify(options.result, null, 2))
  } else {
    options.renderText(options.result)
  }

  if (options.result.errorCount > 0) {
    process.exitCode = 1
  }
}

export function printCliFindings(findings: readonly CliFindingLike[]): void {
  for (const finding of findings) {
    const location = finding.filePath ? ` ${finding.filePath}` : ""
    console.log(
      `[${finding.severity}] ${finding.code}${location}: ${finding.message}`
    )

    if (finding.remediation) {
      console.log(`  remediation: ${finding.remediation.action}`)

      if (finding.remediation.command) {
        console.log(`  command: ${finding.remediation.command}`)
      }

      if (finding.remediation.doc) {
        console.log(`  doc: ${finding.remediation.doc}`)
      }
    }
  }
}

export function createCliErrorResult(
  label: string,
  error: unknown
): CliResultLike {
  const message = error instanceof Error ? error.message : String(error)
  const code =
    error instanceof Error && "code" in error && typeof error.code === "string"
      ? error.code
      : "cli-unhandled-error"

  return {
    errorCount: 1,
    warningCount: 0,
    findings: [
      {
        severity: "error",
        code,
        message: `${label} failed: ${message}`,
        remediation: {
          action:
            "Review the command error and rerun the correct Sync-Pack command.",
          command: "afenda-sync-pack help",
          doc: "docs/sync-pack/FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md",
        },
      },
    ],
  }
}
