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
import { evaluateAfendaWorkspaceGovernance } from "./lib/afenda-workspace-governance.js"

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

  const workspaceGovernanceIssues = await evaluateAfendaWorkspaceGovernance(
    config,
    workspaceRoot
  )

  await runDiagnosticStep(
    "Enforce root topology governance",
    () => {
      assertNoWorkspaceGovernanceIssues(
        workspaceGovernanceIssues,
        "root-topology"
      )
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
    () => {
      assertNoWorkspaceGovernanceIssues(
        workspaceGovernanceIssues,
        "package-topology"
      )
    },
    () =>
      "Workspace package roots do not contain manifestless package directories."
  )

  await runDiagnosticStep(
    "Enforce workspace package root governance",
    () => {
      assertNoWorkspaceGovernanceIssues(
        workspaceGovernanceIssues,
        "package-root"
      )
    },
    () => "Workspace package roots match declared root profiles."
  )

  await runDiagnosticStep(
    "Enforce feature template governance",
    () => {
      assertNoWorkspaceGovernanceIssues(
        workspaceGovernanceIssues,
        "feature-template"
      )
    },
    () => "Feature template policy enforced for discovered features."
  )

  await runDiagnosticStep(
    "Enforce shared package template governance",
    () => {
      assertNoWorkspaceGovernanceIssues(
        workspaceGovernanceIssues,
        "shared-package-template"
      )
    },
    () => "Shared package template policy checked."
  )

  await runDiagnosticStep(
    "Enforce web client src topology",
    () => {
      assertNoWorkspaceGovernanceIssues(
        workspaceGovernanceIssues,
        "web-client-src"
      )
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

await main()

function assertNoWorkspaceGovernanceIssues(
  issues: Awaited<ReturnType<typeof evaluateAfendaWorkspaceGovernance>>,
  rule: (typeof issues)[number]["rule"]
) {
  const matchingIssues = issues.filter((issue) => issue.rule === rule)
  assert(
    matchingIssues.length === 0,
    matchingIssues.map((issue) => `${issue.path}: ${issue.message}`).join("\n")
  )
}
