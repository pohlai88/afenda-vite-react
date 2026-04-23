import fs from "node:fs/promises"
import path from "node:path"

import type { AfendaConfig } from "../config/afenda-config.js"
import { toPosixPath } from "../config/afenda-config.js"

export interface AfendaWorkspaceGovernanceIssue {
  readonly rule:
    | "root-topology"
    | "package-topology"
    | "package-root"
    | "feature-template"
    | "shared-package-template"
    | "web-client-src"
  readonly path: string
  readonly message: string
}

export async function evaluateAfendaWorkspaceGovernance(
  config: AfendaConfig,
  repoRoot: string
): Promise<readonly AfendaWorkspaceGovernanceIssue[]> {
  const issues: AfendaWorkspaceGovernanceIssue[] = []

  issues.push(...(await evaluateRootTopologyGovernance(config, repoRoot)))
  issues.push(...(await evaluatePackageTopologyGovernance(config, repoRoot)))
  issues.push(...(await evaluatePackageRootGovernance(config, repoRoot)))
  issues.push(...(await evaluateFeatureTemplateGovernance(config, repoRoot)))
  issues.push(
    ...(await evaluateSharedPackageTemplateGovernance(config, repoRoot))
  )
  issues.push(...(await evaluateWebClientSrcGovernance(config, repoRoot)))

  return issues.sort((left, right) => left.path.localeCompare(right.path))
}

async function evaluateRootTopologyGovernance(
  config: AfendaConfig,
  repoRoot: string
): Promise<readonly AfendaWorkspaceGovernanceIssue[]> {
  const issues: AfendaWorkspaceGovernanceIssue[] = []
  const rootTopology = config.workspaceGovernance.rootTopology
  const allowedRootDirectorySet = new Set(rootTopology.allowedRootDirectories)
  const allowedHiddenRootDirectorySet = new Set(
    rootTopology.allowedHiddenRootDirectories
  )
  const storageDirectorySet = new Set(rootTopology.storageDirectories)

  pushDisjointSetIssues(
    rootTopology.allowedRootDirectories,
    rootTopology.allowedHiddenRootDirectories,
    "workspaceGovernance.rootTopology.allowedRootDirectories",
    "workspaceGovernance.rootTopology.allowedHiddenRootDirectories",
    issues
  )
  pushDisjointSetIssues(
    rootTopology.allowedRootDirectories,
    rootTopology.storageDirectories,
    "workspaceGovernance.rootTopology.allowedRootDirectories",
    "workspaceGovernance.rootTopology.storageDirectories",
    issues
  )
  pushDisjointSetIssues(
    rootTopology.allowedHiddenRootDirectories,
    rootTopology.storageDirectories,
    "workspaceGovernance.rootTopology.allowedHiddenRootDirectories",
    "workspaceGovernance.rootTopology.storageDirectories",
    issues
  )

  for (const directory of rootTopology.primaryProductDirectories) {
    const exists = await pathExists(path.join(repoRoot, directory), "directory")
    if (!exists) {
      issues.push({
        rule: "root-topology",
        path: directory,
        message: `Configured primary product directory "${directory}" does not exist.`,
      })
    }
  }

  const rootEntries = await fs.readdir(repoRoot, { withFileTypes: true })
  const rootDirectories = rootEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))

  for (const directoryName of rootDirectories) {
    if (directoryName.startsWith(".")) {
      if (
        !allowedHiddenRootDirectorySet.has(directoryName) &&
        !storageDirectorySet.has(directoryName)
      ) {
        issues.push({
          rule: "root-topology",
          path: directoryName,
          message: `Hidden root directory "${directoryName}" is not allowed by workspaceGovernance.rootTopology.`,
        })
      }
      continue
    }

    if (
      !allowedRootDirectorySet.has(directoryName) &&
      !storageDirectorySet.has(directoryName)
    ) {
      issues.push({
        rule: "root-topology",
        path: directoryName,
        message: `Root directory "${directoryName}" is not allowed by workspaceGovernance.rootTopology.`,
      })
    }
  }

  for (const directoryName of rootTopology.primaryProductDirectories) {
    if (!allowedRootDirectorySet.has(directoryName)) {
      issues.push({
        rule: "root-topology",
        path: directoryName,
        message: `Primary product directory "${directoryName}" must also be listed in allowedRootDirectories.`,
      })
    }
    if (storageDirectorySet.has(directoryName)) {
      issues.push({
        rule: "root-topology",
        path: directoryName,
        message: `Primary product directory "${directoryName}" must not be listed in storageDirectories.`,
      })
    }
    if (allowedHiddenRootDirectorySet.has(directoryName)) {
      issues.push({
        rule: "root-topology",
        path: directoryName,
        message: `Primary product directory "${directoryName}" must not be listed in allowedHiddenRootDirectories.`,
      })
    }
  }

  for (const directoryName of rootTopology.storageDirectories) {
    const exists = await pathExists(
      path.join(repoRoot, directoryName),
      "directory"
    )
    if (!exists) {
      issues.push({
        rule: "root-topology",
        path: directoryName,
        message: `Configured storage directory "${directoryName}" does not exist.`,
      })
    }
  }

  for (const fileName of rootTopology.requiredRootFiles) {
    const exists = await pathExists(path.join(repoRoot, fileName), "file")
    if (!exists) {
      issues.push({
        rule: "root-topology",
        path: fileName,
        message: `Required root file "${fileName}" is missing.`,
      })
    }
  }

  return issues
}

