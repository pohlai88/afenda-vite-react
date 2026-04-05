/// <reference types="node" />

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

export type ReadmeTargetMode =
  | 'docs-root'
  | 'docs-collections'
  | 'scripts'
  | 'generic-formal-directory'

export interface ReadmeTargetDefinition {
  path: string
  mode: ReadmeTargetMode
  title?: string
  description?: string
  includeChildDirectories?: boolean
}

export interface AfendaConfig {
  $schema?: string
  schemaVersion: number
  product: {
    name: string
    description: string
  }
  workspace: {
    packageManager: 'pnpm'
    rootPackageName: string
    defaultPackageScope: string
  }
  paths: {
    webApp: string
    typescriptSharedConfig: string
  }
  readmeTargets: ReadmeTargetDefinition[]
  workspaceGovernance: WorkspaceGovernance
}

export interface WorkspaceGovernance {
  rootTopology: RootTopologyGovernance
  featureTemplate: FeatureTemplateGovernance
  sharedPackageTemplate: SharedPackageTemplateGovernance
  webClientSrc: WebClientSrcGovernance
}

export interface RootTopologyGovernance {
  primaryProductDirectories: string[]
  allowedRootDirectories: string[]
  requiredRootFiles: string[]
}

export interface FeatureTemplateGovernance {
  featuresRoot: string
  requiredDirectories: string[]
  requiredFiles: string[]
  enforceWhenFeatureExists: boolean
}

export interface SharedPackageTemplateGovernance {
  packagePath: string
  requiredDirectories: string[]
  requireDirectoriesWhenPackageExists: boolean
}

/** Machine-enforced `apps/web/src` topology (see docs/PROJECT_STRUCTURE.md). */
export interface WebClientSrcGovernance {
  srcRoot: string
  allowedTopLevelDirectories: string[]
  requiredShareSubdirectories: string[]
  enforce: boolean
}

export const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
export const workspaceRoot = path.resolve(scriptDirectory, '..')
export const afendaConfigPath = path.join(scriptDirectory, 'afenda.config.json')
export const afendaSchemaPath = path.join(
  scriptDirectory,
  'afenda.config.schema.json',
)

export async function loadAfendaConfig(): Promise<AfendaConfig> {
  const value = await readJsonFile(afendaConfigPath)
  assertAfendaConfigShape(value)

  return value
}

export async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as unknown
}

