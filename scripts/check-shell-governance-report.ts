/**
 * Shell governance report checker.
 *
 * Produces CI-readable shell governance evidence from live repo state:
 * - registry validation issues
 * - shell component coverage (observed vs registered)
 * - registry composition by zone/kind
 * - shell doctrine manifest JSON (component registry keys, slot ids, state keys, validation pipeline)
 *
 * Usage:
 *   pnpm run script:check-shell-governance-report
 *   pnpm run script:check-shell-governance-report --format=json
 */
import path from "node:path"
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"

import {
  findRepoRoot,
  getOutputFormat,
  listFilesForScanByPolicy,
  normalizePath,
  loadGovernanceModules,
} from "../tools/ui-drift/shared/index.js"
import { shellGovernanceReportsDir } from "./lib/artifact-paths.js"

type RuleCode = "UIX-SHELL-REPORT-001"

type Severity = "error" | "warning"

interface ShellReportIssue {
  severity: Severity
  code: string
  message: string
  file?: string
}

interface SlotDoctrineMatrixRow {
  slotId: string
  zone: string
  slotRole: string
  slotStatus: string
  parentFrameSlot: string | null
  required: boolean
  multiEntry: boolean
  allowedComponentKinds: string[]
  registeredOwners: string[]
  childSlotIds: string[]
}

interface ShellGovernanceReport {
  generatedAt: string
  reportVersion: number
  reportFile: string
  summary: {
    errors: number
    warnings: number
    observedShellComponents: number
    registeredShellComponents: number
  }
  registry: {
    byZone: Record<string, number>
    byKind: Record<string, number>
  }
  coverage: {
    observedComponentNames: string[]
    registeredComponentNames: string[]
    missingInRegistry: string[]
    staleRegistryEntries: string[]
  }
  /** Inspectable slot doctrine: policy + contract + registry owners in one matrix. */
  slotDoctrineMatrix: SlotDoctrineMatrixRow[]
  issues: ShellReportIssue[]
}

const ROOT_DIR = normalizePath(findRepoRoot())
const REPORTS_DIR = shellGovernanceReportsDir(ROOT_DIR)
const VERSIONED_REPORT_RE = /^shell-governance-report\.v(\d{4})\.json$/

async function loadSerializeShellDoctrineManifest(): Promise<
  (pretty?: boolean) => string
> {
  const manifestUrl = new URL(
    `file://${path
      .join(
        ROOT_DIR,
        "packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/shell-doctrine-manifest.ts"
      )
      .replace(/\\/g, "/")}`
  ).href

  const module = (await import(manifestUrl)) as {
    serializeShellDoctrineManifest?: (pretty?: boolean) => string
  }

  if (typeof module.serializeShellDoctrineManifest !== "function") {
    throw new Error(
      "Unable to load serializeShellDoctrineManifest from shell-doctrine-manifest module."
    )
  }

  return module.serializeShellDoctrineManifest
}

async function loadShellRegistryValidator() {
  const moduleUrl = new URL(
    `file://${path
      .join(
        ROOT_DIR,
        "packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/validation/validate-shell-registry.ts"
      )
      .replace(/\\/g, "/")}`
  ).href

  const module = (await import(moduleUrl)) as {
    validateShellRegistry?: () => {
      ok: boolean
      issues: Array<{ code: string; registryKey: string; message: string }>
    }
  }

  if (typeof module.validateShellRegistry !== "function") {
    throw new Error(
      "Unable to load validateShellRegistry from shell validator module."
    )
  }

  return module.validateShellRegistry
}

async function loadShellComponentRegistryForReport(): Promise<
  Record<
    string,
    {
      componentName: string
      zone: string | null
      kind: string
    }
  >
> {
  const moduleUrl = new URL(
    `file://${path
      .join(
        ROOT_DIR,
        "packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/registry/shell-component-registry.ts"
      )
      .replace(/\\/g, "/")}`
  ).href

  const module = (await import(moduleUrl)) as {
    shellComponentRegistry?: Record<
      string,
      { componentName: string; zone: string | null; kind: string }
    >
  }

  if (
    !module.shellComponentRegistry ||
    typeof module.shellComponentRegistry !== "object"
  ) {
    throw new Error(
      "Unable to load shellComponentRegistry from shell-component-registry.ts."
    )
  }

  return module.shellComponentRegistry
}

