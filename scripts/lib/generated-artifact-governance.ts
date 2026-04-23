import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

export interface GeneratedArtifactRootConfig {
  readonly root: string
  readonly maxDirectoryDepth: number
  readonly allowedFileExtensions: readonly string[]
  readonly allowedRelativePaths?: readonly string[]
  readonly requiredCompanionFiles?: readonly {
    readonly source: string
    readonly companion: string
  }[]
}

export interface GeneratedArtifactGovernanceConfig {
  readonly version: number
  readonly ignoredDirectoryNames?: readonly string[]
  readonly mixedAuthoringRoots?: readonly {
    readonly root: string
    readonly allowedGeneratedSubroots?: readonly string[]
  }[]
  readonly generatedRoots: readonly GeneratedArtifactRootConfig[]
}

export interface GeneratedArtifactGovernanceViolation {
  readonly rule:
    | "config-duplicate-root"
    | "config-duplicate-mixed-authoring-root"
    | "config-duplicate-allowed-relative-path"
    | "config-duplicate-companion-source"
    | "generated-root-blocked-by-mixed-authoring-root"
    | "generated-root-missing"
    | "max-directory-depth"
    | "unexpected-file-extension"
    | "unexpected-relative-path"
    | "missing-required-companion"
  readonly path: string
  readonly message: string
}

export interface GeneratedArtifactRootSummary {
  readonly root: string
  readonly directoryCount: number
  readonly fileCount: number
  readonly violationCount: number
}

export interface GeneratedArtifactGovernanceEvaluation {
  readonly rootSummaries: readonly GeneratedArtifactRootSummary[]
  readonly violations: readonly GeneratedArtifactGovernanceViolation[]
}

const DEFAULT_CONFIG_PATH = path.resolve(
  "rules/generated-artifact-governance/generated-artifact-governance.config.json"
)

export function loadGeneratedArtifactGovernanceConfig(
  configPath = DEFAULT_CONFIG_PATH
): GeneratedArtifactGovernanceConfig {
  return JSON.parse(
    readFileSync(configPath, "utf8")
  ) as GeneratedArtifactGovernanceConfig
}

