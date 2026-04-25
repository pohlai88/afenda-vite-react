import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import {
  featureCategorySchema,
  type FeatureCategory,
} from "../schema/category.schema.js"
import type { StackDependencyGroup } from "../schema/stack-contract.schema.js"
import {
  stackScaffoldManifestSchema,
  type StackDependency,
  type StackRouteSuggestion,
  type StackScaffoldManifest,
} from "../schema/stack-contract.schema.js"
import { getTechStackForCategory } from "../schema/tech-stack.schema.js"
import {
  findFeaturesSdkRoot,
  findWorkspaceRoot,
  resolveGeneratedPacksPath,
} from "../workspace.js"

import {
  readWorkspaceCatalogVersions,
  type WorkspaceCatalogVersions,
} from "./workspace-catalog.js"
import {
  assertScaffoldPlacementPaths,
  toRelativePosixPath,
} from "./path-contract.js"

interface CreateTechStackScaffoldManifestOptions {
  readonly appId: string
  readonly category: FeatureCategory
  readonly packageName?: string
  readonly workspaceRoot?: string
}

export interface WriteTechStackScaffoldOptions extends CreateTechStackScaffoldManifestOptions {
  readonly outputDirectory: string
}

export interface WriteTechStackScaffoldResult {
  readonly outputDirectory: string
  readonly manifest: StackScaffoldManifest
  readonly writtenFiles: readonly string[]
}

interface DependencyDefinition {
  readonly name: string
  readonly group: StackDependencyGroup
  readonly requiredFor: readonly string[]
}

interface ReferenceVersions {
  readonly catalog: WorkspaceCatalogVersions
  readonly packageVersions: Record<string, string>
}

const dependencyDefinitions = [
  {
    name: "react",
    group: "dependencies",
    requiredFor: ["frontend"],
  },
  {
    name: "react-dom",
    group: "dependencies",
    requiredFor: ["frontend"],
  },
  {
    name: "@tanstack/react-query",
    group: "dependencies",
    requiredFor: ["frontend", "data-fetching"],
  },
  {
    name: "react-router-dom",
    group: "dependencies",
    requiredFor: ["frontend", "routing"],
  },
  {
    name: "radix-ui",
    group: "dependencies",
    requiredFor: ["frontend", "ui"],
  },
  {
    name: "class-variance-authority",
    group: "dependencies",
    requiredFor: ["frontend", "ui"],
  },
  {
    name: "hono",
    group: "dependencies",
    requiredFor: ["backend", "api"],
  },
  {
    name: "drizzle-orm",
    group: "dependencies",
    requiredFor: ["backend", "database"],
  },
  {
    name: "zod",
    group: "dependencies",
    requiredFor: ["validation", "contracts"],
  },
  {
    name: "typescript",
    group: "devDependencies",
    requiredFor: ["typecheck"],
  },
  {
    name: "vite",
    group: "devDependencies",
    requiredFor: ["frontend", "build"],
  },
  {
    name: "vitest",
    group: "devDependencies",
    requiredFor: ["test"],
  },
  {
    name: "tsx",
    group: "devDependencies",
    requiredFor: ["cli", "scripts"],
  },
  {
    name: "eslint",
    group: "devDependencies",
    requiredFor: ["lint"],
  },
  {
    name: "tailwindcss",
    group: "devDependencies",
    requiredFor: ["frontend", "styling"],
  },
  {
    name: "@tailwindcss/vite",
    group: "devDependencies",
    requiredFor: ["frontend", "styling"],
  },
  {
    name: "@vitejs/plugin-react",
    group: "devDependencies",
    requiredFor: ["frontend", "build"],
  },
  {
    name: "@types/node",
    group: "devDependencies",
    requiredFor: ["typecheck"],
  },
  {
    name: "@types/react",
    group: "devDependencies",
    requiredFor: ["frontend", "typecheck"],
  },
  {
    name: "@types/react-dom",
    group: "devDependencies",
    requiredFor: ["frontend", "typecheck"],
  },
] as const satisfies readonly DependencyDefinition[]

const fallbackVersions: Record<string, string> = {
  react: "^19.2.4",
  "react-dom": "^19.2.4",
  "@tanstack/react-query": "^5.96.2",
  "react-router-dom": "^7.14.0",
  "radix-ui": "^1.4.3",
  "class-variance-authority": "^0.7.1",
  hono: "^4.12.10",
  "drizzle-orm": "^0.45.1",
  zod: "^4.3.6",
  typescript: "~5.9.3",
  vite: "7.3.2",
  vitest: "^4.1.4",
  tsx: "^4.21.0",
  eslint: "^9.39.4",
  tailwindcss: "^4.2.2",
  "@tailwindcss/vite": "^4.2.2",
  "@vitejs/plugin-react": "^5.2.0",
  "@types/node": "^24.12.2",
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3",
}

