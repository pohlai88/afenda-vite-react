import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

type NotebookCell = {
  cell_type?: unknown
  source?: unknown
  outputs?: unknown
  execution_count?: unknown
  metadata?: unknown
}

type NotebookDocument = {
  nbformat?: unknown
  cells?: unknown
}

type Violation = {
  readonly file: string
  readonly rule:
    | "invalid-json"
    | "invalid-notebook-shape"
    | "invalid-cell-shape"
    | "cell-has-output"
    | "cell-has-execution-count"
    | "cell-metadata-trusted-true"
    | "potential-secret"
  readonly message: string
}

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".turbo",
  ".artifacts",
  ".legacy",
  "archives",
  "node_modules",
  "dist",
])

const SECRET_PATTERNS: readonly { label: string; regex: RegExp }[] = [
  { label: "OpenAI key", regex: /\bsk-[A-Za-z0-9]{20,}\b/g },
  { label: "AWS access key", regex: /\bAKIA[0-9A-Z]{16}\b/g },
  {
    label: "Generic private key block",
    regex: /-----BEGIN (?:RSA|EC|OPENSSH|PGP|PRIVATE) KEY-----/g,
  },
  {
    label: "Likely secret assignment",
    regex:
      /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}["']/gi,
  },
]

const allowOutputs = process.env.AFENDA_NOTEBOOK_ALLOW_OUTPUTS === "1"
const allowExecutionCounts =
  process.env.AFENDA_NOTEBOOK_ALLOW_EXECUTION_COUNTS === "1"

function main() {
  const cliPaths = process.argv.slice(2)
  const notebookPaths =
    cliPaths.length > 0
      ? cliPaths.filter((filePath) => filePath.endsWith(".ipynb"))
      : discoverNotebookPaths(process.cwd())

  if (notebookPaths.length === 0) {
    console.log("Notebook governance check passed (no .ipynb files found).")
    return
  }

  const violations: Violation[] = []

  for (const notebookPath of notebookPaths) {
    const normalizedPath = normalizeRelative(notebookPath)
    const absolutePath = path.isAbsolute(notebookPath)
      ? notebookPath
      : path.join(process.cwd(), notebookPath)

    const raw = readFileSync(absolutePath, "utf8")
    let parsed: unknown
    try {
      parsed = JSON.parse(raw) as unknown
    } catch (error) {
      violations.push({
        file: normalizedPath,
        rule: "invalid-json",
        message:
          error instanceof Error
            ? error.message
            : "Notebook is not valid JSON.",
      })
      continue
    }

    if (!isNotebookDocument(parsed)) {
      violations.push({
        file: normalizedPath,
        rule: "invalid-notebook-shape",
        message:
          "Notebook must contain nbformat:number and cells:array fields.",
      })
      continue
    }

    violations.push(
      ...collectCellViolations(normalizedPath, parsed.cells as unknown[])
    )
  }

  if (violations.length > 0) {
    console.error(
      `Notebook governance found ${String(violations.length)} violation(s):`
    )
    for (const violation of violations) {
      console.error(
        `- [${violation.rule}] ${violation.file}\n  ${violation.message}`
      )
    }
    process.exitCode = 1
    return
  }

  console.log(
    `Notebook governance check passed for ${String(notebookPaths.length)} notebook(s).`
  )
}

function discoverNotebookPaths(root: string): string[] {
  const results: string[] = []

  const walk = (directoryPath: string) => {
    for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) {
        continue
      }

      const absoluteEntryPath = path.join(directoryPath, entry.name)
      if (entry.isDirectory()) {
        if (
          IGNORED_DIRECTORIES.has(entry.name) ||
          entry.name.startsWith("_tmp_")
        ) {
          continue
        }
        walk(absoluteEntryPath)
        continue
      }

      if (entry.isFile() && absoluteEntryPath.endsWith(".ipynb")) {
        results.push(
          normalizeRelative(path.relative(process.cwd(), absoluteEntryPath))
        )
      }
    }
  }

  walk(root)
  return results.sort((left, right) => left.localeCompare(right))
}

function collectCellViolations(
  filePath: string,
  cells: unknown[]
): Violation[] {
  const violations: Violation[] = []

  cells.forEach((cell, index) => {
    if (!isNotebookCell(cell)) {
      violations.push({
        file: filePath,
        rule: "invalid-cell-shape",
        message: `Cell[${String(index)}] is not a valid notebook cell object.`,
      })
      return
    }

    const sourceText = readNotebookText(cell.source)
    const outputsText = readNotebookText(cell.outputs)

    if (cell.cell_type === "code") {
      if (
        !allowOutputs &&
        Array.isArray(cell.outputs) &&
        cell.outputs.length > 0
      ) {
        violations.push({
          file: filePath,
          rule: "cell-has-output",
          message:
            `Cell[${String(index)}] contains outputs. Clear outputs before commit ` +
            "or set AFENDA_NOTEBOOK_ALLOW_OUTPUTS=1 for intentional exceptions.",
        })
      }

      if (
        !allowExecutionCounts &&
        cell.execution_count !== null &&
        cell.execution_count !== undefined
      ) {
        violations.push({
          file: filePath,
          rule: "cell-has-execution-count",
          message:
            `Cell[${String(index)}] has execution_count=${String(cell.execution_count)}. ` +
            "Reset execution counts before commit or set AFENDA_NOTEBOOK_ALLOW_EXECUTION_COUNTS=1 for intentional exceptions.",
        })
      }
    }

    if (isRecord(cell.metadata) && cell.metadata.trusted === true) {
      violations.push({
        file: filePath,
        rule: "cell-metadata-trusted-true",
        message: `Cell[${String(index)}] has metadata.trusted=true. Commit notebooks with trusted=false/absent to reduce trust-state drift.`,
      })
    }

    const combinedText = `${sourceText}\n${outputsText}`
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(combinedText)) {
        violations.push({
          file: filePath,
          rule: "potential-secret",
          message: `Cell[${String(index)}] may contain a secret (${pattern.label}).`,
        })
      }
      pattern.regex.lastIndex = 0
    }
  })

  return violations
}

function readNotebookText(value: unknown): string {
  if (typeof value === "string") {
    return value
  }
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").join("\n")
  }
  if (value === null || value === undefined) {
    return ""
  }
  return JSON.stringify(value)
}

function isNotebookDocument(value: unknown): value is NotebookDocument {
  return (
    isRecord(value) &&
    typeof value.nbformat === "number" &&
    Array.isArray(value.cells)
  )
}

function isNotebookCell(value: unknown): value is NotebookCell {
  return isRecord(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function normalizeRelative(value: string): string {
  return value.split(path.sep).join("/")
}

main()
