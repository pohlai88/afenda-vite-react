import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

export interface GovernedRootConfig {
  readonly root: string
  readonly maxDirectoryDepth: number
  readonly allowedPromotedSharedRoots: readonly string[]
}

export interface FilesystemGovernanceConfig {
  readonly version: number
  readonly promotedSharedDirectories: readonly string[]
  readonly ignoredDirectoryNames?: readonly string[]
  readonly deniedDirectoryNames?: readonly string[]
  readonly deniedFileStems: readonly string[]
  readonly governedRoots: readonly GovernedRootConfig[]
}

export interface FilesystemGovernanceViolation {
  readonly rule:
    | "config-overlap"
    | "config-duplicate-root"
    | "config-invalid-promoted-root"
    | "denied-directory-name"
    | "denied-file-stem"
    | "governed-root-missing"
    | "max-directory-depth"
    | "nested-shared"
  readonly path: string
  readonly message: string
}

export interface GovernedRootSummary {
  readonly root: string
  readonly directoryCount: number
  readonly fileCount: number
  readonly violationCount: number
}

export interface FilesystemGovernanceEvaluation {
  readonly rootSummaries: readonly GovernedRootSummary[]
  readonly violations: readonly FilesystemGovernanceViolation[]
}

const DEFAULT_CONFIG_PATH = path.resolve(
  "rules/filesystem-governance/filesystem-governance.config.json"
)

export function loadFilesystemGovernanceConfig(
  configPath = DEFAULT_CONFIG_PATH
): FilesystemGovernanceConfig {
  return JSON.parse(
    readFileSync(configPath, "utf8")
  ) as FilesystemGovernanceConfig
}

export function collectFilesystemGovernanceViolations(
  config: FilesystemGovernanceConfig
): readonly FilesystemGovernanceViolation[] {
  return evaluateFilesystemGovernance(config).violations
}

export function evaluateFilesystemGovernance(
  config: FilesystemGovernanceConfig
): FilesystemGovernanceEvaluation {
  const violations: FilesystemGovernanceViolation[] = [
    ...collectFilesystemGovernanceConfigViolations(config),
  ]
  const rootSummaries: GovernedRootSummary[] = []

  for (const governedRoot of config.governedRoots) {
    const absoluteRoot = path.resolve(governedRoot.root)
    const normalizedRoot = normalizeRelative(governedRoot.root)

    if (!directoryExists(absoluteRoot)) {
      violations.push({
        rule: "governed-root-missing",
        path: normalizedRoot,
        message: `Governed root "${governedRoot.root}" does not exist.`,
      })
      rootSummaries.push({
        root: normalizedRoot,
        directoryCount: 0,
        fileCount: 0,
        violationCount: 1,
      })
      continue
    }

    const directoryViolationsBeforeRoot = violations.length
    const walkResult = walkDirectoryTree(
      absoluteRoot,
      config.ignoredDirectoryNames ?? []
    )

    for (const directoryPath of walkResult.directories) {
      violations.push(
        ...collectDirectoryViolations({
          config,
          governedRoot,
          absoluteRoot,
          directoryPath,
        })
      )
    }

    for (const filePath of walkResult.files) {
      violations.push(
        ...collectFileViolations({
          config,
          absoluteRoot,
          filePath,
        })
      )
    }

    rootSummaries.push({
      root: normalizedRoot,
      directoryCount: walkResult.directories.length,
      fileCount: walkResult.files.length,
      violationCount: violations.length - directoryViolationsBeforeRoot,
    })
  }

  return {
    rootSummaries,
    violations: violations.sort((left, right) =>
      left.path.localeCompare(right.path)
    ),
  }
}

function collectFilesystemGovernanceConfigViolations(
  config: FilesystemGovernanceConfig
): readonly FilesystemGovernanceViolation[] {
  const violations: FilesystemGovernanceViolation[] = []
  const normalizedRoots = config.governedRoots.map((root) =>
    normalizeRootPath(root.root)
  )
  const seenRoots = new Set<string>()

  for (const [index, governedRoot] of config.governedRoots.entries()) {
    const normalizedRoot = normalizedRoots[index]

    if (seenRoots.has(normalizedRoot)) {
      violations.push({
        rule: "config-duplicate-root",
        path: normalizedRoot,
        message: `Governed root "${governedRoot.root}" is duplicated in filesystem governance config.`,
      })
    }

    seenRoots.add(normalizedRoot)

    for (const promotedRoot of governedRoot.allowedPromotedSharedRoots) {
      if (!config.promotedSharedDirectories.includes(promotedRoot)) {
        violations.push({
          rule: "config-invalid-promoted-root",
          path: normalizedRoot,
          message: `Governed root "${governedRoot.root}" allows promoted root "${promotedRoot}", but it is not declared in promotedSharedDirectories.`,
        })
      }
    }
  }

  for (const [index, leftRoot] of normalizedRoots.entries()) {
    for (const rightRoot of normalizedRoots.slice(index + 1)) {
      if (
        leftRoot.startsWith(`${rightRoot}/`) ||
        rightRoot.startsWith(`${leftRoot}/`)
      ) {
        const overlappingRoot =
          leftRoot.length >= rightRoot.length ? leftRoot : rightRoot

        violations.push({
          rule: "config-overlap",
          path: overlappingRoot,
          message: `Governed roots "${leftRoot}" and "${rightRoot}" overlap. Governed roots must stay disjoint to avoid duplicate scanning and conflicting policy.`,
        })
      }
    }
  }

  return violations
}

