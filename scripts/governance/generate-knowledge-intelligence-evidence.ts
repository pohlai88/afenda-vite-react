/**
 * Emits human + machine knowledge intelligence evidence next to governance outputs.
 * Uses static baseline + policy paths registered in afenda.config.json.
 */
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "../..")
const rulesDir = path.join(root, "rules/knowledge-intelligence")
const outJson = path.join(
  root,
  ".artifacts/reports/governance/knowledge-intelligence.evidence.json"
)
const outMd = path.join(
  root,
  ".artifacts/reports/governance/knowledge-intelligence.evidence.md"
)

const baseline = JSON.parse(
  await fs.readFile(path.join(rulesDir, "kpi-baseline.json"), "utf8")
) as Record<string, unknown>
const thresholds = JSON.parse(
  await fs.readFile(path.join(rulesDir, "kpi-thresholds.json"), "utf8")
) as Record<string, unknown>

const generatedAt = new Date().toISOString()
const evidence = {
  generatedAt,
  sourceBaselinePath: "rules/knowledge-intelligence/kpi-baseline.json",
  sourceThresholdsPath: "rules/knowledge-intelligence/kpi-thresholds.json",
  baseline,
  thresholds,
  notes: [
    "Domain evidence report JSON is written by pnpm run script:run-governance-checks (governance core).",
    "Runtime KPIs are exposed at GET /api/v1/knowledge/metrics/intelligence in the API when deployed.",
  ],
}

await fs.mkdir(path.dirname(outJson), { recursive: true })
await fs.writeFile(outJson, `${JSON.stringify(evidence, null, 2)}\n`, "utf8")
await fs.writeFile(
  outMd,
  [
    "# Knowledge intelligence evidence",
    "",
    `Generated: ${generatedAt}`,
    "",
    "## Baseline snapshot",
    "",
    "```json",
    JSON.stringify(baseline, null, 2),
    "```",
    "",
    "## Policy thresholds",
    "",
    "```json",
    JSON.stringify(thresholds, null, 2),
    "```",
    "",
  ].join("\n"),
  "utf8"
)

console.log(
  `Knowledge intelligence evidence written to ${path.relative(root, outJson)} and ${path.relative(root, outMd)}`
)
