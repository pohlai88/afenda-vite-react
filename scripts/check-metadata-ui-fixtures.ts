/**
 * Dedicated fixture assertions for metadata-ui enforced AST rules.
 *
 * Current scope:
 * - allowInlineMetadataToTokenMappingInFeatures
 * - expected rule id: UIX-AST-CONTROL-001
 *
 * This runner uses isolated temporary scan roots so assertions are not affected
 * by pre-existing drift findings elsewhere in the repository.
 */
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const RULE_ID = "UIX-AST-CONTROL-001" as const

type FixtureExpectation = {
  kind: "valid" | "invalid"
  fixturePath: string
  expectedRuleId: typeof RULE_ID
}

const FIXTURES: readonly FixtureExpectation[] = [
  {
    kind: "valid",
    fixturePath:
      "scripts/fixtures/metadata-ui-inline-metadata-to-token-mapping.valid.md",
    expectedRuleId: RULE_ID,
  },
  {
    kind: "invalid",
    fixturePath:
      "scripts/fixtures/metadata-ui-inline-metadata-to-token-mapping.invalid.md",
    expectedRuleId: RULE_ID,
  },
] as const

function extractCodeFence(markdown: string): string {
  const fenceRe = /```(?:tsx?|jsx?)\s*([\s\S]*?)```/m
  const match = fenceRe.exec(markdown)
  if (!match || match[1] == null) {
    throw new Error("Fixture markdown must include a TS/TSX/JS/JSX code fence.")
  }
  return match[1].trim()
}

function runAstChecker(repoRoot: string, scanRoot: string): {
  findings: Array<{ file: string; rule: string }>
} {
  const result = spawnSync(
    process.execPath,
    [
      path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs"),
      path.join(repoRoot, "scripts", "check-ui-drift-ast.ts"),
      "--format=json",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        UI_DRIFT_SCAN_ROOTS: scanRoot,
      },
    }
  )

  const stdout = result.stdout?.trim() ?? ""
  if (stdout.length === 0) {
    throw new Error(
      `AST checker produced no JSON output. stderr:\n${result.stderr ?? ""}`
    )
  }

  let payload: unknown
  try {
    payload = JSON.parse(stdout)
  } catch {
    throw new Error(
      `Unable to parse AST checker JSON output.\nstdout:\n${stdout}\n\nstderr:\n${result.stderr ?? ""}`
    )
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("findings" in payload) ||
    !Array.isArray((payload as { findings?: unknown }).findings)
  ) {
    throw new Error(`Unexpected AST checker payload shape: ${stdout}`)
  }

  return payload as { findings: Array<{ file: string; rule: string }> }
}

function main(): void {
  const repoRoot = process.cwd()
  const tmpParent = path.join(repoRoot, ".tmp")
  mkdirSync(tmpParent, { recursive: true })
  const tmpRoot = mkdtempSync(path.join(tmpParent, "metadata-ui-fixtures-"))
  const failures: string[] = []

  try {
    for (const fixture of FIXTURES) {
      const fixtureAbsolute = path.join(repoRoot, fixture.fixturePath)
      const markdown = readFileSync(fixtureAbsolute, "utf8")
      const source = extractCodeFence(markdown)

      const fixtureName = path.basename(fixture.fixturePath, ".md")
      const scanRoot = path.join(tmpRoot, fixtureName)
      const featureDir = path.join(scanRoot, "features", "fixture")
      const testFile = path.join(featureDir, "fixture.tsx")
      mkdirSync(featureDir, { recursive: true })
      writeFileSync(testFile, source, { encoding: "utf8", flag: "w" })

      const report = runAstChecker(
        repoRoot,
        path.relative(repoRoot, scanRoot).replaceAll("\\", "/")
      )
      const relativeTestPath = path
        .relative(repoRoot, testFile)
        .replaceAll("\\", "/")

      const matching = report.findings.filter(
        (finding) =>
          finding.file.replaceAll("\\", "/") === relativeTestPath &&
          finding.rule === fixture.expectedRuleId
      )

      if (fixture.kind === "valid" && matching.length > 0) {
        failures.push(
          `${fixture.fixturePath}: expected 0 ${fixture.expectedRuleId} findings, got ${matching.length}`
        )
      }

      if (fixture.kind === "invalid" && matching.length === 0) {
        failures.push(
          `${fixture.fixturePath}: expected >=1 ${fixture.expectedRuleId} finding, got 0`
        )
      }
    }
  } finally {
    rmSync(tmpRoot, { recursive: true, force: true })
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`[FAIL] ${failure}`)
    }
    process.exit(1)
  }

  console.log("metadata-ui fixtures: ok")
}

main()
