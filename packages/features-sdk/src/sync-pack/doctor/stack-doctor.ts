import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import {
  countFindings,
  createFindingRemediation,
  type SyncPackFinding,
  type SyncPackFindingResult,
  type SyncPackFindingSeverity,
} from "../finding.js"
import { readWorkspaceCatalogVersions } from "../scaffold/workspace-catalog.js"
import { findWorkspaceRoot } from "../workspace.js"

export type SyncPackDoctorSeverity = SyncPackFindingSeverity

export type SyncPackDoctorFinding = SyncPackFinding

export interface SyncPackDoctorResult extends SyncPackFindingResult<SyncPackDoctorFinding> {
  readonly workspaceRoot: string
  readonly checkedPackageCount: number
}

export interface RunSyncPackDoctorOptions {
  readonly workspaceRoot?: string
  readonly targetPath?: string
}

type DependencySectionName =
  | "dependencies"
  | "devDependencies"
  | "peerDependencies"
  | "optionalDependencies"

type PackageJson = {
  readonly name?: string
  readonly dependencies?: Record<string, string>
  readonly devDependencies?: Record<string, string>
  readonly peerDependencies?: Record<string, string>
  readonly optionalDependencies?: Record<string, string>
}

interface PackageInfo {
  readonly packageJsonPath: string
  readonly packageJson: PackageJson
}

const dependencySectionNames = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const satisfies readonly DependencySectionName[]

const guardedMajorVersions: Record<string, number> = {
  zod: 4,
  tailwindcss: 4,
  "@tailwindcss/vite": 4,
  "@tailwindcss/cli": 4,
}

const findingRemediationDocPath =
  "docs/sync-pack/finding-remediation-catalog.md" as const
const doctorCommand = "pnpm run feature-sync:doctor" as const

function parseMajorVersion(versionSpec: string): number | undefined {
  const match = versionSpec.match(/\d+/)
  return match ? Number(match[0]) : undefined
}

function dependencyEntries(packageJson: PackageJson): Array<{
  readonly section: DependencySectionName
  readonly name: string
  readonly versionSpec: string
}> {
  return dependencySectionNames.flatMap((section) =>
    Object.entries(packageJson[section] ?? {}).map(([name, versionSpec]) => ({
      section,
      name,
      versionSpec,
    }))
  )
}

async function readPackageInfo(packageJsonPath: string): Promise<PackageInfo> {
  const rawPackageJson = await readFile(packageJsonPath, "utf8")
  return {
    packageJsonPath,
    packageJson: JSON.parse(rawPackageJson) as PackageJson,
  }
}

async function findWorkspacePackageJsonFiles(
  workspaceRoot: string
): Promise<string[]> {
  const packageJsonFiles: string[] = []

  for (const workspaceDirectory of ["apps", "packages"]) {
    const absoluteWorkspaceDirectory = path.join(
      workspaceRoot,
      workspaceDirectory
    )

    if (!existsSync(absoluteWorkspaceDirectory)) {
      continue
    }

    const entries = await readdir(absoluteWorkspaceDirectory, {
      withFileTypes: true,
    })

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      const packageJsonPath = path.join(
        absoluteWorkspaceDirectory,
        entry.name,
        "package.json"
      )

      if (existsSync(packageJsonPath)) {
        packageJsonFiles.push(packageJsonPath)
      }
    }
  }

  return packageJsonFiles.sort()
}

async function resolveTargetPackageJsonFiles(
  targetPathInput: string
): Promise<string[]> {
  const targetPath = path.resolve(targetPathInput)
  const targetPackageJsonPath = path.join(targetPath, "package.json")

  if (existsSync(targetPackageJsonPath)) {
    return [targetPackageJsonPath]
  }

  if (targetPath.endsWith("package.json") && existsSync(targetPath)) {
    return [targetPath]
  }

  return []
}

async function resolvePackageJsonFiles(
  workspaceRoot: string,
  targetPath?: string
): Promise<string[]> {
  if (targetPath) {
    return resolveTargetPackageJsonFiles(targetPath)
  }

  const rootPackageJsonPath = path.join(workspaceRoot, "package.json")
  const workspacePackageJsonFiles =
    await findWorkspacePackageJsonFiles(workspaceRoot)

  return [rootPackageJsonPath, ...workspacePackageJsonFiles].filter(
    (filePath) => existsSync(filePath)
  )
}

function resolveVersionSpec(
  versionSpec: string,
  catalogVersions: Record<string, string>,
  dependencyName: string
): string {
  if (versionSpec === "catalog:") {
    return catalogVersions[dependencyName] ?? versionSpec
  }

  return versionSpec
}