async function loadSlotDoctrineForReport(): Promise<{
  shellSlotContractBySlotId: Record<
    string,
    {
      zone: string
      slotRole: string
      slotStatus: string
      parentFrameSlot: string | null
      required: boolean
      multiEntry: boolean
      allowedComponentKinds: readonly string[]
    }
  >
  componentToSlot: Record<string, string>
}> {
  const registryUrl = new URL(
    `file://${path
      .join(
        ROOT_DIR,
        "packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/registry/shell-slot-registry.ts"
      )
      .replace(/\\/g, "/")}`
  ).href
  const policyUrl = new URL(
    `file://${path
      .join(
        ROOT_DIR,
        "packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/policy/shell-slot-policy.ts"
      )
      .replace(/\\/g, "/")}`
  ).href

  const registryMod = (await import(registryUrl)) as {
    shellSlotContractBySlotId: Record<string, Record<string, unknown>>
  }
  const policyMod = (await import(policyUrl)) as {
    shellSlotPolicy: { componentToSlot: Record<string, string> }
  }

  return {
    shellSlotContractBySlotId: registryMod.shellSlotContractBySlotId as Record<
      string,
      {
        zone: string
        slotRole: string
        slotStatus: string
        parentFrameSlot: string | null
        required: boolean
        multiEntry: boolean
        allowedComponentKinds: readonly string[]
      }
    >,
    componentToSlot: policyMod.shellSlotPolicy.componentToSlot,
  }
}

function buildSlotDoctrineMatrix(
  shellSlotContractBySlotId: Record<
    string,
    {
      zone: string
      slotRole: string
      slotStatus: string
      parentFrameSlot: string | null
      required: boolean
      multiEntry: boolean
      allowedComponentKinds: readonly string[]
    }
  >,
  componentToSlot: Record<string, string>
): SlotDoctrineMatrixRow[] {
  const ownersBySlot = new Map<string, string[]>()
  for (const [registryKey, slotId] of Object.entries(componentToSlot)) {
    const list = ownersBySlot.get(slotId) ?? []
    list.push(registryKey)
    ownersBySlot.set(slotId, list)
  }

  const childSlotsByParent = new Map<string, string[]>()
  for (const slotId of Object.keys(shellSlotContractBySlotId)) {
    const contract = shellSlotContractBySlotId[slotId]
    if (!contract) continue
    const parent = contract.parentFrameSlot
    if (parent) {
      const list = childSlotsByParent.get(parent) ?? []
      list.push(slotId)
      childSlotsByParent.set(parent, list)
    }
  }

  const slotIds = Object.keys(shellSlotContractBySlotId).sort()
  return slotIds.map((slotId) => {
    const c = shellSlotContractBySlotId[slotId]
    if (!c) {
      throw new Error(`Missing slot contract for "${slotId}".`)
    }
    const childSlotIds = (childSlotsByParent.get(slotId) ?? []).sort()
    return {
      slotId,
      zone: c.zone,
      slotRole: c.slotRole,
      slotStatus: c.slotStatus,
      parentFrameSlot: c.parentFrameSlot,
      required: c.required,
      multiEntry: c.multiEntry,
      allowedComponentKinds: [...c.allowedComponentKinds],
      registeredOwners: (ownersBySlot.get(slotId) ?? []).sort(),
      childSlotIds,
    }
  })
}

function extractExportedShellComponentNames(content: string): string[] {
  const names = new Set<string>()
  const functionRe = /export\s+function\s+(Shell[A-Za-z0-9_]+)/g
  const constRe = /export\s+const\s+(Shell[A-Za-z0-9_]+)/g

  let match: RegExpExecArray | null
  while ((match = functionRe.exec(content)) !== null) {
    names.add(match[1])
  }
  while ((match = constRe.exec(content)) !== null) {
    names.add(match[1])
  }

  return [...names]
}