export function evaluateGeneratedArtifactGovernance(
  config: GeneratedArtifactGovernanceConfig
): GeneratedArtifactGovernanceEvaluation {
  const violations: GeneratedArtifactGovernanceViolation[] = [
    ...collectGeneratedArtifactConfigViolations(config),
  ]
  const rootSummaries: GeneratedArtifactRootSummary[] = []

  for (const generatedRoot of config.generatedRoots) {
    const absoluteRoot = path.resolve(generatedRoot.root)
    const normalizedRoot = normalizeRelative(generatedRoot.root)

    if (!directoryExists(absoluteRoot)) {
      violations.push({
        rule: "generated-root-missing",
        path: normalizedRoot,
        message: `Generated artifact root "${generatedRoot.root}" does not exist.`,
      })
      rootSummaries.push({
        root: normalizedRoot,
        directoryCount: 0,
        fileCount: 0,
        violationCount: 1,
      })
      continue
    }

    const violationsBeforeRoot = violations.length
    const walkResult = walkDirectoryTree(
      absoluteRoot,
      config.ignoredDirectoryNames ?? []
    )
    const relativeFilePaths = walkResult.files.map((filePath) =>
      normalizeRelative(path.relative(absoluteRoot, filePath))
    )
    const allowedRelativePaths = generatedRoot.allowedRelativePaths
      ? new Set(generatedRoot.allowedRelativePaths)
      : null

    for (const directoryPath of walkResult.directories) {
      const relativeToRoot = normalizeRelative(
        path.relative(absoluteRoot, directoryPath)
      )
      const directoryParts = relativeToRoot.split("/").filter(Boolean)

      if (directoryParts.length > generatedRoot.maxDirectoryDepth) {
        violations.push({
          rule: "max-directory-depth",
          path: normalizeRelative(path.relative(process.cwd(), directoryPath)),
          message: `Directory depth ${String(directoryParts.length)} exceeds max ${String(generatedRoot.maxDirectoryDepth)} under ${generatedRoot.root}.`,
        })
      }
    }

    for (const filePath of walkResult.files) {
      const extension = path.extname(filePath).toLowerCase()
      const relativeFilePath = normalizeRelative(
        path.relative(absoluteRoot, filePath)
      )
      if (!generatedRoot.allowedFileExtensions.includes(extension)) {
        violations.push({
          rule: "unexpected-file-extension",
          path: normalizeRelative(path.relative(process.cwd(), filePath)),
          message: `File extension "${extension || "<none>"}" is not allowed under generated artifact root "${generatedRoot.root}".`,
        })
      }
      if (
        allowedRelativePaths !== null &&
        !allowedRelativePaths.has(relativeFilePath)
      ) {
        violations.push({
          rule: "unexpected-relative-path",
          path: normalizeRelative(path.relative(process.cwd(), filePath)),
          message: `File "${relativeFilePath}" is not allowlisted under generated artifact root "${generatedRoot.root}".`,
        })
      }
    }

    for (const requirement of generatedRoot.requiredCompanionFiles ?? []) {
      if (
        relativeFilePaths.includes(requirement.source) &&
        !relativeFilePaths.includes(requirement.companion)
      ) {
        violations.push({
          rule: "missing-required-companion",
          path: `${normalizedRoot}/${requirement.companion}`,
          message: `Generated artifact "${requirement.source}" requires companion "${requirement.companion}".`,
        })
      }
    }

    rootSummaries.push({
      root: normalizedRoot,
      directoryCount: walkResult.directories.length,
      fileCount: walkResult.files.length,
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

function collectGeneratedArtifactConfigViolations(
  config: GeneratedArtifactGovernanceConfig
): readonly GeneratedArtifactGovernanceViolation[] {
  const violations: GeneratedArtifactGovernanceViolation[] = []
  const seenRoots = new Set<string>()
  const seenMixedAuthoringRoots = new Set<string>()

  for (const mixedAuthoringRoot of config.mixedAuthoringRoots ?? []) {
    const normalizedMixedRoot = normalizeRelative(mixedAuthoringRoot.root)
    if (seenMixedAuthoringRoots.has(normalizedMixedRoot)) {
      violations.push({
        rule: "config-duplicate-mixed-authoring-root",
        path: normalizedMixedRoot,
        message: `Mixed-authoring root "${mixedAuthoringRoot.root}" is duplicated in generated-artifact governance config.`,
      })
    }
    seenMixedAuthoringRoots.add(normalizedMixedRoot)
  }

  for (const generatedRoot of config.generatedRoots) {
    const normalizedRoot = normalizeRelative(generatedRoot.root)
    if (seenRoots.has(normalizedRoot)) {
      violations.push({
        rule: "config-duplicate-root",
        path: normalizedRoot,
        message: `Generated artifact root "${generatedRoot.root}" is duplicated in generated-artifact governance config.`,
      })
    }
    seenRoots.add(normalizedRoot)

    for (const mixedAuthoringRoot of config.mixedAuthoringRoots ?? []) {
      const normalizedMixedRoot = normalizeRelative(mixedAuthoringRoot.root)
      if (
        normalizedRoot === normalizedMixedRoot ||
        normalizedRoot.startsWith(`${normalizedMixedRoot}/`)
      ) {
        const relativeGeneratedSubroot =
          normalizedRoot === normalizedMixedRoot
            ? ""
            : normalizedRoot.slice(normalizedMixedRoot.length + 1)
        const allowedGeneratedSubroots = new Set(
          mixedAuthoringRoot.allowedGeneratedSubroots ?? []
        )
        if (
          relativeGeneratedSubroot === "" ||
          !allowedGeneratedSubroots.has(relativeGeneratedSubroot)
        ) {
          violations.push({
            rule: "generated-root-blocked-by-mixed-authoring-root",
            path: normalizedRoot,
            message: `Generated artifact root "${generatedRoot.root}" is nested inside mixed-authoring root "${mixedAuthoringRoot.root}" without an explicit allowed generated subroot carve-out.`,
          })
        }
      }
    }

    const seenRelativePaths = new Set<string>()
    for (const relativePath of generatedRoot.allowedRelativePaths ?? []) {
      if (seenRelativePaths.has(relativePath)) {
        violations.push({
          rule: "config-duplicate-allowed-relative-path",
          path: `${normalizedRoot}/${relativePath}`,
          message: `Generated artifact root "${generatedRoot.root}" duplicates allowlisted relative path "${relativePath}".`,
        })
      }
      seenRelativePaths.add(relativePath)
    }

    const seenCompanionSources = new Set<string>()
    for (const requirement of generatedRoot.requiredCompanionFiles ?? []) {
      if (seenCompanionSources.has(requirement.source)) {
        violations.push({
          rule: "config-duplicate-companion-source",
          path: `${normalizedRoot}/${requirement.source}`,
          message: `Generated artifact root "${generatedRoot.root}" duplicates companion requirement for source "${requirement.source}".`,
        })
      }
      seenCompanionSources.add(requirement.source)
    }
  }

  return violations
}

function walkDirectoryTree(
  directoryPath: string,
  ignoredDirectoryNames: readonly string[]
): {
  readonly directories: readonly string[]
  readonly files: readonly string[]
} {
  const directories: string[] = []
  const files: string[] = []

  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    if (
      entry.name.startsWith(".") ||
      entry.name === "node_modules" ||
      ignoredDirectoryNames.includes(entry.name)
    ) {
      continue
    }

    const absoluteEntryPath = path.join(directoryPath, entry.name)

    if (entry.isDirectory()) {
      directories.push(absoluteEntryPath)
      const nested = walkDirectoryTree(absoluteEntryPath, ignoredDirectoryNames)
      directories.push(...nested.directories)
      files.push(...nested.files)
      continue
    }

    if (entry.isFile()) {
      files.push(absoluteEntryPath)
    }
  }

  return { directories, files }
}

function directoryExists(directoryPath: string): boolean {
  try {
    return statSync(directoryPath).isDirectory()
  } catch {
    return false
  }
}

function normalizeRelative(value: string): string {
  return value.split(path.sep).join("/")
}
