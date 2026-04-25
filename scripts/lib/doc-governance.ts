import fs from "node:fs/promises"
import path from "node:path"

export interface DocumentationGovernanceIssue {
  readonly rule:
    | "missing-required-file"
    | "missing-required-pattern"
    | "missing-related-atc"
  readonly path: string
  readonly message: string
}

const REQUIRED_FILES = [
  "docs/architecture/governance/GOVERNANCE_CONSTITUTION.md",
  "docs/architecture/governance/GOVERNANCE_GLOSSARY.md",
  "docs/architecture/governance/NAMING_CONVENTION.md",
  "docs/architecture/governance/REPOSITORY_INTEGRITY_GUARD.md",
  "docs/BOUNDARY_SURFACES.md",
  "docs/architecture/adr/ADR_TEMPLATE.md",
  "docs/architecture/atc/ATC_TEMPLATE.md",
] as const

const TERM_EXPECTATIONS = [
  {
    file: "docs/architecture/governance/GOVERNANCE_CONSTITUTION.md",
    patterns: [
      "canonical vs derived",
      "Root vs owner-local surfaces",
      "waiver/exception",
      "ADR vs ATC",
      "traceability chain",
    ],
  },
  {
    file: "docs/BOUNDARY_SURFACES.md",
    patterns: [
      "Scope axis",
      "Surface axis",
      "Doctrine is the semantic class",
      "root doctrine lives under `docs/architecture/**`",
      "Owner-local doctrine is optional and rare",
      "`rules/` is not a general governance archive",
      "Schema defaults to the owner",
      "Root tests",
      "Owner-local tests",
    ],
  },
  {
    file: "docs/architecture/governance/GOVERNANCE_GLOSSARY.md",
    patterns: [
      "Policy",
      "Contract",
      "Guardrail",
      "Evidence",
      "Drift",
      "Regression",
      "Waiver",
      "Gate",
    ],
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
    file: "docs/architecture/governance/REPOSITORY_INTEGRITY_GUARD.md",
    patterns: [
      "Repository Integrity Guard",
      "warn-first",
      "repo:guard",
      "GOV-TRUTH-001",
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

export async function evaluateDocumentationGovernance(
  repoRoot: string
): Promise<readonly DocumentationGovernanceIssue[]> {
  const issues: DocumentationGovernanceIssue[] = []
  const atcRoot = path.join(repoRoot, "docs", "architecture", "atc")
  const decisionsRoot = path.join(repoRoot, "docs", "architecture", "adr")

  for (const relativePath of REQUIRED_FILES) {
    const absolutePath = path.join(repoRoot, relativePath)
    const exists = await fs
      .stat(absolutePath)
      .then((stats) => stats.isFile())
      .catch(() => false)

    if (!exists) {
      issues.push({
        rule: "missing-required-file",
        path: relativePath,
        message: `Missing documentation governance file: ${relativePath}`,
      })
    }
  }

  for (const expectation of TERM_EXPECTATIONS) {
    const absolutePath = path.join(repoRoot, expectation.file)
    const content = await fs.readFile(absolutePath, "utf8").catch(() => "")

    for (const pattern of expectation.patterns) {
      if (!content.includes(pattern)) {
        issues.push({
          rule: "missing-required-pattern",
          path: expectation.file,
          message: `${expectation.file} must include "${pattern}".`,
        })
      }
    }
  }

  const atcEntries = await fs
    .readdir(atcRoot, { withFileTypes: true })
    .catch(() => [])
  const knownAtcIds = new Set(
    atcEntries
      .filter(
        (entry) => entry.isFile() && /^ATC-[0-9]{4}.*\.md$/u.test(entry.name)
      )
      .map((entry) => entry.name.match(/^(ATC-[0-9]{4})/u)?.[1])
      .filter((value): value is string => Boolean(value))
  )

  const decisionEntries = await fs
    .readdir(decisionsRoot, { withFileTypes: true })
    .catch(() => [])
  const adrFiles = decisionEntries
    .filter(
      (entry) => entry.isFile() && /^ADR-[0-9]{4}.*\.md$/u.test(entry.name)
    )
    .map((entry) => path.join(decisionsRoot, entry.name))

  for (const adrPath of adrFiles) {
    const relativePath = normalizeRelativePath(path.relative(repoRoot, adrPath))
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
        issues.push({
          rule: "missing-related-atc",
          path: relativePath,
          message: `${relativePath} references missing ATC "${atcId}".`,
        })
      }
    }
  }

  return issues.sort((left, right) => left.path.localeCompare(right.path))
}

function normalizeRelativePath(value: string): string {
  return value.split(path.sep).join("/")
}