const scaffoldScripts = {
  dev: "vite --configLoader bundle",
  build: "tsc -b && vite build --configLoader bundle",
  typecheck: "tsc -b",
  lint: "eslint .",
  "test:run": "vitest run --configLoader bundle",
} as const satisfies Record<string, string>

type PackageJsonDependencySections = {
  readonly dependencies?: Record<string, string>
  readonly devDependencies?: Record<string, string>
  readonly peerDependencies?: Record<string, string>
  readonly optionalDependencies?: Record<string, string>
}

async function readPackageJsonVersions(
  packageJsonPath: string
): Promise<Record<string, string>> {
  const rawPackageJson = await readFile(packageJsonPath, "utf8")
  const packageJson = JSON.parse(
    rawPackageJson
  ) as PackageJsonDependencySections

  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
    ...packageJson.peerDependencies,
    ...packageJson.optionalDependencies,
  }
}

async function readPackageJsonVersionsIfExists(
  packageJsonPath: string
): Promise<Record<string, string>> {
  if (!existsSync(packageJsonPath)) {
    return {}
  }

  return readPackageJsonVersions(packageJsonPath)
}

async function readReferenceVersions(
  workspaceRoot: string
): Promise<ReferenceVersions> {
  const catalog = await readWorkspaceCatalogVersions(workspaceRoot)
  const rootVersions = await readPackageJsonVersionsIfExists(
    path.join(workspaceRoot, "package.json")
  )
  const webVersions = await readPackageJsonVersionsIfExists(
    path.join(workspaceRoot, "apps", "web", "package.json")
  )

  return {
    catalog,
    packageVersions: {
      ...rootVersions,
      ...webVersions,
    },
  }
}

function resolveDependency(
  definition: DependencyDefinition,
  versions: ReferenceVersions
): StackDependency {
  if (versions.catalog[definition.name]) {
    return {
      name: definition.name,
      group: definition.group,
      versionSpec: "catalog:",
      source: "workspace-catalog",
      requiredFor: [...definition.requiredFor],
    }
  }

  if (versions.packageVersions[definition.name]) {
    return {
      name: definition.name,
      group: definition.group,
      versionSpec: versions.packageVersions[definition.name],
      source: "workspace-package",
      requiredFor: [...definition.requiredFor],
    }
  }

  return {
    name: definition.name,
    group: definition.group,
    versionSpec: fallbackVersions[definition.name],
    source: "fallback",
    requiredFor: [...definition.requiredFor],
  }
}

function toDependencyRecord(
  dependencies: readonly StackDependency[]
): Record<string, string> {
  return Object.fromEntries(
    dependencies.map((dependency) => [dependency.name, dependency.versionSpec])
  )
}

function renderScaffoldReadme(manifest: StackScaffoldManifest): string {
  const recommendation = getTechStackForCategory(manifest.category)
  const routeSuggestions = manifest.routeSuggestions
    .map(
      (suggestion) =>
        `- ${suggestion.surface}: ${suggestion.path} (${suggestion.rationale})`
    )
    .join("\n")
  const nextCommands = manifest.nextCommands
    .map((command) => `- ${command}`)
    .join("\n")

  return `# ${manifest.packageName}

Generated by ${manifest.generatedBy}.

## Purpose

This scaffold is a stack contract, not a completed app. Use it to start an internal feature implementation with the same dependency baseline that the Sync-Pack doctor validates.

## Category

${manifest.category}

## Default Stack

${Object.entries(recommendation.defaultStack)
  .map(([section, values]) => `- ${section}: ${values.join(", ")}`)
  .join("\n")}

## Category Override

${recommendation.categoryOverride.map((value) => `- ${value}`).join("\n")}

## Placement Hints

- planning pack: ${manifest.placement.planningPackDirectory}
- web feature: ${manifest.placement.webFeatureDirectory}
- api module: ${manifest.placement.apiModuleDirectory}
- api route file: ${manifest.placement.apiRouteFile}

## Suggested Routes

${routeSuggestions}

## Next Commands

${nextCommands}

## Deferred

GitHub PR submission and GitHub Actions blocking checks are deferred until the scaffold CLI and SDK contract are accepted.
`
}

