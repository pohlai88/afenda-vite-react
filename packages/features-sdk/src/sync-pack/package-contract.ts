import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"

import {
  countFindings,
  createFindingRemediation,
  type SyncPackFinding,
  type SyncPackFindingResult,
  type SyncPackFindingSeverity,
} from "./finding.js"
import { findFeaturesSdkRoot, findWorkspaceRoot } from "./workspace.js"

export const featureSdkPackageContractId = "FSDK-CONTRACT-001" as const

export type FeatureSdkPackageContractSeverity = SyncPackFindingSeverity

export type FeatureSdkPackageContractFinding = SyncPackFinding

export interface FeatureSdkPackageContractResult extends SyncPackFindingResult<FeatureSdkPackageContractFinding> {
  readonly contractId: typeof featureSdkPackageContractId
  readonly packageRoot: string
  readonly packageJsonPath: string
  readonly rootPackageJsonPath: string
}

export interface CheckFeatureSdkPackageContractOptions {
  readonly packageRoot?: string
  readonly workspaceRoot?: string
}

type PackageJson = {
  readonly name?: string
  readonly version?: string
  readonly type?: string
  readonly description?: string
  readonly license?: string
  readonly keywords?: readonly string[]
  readonly repository?: {
    readonly type?: string
    readonly url?: string
    readonly directory?: string
  }
  readonly bugs?: {
    readonly url?: string
  }
  readonly homepage?: string
  readonly engines?: {
    readonly node?: string
  }
  readonly publishConfig?: {
    readonly access?: string
  }
  readonly files?: readonly string[]
  readonly bin?: string | Record<string, string>
  readonly exports?: unknown
  readonly dependencies?: Record<string, string>
}

const requiredFilesEntries = [
  "dist",
  "README.md",
  "docs/sync-pack/README.md",
  "docs/sync-pack/*.md",
  "rules/sync-pack/*.md",
  "rules/sync-pack/openalternative.seed.json",
] as const

const requiredSourceFiles = [
  "README.md",
  "docs/sync-pack/README.md",
  "docs/sync-pack/CLI_OPERATOR_BENCHMARK_NOTE.md",
  "docs/sync-pack/FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md",
  "docs/sync-pack/FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md",
  "docs/sync-pack/FSDK-CLI-003_COMMAND_TREE_CONTRACT.md",
  "docs/sync-pack/FSDK-CLI-004_ROOT_COMMAND_CONTRACT.md",
  "docs/sync-pack/FSDK-CLI_SCORECARD.md",
  "docs/sync-pack/FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md",
  "docs/sync-pack/INTERNAL_OPERATING_CONTRACT.md",
  "rules/sync-pack/FEATURE_APPROVAL_GATE.md",
  "rules/sync-pack/FEATURE_PRIORITY_MATRIX.md",
  "rules/sync-pack/FEATURE_SYNC_PACK_DOD.md",
  "rules/sync-pack/FEATURE_SYNC_PACK_RULES.md",
  "rules/sync-pack/TECH_STACK_MATRIX.md",
  "rules/sync-pack/openalternative.seed.json",
] as const

const requiredBuildAssetFiles = [
  "dist/sync-pack/templates/01-feature-brief.md",
  "dist/sync-pack/templates/02-product-requirement.md",
  "dist/sync-pack/templates/03-technical-design.md",
  "dist/sync-pack/templates/04-data-contract.md",
  "dist/sync-pack/templates/05-api-contract.md",
  "dist/sync-pack/templates/06-ui-contract.md",
  "dist/sync-pack/templates/07-security-risk-review.md",
  "dist/sync-pack/templates/08-implementation-plan.md",
  "dist/sync-pack/templates/09-test-plan.md",
  "dist/sync-pack/templates/10-handoff.md",
] as const

async function readPackageJson(packageJsonPath: string): Promise<PackageJson> {
  return JSON.parse(await readFile(packageJsonPath, "utf8")) as PackageJson
}

