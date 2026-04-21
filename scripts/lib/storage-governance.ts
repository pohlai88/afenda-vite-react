import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

export interface StorageGovernanceEntry {
  readonly name: string
  readonly kind: "legacy-reference" | "snapshot"
  readonly description: string
}

export interface StorageGovernanceRoot {
  readonly root: string
  readonly requiredRootFiles: readonly string[]
  readonly allowedRootFiles: readonly string[]
  readonly entries: readonly StorageGovernanceEntry[]
}

export interface StorageGovernanceConfig {
  readonly version: number
  readonly storageRoots: readonly StorageGovernanceRoot[]
}

export interface StorageGovernanceViolation {
  readonly rule:
    | "config-duplicate-root"
    | "config-duplicate-entry"
    | "missing-root"
    | "missing-required-root-file"
    | "unexpected-root-file"
    | "undeclared-entry"
    | "missing-declared-entry"
    | "invalid-snapshot-name"
  readonly path: string
  readonly message: string
}

export interface StorageRootSummary {
  readonly root: string
  readonly entryCount: number
  readonly violationCount: number
}

export interface StorageGovernanceEvaluation {
  readonly rootSummaries: readonly StorageRootSummary[]
  readonly violations: readonly StorageGovernanceViolation[]
}

const DEFAULT_CONFIG_PATH = path.resolve(
  "rules/storage-governance/storage-governance.config.json"
)

export function loadStorageGovernanceConfig(
  configPath = DEFAULT_CONFIG_PATH
): StorageGovernanceConfig {
  return JSON.parse(readFileSync(configPath, "utf8")) as StorageGovernanceConfig
}

export function evaluateStorageGovernance(
  config: StorageGovernanceConfig
): StorageGovernanceEvaluation {
  const violations: StorageGovernanceViolation[] = [
    ...collectStorageGovernanceConfigViolations(config),
  ]
  const rootSummaries: StorageRootSummary[] = []

  for (const storageRoot of config.storageRoots) {
    const rootPath = path.resolve(storageRoot.root)
    const relativeRoot = normalizeRelative(storageRoot.root)
    const violationsBeforeRoot = violations.length

    if (!directoryExists(rootPath)) {
      violations.push({
        rule: "missing-root",
        path: relativeRoot,
        message: `Storage root "${storageRoot.root}" does not exist.`,
      })
      rootSummaries.push({
        root: relativeRoot,
        entryCount: 0,
        violationCount: 1,
      })
      continue
    }

    const entries = readdirSync(rootPath, { withFileTypes: true }).filter(
      (entry) => !entry.name.startsWith(".")
    )
    const declaredEntries = new Map(
      storageRoot.entries.map((entry) => [entry.name, entry])
    )

    for (const requiredFile of storageRoot.requiredRootFiles) {
      if (!fileExists(path.join(rootPath, requiredFile))) {
        violations.push({
          rule: "missing-required-root-file",
          path: `${relativeRoot}/${requiredFile}`,
          message: `Storage root "${storageRoot.root}" is missing required file "${requiredFile}".`,
        })
      }
    }

    for (const entry of entries) {
      const entryPath = `${relativeRoot}/${entry.name}`

      if (entry.isFile()) {
        if (!storageRoot.allowedRootFiles.includes(entry.name)) {
          violations.push({
            rule: "unexpected-root-file",
            path: entryPath,
            message: `Storage root "${storageRoot.root}" contains unexpected top-level file "${entry.name}".`,
          })
        }
        continue
      }

      const declared = declaredEntries.get(entry.name)
      if (!declared) {
        violations.push({
          rule: "undeclared-entry",
          path: entryPath,
          message: `Top-level storage entry "${entry.name}" is not declared in storage-governance config.`,
        })
        continue
      }

      if (
        declared.kind === "snapshot" &&
        !/[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(declared.name)
      ) {
        violations.push({
          rule: "invalid-snapshot-name",
          path: entryPath,
          message: `Snapshot entry "${declared.name}" must end with YYYY-MM-DD.`,
        })
      }
    }

    for (const declaredEntry of storageRoot.entries) {
      if (!directoryExists(path.join(rootPath, declaredEntry.name))) {
        violations.push({
          rule: "missing-declared-entry",
          path: `${relativeRoot}/${declaredEntry.name}`,
          message: `Declared storage entry "${declaredEntry.name}" does not exist on disk.`,
        })
      }
    }

    rootSummaries.push({
      root: relativeRoot,
      entryCount: storageRoot.entries.length,
      violationCount: violations.length - violationsBeforeRoot,
    })
  }

  return {
    rootSummaries,
    violations: violations.sort((left, right) =>
      left.path.localeCompare(right.path)
    ),
  }
}

function collectStorageGovernanceConfigViolations(
  config: StorageGovernanceConfig
): readonly StorageGovernanceViolation[] {
  const violations: StorageGovernanceViolation[] = []
  const seenRoots = new Set<string>()

  for (const storageRoot of config.storageRoots) {
    const relativeRoot = normalizeRelative(storageRoot.root)
    if (seenRoots.has(relativeRoot)) {
      violations.push({
        rule: "config-duplicate-root",
        path: relativeRoot,
        message: `Storage root "${storageRoot.root}" is duplicated in storage-governance config.`,
      })
    }
    seenRoots.add(relativeRoot)

    const seenEntries = new Set<string>()
    for (const entry of storageRoot.entries) {
      if (seenEntries.has(entry.name)) {
        violations.push({
          rule: "config-duplicate-entry",
          path: `${relativeRoot}/${entry.name}`,
          message: `Storage entry "${entry.name}" is duplicated under "${storageRoot.root}".`,
        })
      }
      seenEntries.add(entry.name)
    }
  }

  return violations
}

function directoryExists(directoryPath: string): boolean {
  try {
    return statSync(directoryPath).isDirectory()
  } catch {
    return false
  }
}

function fileExists(filePath: string): boolean {
  try {
    return statSync(filePath).isFile()
  } catch {
    return false
  }
}

function normalizeRelative(value: string): string {
  return value.split(path.sep).join("/")
}