function resolvePlanningPackDirectory(
  workspaceRoot: string,
  featuresSdkRoot: string,
  category: FeatureCategory,
  appId: string
): string {
  const planningPackDirectory = path.join(
    resolveGeneratedPacksPath(featuresSdkRoot),
    category,
    appId
  )

  return toRelativePosixPath({
    workspaceRoot,
    targetPath: planningPackDirectory,
    label: "placement.planningPackDirectory",
    fallbackPath: `packages/features-sdk/docs/sync-pack/generated-packs/${category}/${appId}`,
  })
}

function createPlacementHints(
  workspaceRoot: string,
  appId: string,
  category: FeatureCategory
): StackScaffoldManifest["placement"] {
  const featuresSdkRoot = findFeaturesSdkRoot(workspaceRoot)

  return assertScaffoldPlacementPaths({
    planningPackDirectory: resolvePlanningPackDirectory(
      workspaceRoot,
      featuresSdkRoot,
      category,
      appId
    ),
    webFeatureDirectory: `apps/web/src/app/_features/${appId}`,
    apiModuleDirectory: `apps/api/src/modules/${appId}`,
    apiRouteFile: `apps/api/src/routes/${appId}.ts`,
  })
}

function createRouteSuggestions(
  appId: string
): readonly StackRouteSuggestion[] {
  return [
    {
      surface: "web",
      path: `/app/${appId}`,
      rationale:
        "Suggested web route segment for the feature shell; align it with the owning app router before implementation.",
    },
    {
      surface: "api",
      path: `/api/${appId}`,
      rationale:
        "Suggested API base path for a dedicated Hono route file and module directory.",
    },
  ]
}

export async function createTechStackScaffoldManifest(
  options: CreateTechStackScaffoldManifestOptions
): Promise<StackScaffoldManifest> {
  const workspaceRoot = options.workspaceRoot ?? findWorkspaceRoot()
  const versions = await readReferenceVersions(workspaceRoot)
  const category = featureCategorySchema.parse(options.category)
  const dependencies = dependencyDefinitions
    .map((definition) => resolveDependency(definition, versions))
    .filter((dependency) => dependency.group === "dependencies")
  const devDependencies = dependencyDefinitions
    .map((definition) => resolveDependency(definition, versions))
    .filter((dependency) => dependency.group === "devDependencies")

  return stackScaffoldManifestSchema.parse({
    appId: options.appId,
    packageName: options.packageName ?? `@afenda/${options.appId}`,
    category,
    generatedBy: "@afenda/features-sdk/sync-pack",
    dependencies,
    devDependencies,
    scripts: scaffoldScripts,
    placement: createPlacementHints(workspaceRoot, options.appId, category),
    routeSuggestions: createRouteSuggestions(options.appId),
    nextCommands: [
      "pnpm run feature-sync:verify",
      `pnpm run feature-sync:scaffold -- --app-id ${options.appId} --category ${category}`,
      "pnpm run feature-sync:doctor -- --target apps/web",
      "pnpm run feature-sync:doctor -- --target apps/api",
    ],
    notes: [
      "Use catalog: for dependencies available in pnpm-workspace.yaml.",
      "Run sync-pack:doctor before implementation handoff.",
      "GitHub PR submission and GitHub Actions enforcement are deferred for this SDK baseline.",
    ],
  })
}

export async function writeTechStackScaffold(
  options: WriteTechStackScaffoldOptions
): Promise<WriteTechStackScaffoldResult> {
  const manifest = await createTechStackScaffoldManifest(options)
  const outputDirectory = path.resolve(options.outputDirectory)
  const packageJson = {
    name: manifest.packageName,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: manifest.scripts,
    dependencies: toDependencyRecord(manifest.dependencies),
    devDependencies: toDependencyRecord(manifest.devDependencies),
  }
  const files = [
    {
      path: path.join(outputDirectory, "package.json"),
      content: `${JSON.stringify(packageJson, null, 2)}\n`,
    },
    {
      path: path.join(outputDirectory, "STACK_CONTRACT.json"),
      content: `${JSON.stringify(manifest, null, 2)}\n`,
    },
    {
      path: path.join(outputDirectory, "README.md"),
      content: renderScaffoldReadme(manifest),
    },
  ]

  await mkdir(outputDirectory, { recursive: true })

  for (const file of files) {
    await writeFile(file.path, file.content, "utf8")
  }

  return {
    outputDirectory,
    manifest,
    writtenFiles: files.map((file) => file.path),
  }
}