function describeDependencyField(
  entry: ReturnType<typeof dependencyEntries>[number]
): string {
  return `${entry.section}.${entry.name}`
}

function createDoctorRemediation(
  action: string
): ReturnType<typeof createFindingRemediation> {
  return createFindingRemediation(action, {
    command: doctorCommand,
    doc: findingRemediationDocPath,
  })
}

function checkGuardedMajorVersion(
  entry: ReturnType<typeof dependencyEntries>[number],
  packageJsonPath: string,
  catalogVersions: Record<string, string>
): SyncPackDoctorFinding[] {
  const expectedMajorVersion = guardedMajorVersions[entry.name]

  if (!expectedMajorVersion) {
    return []
  }

  const resolvedVersionSpec = resolveVersionSpec(
    entry.versionSpec,
    catalogVersions,
    entry.name
  )
  const actualMajorVersion = parseMajorVersion(resolvedVersionSpec)

  if (actualMajorVersion === expectedMajorVersion) {
    return []
  }

  return [
    {
      severity: "error",
      code: "guarded-major-version-mismatch",
      filePath: packageJsonPath,
      message: `${entry.name} in ${entry.section} resolves to ${resolvedVersionSpec}; expected major ${expectedMajorVersion}.`,
      remediation: createDoctorRemediation(
        `Edit ${packageJsonPath} so ${describeDependencyField(entry)} resolves to major ${expectedMajorVersion}, then rerun Sync-Pack doctor.`
      ),
    },
  ]
}

function checkCatalogDrift(
  entry: ReturnType<typeof dependencyEntries>[number],
  packageJsonPath: string,
  catalogVersions: Record<string, string>
): SyncPackDoctorFinding[] {
  if (!catalogVersions[entry.name] || entry.versionSpec === "catalog:") {
    return []
  }

  const catalogMajorVersion = parseMajorVersion(catalogVersions[entry.name])
  const declaredMajorVersion = parseMajorVersion(entry.versionSpec)

  if (
    catalogMajorVersion !== undefined &&
    declaredMajorVersion !== undefined &&
    catalogMajorVersion !== declaredMajorVersion
  ) {
    return [
      {
        severity: "error",
        code: "catalog-major-version-drift",
        filePath: packageJsonPath,
        message: `${entry.name} in ${entry.section} declares ${entry.versionSpec}; workspace catalog is ${catalogVersions[entry.name]}.`,
        remediation: createDoctorRemediation(
          `Edit ${packageJsonPath} so ${describeDependencyField(entry)} uses catalog: or matches ${catalogVersions[entry.name]}, then rerun Sync-Pack doctor.`
        ),
      },
    ]
  }

  return [
    {
      severity: "warning",
      code: "catalog-not-used",
      filePath: packageJsonPath,
      message: `${entry.name} is available in the workspace catalog; prefer catalog: instead of ${entry.versionSpec}.`,
      remediation: createDoctorRemediation(
        `Edit ${packageJsonPath} and change ${describeDependencyField(entry)} from ${entry.versionSpec} to catalog:, then rerun Sync-Pack doctor.`
      ),
    },
  ]
}

function checkPackage(
  packageInfo: PackageInfo,
  catalogVersions: Record<string, string>
): SyncPackDoctorFinding[] {
  const entries = dependencyEntries(packageInfo.packageJson)

  return entries.flatMap((entry) => [
    ...checkGuardedMajorVersion(
      entry,
      packageInfo.packageJsonPath,
      catalogVersions
    ),
    ...checkCatalogDrift(entry, packageInfo.packageJsonPath, catalogVersions),
  ])
}

export async function runSyncPackDoctor(
  options: RunSyncPackDoctorOptions = {}
): Promise<SyncPackDoctorResult> {
  const workspaceRoot = options.workspaceRoot ?? findWorkspaceRoot()
  const catalogVersions = await readWorkspaceCatalogVersions(workspaceRoot)
  const packageJsonFiles = await resolvePackageJsonFiles(
    workspaceRoot,
    options.targetPath
  )
  const packageInfos = await Promise.all(packageJsonFiles.map(readPackageInfo))
  const findings = packageInfos.flatMap((packageInfo) =>
    checkPackage(packageInfo, catalogVersions)
  )
  const { errorCount, warningCount } = countFindings(findings)

  return {
    workspaceRoot,
    checkedPackageCount: packageInfos.length,
    findings,
    errorCount,
    warningCount,
  }
}