async function evaluatePackageTopologyGovernance(
  config: AfendaConfig,
  repoRoot: string
): Promise<readonly AfendaWorkspaceGovernanceIssue[]> {
  const issues: AfendaWorkspaceGovernanceIssue[] = []
  const packageTopology = config.workspaceGovernance.packageTopology
  const allowedManifestlessDirectories = new Set(
    packageTopology.allowedManifestlessDirectories
  )

  for (const workspaceRootDirectory of packageTopology.workspaceRootDirectories) {
    const workspaceRootPath = path.join(repoRoot, workspaceRootDirectory)
    const rootExists = await pathExists(workspaceRootPath, "directory")

    if (!rootExists) {
      issues.push({
        rule: "package-topology",
        path: workspaceRootDirectory,
        message: `Workspace root "${workspaceRootDirectory}" does not exist.`,
      })
      continue
    }

    const entries = await fs.readdir(workspaceRootPath, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) {
        continue
      }

      const relativePackageDirectory = toPosixPath(
        path.join(workspaceRootDirectory, entry.name)
      )
      if (allowedManifestlessDirectories.has(relativePackageDirectory)) {
        continue
      }

      const packageJsonExists = await pathExists(
        path.join(workspaceRootPath, entry.name, "package.json"),
        "file"
      )
      if (!packageJsonExists) {
        issues.push({
          rule: "package-topology",
          path: relativePackageDirectory,
          message: `Workspace package directory "${relativePackageDirectory}" must contain a package.json manifest or be explicitly allowlisted.`,
        })
      }
    }
  }

  return issues
}

