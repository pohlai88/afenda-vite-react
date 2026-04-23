/// <reference types="node" />

import fs from "fs/promises"
import path from "path"
import {
  afendaSchemaPath,
  assert,
  assertNonEmptyString,
  assertReadmeTargetDefinition,
  isRecord,
  loadAfendaConfig,
  readJsonFile,
  scriptDirectory,
  toPosixPath,
  workspaceRoot,
} from "./afenda-config.js"

interface RootPackageJson {
  name?: string
  packageManager?: string
}

interface WorkspacePackageJson {
  name?: string
}

const rootPackageJsonPath = path.join(workspaceRoot, "package.json")

async function main() {
  const config = await runDiagnosticStep(
    "Load Afenda config",
    async () => loadAfendaConfig(),
    () => "scripts/afenda.config.json loaded and shape-validated."
  )
  const rootPackageJson = await runDiagnosticStep(
    "Load root package manifest",
    async () => readJsonFile(rootPackageJsonPath),
    () => "package.json loaded."
  )

  assertRootPackageJson(rootPackageJson, rootPackageJsonPath)

  await runDiagnosticStep(
    "Validate schema file presence",
    async () => {
      await assertFileExists(
        afendaSchemaPath,
        "Afenda config schema file is missing."
      )
    },
    () => "scripts/afenda.config.schema.json exists."
  )

  await runDiagnosticStep(
    "Validate schema linkage",
    () => {
      assert(
        config.$schema === "./afenda.config.schema.json",
        `Expected "scripts/afenda.config.json" to reference "./afenda.config.schema.json", received ${JSON.stringify(config.$schema)}.`
      )
    },
    () => config.$schema ?? "No schema reference found."
  )

  await runDiagnosticStep(
    "Validate root package name",
    () => {
      assert(
        rootPackageJson.name === config.workspace.rootPackageName,
        `Afenda config workspace.rootPackageName (${config.workspace.rootPackageName}) does not match package.json name (${rootPackageJson.name ?? "undefined"}).`
      )
    },
    () => `${rootPackageJson.name} matches workspace.rootPackageName.`
  )

  const rootPackageManager = rootPackageJson.packageManager
  assertNonEmptyString(rootPackageManager, "package.json packageManager")
  const declaredPackageManager = extractPackageManager(rootPackageManager)
  await runDiagnosticStep(
    "Validate package manager",
    () => {
      assert(
        declaredPackageManager === config.workspace.packageManager,
        `Afenda config workspace.packageManager (${config.workspace.packageManager}) does not match package.json packageManager (${rootPackageJson.packageManager ?? "undefined"}).`
      )
    },
    () => `${declaredPackageManager} matches workspace.packageManager.`
  )

  await runDiagnosticStep(
    "Validate workspace-relative paths",
    () => {
      assertRelativeWorkspacePath(config.paths.webApp, "paths.webApp")
      assertRelativeWorkspacePath(
        config.paths.typescriptSharedConfig,
        "paths.typescriptSharedConfig"
      )
    },
    () =>
      `webApp=${config.paths.webApp}, typescriptSharedConfig=${config.paths.typescriptSharedConfig}`
  )

  await runDiagnosticStep(
    "Validate governance path declarations",
    () => {
      for (const [
        index,
        directory,
      ] of config.workspaceGovernance.packageTopology.workspaceRootDirectories.entries()) {
        assertRelativeWorkspacePath(
          directory,
          `workspaceGovernance.packageTopology.workspaceRootDirectories[${index}]`
        )
      }
      for (const [
        index,
        pkg,
      ] of config.workspaceGovernance.packageRoots.packages.entries()) {
        assertRelativeWorkspacePath(
          pkg.path,
          `workspaceGovernance.packageRoots.packages[${index}].path`
        )
      }
      assertRelativeWorkspacePath(
        config.workspaceGovernance.featureTemplate.featuresRoot,
        "workspaceGovernance.featureTemplate.featuresRoot"
      )
      assertRelativeWorkspacePath(
        config.workspaceGovernance.sharedPackageTemplate.packagePath,
        "workspaceGovernance.sharedPackageTemplate.packagePath"
      )
      assertRelativeWorkspacePath(
        config.workspaceGovernance.webClientSrc.srcRoot,
        "workspaceGovernance.webClientSrc.srcRoot"
      )
      assertRelativeWorkspacePath(
        config.governance.evidence.root,
        "governance.evidence.root"
      )
      assertRelativeWorkspacePath(
        config.governance.evidence.aggregateReportPath,
        "governance.evidence.aggregateReportPath"
      )
      assertRelativeWorkspacePath(
        config.governance.evidence.summaryReportPath,
        "governance.evidence.summaryReportPath"
      )
      assertRelativeWorkspacePath(
        config.governance.evidence.registerPath,
        "governance.evidence.registerPath"
      )
      assertRelativeWorkspacePath(
        config.governance.evidence.registerSnapshotPath,
        "governance.evidence.registerSnapshotPath"
      )
      assertRelativeWorkspacePath(
        config.governance.waivers.registryPath,
        "governance.waivers.registryPath"
      )
      assertRelativeWorkspacePath(
        config.governance.waivers.reportPath,
        "governance.waivers.reportPath"
      )
      for (const [index, domain] of config.governance.domains.entries()) {
        assertRelativeWorkspacePath(
          domain.docs.primary,
          `governance.domains[${index}].docs.primary`
        )
        for (const [
          referenceIndex,
          reference,
        ] of domain.docs.references.entries()) {
          assertRelativeWorkspacePath(
            reference,
            `governance.domains[${index}].docs.references[${referenceIndex}]`
          )
        }
        assertRelativeWorkspacePath(
          domain.localConfig,
          `governance.domains[${index}].localConfig`
        )
        assertRelativeWorkspacePath(
          domain.evidencePath,
          `governance.domains[${index}].evidencePath`
        )
        assertRelativeWorkspacePath(
          domain.report.scriptPath,
          `governance.domains[${index}].report.scriptPath`
        )
        for (const [checkIndex, check] of domain.checks.entries()) {
          assertRelativeWorkspacePath(
            check.scriptPath,
            `governance.domains[${index}].checks[${checkIndex}].scriptPath`
          )
        }
      }
      for (const [index, gate] of config.governance.gates.entries()) {
        assertRelativeWorkspacePath(
          gate.scriptPath,
          `governance.gates[${index}].scriptPath`
        )
      }
      for (const [index, rollout] of config.fileSurvival.rollouts.entries()) {
        assertRelativeWorkspacePath(
          rollout.scopeRoot,
          `fileSurvival.rollouts[${index}].scopeRoot`
        )
        for (const [sharedIndex, sharedRoot] of rollout.sharedRoots.entries()) {
          assertRelativeWorkspacePath(
            sharedRoot,
            `fileSurvival.rollouts[${index}].sharedRoots[${sharedIndex}]`
          )
        }
        for (const [
          ownerIndex,
          runtimeOwner,
        ] of rollout.runtimeOwners.entries()) {
          assertRelativeWorkspacePath(
            runtimeOwner,
            `fileSurvival.rollouts[${index}].runtimeOwners[${ownerIndex}]`
          )
        }
        for (const [
          exceptionIndex,
          reviewedException,
        ] of rollout.reviewedExceptions.entries()) {
          assertRelativeWorkspacePath(
            reviewedException,
            `fileSurvival.rollouts[${index}].reviewedExceptions[${exceptionIndex}]`
          )
        }
        for (const [
          scopeIndex,
          protectedScope,
        ] of rollout.protectedScopes.entries()) {
          for (const [
            rootIndex,
            protectedRoot,
          ] of protectedScope.roots.entries()) {
            assertRelativeWorkspacePath(
              protectedRoot,
              `fileSurvival.rollouts[${index}].protectedScopes[${scopeIndex}].roots[${rootIndex}]`
            )
          }
        }
        for (const [ownerIndex, ownerRule] of rollout.ownerTruth.entries()) {
          assertRelativeWorkspacePath(
            ownerRule.root,
            `fileSurvival.rollouts[${index}].ownerTruth[${ownerIndex}].root`
          )
        }
      }
    },
    () =>
      `featuresRoot=${config.workspaceGovernance.featureTemplate.featuresRoot}, sharedPackage=${config.workspaceGovernance.sharedPackageTemplate.packagePath}, webClientSrc=${config.workspaceGovernance.webClientSrc.srcRoot}`
  )

  await runDiagnosticStep(
    "Validate README target definitions",
    async () => {
      assertUniqueReadmeTargets(config.readmeTargets)

      for (const [index, target] of config.readmeTargets.entries()) {
        assertReadmeTargetDefinition(target, `readmeTargets[${index}]`)
        assertRelativeWorkspacePath(target.path, `readmeTargets[${index}].path`)

        const targetDirectory = path.join(workspaceRoot, target.path)
        await assertDirectoryExists(
          targetDirectory,
          `Configured README target "${target.path}" (${target.mode}) does not exist.`
        )
      }
    },
    () => `${config.readmeTargets.length} README target definitions validated.`
  )

  const rulesPath = path.join(scriptDirectory, "RULES.md")
  await runDiagnosticStep(
    "Validate scripts directory governance files",
    async () => {
      await assertFileExists(
        rulesPath,
        "scripts/RULES.md is missing (scripts layout and contribution policy)."
      )
      await assertScriptsDirectoryNestingPolicy(scriptDirectory)
    },
    () => "scripts/RULES.md present; scripts/ nesting policy satisfied."
  )

  await runDiagnosticStep(
    "Enforce root topology governance",
    async () => {
      await assertRootTopologyGovernance(config)
    },
    () => "Root directories and required root files satisfy governance policy."
  )

  const webAppDirectory = path.join(workspaceRoot, config.paths.webApp)
  const sharedTypescriptConfigDirectory = path.join(
    workspaceRoot,
    config.paths.typescriptSharedConfig
  )

  await runDiagnosticStep(
    "Validate configured directories exist",
    async () => {
      await assertDirectoryExists(
        webAppDirectory,
        `Configured web app path "${config.paths.webApp}" does not exist.`
      )
      await assertDirectoryExists(
        sharedTypescriptConfigDirectory,
        `Configured TypeScript shared config path "${config.paths.typescriptSharedConfig}" does not exist.`
      )
      for (const rollout of config.fileSurvival.rollouts) {
        await assertDirectoryExists(
          path.join(workspaceRoot, rollout.scopeRoot),
          `Configured file survival scope root "${rollout.scopeRoot}" does not exist.`
        )
        for (const sharedRoot of rollout.sharedRoots) {
          await assertDirectoryExists(
            path.join(workspaceRoot, sharedRoot),
            `Configured file survival shared root "${sharedRoot}" does not exist.`
          )
        }
        for (const runtimeOwner of rollout.runtimeOwners) {
          await assertFileExists(
            path.join(workspaceRoot, runtimeOwner),
            `Configured file survival runtime owner "${runtimeOwner}" does not exist.`
          )
        }
        for (const reviewedException of rollout.reviewedExceptions) {
          const absoluteReviewedExceptionPath = path.join(
            workspaceRoot,
            reviewedException
          )
          await assertPathExists(
            absoluteReviewedExceptionPath,
            `Configured file survival reviewed exception "${reviewedException}" does not exist.`
          )
        }
        for (const protectedScope of rollout.protectedScopes) {
          for (const protectedRoot of protectedScope.roots) {
            await assertPathExists(
              path.join(workspaceRoot, protectedRoot),
              `Configured file survival protected scope root "${protectedRoot}" does not exist.`
            )
          }
        }
        for (const ownerRule of rollout.ownerTruth) {
          await assertPathExists(
            path.join(workspaceRoot, ownerRule.root),
            `Configured file survival owner truth root "${ownerRule.root}" does not exist.`
          )
        }
      }
    },
    () =>
      `${config.paths.webApp}, ${config.paths.typescriptSharedConfig}, and ${String(config.fileSurvival.rollouts.length)} file survival rollout(s) exist.`
  )

  const [
    webAppPackageJson,
    sharedConfigPackageJson,
    workspacePackageJsonPaths,
  ] = await Promise.all([
    readWorkspacePackageJson(path.join(webAppDirectory, "package.json")),
    readWorkspacePackageJson(
      path.join(sharedTypescriptConfigDirectory, "package.json")
    ),
    collectWorkspacePackageJsonPaths(),
  ])

  await runDiagnosticStep(
    "Validate critical package scopes",
    () => {
      assertScopedPackageName(
        webAppPackageJson.name,
        config.workspace.defaultPackageScope,
        `${config.paths.webApp}/package.json`
      )
      assertScopedPackageName(
        sharedConfigPackageJson.name,
        config.workspace.defaultPackageScope,
        `${config.paths.typescriptSharedConfig}/package.json`
      )
    },
    () =>
      `${webAppPackageJson.name} and ${sharedConfigPackageJson.name} use ${config.workspace.defaultPackageScope}.`
  )

  await runDiagnosticStep(
    "Validate workspace package scopes",
    async () => {
      for (const packageJsonPath of workspacePackageJsonPaths) {
        const workspacePackage = await readWorkspacePackageJson(packageJsonPath)
        const relativePackageJsonPath = toPosixPath(
          path.relative(workspaceRoot, packageJsonPath)
        )

        assertScopedPackageName(
          workspacePackage.name,
          config.workspace.defaultPackageScope,
          relativePackageJsonPath
        )
      }
    },
    () =>
      `${workspacePackageJsonPaths.length} workspace package manifests checked against ${config.workspace.defaultPackageScope}.`
  )

  await runDiagnosticStep(
    "Enforce workspace package topology",
    async () => {
      await assertPackageTopologyGovernance(config)
    },
    () =>
      "Workspace package roots do not contain manifestless package directories."
  )

  await runDiagnosticStep(
    "Enforce workspace package root governance",
    async () => {
      await assertPackageRootGovernance(config)
    },
    () => "Workspace package roots match declared root profiles."
  )

  await runDiagnosticStep(
    "Enforce feature template governance",
    async () => {
      await assertFeatureTemplateGovernance(config)
    },
    () => "Feature template policy enforced for discovered features."
  )

  await runDiagnosticStep(
    "Enforce shared package template governance",
    async () => {
      await assertSharedPackageTemplateGovernance(config)
    },
    () => "Shared package template policy checked."
  )

  await runDiagnosticStep(
    "Enforce web client src topology",
    async () => {
      await assertWebClientSrcGovernance(config)
    },
    () => "Web client src topology matches workspaceGovernance.webClientSrc."
  )

  console.log("Afenda config check passed")
}