function collectDirectoryViolations({
  config,
  governedRoot,
  absoluteRoot,
  directoryPath,
}: {
  config: FilesystemGovernanceConfig
  governedRoot: GovernedRootConfig
  absoluteRoot: string
  directoryPath: string
}): readonly FilesystemGovernanceViolation[] {
  const violations: FilesystemGovernanceViolation[] = []
  const relativePath = normalizeRelative(
    path.relative(process.cwd(), directoryPath)
  )
  const relativeToRoot = normalizeRelative(
    path.relative(absoluteRoot, directoryPath)
  )
  const directoryParts = relativeToRoot.split("/").filter(Boolean)
  const directoryName = path.basename(directoryPath).toLowerCase()

  if (config.deniedDirectoryNames?.includes(directoryName)) {
    violations.push({
      rule: "denied-directory-name",
      path: relativePath,
      message: `Directory name "${directoryName}" is denied by filesystem governance.`,
    })
  }

  if (directoryParts.length > governedRoot.maxDirectoryDepth) {
    violations.push({
      rule: "max-directory-depth",
      path: relativePath,
      message: `Directory depth ${String(directoryParts.length)} exceeds max ${String(governedRoot.maxDirectoryDepth)} under ${governedRoot.root}.`,
    })
  }

  const sharedDirectoryViolation = findNestedSharedDirectoryViolation({
    directoryParts,
    promotedSharedDirectories: config.promotedSharedDirectories,
    allowedPromotedSharedRoots: governedRoot.allowedPromotedSharedRoots,
  })

  if (sharedDirectoryViolation !== null) {
    violations.push({
      rule: "nested-shared",
      path: relativePath,
      message: sharedDirectoryViolation,
    })
  }

  return violations
}

function collectFileViolations({
  config,
  absoluteRoot,
  filePath,
}: {
  config: FilesystemGovernanceConfig
  absoluteRoot: string
  filePath: string
}): readonly FilesystemGovernanceViolation[] {
  const violations: FilesystemGovernanceViolation[] = []
  const relativePath = normalizeRelative(path.relative(process.cwd(), filePath))
  const fileExtension = path.extname(filePath).toLowerCase()
  const fileStem = path.basename(filePath, fileExtension).toLowerCase()

  if (
    isGovernedSourceFileExtension(fileExtension) &&
    config.deniedFileStems.includes(fileStem)
  ) {
    violations.push({
      rule: "denied-file-stem",
      path: relativePath,
      message: `File stem "${fileStem}" is denied by filesystem governance.`,
    })
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

function isGovernedSourceFileExtension(extension: string): boolean {
  return [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".mjs",
    ".cjs",
    ".mts",
    ".cts",
    ".md",
    ".mdx",
  ].includes(extension)
}

function findNestedSharedDirectoryViolation({
  directoryParts,
  promotedSharedDirectories,
  allowedPromotedSharedRoots,
}: {
  directoryParts: readonly string[]
  promotedSharedDirectories: readonly string[]
  allowedPromotedSharedRoots: readonly string[]
}): string | null {
  let seenPromotedBoundary = false

  for (const [index, part] of directoryParts.entries()) {
    if (!promotedSharedDirectories.includes(part)) {
      continue
    }

    const isAllowedPromotedRoot =
      index === 0 && allowedPromotedSharedRoots.includes(part)

    if (isAllowedPromotedRoot && !seenPromotedBoundary) {
      seenPromotedBoundary = true
      continue
    }

    return `Nested promoted shared directory "${part}" is not allowed below the governed root.`
  }

  return null
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

function normalizeRootPath(value: string): string {
  return normalizeRelative(value).replace(/\/+$/, "")
}
