import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { ZodError, z } from "zod"

import {
  checkGeneratedPackDirectory,
  findGeneratedPackDirectories,
  type SyncPackCheckFinding,
} from "../check/pack-check.js"
import {
  countFindings,
  createFindingRemediation,
  type SyncPackFinding,
  type SyncPackFindingResult,
} from "../finding.js"
import {
  readSeedCandidates,
  resolveGeneratedPacksPath,
  resolveSeedPath,
} from "../workspace.js"
import {
  featureCategorySchema,
  type FeatureCategory,
} from "../schema/category.schema.js"
import {
  appCandidateSchema,
  type AppCandidate,
} from "../schema/candidate.schema.js"
import { findFeaturesSdkRoot } from "../workspace.js"

export const syncPackExampleContractId = "FSDK-EXAMPLE-001" as const

export const syncPackGoldenExamplePackIds = [
  "internal-support-crm",
  "bi-reporting-starter",
  "iam-sso-control-plane",
  "uptime-monitoring-workbench",
] as const

export type SyncPackGoldenExamplePackId =
  (typeof syncPackGoldenExamplePackIds)[number]

export interface ExamplePackMeta {
  readonly packId: string
  readonly name: string
  readonly category: FeatureCategory
  readonly maturity: "golden" | "secondary"
  readonly fitness: {
    readonly lastVerifiedAt: string
    readonly sdkVersion: string
    readonly verifyStatus: "pass" | "fail"
  }
}

export type SyncPackExampleFitnessFinding = SyncPackFinding

export interface CheckGoldenExampleFitnessResult extends SyncPackFindingResult<SyncPackExampleFitnessFinding> {
  readonly contractId: typeof syncPackExampleContractId
  readonly registryPath: string
  readonly guidePath: string
  readonly registry: readonly ExamplePackMeta[]
}

export interface SyncGoldenExampleFitnessResult extends CheckGoldenExampleFitnessResult {
  readonly packCount: number
}

export interface CheckGoldenExampleFitnessOptions {
  readonly packageRoot?: string
  readonly packsRoot?: string
  readonly registryPath?: string
  readonly guidePath?: string
}

export interface SyncGoldenExampleFitnessOptions extends CheckGoldenExampleFitnessOptions {
  readonly now?: () => Date
}

export const examplePackMetaSchema = z.strictObject({
  packId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  category: featureCategorySchema,
  maturity: z.enum(["golden", "secondary"]),
  fitness: z.strictObject({
    lastVerifiedAt: z.string().trim().min(1),
    sdkVersion: z.string().trim().min(1),
    verifyStatus: z.enum(["pass", "fail"]),
  }),
})

export const examplePackRegistrySchema = z.array(examplePackMetaSchema)

const goldenExampleGuidance: Record<
  SyncPackGoldenExamplePackId,
  {
    readonly whenToStart: string
    readonly whenNotToStart: string
  }
> = {
  "internal-support-crm": {
    whenToStart:
      "Start here for internal service desks, support queues, CRM-style account operations, or workflow-heavy business tooling.",
    whenNotToStart:
      "Do not start here for analytics-first products, IAM/control-plane work, or lightweight utility apps.",
  },
  "bi-reporting-starter": {
    whenToStart:
      "Start here for internal analytics, BI reporting, metric exploration, or operational dashboard work.",
    whenNotToStart:
      "Do not start here for transactional back-office flows, IAM platforms, or support CRM products.",
  },
  "iam-sso-control-plane": {
    whenToStart:
      "Start here for authentication, SSO, identity governance, policy administration, or security-control surfaces.",
    whenNotToStart:
      "Do not start here for content publishing, business CRM flows, or observability dashboards.",
  },
  "uptime-monitoring-workbench": {
    whenToStart:
      "Start here for observability, monitoring, incident response, SRE tooling, or infrastructure operations work.",
    whenNotToStart:
      "Do not start here for business workflow systems, BI-heavy products, or identity-control platforms.",
  },
}

const goldenExampleGuideTitle = "# Sync-Pack Golden Examples" as const
const goldenExamplesDocPath = "docs/sync-pack/GOLDEN_EXAMPLES.md" as const
const exampleContractDocPath =
  "docs/sync-pack/FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md" as const
const syncExamplesCommand = "pnpm run feature-sync:sync-examples" as const

