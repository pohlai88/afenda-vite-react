import fs from "node:fs/promises"
import path from "node:path"

import type { RepoGuardFinding } from "./repo-guard.js"

export interface BoundaryImportRule {
  readonly id: string
  readonly scopeRoot: string
  readonly blockedTargetPrefixes: readonly string[]
  readonly allowedTargetPrefixes?: readonly string[]
  readonly blockedImportPatterns?: readonly BoundaryImportPattern[]
  readonly allowedImportPatterns?: readonly RegExp[]
  readonly blockedSourcePatterns?: readonly BoundarySourcePattern[]
  readonly severity: "error" | "warn"
  readonly message: string
  readonly suggestedFix?: string
}

export interface BoundaryImportPattern {
  readonly pattern: RegExp
  readonly message?: string
  readonly suggestedFix?: string
}

export interface BoundarySourcePattern {
  readonly pattern: RegExp
  readonly message?: string
  readonly suggestedFix?: string
}

export interface BoundaryImportPolicy {
  readonly sourceGlobs: readonly string[]
  readonly ignoredFileGlobs: readonly string[]
  readonly globalBlockedImportPatterns: readonly RegExp[]
  readonly globalIgnoredImportPatterns: readonly RegExp[]
  readonly rules: readonly BoundaryImportRule[]
}

interface WorkspacePackageExportSurface {
  readonly packageName: string
  readonly allowBareImport: boolean
  readonly allowedSubpathPatterns: readonly string[]
}

export interface ParsedImportRecord {
  readonly importPath: string
  readonly line: number
}

export async function evaluateBoundaryImportFindings(options: {
  readonly repoRoot: string
  readonly filePaths: readonly string[]
  readonly policy: BoundaryImportPolicy
}): Promise<readonly RepoGuardFinding[]> {
  const findings: RepoGuardFinding[] = []
  const workspacePackageExportSurfaces =
    await loadWorkspacePackageExportSurfaces(options.repoRoot)

  for (const filePath of options.filePaths) {
    if (!matchesAnyGlob(filePath, options.policy.sourceGlobs)) {
      continue
    }
    if (matchesAnyGlob(filePath, options.policy.ignoredFileGlobs)) {
      continue
    }

    const absolutePath = path.join(options.repoRoot, filePath)
    let source: string
    try {
      source = await fs.readFile(absolutePath, "utf8")
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        continue
      }
      throw error
    }
    const imports = parseImportsFromSource(source)
    const applicableRules = options.policy.rules.filter(
      (rule) =>
        filePath === rule.scopeRoot || filePath.startsWith(`${rule.scopeRoot}/`)
    )

    for (const rule of applicableRules) {
      for (const pattern of rule.blockedSourcePatterns ?? []) {
        pattern.pattern.lastIndex = 0
        const match = pattern.pattern.exec(source)
        if (!match || typeof match.index !== "number") {
          continue
        }

        findings.push({
          severity: rule.severity,
          ruleId: rule.id,
          filePath,
          message: pattern.message ?? rule.message,
          evidence: `line=${String(findLineNumberForIndex(source, match.index))}; pattern=${pattern.pattern.source}`,
          suggestedFix:
            pattern.suggestedFix ??
            rule.suggestedFix ??
            "Remove the blocked runtime pattern and route the behavior through an allowed governed surface instead.",
        })
      }
    }

    for (const record of imports) {
      const isGloballyIgnoredImport =
        options.policy.globalIgnoredImportPatterns.some((pattern) =>
          pattern.test(record.importPath)
        )
      const matchesRuleSpecificBlockedImport = applicableRules.some((rule) =>
        (rule.blockedImportPatterns ?? []).some((entry) =>
          entry.pattern.test(record.importPath)
        )
      )

      if (isGloballyIgnoredImport && !matchesRuleSpecificBlockedImport) {
        continue
      }

      const normalizedTarget = normalizeImportTarget(
        filePath,
        record.importPath
      )
      const blockedPatternTarget = normalizedTarget ?? record.importPath

      if (
        options.policy.globalBlockedImportPatterns.some((pattern) =>
          pattern.test(blockedPatternTarget)
        )
      ) {
        findings.push({
          severity: "error",
          ruleId: "RG-STRUCT-003",
          filePath,
          message:
            "Import path crosses a forbidden workspace-private or machine-noise boundary.",
          evidence: `line=${String(record.line)}; import=${record.importPath}`,
          suggestedFix:
            "Import through a public package/app surface instead of a private filesystem path.",
        })
        continue
      }
      let matchedScopedRule = false
      for (const rule of applicableRules) {
        if (
          rule.allowedImportPatterns?.some((pattern) =>
            pattern.test(record.importPath)
          )
        ) {
          continue
        }

        const blockedImportPattern = rule.blockedImportPatterns?.find((entry) =>
          entry.pattern.test(record.importPath)
        )

        if (blockedImportPattern) {
          findings.push({
            severity: rule.severity,
            ruleId: rule.id,
            filePath,
            message: blockedImportPattern.message ?? rule.message,
            evidence: `line=${String(record.line)}; import=${record.importPath}`,
            suggestedFix:
              blockedImportPattern.suggestedFix ??
              rule.suggestedFix ??
              "Depend on an allowed public surface or move the code into the owning domain.",
          })
          matchedScopedRule = true
          break
        }

        if (!normalizedTarget) {
          continue
        }

        if (
          rule.allowedTargetPrefixes?.some((prefix) =>
            matchesTargetPrefix(normalizedTarget, prefix)
          )
        ) {
          continue
        }

        if (
          rule.blockedTargetPrefixes.some((prefix) =>
            matchesTargetPrefix(normalizedTarget, prefix)
          )
        ) {
          findings.push({
            severity: rule.severity,
            ruleId: rule.id,
            filePath,
            message: rule.message,
            evidence: `line=${String(record.line)}; import=${record.importPath}; target=${normalizedTarget}`,
            suggestedFix:
              rule.suggestedFix ??
              "Depend on an allowed public surface or move the code into the owning domain.",
          })
          matchedScopedRule = true
          break
        }
      }

      if (matchedScopedRule) {
        continue
      }

      if (!normalizedTarget) {
        continue
      }

      const relativeWorkspaceRootFinding = evaluateRelativeWorkspaceRootFinding(
        {
          filePath,
          importPath: record.importPath,
          line: record.line,
          normalizedTarget,
        }
      )

      if (relativeWorkspaceRootFinding) {
        findings.push(relativeWorkspaceRootFinding)
        continue
      }

      const workspacePackageFinding = evaluateWorkspacePackageImportFinding({
        filePath,
        importPath: record.importPath,
        line: record.line,
        workspacePackageExportSurfaces,
      })

      if (workspacePackageFinding) {
        findings.push(workspacePackageFinding)
        continue
      }
    }
  }

  return findings
}

