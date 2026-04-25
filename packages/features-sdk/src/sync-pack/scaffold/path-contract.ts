import path from "node:path"

import type { StackScaffoldPlacement } from "../schema/stack-contract.schema.js"

export const syncPackScaffoldPathContractId = "FSDK-SCAFFOLD-PATH-001" as const

const windowsAbsolutePathPattern = /^[a-zA-Z]:[\\/]/u
const posixAbsolutePathPattern = /^\//u

export class RelativePosixPathContractError extends Error {
  readonly code = "invalid-relative-posix-path"
  readonly invariant = syncPackScaffoldPathContractId
  readonly doctrine = "ADR-0010/ATC-0007"
  readonly resolution: string

  constructor(label: string, value: string, resolution: string) {
    super(
      `${label} must be a workspace-relative POSIX path. Received "${value}".`
    )
    this.name = "RelativePosixPathContractError"
    this.resolution = resolution
  }
}

function normalizePosixPath(value: string): string {
  return value
    .trim()
    .replaceAll("\\", "/")
    .replace(/\/{2,}/gu, "/")
}

function isAbsolutePath(value: string): boolean {
  return (
    windowsAbsolutePathPattern.test(value) ||
    posixAbsolutePathPattern.test(value) ||
    path.win32.isAbsolute(value) ||
    path.posix.isAbsolute(value)
  )
}

export function assertRelativePosixPath(value: string, label: string): string {
  const normalizedPath = normalizePosixPath(value)

  if (normalizedPath.length === 0 || normalizedPath === ".") {
    throw new RelativePosixPathContractError(
      label,
      value,
      `${label} must point to a repo-relative workspace location.`
    )
  }

  if (isAbsolutePath(normalizedPath)) {
    throw new RelativePosixPathContractError(
      label,
      value,
      `${label} must stay workspace-relative; do not emit absolute filesystem paths.`
    )
  }

  const segments = normalizedPath.split("/")
  if (segments.some((segment) => segment === "" || segment === ".")) {
    throw new RelativePosixPathContractError(
      label,
      value,
      `${label} must use normalized POSIX segments without empty or current-directory markers.`
    )
  }

  if (segments.includes("..")) {
    throw new RelativePosixPathContractError(
      label,
      value,
      `${label} must not backtrack outside the workspace root.`
    )
  }

  return normalizedPath
}

export function toRelativePosixPath(options: {
  readonly workspaceRoot: string
  readonly targetPath: string
  readonly label: string
  readonly fallbackPath?: string
}): string {
  const relativePath = path.relative(options.workspaceRoot, options.targetPath)

  if (
    relativePath === "" ||
    relativePath === "." ||
    relativePath.startsWith("..") ||
    isAbsolutePath(relativePath)
  ) {
    if (options.fallbackPath) {
      return assertRelativePosixPath(options.fallbackPath, options.label)
    }

    throw new RelativePosixPathContractError(
      options.label,
      relativePath,
      `${options.label} must resolve to a workspace-relative POSIX path.`
    )
  }

  return assertRelativePosixPath(relativePath, options.label)
}

export function assertScaffoldPlacementPaths(
  placement: StackScaffoldPlacement
): StackScaffoldPlacement {
  return {
    planningPackDirectory: assertRelativePosixPath(
      placement.planningPackDirectory,
      "placement.planningPackDirectory"
    ),
    webFeatureDirectory: assertRelativePosixPath(
      placement.webFeatureDirectory,
      "placement.webFeatureDirectory"
    ),
    apiModuleDirectory: assertRelativePosixPath(
      placement.apiModuleDirectory,
      "placement.apiModuleDirectory"
    ),
    apiRouteFile: assertRelativePosixPath(
      placement.apiRouteFile,
      "placement.apiRouteFile"
    ),
  }
}
