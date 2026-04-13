/**
 * TOKEN MANIFEST
 *
 * JSON-sidecar metadata for the emitted theme artifact.
 *
 * Architecture:
 * - CSS remains the runtime truth
 * - this manifest is artifact metadata for drift tracking, CI, and debugging
 * - this file must not redefine token semantics or emit CSS
 *
 * Rules:
 * - consume bridged / serialized / emitted outputs only
 * - keep metrics deterministic
 * - keep manifest shape versioned
 * - `emitRevision` is a monotonic integer from `resolveEmitRevisionForArtifact` when writing
 *   via `generateThemeCssArtifact` (increments only when emitted CSS `sha256` changes).
 */

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { bridgedThemeTokens } from './token-bridge'
import {
  buildEmittedThemeCssContent,
  DEFAULT_EMITTED_THEME_FILENAME,
  DEFAULT_EMITTED_THEME_OUTPUT_PATH,
} from './token-emit'
import { serializedThemeCss } from './token-serialize'
import { shadcnRegistry } from './shadcn-registry'
import type { BridgedThemeTokens, SerializedThemeCss } from './token-types'

//
// SCHEMA VERSION
//

/**
 * Bump only when the manifest JSON shape changes.
 * Do not bump for ordinary token or CSS content changes.
 */
export const THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION = 3 as const

//
// PACKAGE VERSION
//

/** Resolved from `…/design-architecture/src/tokenization/` → `packages/design-system/package.json`. */
const PACKAGE_JSON_URL = new URL('../../../package.json', import.meta.url)

function readDesignSystemPackageVersion(): string {
  const raw = readFileSync(fileURLToPath(PACKAGE_JSON_URL), 'utf8')
  const pkg = JSON.parse(raw) as { version?: unknown }

  return typeof pkg.version === 'string' ? pkg.version : '0.0.0'
}

//
// TYPES
//

export interface ThemeManifestGenerator {
  readonly package: '@afenda/design-system'
  readonly packageVersion: string
}

export interface ThemeManifestCssArtifact {
  readonly fileName: string
  readonly sha256: string
  readonly byteLength: number
  readonly lineCount: number
}

export interface ThemeManifestTokenization {
  readonly themeStaticDeclarationCount: number
  readonly darkModeDeclarationCount: number
  readonly runtimeParameterDeclarationCount: number
  readonly keyframeCount: number
  readonly totalCssDeclarationCount: number

  readonly shadcnRegistrySemanticColorCount: number
  readonly shadcnRegistryChartColorCount: number
  readonly shadcnRegistrySidebarColorCount: number
  readonly shadcnRegistryColorCount: number
  readonly shadcnRegistryRadiusCount: number
  readonly shadcnRegistryFontCount: number
  readonly shadcnRegistryTextSizeCount: number
  readonly shadcnRegistryShadowCount: number

  readonly shadcnRegistryRequiredAliasCount: number
  readonly shadcnRegistryExtraRuntimeAliasCount: number
  readonly shadcnRegistryWrappedAliasCount: number
  readonly shadcnRegistryTotalAliasCount: number
}

export interface ThemeManifestSections {
  readonly themeStaticLineCount: number
  readonly darkModeLineCount: number
  readonly runtimeParameterLineCount: number
  readonly keyframesLineCount: number
  readonly combinedLineCount: number
  readonly emittedLineCount: number
}

export interface ThemeArtifactManifest {
  readonly schemaVersion: typeof THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION
  /**
   * Increments when emitted theme CSS bytes change; stable across regenerations with identical output.
   * See `resolveEmitRevisionForArtifact`.
   */
  readonly emitRevision: number
  readonly generator: ThemeManifestGenerator
  readonly css: ThemeManifestCssArtifact
  readonly tokenization: ThemeManifestTokenization
  readonly sections: ThemeManifestSections
}

export interface BuildThemeArtifactManifestOptions {
  readonly outputPath?: string
  readonly emittedContent?: string
  readonly bridged?: BridgedThemeTokens
  readonly serialized?: SerializedThemeCss
  readonly cssFileName?: string
  /** Set by `generateThemeCssArtifact` from `resolveEmitRevisionForArtifact`. Default `1`. */
  readonly emitRevision?: number
}

//
// HELPERS
//