async function evaluatePackageRootGovernance(
  config: AfendaConfig,
  repoRoot: string
): Promise<readonly AfendaWorkspaceGovernanceIssue[]> {
  const issues: AfendaWorkspaceGovernanceIssue[] = []
  const packageRootGovernance = config.workspaceGovernance.packageRoots
  const profileMap = new Map<
    string,
    (typeof packageRootGovernance.profiles)[number]
  >()
  const packageDefinitionMap = new Map<
    string,
    (typeof packageRootGovernance.packages)[number]
  >()

  for (const profile of packageRootGovernance.profiles) {
    if (profileMap.has(profile.name)) {
      issues.push({
        rule: "package-root",
        path: `profile:${profile.name}`,
        message: `workspaceGovernance.packageRoots.profiles contains duplicate profile "${profile.name}".`,
      })
    }
    profileMap.set(profile.name, profile)
  }

  for (const packageDefinition of packageRootGovernance.packages) {
    const normalizedPath = toPosixPath(packageDefinition.path)
    if (!profileMap.has(packageDefinition.profile)) {
      issues.push({
        rule: "package-root",
        path: normalizedPath,
        message: `workspaceGovernance.packageRoots.packages entry "${normalizedPath}" references unknown profile "${packageDefinition.profile}".`,
      })
    }
    if (packageDefinitionMap.has(normalizedPath)) {
      issues.push({
        rule: "package-root",
        path: normalizedPath,
        message: `workspaceGovernance.packageRoots.packages contains duplicate path "${normalizedPath}".`,
      })
    }
    packageDefinitionMap.set(normalizedPath, packageDefinition)
  }

  const discoveredPackageDirectories = await collectWorkspacePackageDirectories(
    config,
    repoRoot
  )

  for (const packageDirectory of discoveredPackageDirectories) {
    if (!packageDefinitionMap.has(packageDirectory)) {
      issues.push({
        rule: "package-root",
        path: packageDirectory,
        message: `Workspace package directory "${packageDirectory}" must be declared in workspaceGovernance.packageRoots.packages.`,
      })
    }
  }

  for (const [packageDirectory, packageDefinition] of packageDefinitionMap) {
    if (!discoveredPackageDirectories.includes(packageDirectory)) {
      issues.push({
        rule: "package-root",
        path: packageDirectory,
        message: `workspaceGovernance.packageRoots.packages entry "${packageDirectory}" does not match a discovered workspace package directory.`,
      })
      continue
    }

    const profile = profileMap.get(packageDefinition.profile)
    if (!profile) {
      continue
    }

    const packageRootPath = path.join(repoRoot, packageDirectory)
    const allowedDirectories = new Set([
      ...profile.allowedDirectories,
      ...packageDefinition.extraAllowedDirectories,
    ])
    const allowedFiles = new Set([
      ...profile.allowedFiles,
      ...packageDefinition.extraAllowedFiles,
    ])
    const entries = await fs.readdir(packageRootPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory() && !allowedDirectories.has(entry.name)) {
        issues.push({
          rule: "package-root",
          path: `${packageDirectory}/${entry.name}`,
          message: `Package root "${packageDirectory}" contains disallowed directory "${entry.name}/".`,
        })
      }

      if (entry.isFile() && !allowedFiles.has(entry.name)) {
        issues.push({
          rule: "package-root",
          path: `${packageDirectory}/${entry.name}`,
          message: `Package root "${packageDirectory}" contains disallowed file "${entry.name}".`,
        })
      }
    }
  }

  return issues
}

async function evaluateFeatureTemplateGovernance(
  config: AfendaConfig,
  repoRoot: string
): Promise<readonly AfendaWorkspaceGovernanceIssue[]> {
  const issues: AfendaWorkspaceGovernanceIssue[] = []
  const featureTemplate = config.workspaceGovernance.featureTemplate
  const featuresRootPath = path.join(repoRoot, featureTemplate.featuresRoot)
  const featuresRootExists = await pathExists(featuresRootPath, "directory")

  if (!featuresRootExists) {
    return issues
  }

  const entries = await fs.readdir(featuresRootPath, { withFileTypes: true })
  const featureDirectories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))

  if (
    !featureTemplate.enforceWhenFeatureExists ||
    featureDirectories.length === 0
  ) {
    return issues
  }

  for (const featureDirectory of featureDirectories) {
    const featureRoot = path.join(featuresRootPath, featureDirectory)

    for (const requiredDirectory of featureTemplate.requiredDirectories) {
      const exists = await pathExists(
        path.join(featureRoot, requiredDirectory),
        "directory"
      )
      if (!exists) {
        issues.push({
          rule: "feature-template",
          path: `${featureTemplate.featuresRoot}/${featureDirectory}/${requiredDirectory}`,
          message: `Feature "${featureDirectory}" must include "${requiredDirectory}/" per workspaceGovernance.featureTemplate.`,
        })
      }
    }

    for (const requiredFile of featureTemplate.requiredFiles) {
      const exists = await pathExists(
        path.join(featureRoot, requiredFile),
        "file"
      )
      if (!exists) {
        issues.push({
          rule: "feature-template",
          path: `${featureTemplate.featuresRoot}/${featureDirectory}/${requiredFile}`,
          message: `Feature "${featureDirectory}" must include "${requiredFile}" per workspaceGovernance.featureTemplate.`,
        })
      }
    }
  }

  return issues
}

async function evaluateSharedPackageTemplateGovernance(
  config: AfendaConfig,
  repoRoot: string
): Promise<readonly AfendaWorkspaceGovernanceIssue[]> {
  const issues: AfendaWorkspaceGovernanceIssue[] = []
  const sharedPackageTemplate = config.workspaceGovernance.sharedPackageTemplate
  const sharedPackagePath = path.join(
    repoRoot,
    sharedPackageTemplate.packagePath
  )
  const sharedPackageExists = await pathExists(sharedPackagePath, "directory")

  if (
    !sharedPackageExists ||
    !sharedPackageTemplate.requireDirectoriesWhenPackageExists
  ) {
    return issues
  }

  for (const requiredDirectory of sharedPackageTemplate.requiredDirectories) {
    const exists = await pathExists(
      path.join(sharedPackagePath, requiredDirectory),
      "directory"
    )
    if (!exists) {
      issues.push({
        rule: "shared-package-template",
        path: `${sharedPackageTemplate.packagePath}/${requiredDirectory}`,
        message: `Shared package "${sharedPackageTemplate.packagePath}" must include "${requiredDirectory}/" per workspaceGovernance.sharedPackageTemplate.`,
      })
    }
  }

  return issues
}

