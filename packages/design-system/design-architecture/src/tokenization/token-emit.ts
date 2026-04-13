/**
 * TOKEN EMIT
 *
 * Emits the serialized token CSS as a canonical generated artifact.
 *
 * Rules:
 * - consume serialized output only
 * - write deterministic file content
 * - own generator annotation header
 * - do not redefine token semantics here
 * - do not normalize/bridge/serialize here
 *
 * Purpose:
 * - produce a stable generated CSS artifact for the monorepo
 * - make token output reviewable in PRs
 * - provide a CI-verifiable output boundary
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import {
  TOKENIZATION_PIPELINE_ARTIFACT_FILES,
  TOKENIZATION_PIPELINE_SOURCE_FILES,
} from './token-pipeline-order'
import { serializedThemeCss } from './token-serialize'
import { TOKEN_LINE_BREAK, TOKEN_SECTION_GAP } from './token-text'
import type { SerializedThemeCss } from './token-types'

// =============================================================================
// Config
// =============================================================================

export const DEFAULT_EMITTED_THEME_FILENAME = 'generated-theme.css'

export const DEFAULT_EMITTED_THEME_OUTPUT_PATH = resolve(
  process.cwd(),
  'src',
  'generated',
  DEFAULT_EMITTED_THEME_FILENAME,
)

// =============================================================================
// Generated file header
// =============================================================================

export function createGeneratedFileHeader(): string {
  const pipelineLines = TOKENIZATION_PIPELINE_SOURCE_FILES.flatMap(
    (file, index) => (index === 0 ? [` * ${file}`] : [` * -> ${file}`]),
  )
  const artifactLines = TOKENIZATION_PIPELINE_ARTIFACT_FILES.flatMap(
    (file, index) => (index === 0 ? [` * ${file}`] : [` * -> ${file}`]),
  )
  return [
    '/**',
    ' * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY',
    ' *',
    ' * Source pipeline:',
    ...pipelineLines,
    ' *',
    ' * Artifact assembly (shadcn aliases + on-disk write):',
    ...artifactLines,
    ' *',
    ' * This file is generator-owned.',
    ' * Update the token pipeline instead of editing this artifact.',
    ' */',
  ].join(TOKEN_LINE_BREAK)
}

// =============================================================================
// Content assembly
// =============================================================================

export function buildEmittedThemeCssContent(
  serialized: SerializedThemeCss = serializedThemeCss,
): string {
  const content = [createGeneratedFileHeader(), serialized.combined]
    .filter((section) => section.length > 0)
    .join(TOKEN_SECTION_GAP)

  return `${content}${TOKEN_LINE_BREAK}`
}

// =============================================================================
// Write helpers
// =============================================================================

export function ensureParentDirectoryExists(outputPath: string): void {
  mkdirSync(dirname(outputPath), { recursive: true })
}

export function writeEmittedThemeCssFile(
  outputPath: string = DEFAULT_EMITTED_THEME_OUTPUT_PATH,
  serialized: SerializedThemeCss = serializedThemeCss,
): string {
  const content = buildEmittedThemeCssContent(serialized)

  ensureParentDirectoryExists(outputPath)
  writeFileSync(outputPath, content, 'utf8')

  return outputPath
}

// =============================================================================
// Change detection
// =============================================================================

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error
}

export function readExistingEmittedThemeCssFile(
  outputPath: string = DEFAULT_EMITTED_THEME_OUTPUT_PATH,
): string | null {
  try {
    return readFileSync(outputPath, 'utf8')
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return null
    }

    throw error
  }
}

export function hasEmittedThemeCssChanged(
  outputPath: string = DEFAULT_EMITTED_THEME_OUTPUT_PATH,
  serialized: SerializedThemeCss = serializedThemeCss,
): boolean {
  const nextContent = buildEmittedThemeCssContent(serialized)
  const previousContent = readExistingEmittedThemeCssFile(outputPath)

  return previousContent !== nextContent
}

// =============================================================================
// High-level emit API
// =============================================================================

export interface EmitThemeCssResult {
  readonly outputPath: string
  readonly content: string
  readonly changed: boolean
}

export function emitThemeCss(
  outputPath: string = DEFAULT_EMITTED_THEME_OUTPUT_PATH,
  serialized: SerializedThemeCss = serializedThemeCss,
): EmitThemeCssResult {
  const content = buildEmittedThemeCssContent(serialized)
  const previousContent = readExistingEmittedThemeCssFile(outputPath)
  const changed = previousContent !== content

  ensureParentDirectoryExists(outputPath)
  writeFileSync(outputPath, content, 'utf8')

  return {
    outputPath,
    content,
    changed,
  }
}