function createExampleRemediation(
  action: string,
  options: {
    readonly command?: string
    readonly doc?: string
  } = {}
): ReturnType<typeof createFindingRemediation> {
  return createFindingRemediation(action, {
    command: options.command ?? syncExamplesCommand,
    doc: options.doc ?? exampleContractDocPath,
  })
}

function resolveExampleRegistryPath(packageRoot: string): string {
  return path.join(
    packageRoot,
    "docs",
    "sync-pack",
    "example-pack-registry.json"
  )
}

function resolveGoldenExamplesGuidePath(packageRoot: string): string {
  return path.join(packageRoot, "docs", "sync-pack", "GOLDEN_EXAMPLES.md")
}

async function readPackageVersion(packageRoot: string): Promise<string> {
  const packageJsonPath = path.join(packageRoot, "package.json")
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
    readonly version?: string
  }

  return packageJson.version?.trim() || "0.0.0"
}

async function readPackCandidate(packDirectory: string): Promise<AppCandidate> {
  const candidatePath = path.join(packDirectory, "00-candidate.json")
  const rawCandidate = await readFile(candidatePath, "utf8")

  return appCandidateSchema.parse(JSON.parse(rawCandidate))
}

function summarizeExamplePackFindings(
  packDirectory: string,
  findings: readonly SyncPackCheckFinding[]
): SyncPackExampleFitnessFinding[] {
  return findings.map((finding) => ({
    severity: finding.severity,
    code: `example-pack-${finding.code}`,
    message: finding.message,
    filePath: finding.filePath ?? packDirectory,
    remediation:
      finding.remediation ??
      createExampleRemediation(
        `Repair the generated pack under ${packDirectory} and rerun feature-sync:sync-examples.`
      ),
  }))
}

function isGoldenPackId(packId: string): packId is SyncPackGoldenExamplePackId {
  return (syncPackGoldenExamplePackIds as readonly string[]).includes(packId)
}

function createSecondaryGuideSection(entry: ExamplePackMeta): string {
  return [
    `### ${entry.packId}`,
    `- Path: \`docs/sync-pack/generated-packs/${entry.category}/${entry.packId}\``,
    `- Category: \`${entry.category}\``,
    "- Maturity: `secondary`",
    "- Use this as a reference example when no golden pack matches your problem closely.",
  ].join("\n")
}

function renderGoldenExamplesGuide(
  entries: readonly ExamplePackMeta[]
): string {
  const goldenEntries = entries.filter((entry) => entry.maturity === "golden")
  const secondaryEntries = entries.filter(
    (entry) => entry.maturity === "secondary"
  )
  const sections = [
    goldenExampleGuideTitle,
    "",
    "These are the governed internal Sync-Pack examples.",
    "",
    "Use `pnpm run feature-sync:verify` for daily operator validation.",
    "Use `pnpm run feature-sync:intent`, `pnpm run feature-sync:intent-check`, `pnpm run feature-sync:sync-examples`, and `pnpm run feature-sync:quality-validate` when changing the SDK/package itself.",
    "",
    "## Golden examples",
    "",
    ...goldenEntries.flatMap((entry) => {
      const guidance =
        goldenExampleGuidance[entry.packId as SyncPackGoldenExamplePackId]

      return [
        `### ${entry.packId}`,
        `- Path: \`docs/sync-pack/generated-packs/${entry.category}/${entry.packId}\``,
        `- Category: \`${entry.category}\``,
        `- Name: ${entry.name}`,
        `- Fitness: \`${entry.fitness.verifyStatus}\` on SDK \`${entry.fitness.sdkVersion}\``,
        `- When to start: ${guidance.whenToStart}`,
        `- When not to start: ${guidance.whenNotToStart}`,
        "- Follow-up commands:",
        "  - `pnpm run feature-sync:generate -- --pack <pack-id>`",
        "  - `pnpm run feature-sync:check`",
        "  - `pnpm run feature-sync:verify`",
        "  - `pnpm run feature-sync:quality-validate` when the SDK/package changed",
        "",
      ]
    }),
    "## Secondary examples",
    "",
    ...secondaryEntries.flatMap((entry) => [
      createSecondaryGuideSection(entry),
      "",
    ]),
  ]

  return `${sections.join("\n").trimEnd()}\n`
}