function assertRootPackageJson(
  value: unknown,
  filePath: string
): asserts value is RootPackageJson {
  assert(isRecord(value), `${filePath} must be a JSON object.`)
  assertNonEmptyString(value.name, "package.json name")
  assertNonEmptyString(value.packageManager, "package.json packageManager")
}

async function readWorkspacePackageJson(
  filePath: string
): Promise<WorkspacePackageJson> {
  await assertFileExists(
    filePath,
    `Missing workspace package manifest: ${filePath}`
  )
  const value = await readJsonFile(filePath)

  assert(isRecord(value), `${filePath} must be a JSON object.`)
  assertNonEmptyString(value.name, `${filePath} name`)

  return value
}

async function collectWorkspacePackageJsonPaths() {
  const packageJsonPaths: string[] = []

  for (const directoryName of ["apps", "packages"]) {
    const rootDirectory = path.join(workspaceRoot, directoryName)
    const children = await fs.readdir(rootDirectory, { withFileTypes: true })

    for (const child of children) {
      if (!child.isDirectory()) {
        continue
      }

      const packageJsonPath = path.join(
        rootDirectory,
        child.name,
        "package.json"
      )

      try {
        await fs.access(packageJsonPath)
        packageJsonPaths.push(packageJsonPath)
      } catch {
        // Skip directories that are not package roots.
      }
    }
  }

  return packageJsonPaths.sort((left, right) => left.localeCompare(right))
}

