import { readdirSync, readFileSync } from "node:fs"
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
    | "denied-directory-name"
    | "denied-file-stem"
    | "max-directory-depth"
    | "nested-shared"
  readonly path: string
  readonly message: string
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
  const violations: FilesystemGovernanceViolation[] = []

  for (const governedRoot of config.governedRoots) {
    const absoluteRoot = path.resolve(governedRoot.root)

    for (const filePath of walkFiles(
      absoluteRoot,
      config.ignoredDirectoryNames ?? []
    )) {
      const relativePath = normalizeRelative(
        path.relative(process.cwd(), filePath)
      )
      const relativeToRoot = normalizeRelative(
        path.relative(absoluteRoot, filePath)
      )
      const fileExtension = path.extname(filePath).toLowerCase()
      const fileStem = path.basename(filePath, fileExtension).toLowerCase()
      const directoryParts = normalizeRelative(path.dirname(relativeToRoot))
        .split("/")
        .filter(Boolean)

      for (const directoryPart of directoryParts) {
        if (config.deniedDirectoryNames?.includes(directoryPart)) {
          violations.push({
            rule: "denied-directory-name",
            path: relativePath,
            message: `Directory name "${directoryPart}" is denied by filesystem governance.`,
          })
          break
        }
      }

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

      if (directoryParts.length > governedRoot.maxDirectoryDepth) {
        violations.push({
          rule: "max-directory-depth",
          path: relativePath,
          message: `Directory depth ${directoryParts.length} exceeds max ${governedRoot.maxDirectoryDepth} under ${governedRoot.root}.`,
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
    }
  }

  return violations.sort((left, right) => left.path.localeCompare(right.path))
}

function walkFiles(
  directoryPath: string,
  ignoredDirectoryNames: readonly string[]
): readonly string[] {
  const discovered: string[] = []

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
      discovered.push(...walkFiles(absoluteEntryPath, ignoredDirectoryNames))
      continue
    }

    if (entry.isFile()) {
      discovered.push(absoluteEntryPath)
    }
  }

  return discovered
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

function normalizeRelative(value: string): string {
  return value.split(path.sep).join("/")
}