async function buildExampleEntries(options: {
  readonly packageRoot: string
  readonly packsRoot: string
  readonly now: () => Date
}): Promise<{
  readonly entries: readonly ExamplePackMeta[]
  readonly findings: readonly SyncPackExampleFitnessFinding[]
}> {
  const sdkVersion = await readPackageVersion(options.packageRoot)
  const seedCandidates = await readSeedCandidates(
    resolveSeedPath(options.packageRoot)
  )
  const seedStatusById = new Map(
    seedCandidates.map((candidate) => [candidate.id, candidate.status])
  )
  const packDirectories = await findGeneratedPackDirectories(options.packsRoot)
  const findings: SyncPackExampleFitnessFinding[] = []
  const entries: ExamplePackMeta[] = []

  if (packDirectories.length !== 8) {
    findings.push({
      severity: "error",
      code: "unexpected-example-pack-count",
      filePath: options.packsRoot,
      message: `Expected 8 governed example packs, found ${packDirectories.length}.`,
      remediation: createExampleRemediation(
        "Restore the governed example-pack set before rerunning feature-sync:sync-examples."
      ),
    })
  }

  for (const packDirectory of packDirectories) {
    const packCheckFindings = await checkGeneratedPackDirectory(packDirectory)

    findings.push(
      ...summarizeExamplePackFindings(packDirectory, packCheckFindings)
    )

    try {
      const candidate = await readPackCandidate(packDirectory)
      const maturity = isGoldenPackId(candidate.id) ? "golden" : "secondary"
      const verifyStatus =
        packCheckFindings.some((finding) => finding.severity === "error") ||
        (maturity === "golden" &&
          (candidate.status !== "approved" ||
            seedStatusById.get(candidate.id) !== "approved"))
          ? "fail"
          : "pass"

      if (maturity === "golden" && candidate.status !== "approved") {
        findings.push({
          severity: "error",
          code: "golden-example-pack-not-approved",
          filePath: path.join(packDirectory, "00-candidate.json"),
          message: `Golden example ${candidate.id} must be approved in generated pack output.`,
          remediation: createExampleRemediation(
            `Promote ${candidate.id} to approved in generated pack output, then rerun feature-sync:sync-examples.`,
            {
              doc: goldenExamplesDocPath,
            }
          ),
        })
      }

      if (
        maturity === "golden" &&
        seedStatusById.get(candidate.id) !== "approved"
      ) {
        findings.push({
          severity: "error",
          code: "golden-example-seed-not-approved",
          filePath: resolveSeedPath(options.packageRoot),
          message: `Golden example ${candidate.id} must be approved in rules/sync-pack/openalternative.seed.json.`,
          remediation: createExampleRemediation(
            `Promote ${candidate.id} to approved in the seed file, regenerate packs if needed, then rerun feature-sync:sync-examples.`,
            {
              doc: goldenExamplesDocPath,
            }
          ),
        })
      }

      entries.push({
        packId: candidate.id,
        name: candidate.name,
        category: candidate.internalCategory,
        maturity,
        fitness: {
          lastVerifiedAt: options.now().toISOString(),
          sdkVersion,
          verifyStatus,
        },
      })
    } catch (error) {
      const candidatePath = path.join(packDirectory, "00-candidate.json")

      findings.push({
        severity: "error",
        code:
          error instanceof ZodError
            ? "example-pack-invalid-candidate"
            : "example-pack-read-failed",
        filePath: candidatePath,
        message:
          error instanceof ZodError
            ? `Example pack candidate metadata is invalid: ${error.issues
                .slice(0, 3)
                .map((issue) => {
                  const issuePath =
                    issue.path.length > 0 ? issue.path.join(".") : "root"
                  return `${issuePath}: ${issue.message}`
                })
                .join("; ")}`
            : `Unable to read example pack candidate: ${error instanceof Error ? error.message : String(error)}`,
        remediation: createExampleRemediation(
          `Repair ${candidatePath} so the example can be registered and rerun feature-sync:sync-examples.`
        ),
      })
    }
  }

  return {
    entries: entries.sort((left, right) =>
      `${left.category}/${left.packId}`.localeCompare(
        `${right.category}/${right.packId}`
      )
    ),
    findings,
  }
}

async function readExampleRegistry(
  registryPath: string
): Promise<readonly ExamplePackMeta[]> {
  return examplePackRegistrySchema.parse(
    JSON.parse(await readFile(registryPath, "utf8"))
  )
}

function findRegistryEntry(
  registry: readonly ExamplePackMeta[],
  packId: string
): ExamplePackMeta | undefined {
  return registry.find((entry) => entry.packId === packId)
}