function countBy<T extends string>(
  items: readonly T[]
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of items) {
    counts[item] = (counts[item] ?? 0) + 1
  }
  return counts
}

function resolveNextReportVersion(reportDir: string): number {
  if (!existsSync(reportDir)) return 1

  const files = readdirSync(reportDir)
  let maxVersion = 0
  for (const file of files) {
    const match = VERSIONED_REPORT_RE.exec(file)
    if (!match) continue
    const parsed = Number.parseInt(match[1], 10)
    if (Number.isFinite(parsed) && parsed > maxVersion) {
      maxVersion = parsed
    }
  }

  return maxVersion + 1
}

function writeVersionedReport(
  report: Omit<ShellGovernanceReport, "reportFile">
): string {
  mkdirSync(REPORTS_DIR, { recursive: true })
  const version = report.reportVersion.toString().padStart(4, "0")
  const versionedFilename = `shell-governance-report.v${version}.json`
  const versionedPath = path.join(REPORTS_DIR, versionedFilename)
  const latestPath = path.join(
    REPORTS_DIR,
    "shell-governance-report.latest.json"
  )

  const finalReport: ShellGovernanceReport = {
    ...report,
    reportFile: normalizePath(path.relative(ROOT_DIR, versionedPath)),
  }

  writeFileSync(versionedPath, JSON.stringify(finalReport, null, 2), "utf8")
  writeFileSync(latestPath, JSON.stringify(finalReport, null, 2), "utf8")
  return finalReport.reportFile
}