async function runDiagnosticStep<T>(
  label: string,
  run: () => Promise<T> | T,
  successDetail?: (value: T) => string
): Promise<T> {
  try {
    const value = await run()
    const detail = successDetail ? successDetail(value) : undefined
    console.log(detail ? `[ok] ${label}: ${detail}` : `[ok] ${label}`)
    return value
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[${label}] ${message}`)
  }
}

function extractPackageManager(packageManager: string) {
  const separatorIndex = packageManager.indexOf("@")
  return separatorIndex === -1
    ? packageManager
    : packageManager.slice(0, separatorIndex)
}

function assertRelativeWorkspacePath(relativePath: string, label: string) {
  assert(
    !path.isAbsolute(relativePath),
    `Afenda config ${label} must be workspace-relative, received absolute path "${relativePath}".`
  )
}

/**
 * Enforces `scripts/RULES.md`: at most one directory level under `scripts/`
 * (no `scripts/a/b/` subtrees).
 */
async function assertScriptsDirectoryNestingPolicy(scriptsRoot: string) {
  const topLevel = await fs.readdir(scriptsRoot, { withFileTypes: true })

  for (const entry of topLevel) {
    if (!entry.isDirectory()) {
      continue
    }

    if (entry.name.startsWith(".") || entry.name === "node_modules") {
      continue
    }

    const areaPath = path.join(scriptsRoot, entry.name)
    const inner = await fs.readdir(areaPath, { withFileTypes: true })
    const nestedDirectories = inner.filter(
      (child) => child.isDirectory() && !child.name.startsWith(".")
    )

    assert(
      nestedDirectories.length === 0,
      `scripts/${entry.name}/ must not contain subdirectories (max one level under scripts/). Offenders: ${nestedDirectories.map((child) => child.name).join(", ")}. See scripts/RULES.md.`
    )
  }
}

async function assertRootTopologyGovernance(
  config: Awaited<ReturnType<typeof loadAfendaConfig>>
) {
  const rootTopology = config.workspaceGovernance.rootTopology
  const allowedRootDirectorySet = new Set(rootTopology.allowedRootDirectories)
  const allowedHiddenRootDirectorySet = new Set(
    rootTopology.allowedHiddenRootDirectories
  )
  const storageDirectorySet = new Set(rootTopology.storageDirectories)

  assertDisjointSets(
    rootTopology.allowedRootDirectories,
    rootTopology.allowedHiddenRootDirectories,
    "workspaceGovernance.rootTopology.allowedRootDirectories",
    "workspaceGovernance.rootTopology.allowedHiddenRootDirectories"
  )
  assertDisjointSets(
    rootTopology.allowedRootDirectories,
    rootTopology.storageDirectories,
    "workspaceGovernance.rootTopology.allowedRootDirectories",
    "workspaceGovernance.rootTopology.storageDirectories"
  )
  assertDisjointSets(
    rootTopology.allowedHiddenRootDirectories,
    rootTopology.storageDirectories,
    "workspaceGovernance.rootTopology.allowedHiddenRootDirectories",
    "workspaceGovernance.rootTopology.storageDirectories"
  )

  for (const directory of rootTopology.primaryProductDirectories) {
    const directoryPath = path.join(workspaceRoot, directory)
    await assertDirectoryExists(
      directoryPath,
      `Configured primary product directory "${directory}" does not exist.`
    )
  }

  const rootEntries = await fs.readdir(workspaceRoot, { withFileTypes: true })
  const rootDirectories = rootEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))

  for (const directoryName of rootDirectories) {
    if (directoryName.startsWith(".")) {
      assert(
        allowedHiddenRootDirectorySet.has(directoryName) ||
          storageDirectorySet.has(directoryName),
        `Hidden root directory "${directoryName}" is not allowed by workspaceGovernance.rootTopology.allowedHiddenRootDirectories or workspaceGovernance.rootTopology.storageDirectories.`
      )
      continue
    }

    assert(
      allowedRootDirectorySet.has(directoryName) ||
        storageDirectorySet.has(directoryName),
      `Root directory "${directoryName}" is not allowed by workspaceGovernance.rootTopology.allowedRootDirectories or workspaceGovernance.rootTopology.storageDirectories.`
    )
  }

  for (const directoryName of rootTopology.primaryProductDirectories) {
    assert(
      allowedRootDirectorySet.has(directoryName),
      `Primary product directory "${directoryName}" must also be listed in allowedRootDirectories.`
    )
    assert(
      !storageDirectorySet.has(directoryName),
      `Primary product directory "${directoryName}" must not be listed in storageDirectories.`
    )
    assert(
      !allowedHiddenRootDirectorySet.has(directoryName),
      `Primary product directory "${directoryName}" must not be listed in allowedHiddenRootDirectories.`
    )
  }

  for (const directoryName of rootTopology.storageDirectories) {
    await assertDirectoryExists(
      path.join(workspaceRoot, directoryName),
      `Configured storage directory "${directoryName}" does not exist.`
    )
  }

  for (const fileName of rootTopology.requiredRootFiles) {
    await assertFileExists(
      path.join(workspaceRoot, fileName),
      `Required root file "${fileName}" is missing.`
    )
  }
}

async function assertFeatureTemplateGovernance(
  config: Awaited<ReturnType<typeof loadAfendaConfig>>
) {
  const featureTemplate = config.workspaceGovernance.featureTemplate
  const featuresRootPath = path.join(
    workspaceRoot,
    featureTemplate.featuresRoot
  )
  const featuresRootStats = await fs
    .stat(featuresRootPath)
    .catch(() => undefined)

  if (!featuresRootStats?.isDirectory()) {
    return
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
    return
  }

  for (const featureDirectory of featureDirectories) {
    const featureRoot = path.join(featuresRootPath, featureDirectory)

    for (const requiredDirectory of featureTemplate.requiredDirectories) {
      await assertDirectoryExists(
        path.join(featureRoot, requiredDirectory),
        `Feature "${featureDirectory}" must include "${requiredDirectory}/" per workspaceGovernance.featureTemplate.`
      )
    }

    for (const requiredFile of featureTemplate.requiredFiles) {
      await assertFileExists(
        path.join(featureRoot, requiredFile),
        `Feature "${featureDirectory}" must include "${requiredFile}" per workspaceGovernance.featureTemplate.`
      )
    }
  }
}

async function assertPackageTopologyGovernance(
  config: Awaited<ReturnType<typeof loadAfendaConfig>>
) {
  const packageTopology = config.workspaceGovernance.packageTopology
  const allowedManifestlessDirectories = new Set(
    packageTopology.allowedManifestlessDirectories
  )

  for (const workspaceRootDirectory of packageTopology.workspaceRootDirectories) {
    const workspaceRootPath = path.join(workspaceRoot, workspaceRootDirectory)
    await assertDirectoryExists(
      workspaceRootPath,
      `Workspace root "${workspaceRootDirectory}" does not exist.`
    )

    const entries = await fs.readdir(workspaceRootPath, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) {
        continue
      }

      const relativePackageDirectory = toPosixPath(
        path.join(workspaceRootDirectory, entry.name)
      )
      const packageDirectoryPath = path.join(workspaceRootPath, entry.name)
      const packageJsonPath = path.join(packageDirectoryPath, "package.json")

      if (allowedManifestlessDirectories.has(relativePackageDirectory)) {
        continue
      }

      const packageJsonExists = await fs
        .stat(packageJsonPath)
        .then((stats) => stats.isFile())
        .catch(() => false)

      assert(
        packageJsonExists,
        `Workspace package directory "${relativePackageDirectory}" must contain a package.json manifest or be explicitly allowlisted in workspaceGovernance.packageTopology.allowedManifestlessDirectories.`
      )
    }
  }
}

async function assertPackageRootGovernance(
  config: Awaited<ReturnType<typeof loadAfendaConfig>>
) {
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
    assert(
      !profileMap.has(profile.name),
      `workspaceGovernance.packageRoots.profiles contains duplicate profile "${profile.name}".`
    )
    profileMap.set(profile.name, profile)
  }

  for (const packageDefinition of packageRootGovernance.packages) {
    const normalizedPath = toPosixPath(packageDefinition.path)
    assert(
      profileMap.has(packageDefinition.profile),
      `workspaceGovernance.packageRoots.packages entry "${normalizedPath}" references unknown profile "${packageDefinition.profile}".`
    )
    assert(
      !packageDefinitionMap.has(normalizedPath),
      `workspaceGovernance.packageRoots.packages contains duplicate path "${normalizedPath}".`
    )
    packageDefinitionMap.set(normalizedPath, packageDefinition)
  }

  const discoveredPackageDirectories =
    await collectWorkspacePackageDirectories(config)

  for (const packageDirectory of discoveredPackageDirectories) {
    assert(
      packageDefinitionMap.has(packageDirectory),
      `Workspace package directory "${packageDirectory}" must be declared in workspaceGovernance.packageRoots.packages.`
    )
  }

  for (const [packageDirectory, packageDefinition] of packageDefinitionMap) {
    assert(
      discoveredPackageDirectories.includes(packageDirectory),
      `workspaceGovernance.packageRoots.packages entry "${packageDirectory}" does not match a discovered workspace package directory.`
    )

    const profile = profileMap.get(packageDefinition.profile)
    assert(
      profile,
      `Missing package root profile "${packageDefinition.profile}".`
    )

    const packageRootPath = path.join(workspaceRoot, packageDirectory)
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
      if (entry.isDirectory()) {
        assert(
          allowedDirectories.has(entry.name),
          `Package root "${packageDirectory}" contains disallowed directory "${entry.name}/". Allowed directories: ${[...allowedDirectories].sort((left, right) => left.localeCompare(right)).join(", ")}.`
        )
        continue
      }

      if (entry.isFile()) {
        assert(
          allowedFiles.has(entry.name),
          `Package root "${packageDirectory}" contains disallowed file "${entry.name}". Allowed files: ${[...allowedFiles].sort((left, right) => left.localeCompare(right)).join(", ")}.`
        )
      }
    }
  }
}

async function assertSharedPackageTemplateGovernance(
  config: Awaited<ReturnType<typeof loadAfendaConfig>>
) {
  const sharedPackageTemplate = config.workspaceGovernance.sharedPackageTemplate
  const sharedPackagePath = path.join(
    workspaceRoot,
    sharedPackageTemplate.packagePath
  )
  const sharedPackageStats = await fs
    .stat(sharedPackagePath)
    .catch(() => undefined)

  if (!sharedPackageStats?.isDirectory()) {
    return
  }

  if (!sharedPackageTemplate.requireDirectoriesWhenPackageExists) {
    return
  }

  for (const requiredDirectory of sharedPackageTemplate.requiredDirectories) {
    await assertDirectoryExists(
      path.join(sharedPackagePath, requiredDirectory),
      `Shared package "${sharedPackageTemplate.packagePath}" must include "${requiredDirectory}/" per workspaceGovernance.sharedPackageTemplate.`
    )
  }
}

async function collectWorkspacePackageDirectories(
  config: Awaited<ReturnType<typeof loadAfendaConfig>>
) {
  const packageDirectories: string[] = []

  for (const workspaceRootDirectory of config.workspaceGovernance
    .packageTopology.workspaceRootDirectories) {
    const rootDirectoryPath = path.join(workspaceRoot, workspaceRootDirectory)
    const entries = await fs.readdir(rootDirectoryPath, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".")) {
        continue
      }

      const relativePackageDirectory = toPosixPath(
        path.join(workspaceRootDirectory, entry.name)
      )
      const packageJsonPath = path.join(
        rootDirectoryPath,
        entry.name,
        "package.json"
      )
      const packageJsonExists = await fs
        .stat(packageJsonPath)
        .then((stats) => stats.isFile())
        .catch(() => false)

      if (packageJsonExists) {
        packageDirectories.push(relativePackageDirectory)
      }
    }
  }

  return packageDirectories.sort((left, right) => left.localeCompare(right))
}

async function assertWebClientSrcGovernance(
  config: Awaited<ReturnType<typeof loadAfendaConfig>>
) {
  const webClientSrc = config.workspaceGovernance.webClientSrc
  if (!webClientSrc.enforce) {
    return
  }

  const srcPath = path.join(workspaceRoot, webClientSrc.srcRoot)
  await assertDirectoryExists(
    srcPath,
    `Web client src "${webClientSrc.srcRoot}" must exist (workspaceGovernance.webClientSrc).`
  )

  const entries = await fs.readdir(srcPath, { withFileTypes: true })
  const topLevelDirs = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))

  const expected = [...webClientSrc.allowedTopLevelDirectories].sort(
    (left, right) => left.localeCompare(right)
  )

  assert(
    topLevelDirs.length === expected.length &&
      topLevelDirs.every((name, index) => name === expected[index]),
    `Web client src top-level directories must match workspaceGovernance.webClientSrc.allowedTopLevelDirectories exactly (no extra folders; no dumping at src root).\nExpected: ${expected.join(", ")}\nActual: ${topLevelDirs.join(", ")}\nSee docs/PROJECT_STRUCTURE.md and docs/MONOREPO_BOUNDARIES.md.`
  )

  const sharePath = path.join(srcPath, "share")
  for (const subdirectory of webClientSrc.requiredShareSubdirectories) {
    await assertDirectoryExists(
      path.join(sharePath, subdirectory),
      `src/share must include "${subdirectory}/" per workspaceGovernance.webClientSrc.requiredShareSubdirectories.`
    )
  }
}

function assertUniqueReadmeTargets(
  readmeTargets: Array<{ path: string; mode: string }>
) {
  const seenTargets = new Set<string>()

  for (const target of readmeTargets) {
    const targetKey = `${target.mode}:${toPosixPath(target.path)}`

    assert(
      !seenTargets.has(targetKey),
      `Duplicate README target "${target.path}" with mode "${target.mode}".`
    )

    seenTargets.add(targetKey)
  }
}

async function assertDirectoryExists(directoryPath: string, message: string) {
  const stats = await fs.stat(directoryPath).catch(() => undefined)
  assert(Boolean(stats?.isDirectory()), message)
}

async function assertFileExists(filePath: string, message: string) {
  const stats = await fs.stat(filePath).catch(() => undefined)
  assert(Boolean(stats?.isFile()), message)
}

async function assertPathExists(targetPath: string, message: string) {
  const stats = await fs.stat(targetPath).catch(() => undefined)
  assert(Boolean(stats), message)
}

function assertScopedPackageName(
  packageName: string | undefined,
  defaultPackageScope: string,
  label: string
) {
  assertNonEmptyString(packageName, `${label} package name`)
  assert(
    packageName.startsWith(defaultPackageScope),
    `${label} package name (${packageName}) does not start with workspace.defaultPackageScope (${defaultPackageScope}).`
  )
}

function assertDisjointSets(
  leftValues: string[],
  rightValues: string[],
  leftLabel: string,
  rightLabel: string
) {
  const rightSet = new Set(rightValues)
  const overlap = leftValues.filter((value) => rightSet.has(value))

  assert(
    overlap.length === 0,
    `${leftLabel} and ${rightLabel} must be disjoint. Overlap: ${overlap.join(", ")}.`
  )
}

await main()