function validateIsoTimestamp(value: string): boolean {
  return Number.isFinite(Date.parse(value))
}

export async function syncGoldenExampleFitness(
  options: SyncGoldenExampleFitnessOptions = {}
): Promise<SyncGoldenExampleFitnessResult> {
  const packageRoot = path.resolve(options.packageRoot ?? findFeaturesSdkRoot())
  const packsRoot = path.resolve(
    options.packsRoot ?? resolveGeneratedPacksPath(packageRoot)
  )
  const registryPath = path.resolve(
    options.registryPath ?? resolveExampleRegistryPath(packageRoot)
  )
  const guidePath = path.resolve(
    options.guidePath ?? resolveGoldenExamplesGuidePath(packageRoot)
  )
  const now = options.now ?? (() => new Date())
  const { entries, findings } = await buildExampleEntries({
    packageRoot,
    packsRoot,
    now,
  })

  await mkdir(path.dirname(registryPath), { recursive: true })
  await writeFile(registryPath, `${JSON.stringify(entries, null, 2)}\n`, "utf8")
  await writeFile(guidePath, renderGoldenExamplesGuide(entries), "utf8")

  const dedupedFindings = findings.filter(
    (finding, index, allFindings) =>
      allFindings.findIndex(
        (candidate) =>
          candidate.code === finding.code &&
          candidate.message === finding.message &&
          candidate.filePath === finding.filePath
      ) === index
  )
  const { errorCount, warningCount } = countFindings(dedupedFindings)

  return {
    contractId: syncPackExampleContractId,
    registryPath,
    guidePath,
    registry: entries,
    findings: dedupedFindings,
    errorCount,
    warningCount,
    packCount: entries.length,
  }
}