export function assertAfendaConfigShape(
  value: unknown,
): asserts value is AfendaConfig {
  assert(isRecord(value), 'Afenda config must be a JSON object.')

  assert(value.schemaVersion === 1, 'Afenda config schemaVersion must be 1.')

  assert(isRecord(value.product), 'Afenda config product must be an object.')
  assertNonEmptyString(value.product.name, 'product.name')
  assertNonEmptyString(value.product.description, 'product.description')

  assert(
    isRecord(value.workspace),
    'Afenda config workspace must be an object.',
  )
  assert(
    value.workspace.packageManager === 'pnpm',
    'Afenda config workspace.packageManager must be "pnpm".',
  )
  assertNonEmptyString(
    value.workspace.rootPackageName,
    'workspace.rootPackageName',
  )
  assertNonEmptyString(
    value.workspace.defaultPackageScope,
    'workspace.defaultPackageScope',
  )

  assert(isRecord(value.paths), 'Afenda config paths must be an object.')
  assertNonEmptyString(value.paths.webApp, 'paths.webApp')
  assertNonEmptyString(
    value.paths.typescriptSharedConfig,
    'paths.typescriptSharedConfig',
  )

  assert(
    Array.isArray(value.readmeTargets),
    'Afenda config readmeTargets must be an array.',
  )
  assert(
    value.readmeTargets.length > 0,
    'Afenda config readmeTargets must contain at least one target.',
  )

  value.readmeTargets.forEach((target, index) => {
    assertReadmeTargetDefinition(target, `readmeTargets[${index}]`)
  })

  assert(
    isRecord(value.workspaceGovernance),
    'Afenda config workspaceGovernance must be an object.',
  )

  assert(
    isRecord(value.workspaceGovernance.rootTopology),
    'workspaceGovernance.rootTopology must be an object.',
  )
  assertStringArray(
    value.workspaceGovernance.rootTopology.primaryProductDirectories,
    'workspaceGovernance.rootTopology.primaryProductDirectories',
  )
  assertStringArray(
    value.workspaceGovernance.rootTopology.allowedRootDirectories,
    'workspaceGovernance.rootTopology.allowedRootDirectories',
  )
  assertStringArray(
    value.workspaceGovernance.rootTopology.requiredRootFiles,
    'workspaceGovernance.rootTopology.requiredRootFiles',
  )

  assert(
    isRecord(value.workspaceGovernance.featureTemplate),
    'workspaceGovernance.featureTemplate must be an object.',
  )
  assertNonEmptyString(
    value.workspaceGovernance.featureTemplate.featuresRoot,
    'workspaceGovernance.featureTemplate.featuresRoot',
  )
  assertStringArray(
    value.workspaceGovernance.featureTemplate.requiredDirectories,
    'workspaceGovernance.featureTemplate.requiredDirectories',
  )
  assertStringArray(
    value.workspaceGovernance.featureTemplate.requiredFiles,
    'workspaceGovernance.featureTemplate.requiredFiles',
  )
  assert(
    typeof value.workspaceGovernance.featureTemplate.enforceWhenFeatureExists ===
      'boolean',
    'workspaceGovernance.featureTemplate.enforceWhenFeatureExists must be a boolean.',
  )

  assert(
    isRecord(value.workspaceGovernance.sharedPackageTemplate),
    'workspaceGovernance.sharedPackageTemplate must be an object.',
  )
  assertNonEmptyString(
    value.workspaceGovernance.sharedPackageTemplate.packagePath,
    'workspaceGovernance.sharedPackageTemplate.packagePath',
  )
  assertStringArray(
    value.workspaceGovernance.sharedPackageTemplate.requiredDirectories,
    'workspaceGovernance.sharedPackageTemplate.requiredDirectories',
  )
  assert(
    typeof value.workspaceGovernance.sharedPackageTemplate
      .requireDirectoriesWhenPackageExists === 'boolean',
    'workspaceGovernance.sharedPackageTemplate.requireDirectoriesWhenPackageExists must be a boolean.',
  )

  assert(
    isRecord(value.workspaceGovernance.webClientSrc),
    'workspaceGovernance.webClientSrc must be an object.',
  )
  assertNonEmptyString(
    value.workspaceGovernance.webClientSrc.srcRoot,
    'workspaceGovernance.webClientSrc.srcRoot',
  )
  assertStringArray(
    value.workspaceGovernance.webClientSrc.allowedTopLevelDirectories,
    'workspaceGovernance.webClientSrc.allowedTopLevelDirectories',
  )
  assert(
    Array.isArray(value.workspaceGovernance.webClientSrc.requiredShareSubdirectories),
    'workspaceGovernance.webClientSrc.requiredShareSubdirectories must be an array.',
  )
  value.workspaceGovernance.webClientSrc.requiredShareSubdirectories.forEach(
    (item, index) => {
      assertNonEmptyString(
        item,
        `workspaceGovernance.webClientSrc.requiredShareSubdirectories[${index}]`,
      )
    },
  )
  assert(
    typeof value.workspaceGovernance.webClientSrc.enforce === 'boolean',
    'workspaceGovernance.webClientSrc.enforce must be a boolean.',
  )
}

export function assertReadmeTargetDefinition(
  value: unknown,
  label: string,
): asserts value is ReadmeTargetDefinition {
  assert(isRecord(value), `${label} must be an object.`)
  assertNonEmptyString(value.path, `${label}.path`)
  assertReadmeTargetMode(value.mode, `${label}.mode`)

  if (value.title !== undefined) {
    assertNonEmptyString(value.title, `${label}.title`)
  }

  if (value.description !== undefined) {
    assertNonEmptyString(value.description, `${label}.description`)
  }

  if (value.includeChildDirectories !== undefined) {
    assert(
      typeof value.includeChildDirectories === 'boolean',
      `${label}.includeChildDirectories must be a boolean.`,
    )
    assert(
      value.mode === 'generic-formal-directory',
      `${label}.includeChildDirectories is only supported for generic-formal-directory targets.`,
    )
  }

  if (value.mode === 'generic-formal-directory') {
    assertNonEmptyString(value.title, `${label}.title`)
    assertNonEmptyString(value.description, `${label}.description`)
  }
}

export function assertReadmeTargetMode(
  value: unknown,
  label: string,
): asserts value is ReadmeTargetMode {
  assert(
    value === 'docs-root' ||
      value === 'docs-collections' ||
      value === 'scripts' ||
      value === 'generic-formal-directory',
    `${label} must be one of: docs-root, docs-collections, scripts, generic-formal-directory.`,
  )
}

export function assertNonEmptyString(
  value: unknown,
  label: string,
): asserts value is string {
  assert(
    typeof value === 'string' && value.trim().length > 0,
    `${label} must be a non-empty string.`,
  )
}

export function assertStringArray(
  value: unknown,
  label: string,
): asserts value is string[] {
  assert(Array.isArray(value), `${label} must be an array.`)
  assert(value.length > 0, `${label} must contain at least one item.`)
  value.forEach((item, index) => {
    assertNonEmptyString(item, `${label}[${index}]`)
  })
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function toPosixPath(value: string) {
  return value.split(path.sep).join('/')
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