export function sha256ThemeArtifactContent(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

function sha256(content: string): string {
  return sha256ThemeArtifactContent(content)
}

/**
 * Next manifest `emitRevision`: starts at 1; increments only when `emittedCss` hash differs from
 * the previous manifest’s `css.sha256`. Same bytes → same revision (stable for git / CI).
 */
export function resolveEmitRevisionForArtifact(
  emittedCss: string,
  previousManifestRaw: string | undefined,
): number {
  const newHash = sha256ThemeArtifactContent(emittedCss)

  if (previousManifestRaw === undefined) {
    return 1
  }

  try {
    const prev = JSON.parse(previousManifestRaw) as {
      css?: { sha256?: string }
      emitRevision?: unknown
    }
    const prevHash = prev.css?.sha256
    const prevRev =
      typeof prev.emitRevision === 'number' &&
      Number.isFinite(prev.emitRevision)
        ? Math.max(1, Math.floor(prev.emitRevision))
        : 1

    if (prevHash === newHash) {
      return prevRev
    }

    return prevRev + 1
  } catch {
    return 1
  }
}

function countLines(content: string): number {
  if (content.length === 0) {
    return 0
  }

  return content.split(/\r\n|\r|\n/).length
}

function buildGeneratorManifest(): ThemeManifestGenerator {
  return {
    package: '@afenda/design-system',
    packageVersion: readDesignSystemPackageVersion(),
  }
}

function buildCssArtifactManifest(
  css: string,
  cssFileName: string,
): ThemeManifestCssArtifact {
  return {
    fileName: cssFileName,
    sha256: sha256(css),
    byteLength: Buffer.byteLength(css, 'utf8'),
    lineCount: countLines(css),
  }
}

function buildTokenizationManifest(
  bridged: BridgedThemeTokens,
): ThemeManifestTokenization {
  const themeStaticDeclarationCount = bridged.themeStaticDeclarations.length
  const darkModeDeclarationCount = bridged.darkModeDeclarations.length
  const runtimeParameterDeclarationCount =
    bridged.runtimeParameterDeclarations.length
  const keyframeCount = bridged.keyframes.length

  return {
    themeStaticDeclarationCount,
    darkModeDeclarationCount,
    runtimeParameterDeclarationCount,
    keyframeCount,
    totalCssDeclarationCount:
      themeStaticDeclarationCount +
      darkModeDeclarationCount +
      runtimeParameterDeclarationCount,

    shadcnRegistrySemanticColorCount: shadcnRegistry.semanticColors.length,
    shadcnRegistryChartColorCount: shadcnRegistry.chartColors.length,
    shadcnRegistrySidebarColorCount: shadcnRegistry.sidebarColors.length,
    shadcnRegistryColorCount: shadcnRegistry.colors.length,
    shadcnRegistryRadiusCount: shadcnRegistry.radius.length,
    shadcnRegistryFontCount: shadcnRegistry.fonts.length,
    shadcnRegistryTextSizeCount: shadcnRegistry.textSizes.length,
    shadcnRegistryShadowCount: shadcnRegistry.shadows.length,

    shadcnRegistryRequiredAliasCount:
      shadcnRegistry.requiredColorAliases.length,
    shadcnRegistryExtraRuntimeAliasCount:
      shadcnRegistry.extraRuntimeAliases.length,
    shadcnRegistryWrappedAliasCount: shadcnRegistry.wrappedAliases.length,
    shadcnRegistryTotalAliasCount: shadcnRegistry.allAliases.length,
  }
}

function buildSectionManifest(
  serialized: SerializedThemeCss,
  emittedContent: string,
): ThemeManifestSections {
  return {
    themeStaticLineCount: countLines(serialized.themeStaticBlock),
    darkModeLineCount: countLines(serialized.darkModeBlock),
    runtimeParameterLineCount: countLines(serialized.runtimeParameterBlock),
    keyframesLineCount: countLines(serialized.keyframesBlock),
    combinedLineCount: countLines(serialized.combined),
    emittedLineCount: countLines(emittedContent),
  }
}

//
// ROOT MANIFEST BUILDER
//

export function buildThemeArtifactManifest(
  options: BuildThemeArtifactManifestOptions = {},
): ThemeArtifactManifest {
  const outputPath = options.outputPath ?? DEFAULT_EMITTED_THEME_OUTPUT_PATH
  const bridged = options.bridged ?? bridgedThemeTokens
  const serialized = options.serialized ?? serializedThemeCss
  const emittedContent =
    options.emittedContent ?? buildEmittedThemeCssContent(serialized)
  const cssFileName =
    options.cssFileName ??
    (basename(outputPath) || DEFAULT_EMITTED_THEME_FILENAME)

  const emitRevision = options.emitRevision ?? 1

  return {
    schemaVersion: THEME_ARTIFACT_MANIFEST_SCHEMA_VERSION,
    emitRevision,
    generator: buildGeneratorManifest(),
    css: buildCssArtifactManifest(emittedContent, cssFileName),
    tokenization: buildTokenizationManifest(bridged),
    sections: buildSectionManifest(serialized, emittedContent),
  }
}

//
// SERIALIZATION
//

/**
 * Stable JSON serialization for git diffs and artifact review.
 * Keep object field order deliberate and fixed.
 */
export function serializeThemeArtifactManifest(
  manifest: ThemeArtifactManifest,
): string {
  return `${JSON.stringify(manifest, null, 2)}\n`
}

//
// DEFAULT SIDECAR PATH
//

export function defaultThemeManifestPath(cssOutputFilePath: string): string {
  return join(dirname(cssOutputFilePath), 'generated-theme.manifest.json')
}

//
// CANONICAL EXPORT
//

export const themeArtifactManifest = buildThemeArtifactManifest()
