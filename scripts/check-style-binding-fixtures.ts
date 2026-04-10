/**
 * Dedicated fixture assertions for style-binding global owner import enforcement.
 *
 * Current scope:
 * - styleBindingPolicy.allowedGlobalStyleOwners
 * - expected rule id: UIX-AST-IMPORT-006
 *
 * This runner writes temporary fixture source files under apps/web/src so import
 * resolution can target canonical owner files (e.g. apps/web/src/globals.css).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const RULE_ID = "UIX-AST-IMPORT-006" as const

type FixtureExpectation = {
  kind: "valid" | "invalid"
  fixturePath: string
  fixtureFileName: string
  expectedRuleId: typeof RULE_ID
  setup?: (fixtureDir: string) => void
}

const FIXTURES: readonly FixtureExpectation[] = [
  {
    kind: "valid",
    fixturePath:
      "scripts/fixtures/policy-manifests/style-binding/global-style-owner-import.valid.md",
    fixtureFileName: "style-binding-valid.fixture.tsx",
    expectedRuleId: RULE_ID,
  },
  {
    kind: "valid",
    fixturePath:
      "scripts/fixtures/policy-manifests/style-binding/global-style-owner-import.valid-globals.md",
    fixtureFileName: "style-binding-valid-globals.fixture.tsx",
    expectedRuleId: RULE_ID,
  },
  {
    kind: "invalid",
    fixturePath:
      "scripts/fixtures/policy-manifests/style-binding/global-style-owner-import.invalid.md",
    fixtureFileName: "style-binding-invalid.fixture.tsx",
    expectedRuleId: RULE_ID,
    setup: (fixtureDir) => {
      writeFileSync(path.join(fixtureDir, "globals.css"), "/* fixture local globals */")
    },
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
  const fixtureDir = path.join(repoRoot, "apps", "web", "src", "__style_binding_fixtures__")
  mkdirSync(fixtureDir, { recursive: true })
  const failures: string[] = []
  const createdPaths: string[] = []

  try {
    for (const fixture of FIXTURES) {
      const fixtureAbsolute = path.join(repoRoot, fixture.fixturePath)
      const markdown = readFileSync(fixtureAbsolute, "utf8")
      const source = extractCodeFence(markdown)
      const testFile = path.join(fixtureDir, fixture.fixtureFileName)
      writeFileSync(testFile, source, { encoding: "utf8", flag: "w" })
      createdPaths.push(testFile)

      fixture.setup?.(fixtureDir)

      const report = runAstChecker(
        repoRoot,
        path.relative(repoRoot, fixtureDir).replaceAll("\\", "/")
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
    for (const p of createdPaths) {
      rmSync(p, { force: true })
    }
    rmSync(path.join(fixtureDir, "globals.css"), { force: true })
    rmSync(fixtureDir, { recursive: true, force: true })
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`[FAIL] ${failure}`)
    }
    process.exit(1)
  }

  console.log("style-binding fixtures: ok")
}

main()