async function evaluateWebClientSrcGovernance(
  config: AfendaConfig,
  repoRoot: string
): Promise<readonly AfendaWorkspaceGovernanceIssue[]> {
  const issues: AfendaWorkspaceGovernanceIssue[] = []
  const webClientSrc = config.workspaceGovernance.webClientSrc
  if (!webClientSrc.enforce) {
    return issues
  }

  const srcPath = path.join(repoRoot, webClientSrc.srcRoot)
  const srcExists = await pathExists(srcPath, "directory")
  if (!srcExists) {
    issues.push({
      rule: "web-client-src",
      path: webClientSrc.srcRoot,
      message: `Web client src "${webClientSrc.srcRoot}" must exist (workspaceGovernance.webClientSrc).`,
    })
    return issues
  }

  const entries = await fs.readdir(srcPath, { withFileTypes: true })
  const topLevelDirs = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
  const expected = [...webClientSrc.allowedTopLevelDirectories].sort(
    (left, right) => left.localeCompare(right)
  )

  const topologyMatches =
    topLevelDirs.length === expected.length &&
    topLevelDirs.every((name, index) => name === expected[index])

  if (!topologyMatches) {
    issues.push({
      rule: "web-client-src",
      path: webClientSrc.srcRoot,
      message: `Web client src top-level directories must match workspaceGovernance.webClientSrc.allowedTopLevelDirectories exactly. Expected: ${expected.join(", ")}. Actual: ${topLevelDirs.join(", ")}.`,
    })
  }

  const sharePath = path.join(srcPath, "share")
  for (const subdirectory of webClientSrc.requiredShareSubdirectories) {
    const exists = await pathExists(
      path.join(sharePath, subdirectory),
      "directory"
    )
    if (!exists) {
      issues.push({
        rule: "web-client-src",
        path: `${webClientSrc.srcRoot}/share/${subdirectory}`,
        message: `src/share must include "${subdirectory}/" per workspaceGovernance.webClientSrc.requiredShareSubdirectories.`,
      })
    }
  }

  return issues
}

async function collectWorkspacePackageDirectories(
  config: AfendaConfig,
  repoRoot: string
) {
  const packageDirectories: string[] = []

  for (const workspaceRootDirectory of config.workspaceGovernance
    .packageTopology.workspaceRootDirectories) {
    const rootDirectoryPath = path.join(repoRoot, workspaceRootDirectory)
    const exists = await pathExists(rootDirectoryPath, "directory")
    if (!exists) {
      continue
    }

    const entries = await fs.readdir(rootDirectoryPath, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) {
        continue
      }

      const relativePackageDirectory = toPosixPath(
        path.join(workspaceRootDirectory, entry.name)
      )
      const packageJsonExists = await pathExists(
        path.join(rootDirectoryPath, entry.name, "package.json"),
        "file"
      )

      if (packageJsonExists) {
        packageDirectories.push(relativePackageDirectory)
      }
    }
  }

  return packageDirectories.sort((left, right) => left.localeCompare(right))
}

async function pathExists(
  targetPath: string,
  kind: "file" | "directory"
): Promise<boolean> {
  const stats = await fs.stat(targetPath).catch(() => undefined)
  return kind === "file"
    ? Boolean(stats?.isFile())
    : Boolean(stats?.isDirectory())
}

function pushDisjointSetIssues(
  leftValues: string[],
  rightValues: string[],
  leftLabel: string,
  rightLabel: string,
  issues: AfendaWorkspaceGovernanceIssue[]
) {
  const rightSet = new Set(rightValues)
  const overlap = leftValues.filter((value) => rightSet.has(value))
  if (overlap.length === 0) {
    return
  }

  issues.push({
    rule: "root-topology",
    path: `${leftLabel}|${rightLabel}`,
    message: `${leftLabel} and ${rightLabel} must be disjoint. Overlap: ${overlap.join(", ")}.`,
  })
}