export async function checkGoldenExampleFitness(
  options: CheckGoldenExampleFitnessOptions = {}
): Promise<CheckGoldenExampleFitnessResult> {
  const packageRoot = path.resolve(options.packageRoot ?? findFeaturesSdkRoot())
  const packsRoot = path.resolve(
    options.packsRoot ?? resolveGeneratedPacksPath(packageRoot)
  )
  const registryPath = path.resolve(
    options.registryPath ?? resolveExampleRegistryPath(packageRoot)
  )
  const guidePath = path.resolve(
    options.guidePath ?? resolveGoldenExamplesGuidePath(packageRoot)
  )
  const findings: SyncPackExampleFitnessFinding[] = []

  if (!existsSync(registryPath)) {
    findings.push({
      severity: "error",
      code: "missing-example-pack-registry",
      filePath: registryPath,
      message: "Example pack registry is missing.",
      remediation: createExampleRemediation(
        "Run pnpm run feature-sync:sync-examples to regenerate the registry."
      ),
    })
  }

  if (!existsSync(guidePath)) {
    findings.push({
      severity: "error",
      code: "missing-golden-examples-guide",
      filePath: guidePath,
      message: "Golden examples guide is missing.",
      remediation: createExampleRemediation(
        "Run pnpm run feature-sync:sync-examples to regenerate the golden examples guide."
      ),
    })
  }

  let registry: readonly ExamplePackMeta[] = []

  if (findings.length === 0) {
    try {
      registry = await readExampleRegistry(registryPath)
    } catch (error) {
      findings.push({
        severity: "error",
        code:
          error instanceof ZodError
            ? "invalid-example-pack-registry-schema"
            : "invalid-example-pack-registry-json",
        filePath: registryPath,
        message:
          error instanceof ZodError
            ? `Example pack registry does not satisfy ${syncPackExampleContractId}: ${error.issues
                .slice(0, 3)
                .map((issue) => {
                  const issuePath =
                    issue.path.length > 0 ? issue.path.join(".") : "root"
                  return `${issuePath}: ${issue.message}`
                })
                .join("; ")}`
            : `Unable to read example pack registry: ${error instanceof Error ? error.message : String(error)}`,
        remediation: createExampleRemediation(
          "Run pnpm run feature-sync:sync-examples to regenerate a valid example pack registry."
        ),
      })
    }
  }

  if (registry.length > 0) {
    const sdkVersion = await readPackageVersion(packageRoot)
    const seedCandidates = await readSeedCandidates(
      resolveSeedPath(packageRoot)
    )
    const seedStatusById = new Map(
      seedCandidates.map((candidate) => [candidate.id, candidate.status])
    )
    const packDirectories = await findGeneratedPackDirectories(packsRoot)
    const actualPackIds = new Set<string>()

    if (packDirectories.length !== 8) {
      findings.push({
        severity: "error",
        code: "unexpected-example-pack-count",
        filePath: packsRoot,
        message: `Expected 8 governed example packs, found ${packDirectories.length}.`,
        remediation: createExampleRemediation(
          "Restore the governed example-pack set or rerun feature-sync:sync-examples after repairing generated packs."
        ),
      })
    }

    for (const packDirectory of packDirectories) {
      try {
        const candidate = await readPackCandidate(packDirectory)
        actualPackIds.add(candidate.id)
      } catch {
        actualPackIds.add(path.basename(packDirectory))
      }
    }

    if (registry.length !== packDirectories.length) {
      findings.push({
        severity: "error",
        code: "example-pack-registry-count-mismatch",
        filePath: registryPath,
        message: `Example pack registry records ${registry.length} entries but ${packDirectories.length} generated packs exist.`,
        remediation: createExampleRemediation(
          "Run pnpm run feature-sync:sync-examples so the registry matches the current generated pack set."
        ),
      })
    }

    for (const goldenPackId of syncPackGoldenExamplePackIds) {
      const entry = findRegistryEntry(registry, goldenPackId)

      if (!entry) {
        findings.push({
          severity: "error",
          code: "missing-golden-example-entry",
          filePath: registryPath,
          message: `Golden example ${goldenPackId} is missing from the registry.`,
          remediation: createExampleRemediation(
            "Run pnpm run feature-sync:sync-examples so all golden examples are registered."
          ),
        })
        continue
      }

      if (entry.maturity !== "golden") {
        findings.push({
          severity: "error",
          code: "invalid-golden-example-maturity",
          filePath: registryPath,
          message: `Golden example ${goldenPackId} must be marked as golden in the registry.`,
          remediation: createExampleRemediation(
            `Restore ${goldenPackId} as a golden example via feature-sync:sync-examples.`
          ),
        })
      }

      if (entry.fitness.sdkVersion !== sdkVersion) {
        findings.push({
          severity: "error",
          code: "stale-example-fitness-sdk-version",
          filePath: registryPath,
          message: `Golden example ${goldenPackId} was last verified against SDK ${entry.fitness.sdkVersion}; current SDK version is ${sdkVersion}.`,
          remediation: createExampleRemediation(
            "Run pnpm run feature-sync:sync-examples to refresh golden example fitness metadata."
          ),
        })
      }

      if (!validateIsoTimestamp(entry.fitness.lastVerifiedAt)) {
        findings.push({
          severity: "error",
          code: "invalid-example-fitness-timestamp",
          filePath: registryPath,
          message: `Golden example ${goldenPackId} has an invalid lastVerifiedAt timestamp.`,
          remediation: createExampleRemediation(
            "Run pnpm run feature-sync:sync-examples to rewrite valid example fitness timestamps."
          ),
        })
      }

      const packDirectory = path.join(packsRoot, entry.category, entry.packId)

      if (!existsSync(packDirectory)) {
        findings.push({
          severity: "error",
          code: "missing-golden-example-pack",
          filePath: packDirectory,
          message: `Golden example pack ${entry.packId} does not exist under generated packs.`,
          remediation: createExampleRemediation(
            `Restore docs/sync-pack/generated-packs/${entry.category}/${entry.packId} and rerun feature-sync:sync-examples.`
          ),
        })
        continue
      }

      const packFindings = await checkGeneratedPackDirectory(packDirectory)

      if (packFindings.some((finding) => finding.severity === "error")) {
        findings.push({
          severity: "error",
          code: "broken-golden-example-pack",
          filePath: packDirectory,
          message: `Golden example ${entry.packId} does not currently pass generated-pack validation.`,
          remediation: createExampleRemediation(
            `Repair ${entry.packId}, rerun feature-sync:check if needed, then rerun feature-sync:sync-examples.`
          ),
        })
      }

      try {
        const candidate = await readPackCandidate(packDirectory)

        if (candidate.status !== "approved") {
          findings.push({
            severity: "error",
            code: "golden-example-pack-not-approved",
            filePath: path.join(packDirectory, "00-candidate.json"),
            message: `Golden example ${entry.packId} must be approved in generated pack output.`,
            remediation: createExampleRemediation(
              `Promote ${entry.packId} to approved in generated pack output and rerun feature-sync:sync-examples.`
            ),
          })
        }

        if (seedStatusById.get(entry.packId) !== "approved") {
          findings.push({
            severity: "error",
            code: "golden-example-seed-not-approved",
            filePath: resolveSeedPath(packageRoot),
            message: `Golden example ${entry.packId} must be approved in rules/sync-pack/openalternative.seed.json.`,
            remediation: createExampleRemediation(
              `Promote ${entry.packId} to approved in the seed file, regenerate packs if needed, then rerun feature-sync:sync-examples.`
            ),
          })
        }

        if (
          candidate.name !== entry.name ||
          candidate.internalCategory !== entry.category
        ) {
          findings.push({
            severity: "error",
            code: "golden-example-registry-mismatch",
            filePath: registryPath,
            message: `Registry entry for ${entry.packId} does not match the generated pack candidate metadata.`,
            remediation: createExampleRemediation(
              `Run pnpm run feature-sync:sync-examples to resync ${entry.packId} metadata.`
            ),
          })
        }

        if (entry.fitness.verifyStatus !== "pass") {
          findings.push({
            severity: "error",
            code: "golden-example-registry-not-pass",
            filePath: registryPath,
            message: `Golden example ${entry.packId} must record verifyStatus=pass in the registry.`,
            remediation: createExampleRemediation(
              `Repair ${entry.packId} and rerun feature-sync:sync-examples so the registry records pass status.`
            ),
          })
        }
      } catch (error) {
        findings.push({
          severity: "error",
          code: "golden-example-candidate-read-failed",
          filePath: path.join(packDirectory, "00-candidate.json"),
          message: `Unable to validate golden example ${entry.packId}: ${error instanceof Error ? error.message : String(error)}`,
          remediation: createExampleRemediation(
            `Repair ${entry.packId} candidate metadata and rerun feature-sync:sync-examples.`
          ),
        })
      }
    }

    for (const entry of registry) {
      if (!actualPackIds.has(entry.packId)) {
        findings.push({
          severity: "error",
          code: "orphaned-example-pack-registry-entry",
          filePath: registryPath,
          message: `Registry entry ${entry.packId} no longer maps to an existing generated pack.`,
          remediation: createExampleRemediation(
            "Run pnpm run feature-sync:sync-examples to remove orphaned example entries."
          ),
        })
      }

      if (entry.maturity === "golden" && !isGoldenPackId(entry.packId)) {
        findings.push({
          severity: "error",
          code: "unexpected-golden-example-entry",
          filePath: registryPath,
          message: `Registry entry ${entry.packId} is marked golden but is not in the governed golden set.`,
          remediation: createExampleRemediation(
            "Run pnpm run feature-sync:sync-examples to restore the governed golden set."
          ),
        })
      }
    }

    if (existsSync(guidePath)) {
      const guideContent = await readFile(guidePath, "utf8")

      for (const goldenPackId of syncPackGoldenExamplePackIds) {
        if (!guideContent.includes(goldenPackId)) {
          findings.push({
            severity: "error",
            code: "golden-example-guide-missing-pack",
            filePath: guidePath,
            message: `Golden examples guide does not mention ${goldenPackId}.`,
            remediation: createExampleRemediation(
              "Run pnpm run feature-sync:sync-examples to regenerate the golden examples guide."
            ),
          })
        }
      }

      for (const requiredText of [
        "pnpm run feature-sync:generate",
        "pnpm run feature-sync:check",
        "pnpm run feature-sync:verify",
        "pnpm run feature-sync:quality-validate",
        "pnpm run feature-sync:sync-examples",
      ]) {
        if (!guideContent.includes(requiredText)) {
          findings.push({
            severity: "error",
            code: "golden-example-guide-command-drift",
            filePath: guidePath,
            message: `Golden examples guide must reference ${requiredText}.`,
            remediation: createExampleRemediation(
              "Run pnpm run feature-sync:sync-examples to regenerate the guide with current commands."
            ),
          })
        }
      }
    }
  }

  const dedupedFindings = findings.filter(
    (finding, index, allFindings) =>
      allFindings.findIndex(
        (candidate) =>
          candidate.code === finding.code &&
          candidate.message === finding.message &&
          candidate.filePath === finding.filePath
      ) === index
  )
  const { errorCount, warningCount } = countFindings(dedupedFindings)

  return {
    contractId: syncPackExampleContractId,
    registryPath,
    guidePath,
    registry,
    findings: dedupedFindings,
    errorCount,
    warningCount,
  }
}
