/**
 * Build-time entry: write generated theme CSS + JSON manifest for apps (e.g. `globals.css` import).
 * Delegates to the src/tokenization pipeline (serialize + Tailwind compatibility adapter).
 *
 * Barrel entry: `@afenda/design-system/scripts` (`design-architecture/scripts/index.ts`).
 *
 * Relationship to `token-emit.buildEmittedThemeCssContent`:
 * - That helper emits **header + serialized core only** (no adapter).
 * - Here, `buildArtifactThemeCssString` emits the **production artifact**: header +
 *   serialized core **with** `appendTailwindAdapter` (shadcn/Tailwind compatibility aliases).
 *   Keep the two boundaries distinct so serializer-only drift checks stay meaningful.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { bridgedThemeTokens } from '../src/tokenization/token-bridge'
import { createGeneratedFileHeader } from '../src/tokenization/token-emit'
import {
  buildThemeArtifactManifest,
  defaultThemeManifestPath,
  serializeThemeArtifactManifest,
} from '../src/tokenization/token-manifest'
import { serializedThemeCss } from '../src/tokenization/token-serialize'
import { TOKEN_SECTION_GAP } from '../src/tokenization/token-text'
import {
  appendTailwindAdapter,
  type TailwindAdapterOptions,
} from '../src/tokenization/token-tailwind-adapter'
import type { SerializedThemeCss } from '../src/tokenization/token-types'

export type GenerateThemeCssArtifactOptions = {
  readonly outputFilePath: string
  /**
   * JSON sidecar path. Defaults to `generated-theme.manifest.json` beside the CSS file.
   */
  readonly manifestFilePath?: string
  /**
   * When false, only the CSS file is written (manifest skipped). Default true.
   */
  readonly writeManifest?: boolean
  /** Passed through to `appendTailwindAdapter` (e.g. toggle alias blocks in tests). */
  readonly adapterOptions?: TailwindAdapterOptions
}

/**
 * Full **on-disk** theme CSS string: generator header + serialized theme + Tailwind/shadcn
 * compatibility adapter (see `appendTailwindAdapter`).
 *
 * @param serialized - Defaults to module `serializedThemeCss` for production builds.
 * @param adapterOptions - Defaults to `{}` (all default adapter sections enabled).
 */
export function buildArtifactThemeCssString(
  serialized: SerializedThemeCss = serializedThemeCss,
  adapterOptions: TailwindAdapterOptions = {},
): string {
  const header = createGeneratedFileHeader()
  const body = appendTailwindAdapter(serialized, adapterOptions)
  return [header, body].filter(Boolean).join(TOKEN_SECTION_GAP)
}

export async function generateThemeCssArtifact(
  options: GenerateThemeCssArtifactOptions,
): Promise<void> {
  const css = buildArtifactThemeCssString(
    serializedThemeCss,
    options.adapterOptions ?? {},
  )

  const outputDir = path.dirname(options.outputFilePath)
  await mkdir(outputDir, { recursive: true })
  await writeFile(options.outputFilePath, css, 'utf8')

  const writeManifest = options.writeManifest ?? true
  if (!writeManifest) {
    return
  }

  const manifestPath =
    options.manifestFilePath ?? defaultThemeManifestPath(options.outputFilePath)

  // Manifest fingerprints and section metrics refer to this **final** byte string
  // (header + serialized core + adapter), not the serializer-only core.
  const manifest = buildThemeArtifactManifest({
    outputPath: options.outputFilePath,
    emittedContent: css,
    cssFileName: path.basename(options.outputFilePath),
    bridged: bridgedThemeTokens,
    serialized: serializedThemeCss,
  })

  await writeFile(
    manifestPath,
    serializeThemeArtifactManifest(manifest),
    'utf8',
  )
}