export function parseImportsFromSource(
  source: string
): readonly ParsedImportRecord[] {
  const imports: ParsedImportRecord[] = []
  const lines = source.split(/\r?\n/u)
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[^"'`]+?\s+from\s+)?["']([^"']+)["']/gu,
    /\bexport\s+[^"'`]*?\sfrom\s+["']([^"']+)["']/gu,
    /\bimport\(\s*["']([^"']+)["']\s*\)/gu,
  ]

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ""
    for (const pattern of patterns) {
      pattern.lastIndex = 0
      for (const match of line.matchAll(pattern)) {
        const importPath = match[1]?.trim()
        if (!importPath) {
          continue
        }
        imports.push({
          importPath,
          line: index + 1,
        })
      }
    }
  }

  return imports
}

export function normalizeImportTarget(
  importerPath: string,
  importPath: string
): string | null {
  if (importPath.startsWith("@/")) {
    return `apps/web/src/${importPath.slice(2)}`
  }

  if (importPath.startsWith("@afenda/")) {
    return importPath
  }

  if (!importPath.startsWith(".")) {
    return null
  }

  const importerDirectory = path.posix.dirname(
    importerPath.replace(/\\/gu, "/")
  )
  const resolved = path.posix.normalize(
    path.posix.join(importerDirectory, importPath)
  )
  return resolved.startsWith("../") ? null : resolved
}

export function isAllowedWorkspacePackageImport(options: {
  readonly importPath: string
  readonly exportSurface: WorkspacePackageExportSurface
}): boolean {
  const { importPath, exportSurface } = options
  if (importPath === exportSurface.packageName) {
    return exportSurface.allowBareImport
  }

  const packagePrefix = `${exportSurface.packageName}/`
  if (!importPath.startsWith(packagePrefix)) {
    return true
  }

  const subpath = importPath.slice(packagePrefix.length)
  return exportSurface.allowedSubpathPatterns.some((pattern) =>
    matchesExportSubpathPattern(subpath, pattern)
  )
}

async function loadWorkspacePackageExportSurfaces(
  repoRoot: string
): Promise<ReadonlyMap<string, WorkspacePackageExportSurface>> {
  const manifestPaths = await collectWorkspacePackageManifestPaths(repoRoot)
  const surfaces = await Promise.all(
    manifestPaths.map(async (manifestPath) => {
      const manifestRaw = await fs.readFile(manifestPath, "utf8")
      const manifest = JSON.parse(manifestRaw) as {
        readonly name?: string
        readonly exports?: Record<string, unknown> | string
      }

      const packageName = manifest.name
      if (!packageName?.startsWith("@afenda/")) {
        return null
      }

      return {
        packageName,
        allowBareImport: hasBareExport(manifest.exports),
        allowedSubpathPatterns: extractAllowedSubpathPatterns(manifest.exports),
      } satisfies WorkspacePackageExportSurface
    })
  )

  return new Map(
    surfaces
      .filter(
        (surface): surface is WorkspacePackageExportSurface => surface !== null
      )
      .map((surface) => [surface.packageName, surface])
  )
}

