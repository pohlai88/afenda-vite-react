/**
 * Fails when committed knowledge intelligence baseline violates ATC-style thresholds
 * in rules/knowledge-intelligence/kpi-thresholds.json.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "../..")
const rulesDir = path.join(root, "rules/knowledge-intelligence")

const thresholds = JSON.parse(
  fs.readFileSync(path.join(rulesDir, "kpi-thresholds.json"), "utf8")
) as {
  minIndexedChunkCount: number
  minSemanticQueryCount: number
  maxZeroResultRate: number
  requirePluginRegistryEnforced: boolean
}

const baseline = JSON.parse(
  fs.readFileSync(path.join(rulesDir, "kpi-baseline.json"), "utf8")
) as {
  indexedChunkCount: number
  semanticQueryCount: number
  zeroResultRate: number
  pluginRegistryEnforced: boolean
}

const issues: string[] = []
if (baseline.indexedChunkCount < thresholds.minIndexedChunkCount) {
  issues.push(
    `indexedChunkCount ${String(baseline.indexedChunkCount)} < min ${String(thresholds.minIndexedChunkCount)}`
  )
}
if (baseline.semanticQueryCount < thresholds.minSemanticQueryCount) {
  issues.push(
    `semanticQueryCount ${String(baseline.semanticQueryCount)} < min ${String(thresholds.minSemanticQueryCount)}`
  )
}
if (baseline.zeroResultRate > thresholds.maxZeroResultRate) {
  issues.push(
    `zeroResultRate ${String(baseline.zeroResultRate)} > max ${String(thresholds.maxZeroResultRate)}`
  )
}
if (
  thresholds.requirePluginRegistryEnforced &&
  !baseline.pluginRegistryEnforced
) {
  issues.push("pluginRegistryEnforced must be true per policy")
}

if (issues.length > 0) {
  console.error("Knowledge intelligence threshold check failed:")
  for (const i of issues) {
    console.error(`- ${i}`)
  }
  process.exit(1)
}

console.log("Knowledge intelligence baseline satisfies KPI thresholds.")
