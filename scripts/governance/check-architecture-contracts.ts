import fs from "node:fs/promises"
import path from "node:path"

import { loadAfendaConfig, workspaceRoot } from "../config/afenda-config.js"
import {
  evaluateAtcHonesty,
  parseAtcContract,
} from "../lib/governance-honesty.js"

const ATC_ROOT = path.join(workspaceRoot, "docs", "architecture", "atc")
const TEMPLATE_PATH = path.join(ATC_ROOT, "ATC_TEMPLATE.md")
const DECISIONS_ROOT = path.join(workspaceRoot, "docs", "architecture", "adr")

const requiredSections = [
  "## Contract identity",
  "## Lifecycle and enforcement",
  "## Implementation bindings",
  "## Enforcement surfaces",
  "## Evidence",
  "## Drift handling",
  "## Linked commands",
] as const

const issues: string[] = []
const config = await loadAfendaConfig()

for (const requiredPath of [ATC_ROOT, TEMPLATE_PATH, DECISIONS_ROOT]) {
  const exists = await fs
    .stat(requiredPath)
    .then(() => true)
    .catch(() => false)
  if (!exists) {
    issues.push(
      `Missing architecture contract path: ${path.relative(workspaceRoot, requiredPath)}`
    )
  }
}

const decisionEntries = await fs
  .readdir(DECISIONS_ROOT, { withFileTypes: true })
  .catch(() => [])
const knownAdrIds = new Set(
  decisionEntries
    .filter(
      (entry) => entry.isFile() && /^ADR-[0-9]{4}.*\.md$/u.test(entry.name)
    )
    .map((entry) => entry.name.match(/^(ADR-[0-9]{4})/u)?.[1])
    .filter((value): value is string => Boolean(value))
)

const entries = await fs
  .readdir(ATC_ROOT, { withFileTypes: true })
  .catch(() => [])
const atcFiles = entries
  .filter(
    (entry) =>
      entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md"
  )
  .map((entry) => path.join(ATC_ROOT, entry.name))

for (const filePath of atcFiles) {
  const relativePath = path.relative(workspaceRoot, filePath)
  const content = await fs.readFile(filePath, "utf8")

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      issues.push(`${relativePath} is missing required section "${section}".`)
    }
  }

  const atc = parseAtcContract(content)
  if (!atc.contractId) {
    issues.push(`${relativePath} must declare a Contract ID in body metadata.`)
    continue
  }

  if (!atc.lifecycleStatus) {
    issues.push(`${relativePath} must declare a lifecycle status.`)
  }
  if (!atc.enforcementMaturity) {
    issues.push(`${relativePath} must declare an enforcement maturity.`)
  }
  if (!atc.evidencePath) {
    issues.push(`${relativePath} must declare an evidence path.`)
  }
  if (!atc.checkCommand || !atc.reportCommand) {
    issues.push(
      `${relativePath} must declare linked check and report commands.`
    )
  }

  const boundDomain = atc.domainId
    ? config.governance.domains.find((domain) => domain.id === atc.domainId)
    : undefined
  const claimsStrongEnforcement =
    atc.lifecycleStatus === "enforced" ||
    atc.enforcementMaturity === "blocking" ||
    atc.enforcementMaturity === "runtime-enforced"
  const evidenceExists =
    claimsStrongEnforcement && boundDomain
      ? await fs
          .stat(path.join(workspaceRoot, boundDomain.evidencePath))
          .then((stats) => stats.isFile())
          .catch(() => false)
      : undefined

  issues.push(
    ...evaluateAtcHonesty({
      config,
      relativePath,
      atc,
      knownAdrIds,
      evidenceExists,
    })
  )
}

if (issues.length === 0) {
  console.log("Architecture contracts check passed.")
  process.exit(0)
}

console.error(
  `Architecture contracts check found ${String(issues.length)} issue(s):`
)
for (const issue of issues) {
  console.error(`- ${issue}`)
}

process.exit(1)