async function main() {
  const governance = await loadGovernanceModules<RuleCode>(ROOT_DIR)
  const validateShellRegistry = await loadShellRegistryValidator()
  const registryValidation = validateShellRegistry()
  const { shellSlotContractBySlotId, componentToSlot } =
    await loadSlotDoctrineForReport()
  const slotDoctrineMatrix = buildSlotDoctrineMatrix(
    shellSlotContractBySlotId,
    componentToSlot
  )

  const scanFiles = listFilesForScanByPolicy(
    ROOT_DIR,
    governance.ownershipPolicy.productRoots
  )

  const shellUiFiles = scanFiles.filter((absoluteFile) => {
    const normalized = normalizePath(absoluteFile)
    return (
      normalized.includes("/components/shell-ui/") &&
      (normalized.endsWith(".ts") || normalized.endsWith(".tsx"))
    )
  })

  const observedComponentNames = new Set<string>()
  for (const absoluteFile of shellUiFiles) {
    const content = readFileSync(absoluteFile, "utf8")
    for (const name of extractExportedShellComponentNames(content)) {
      observedComponentNames.add(name)
    }
  }

  const shellComponentRegistry = await loadShellComponentRegistryForReport()
  const registryEntries = Object.values(shellComponentRegistry)
  const registeredComponentNames = new Set(
    registryEntries.map((entry) => entry.componentName)
  )

  const missingInRegistry = [...observedComponentNames].filter(
    (name) => !registeredComponentNames.has(name)
  )
  const staleRegistryEntries = [...registeredComponentNames].filter(
    (name) => !observedComponentNames.has(name)
  )

  const issues: ShellReportIssue[] = [
    ...registryValidation.issues.map((issue) => ({
      severity: "error" as const,
      code: issue.code,
      message: issue.message,
      file: issue.registryKey,
    })),
    ...missingInRegistry.map((name) => ({
      severity: "error" as const,
      code: "missing_shell_component_registration",
      message: `Observed shell component "${name}" is missing from shell-component-registry.`,
    })),
    ...staleRegistryEntries.map((name) => ({
      severity: "warning" as const,
      code: "stale_shell_component_registration",
      message: `Registered shell component "${name}" was not observed in current shell-ui exports.`,
    })),
  ]

  const byZone = countBy(
    registryEntries
      .map((entry) => entry.zone)
      .filter((zone): zone is string => zone != null)
  )
  const byKind = countBy(registryEntries.map((entry) => entry.kind))

  const nextVersion = resolveNextReportVersion(REPORTS_DIR)
  const reportBase = {
    generatedAt: new Date().toISOString(),
    reportVersion: nextVersion,
    summary: {
      errors: issues.filter((issue) => issue.severity === "error").length,
      warnings: issues.filter((issue) => issue.severity === "warning").length,
      observedShellComponents: observedComponentNames.size,
      registeredShellComponents: registeredComponentNames.size,
    },
    registry: {
      byZone,
      byKind,
    },
    coverage: {
      observedComponentNames: [...observedComponentNames].sort(),
      registeredComponentNames: [...registeredComponentNames].sort(),
      missingInRegistry: [...missingInRegistry].sort(),
      staleRegistryEntries: [...staleRegistryEntries].sort(),
    },
    slotDoctrineMatrix,
    issues,
  }
  const reportFile = writeVersionedReport(reportBase)
  const report: ShellGovernanceReport = {
    ...reportBase,
    reportFile,
  }

  const serializeShellDoctrineManifest =
    await loadSerializeShellDoctrineManifest()
  const manifestJson = serializeShellDoctrineManifest(true)
  const manifestVersionStr = reportBase.reportVersion
    .toString()
    .padStart(4, "0")
  mkdirSync(REPORTS_DIR, { recursive: true })
  const manifestVersionedPath = path.join(
    REPORTS_DIR,
    `shell-doctrine-manifest.v${manifestVersionStr}.json`
  )
  const manifestLatestPath = path.join(
    REPORTS_DIR,
    "shell-doctrine-manifest.latest.json"
  )
  writeFileSync(manifestVersionedPath, manifestJson, "utf8")
  writeFileSync(manifestLatestPath, manifestJson, "utf8")

  const format = getOutputFormat()
  if (format === "json") {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log("Shell Governance Report")
    console.log("======================\n")
    console.log(
      `Observed shell components: ${report.summary.observedShellComponents}`
    )
    console.log(
      `Registered shell components: ${report.summary.registeredShellComponents}`
    )
    console.log(`Errors: ${report.summary.errors}`)
    console.log(`Warnings: ${report.summary.warnings}\n`)
    console.log("Doctrine manifest")
    console.log("-----------------")
    console.log(
      `Written: ${normalizePath(path.relative(ROOT_DIR, manifestLatestPath))}`
    )
    console.log(
      `Versioned: ${normalizePath(path.relative(ROOT_DIR, manifestVersionedPath))}\n`
    )

    console.log("By Zone")
    console.log("-------")
    for (const [zone, count] of Object.entries(report.registry.byZone).sort()) {
      console.log(`${zone}: ${count}`)
    }
    console.log("\nBy Kind")
    console.log("-------")
    for (const [kind, count] of Object.entries(report.registry.byKind).sort()) {
      console.log(`${kind}: ${count}`)
    }

    console.log("\nSlot doctrine matrix")
    console.log("--------------------")
    for (const row of report.slotDoctrineMatrix) {
      const kinds = row.allowedComponentKinds.join(", ")
      const owners =
        row.registeredOwners.length > 0 ? row.registeredOwners.join(", ") : "—"
      const children =
        row.childSlotIds.length > 0 ? row.childSlotIds.join(", ") : "—"
      const parent = row.parentFrameSlot ?? "—"
      console.log(`${row.slotId}`)
      console.log(
        `  zone=${row.zone} role=${row.slotRole} status=${row.slotStatus} parent=${parent} required=${row.required} multiEntry=${row.multiEntry}`
      )
      console.log(`  kinds: [${kinds}]`)
      console.log(`  owners: ${owners}`)
      console.log(`  child slots: ${children}`)
    }

    if (report.issues.length > 0) {
      console.log("\nIssues")
      console.log("------")
      for (const issue of report.issues) {
        const where = issue.file ? ` (${issue.file})` : ""
        console.log(`[${issue.severity.toUpperCase()}] ${issue.code}${where}`)
        console.log(`  ${issue.message}`)
      }
    }
  }

  process.exit(report.summary.errors > 0 ? 1 : 0)
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(2)
})
