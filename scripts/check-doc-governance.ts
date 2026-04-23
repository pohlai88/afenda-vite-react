import fs from "node:fs/promises"
import path from "node:path"

import { workspaceRoot } from "./afenda-config.js"

const DECISIONS_ROOT = path.join(workspaceRoot, "docs", "architecture", "adr")
const ATC_ROOT = path.join(workspaceRoot, "docs", "architecture", "atc")

const requiredFiles = [
  "docs/architecture/governance/GOVERNANCE_CONSTITUTION.md",
  "docs/architecture/governance/GOVERNANCE_GLOSSARY.md",
  "docs/architecture/governance/NAMING_CONVENTION.md",
  "docs/architecture/adr/ADR_TEMPLATE.md",
  "docs/architecture/atc/ATC_TEMPLATE.md",
] as const

const termExpectations = [
  {
    file: "docs/architecture/governance/GOVERNANCE_CONSTITUTION.md",
    patterns: [
      "canonical vs derived",
      "waiver/exception",
      "ADR vs ATC",
      "traceability chain",
    ],
  },
  {
    file: "docs/architecture/governance/GOVERNANCE_GLOSSARY.md",
    patterns: ["Policy", "Contract", "Guardrail", "Evidence", "Drift", "Regression", "Waiver", "Gate"],
  },
  {
    file: "docs/architecture/governance/NAMING_CONVENTION.md",
    patterns: [
      "path + filename",
      "root/global surfaces",
      "Exports stay canonical to the subject",
      "Role suffixes belong in filenames",
      "Controlled governed domains only",
    ],
  },
  {
    file: "docs/architecture/adr/ADR_TEMPLATE.md",
    patterns: ["Related governance domains", "Related ATCs"],
  },
  {
    file: "docs/architecture/atc/ATC_TEMPLATE.md",
    patterns: ["## Contract identity", "## Linked commands"],
  },
] as const

const issues: string[] = []

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(workspaceRoot, relativePath)
  const exists = await fs
    .stat(absolutePath)
    .then((stats) => stats.isFile())
    .catch(() => false)

  if (!exists) {
    issues.push(`Missing documentation governance file: ${relativePath}`)
  }
}

for (const expectation of termExpectations) {
  const absolutePath = path.join(workspaceRoot, expectation.file)
  const content = await fs.readFile(absolutePath, "utf8").catch(() => "")

  for (const pattern of expectation.patterns) {
    if (!content.includes(pattern)) {
      issues.push(`${expectation.file} must include "${pattern}".`)
    }
  }
}

const atcEntries = await fs.readdir(ATC_ROOT, { withFileTypes: true }).catch(() => [])
const knownAtcIds = new Set(
  atcEntries
    .filter((entry) => entry.isFile() && /^ATC-[0-9]{4}.*\.md$/u.test(entry.name))
    .map((entry) => entry.name.match(/^(ATC-[0-9]{4})/u)?.[1])
    .filter((value): value is string => Boolean(value))
)

const decisionEntries = await fs
  .readdir(DECISIONS_ROOT, { withFileTypes: true })
  .catch(() => [])
const adrFiles = decisionEntries
  .filter((entry) => entry.isFile() && /^ADR-[0-9]{4}.*\.md$/u.test(entry.name))
  .map((entry) => path.join(DECISIONS_ROOT, entry.name))

for (const adrPath of adrFiles) {
  const relativePath = path.relative(workspaceRoot, adrPath)
  const content = await fs.readFile(adrPath, "utf8")
  const relatedAtcs = content.match(
    /- \*\*Related ATCs:\*\*\s*([^\n]+)/u
  )?.[1]

  if (!relatedAtcs) {
    continue
  }

  const referencedAtcs = relatedAtcs
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value && value !== "ATC-XXXX")

  for (const atcId of referencedAtcs) {
    if (!knownAtcIds.has(atcId)) {
      issues.push(`${relativePath} references missing ATC "${atcId}".`)
    }
  }
}

if (issues.length === 0) {
  console.log("Documentation governance check passed.")
  process.exit(0)
}

console.error(`Documentation governance check found ${String(issues.length)} issue(s):`)
for (const issue of issues) {
  console.error(`- ${issue}`)
}

process.exit(1)