function packageTargetToPath(packageRoot: string, target: string): string {
  return path.join(packageRoot, target.replace(/^\.\//, ""))
}

function collectExportTargets(
  value: unknown,
  targets: string[] = []
): string[] {
  if (!value || typeof value !== "object") {
    return targets
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (
      (key === "types" || key === "import") &&
      typeof nestedValue === "string"
    ) {
      targets.push(nestedValue)
      continue
    }

    collectExportTargets(nestedValue, targets)
  }

  return targets
}

function validateExports(
  packageRoot: string,
  packageJson: PackageJson
): FeatureSdkPackageContractFinding[] {
  const targets = collectExportTargets(packageJson.exports)

  return targets.flatMap((target) => {
    const filePath = packageTargetToPath(packageRoot, target)

    if (existsSync(filePath)) {
      return []
    }

    return [
      {
        severity: "error",
        code: "missing-export-target",
        filePath,
        message: `Export target ${target} does not exist.`,
        remediation: createFindingRemediation(
          "Build @afenda/features-sdk before running release-check.",
          {
            command: "pnpm --filter @afenda/features-sdk build",
            doc: "docs/sync-pack/FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md",
          }
        ),
      },
    ]
  })
}

function binEntries(
  packageJson: PackageJson
): Array<readonly [string, string]> {
  if (!packageJson.bin) {
    return []
  }

  if (typeof packageJson.bin === "string") {
    return [[packageJson.name ?? "bin", packageJson.bin]]
  }

  return Object.entries(packageJson.bin)
}

async function validateBins(
  packageRoot: string,
  packageJson: PackageJson
): Promise<FeatureSdkPackageContractFinding[]> {
  const findings: FeatureSdkPackageContractFinding[] = []

  for (const [binName, target] of binEntries(packageJson)) {
    const filePath = packageTargetToPath(packageRoot, target)

    if (!target.endsWith(".js")) {
      findings.push({
        severity: "error",
        code: "bin-target-not-js",
        filePath,
        message: `Bin ${binName} target ${target} must end with .js.`,
        remediation: createFindingRemediation(
          "Update package.json bin targets to point at built JavaScript files with .js extension."
        ),
      })
    }

    if (!existsSync(filePath)) {
      findings.push({
        severity: "error",
        code: "missing-bin-target",
        filePath,
        message: `Bin ${binName} target ${target} does not exist.`,
        remediation: createFindingRemediation(
          "Build @afenda/features-sdk before running release-check.",
          {
            command: "pnpm --filter @afenda/features-sdk build",
            doc: "docs/sync-pack/FSDK-CLI-001_RELEASE_GATE_CLI_CONTRACT.md",
          }
        ),
      })
      continue
    }

    const fileContent = await readFile(filePath, "utf8")

    if (!fileContent.startsWith("#!/usr/bin/env node")) {
      findings.push({
        severity: "error",
        code: "bin-target-missing-shebang",
        filePath,
        message: `Bin ${binName} target ${target} must start with #!/usr/bin/env node.`,
        remediation: createFindingRemediation(
          "Restore the Node shebang at the top of the CLI entrypoint source file."
        ),
      })
    }
  }

  return findings
}

function validatePackageMetadata(
  packageJson: PackageJson
): FeatureSdkPackageContractFinding[] {
  const findings: FeatureSdkPackageContractFinding[] = []

  if (packageJson.name !== "@afenda/features-sdk") {
    findings.push({
      severity: "error",
      code: "invalid-package-name",
      message: "Package name must be @afenda/features-sdk.",
      remediation: createFindingRemediation(
        "Restore the internal SDK package name in packages/features-sdk/package.json."
      ),
    })
  }

  if (!packageJson.version) {
    findings.push({
      severity: "error",
      code: "missing-package-version",
      message: "Package version must be declared.",
      remediation: createFindingRemediation(
        "Restore a declared package version in packages/features-sdk/package.json."
      ),
    })
  }

  if (packageJson.type !== "module") {
    findings.push({
      severity: "error",
      code: "invalid-package-module-type",
      message: "Package type must be module.",
      remediation: createFindingRemediation(
        "Set package.json type to module so the published SDK stays ESM."
      ),
    })
  }

  if (!packageJson.description) {
    findings.push({
      severity: "error",
      code: "missing-package-description",
      message: "Package description must be declared.",
      remediation: createFindingRemediation(
        "Restore the package description in packages/features-sdk/package.json."
      ),
    })
  }

  if (packageJson.license !== "UNLICENSED") {
    findings.push({
      severity: "error",
      code: "invalid-package-license",
      message: "Package license must remain UNLICENSED for internal readiness.",
      remediation: createFindingRemediation(
        "Restore the package license to UNLICENSED until partner/public externalization is approved."
      ),
    })
  }

  if (packageJson.repository?.directory !== "packages/features-sdk") {
    findings.push({
      severity: "error",
      code: "invalid-repository-directory",
      message: "Package repository.directory must be packages/features-sdk.",
      remediation: createFindingRemediation(
        "Restore repository.directory to packages/features-sdk in package.json."
      ),
    })
  }

  if (!packageJson.bugs?.url) {
    findings.push({
      severity: "error",
      code: "missing-package-bugs-url",
      message: "Package bugs.url must be declared.",
      remediation: createFindingRemediation(
        "Declare bugs.url in packages/features-sdk/package.json."
      ),
    })
  }

  if (!packageJson.homepage) {
    findings.push({
      severity: "error",
      code: "missing-package-homepage",
      message: "Package homepage must be declared.",
      remediation: createFindingRemediation(
        "Declare homepage in packages/features-sdk/package.json."
      ),
    })
  }

  if (packageJson.publishConfig?.access !== "restricted") {
    findings.push({
      severity: "error",
      code: "invalid-publish-access",
      message: "Package publishConfig.access must remain restricted.",
      remediation: createFindingRemediation(
        "Restore publishConfig.access to restricted; partner/public publish posture is deferred."
      ),
    })
  }

  if (!packageJson.keywords?.includes("sync-pack")) {
    findings.push({
      severity: "error",
      code: "missing-sync-pack-keyword",
      message: "Package keywords must include sync-pack.",
      remediation: createFindingRemediation(
        "Add sync-pack to the package keywords list."
      ),
    })
  }

  return findings
}

function validateFiles(
  packageJson: PackageJson
): FeatureSdkPackageContractFinding[] {
  const files = new Set(packageJson.files ?? [])

  return requiredFilesEntries.flatMap((entry) => {
    if (files.has(entry)) {
      return []
    }

    return [
      {
        severity: "error",
        code: "missing-files-entry",
        message: `Package files must include ${entry}.`,
        remediation: createFindingRemediation(
          "Restore the required files entry in packages/features-sdk/package.json."
        ),
      },
    ]
  })
}

function validateRequiredPackageFiles(
  packageRoot: string
): FeatureSdkPackageContractFinding[] {
  return requiredSourceFiles.flatMap((target) => {
    const filePath = path.join(packageRoot, target)

    if (existsSync(filePath)) {
      return []
    }

    return [
      {
        severity: "error",
        code: "missing-required-package-file",
        filePath,
        message: `Required package file ${target} does not exist.`,
        remediation: createFindingRemediation(
          "Restore the required Sync-Pack docs, rules, or seed data before release-check."
        ),
      },
    ]
  })
}

function validateRequiredBuildAssets(
  packageRoot: string
): FeatureSdkPackageContractFinding[] {
  return requiredBuildAssetFiles.flatMap((target) => {
    const filePath = path.join(packageRoot, target)

    if (existsSync(filePath)) {
      return []
    }

    return [
      {
        severity: "error",
        code: "missing-required-build-asset",
        filePath,
        message: `Required build asset ${target} does not exist.`,
        remediation: createFindingRemediation(
          "Rebuild @afenda/features-sdk and verify the asset copy step restores the missing template.",
          {
            command: "pnpm --filter @afenda/features-sdk build",
          }
        ),
      },
    ]
  })
}

function validateRuntimeDependencies(
  packageJson: PackageJson
): FeatureSdkPackageContractFinding[] {
  if (packageJson.dependencies?.zod) {
    return []
  }

  return [
    {
      severity: "error",
      code: "missing-runtime-zod-dependency",
      message: "Package must declare zod as a runtime dependency.",
      remediation: createFindingRemediation(
        "Restore zod under dependencies, not only devDependencies."
      ),
    },
  ]
}

function validateNodeEngine(
  packageJson: PackageJson,
  rootPackageJson: PackageJson,
  packageJsonPath: string,
  rootPackageJsonPath: string
): FeatureSdkPackageContractFinding[] {
  const packageNodeEngine = packageJson.engines?.node
  const rootNodeEngine = rootPackageJson.engines?.node

  if (packageNodeEngine && packageNodeEngine === rootNodeEngine) {
    return []
  }

  return [
    {
      severity: "error",
      code: "node-engine-policy-mismatch",
      filePath: packageJsonPath,
      message: `Package node engine ${packageNodeEngine ?? "missing"} must match root policy ${rootNodeEngine ?? "missing"} in ${rootPackageJsonPath}.`,
      remediation: createFindingRemediation(
        "Synchronize packages/features-sdk engines.node with the root package policy."
      ),
    },
  ]
}

export async function checkFeatureSdkPackageContract(
  options: CheckFeatureSdkPackageContractOptions = {}
): Promise<FeatureSdkPackageContractResult> {
  const packageRoot = path.resolve(options.packageRoot ?? findFeaturesSdkRoot())
  const workspaceRoot = path.resolve(
    options.workspaceRoot ?? findWorkspaceRoot(packageRoot)
  )
  const packageJsonPath = path.join(packageRoot, "package.json")
  const rootPackageJsonPath = path.join(workspaceRoot, "package.json")
  const packageJson = await readPackageJson(packageJsonPath)
  const rootPackageJson = await readPackageJson(rootPackageJsonPath)
  const findings = [
    ...validatePackageMetadata(packageJson),
    ...validateExports(packageRoot, packageJson),
    ...(await validateBins(packageRoot, packageJson)),
    ...validateFiles(packageJson),
    ...validateRequiredPackageFiles(packageRoot),
    ...validateRequiredBuildAssets(packageRoot),
    ...validateRuntimeDependencies(packageJson),
    ...validateNodeEngine(
      packageJson,
      rootPackageJson,
      packageJsonPath,
      rootPackageJsonPath
    ),
  ]
  const { errorCount, warningCount } = countFindings(findings)

  return {
    contractId: featureSdkPackageContractId,
    packageRoot,
    packageJsonPath,
    rootPackageJsonPath,
    findings,
    errorCount,
    warningCount,
  }
}