async function collectWorkspacePackageManifestPaths(
  repoRoot: string
): Promise<readonly string[]> {
  const roots = ["apps", "packages"] as const
  const manifestPaths: string[] = []

  for (const root of roots) {
    const absoluteRoot = path.join(repoRoot, root)
    let entries: Awaited<ReturnType<typeof fs.readdir>>
    try {
      entries = await fs.readdir(absoluteRoot, { withFileTypes: true })
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        continue
      }
      throw error
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }
      const manifestPath = path.join(absoluteRoot, entry.name, "package.json")
      try {
        await fs.access(manifestPath)
        manifestPaths.push(manifestPath)
      } catch {
        continue
      }
    }
  }

  return manifestPaths
}

function hasBareExport(
  exportsField: Record<string, unknown> | string | undefined
): boolean {
  if (!exportsField) {
    return false
  }
  if (typeof exportsField === "string") {
    return true
  }
  return Object.hasOwn(exportsField, ".")
}

function extractAllowedSubpathPatterns(
  exportsField: Record<string, unknown> | string | undefined
): readonly string[] {
  if (!exportsField || typeof exportsField === "string") {
    return []
  }

  return Object.keys(exportsField)
    .filter((key) => key.startsWith("./") && key !== ".")
    .map((key) => key.slice(2))
}

function evaluateWorkspacePackageImportFinding(options: {
  readonly filePath: string
  readonly importPath: string
  readonly line: number
  readonly workspacePackageExportSurfaces: ReadonlyMap<
    string,
    WorkspacePackageExportSurface
  >
}): RepoGuardFinding | null {
  const packageSpecifier = extractWorkspacePackageSpecifier(options.importPath)
  if (!packageSpecifier) {
    return null
  }

  const exportSurface = options.workspacePackageExportSurfaces.get(
    packageSpecifier.packageName
  )
  if (!exportSurface) {
    return null
  }

  if (
    isAllowedWorkspacePackageImport({
      importPath: options.importPath,
      exportSurface,
    })
  ) {
    return null
  }

  return {
    severity: "error",
    ruleId: "RG-STRUCT-003",
    filePath: options.filePath,
    message:
      "Import path bypasses the package's declared public export surface.",
    evidence: `line=${String(options.line)}; import=${options.importPath}; package=${packageSpecifier.packageName}`,
    suggestedFix:
      "Import through a declared package export or add an explicit export before using the subpath.",
  }
}

function evaluateRelativeWorkspaceRootFinding(options: {
  readonly filePath: string
  readonly importPath: string
  readonly line: number
  readonly normalizedTarget: string
}): RepoGuardFinding | null {
  if (!options.importPath.startsWith(".")) {
    return null
  }

  const importerWorkspaceRoot = extractWorkspaceRoot(options.filePath)
  const targetWorkspaceRoot = extractWorkspaceRoot(options.normalizedTarget)

  if (
    !importerWorkspaceRoot ||
    !targetWorkspaceRoot ||
    importerWorkspaceRoot === targetWorkspaceRoot
  ) {
    return null
  }

  return {
    severity: "error",
    ruleId: "RG-STRUCT-003",
    filePath: options.filePath,
    message:
      "Relative import crosses into a different workspace root. Use the owner app alias or a package public entrypoint instead.",
    evidence: `line=${String(options.line)}; import=${options.importPath}; target=${options.normalizedTarget}`,
    suggestedFix:
      "Replace the relative filesystem reach with an app alias or declared package export.",
  }
}

function extractWorkspacePackageSpecifier(importPath: string): {
  readonly packageName: string
  readonly subpath: string | null
} | null {
  if (!importPath.startsWith("@afenda/")) {
    return null
  }

  const segments = importPath.split("/")
  if (segments.length < 2) {
    return null
  }

  const packageName = `${segments[0]}/${segments[1]}`
  const subpath = segments.length > 2 ? segments.slice(2).join("/") : null
  return {
    packageName,
    subpath,
  }
}

function matchesExportSubpathPattern(
  subpath: string,
  pattern: string
): boolean {
  if (!pattern.includes("*")) {
    return subpath === pattern
  }

  const escapedPattern = pattern.replace(/[|\\{}()[\]^$+?.]/gu, "\\$&")
  const regex = new RegExp(`^${escapedPattern.replaceAll("*", ".*")}$`, "u")
  return regex.test(subpath)
}

function extractWorkspaceRoot(filePath: string): string | null {
  const normalizedPath = filePath.replace(/\\/gu, "/")
  const segments = normalizedPath.split("/")

  if (
    (segments[0] === "apps" || segments[0] === "packages") &&
    segments.length >= 2
  ) {
    return `${segments[0]}/${segments[1]}`
  }

  return null
}

function matchesAnyGlob(
  filePath: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) => path.matchesGlob(filePath, pattern))
}

function matchesTargetPrefix(
  normalizedTarget: string,
  prefix: string
): boolean {
  return (
    normalizedTarget === prefix ||
    normalizedTarget.startsWith(`${prefix}/`) ||
    stripKnownScriptExtension(normalizedTarget) === prefix
  )
}

function stripKnownScriptExtension(value: string): string {
  return value.replace(/\.(?:[cm]?[jt]sx?)$/u, "")
}

function findLineNumberForIndex(source: string, index: number): number {
  let line = 1

  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source[cursor] === "\n") {
      line += 1
    }
  }

  return line
}
