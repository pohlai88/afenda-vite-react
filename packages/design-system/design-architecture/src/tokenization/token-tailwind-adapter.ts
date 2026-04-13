/**
 * TOKEN TAILWIND ADAPTER
 *
 * Optional post-serialize compatibility adapter for Tailwind v4 / shadcn-style
 * runtime aliases.
 *
 * Relationship to Tailwind v4:
 * - Official Tailwind v4 + shadcn examples often show unprefixed semantic globals
 *   (for example `--background`) with `@theme inline` mapping `--color-*` to them.
 * - This pipeline keeps `--color-*`, `--radius-*`, `--font-*`, etc. as canonical
 *   runtime variables and treats unprefixed shadcn-style names as compatibility aliases.
 * - Adapters may emit either direction in theory, but this adapter emits compatibility
 *   aliases from canonical variables after the core serialized output.
 *
 * Purpose:
 * - emit compatibility aliases from shadcn-registry metadata
 * - keep canonical `--color-*`, `--radius-*`, `--font-*` naming untouched
 * - append optional adapter blocks after core serialized CSS
 *
 * Rules:
 * - this is an adapter, not a second compiler
 * - consume registry metadata and serialized output only
 * - do not redefine canonical token truth
 * - do not replace @theme static as the primary model
 *
 * When bridging to shadcn-style unprefixed aliases, validate production CSS for unintended
 * literal template fragments (e.g. `<alpha-value>`) per your bundler.
 */

import { shadcnRegistry } from './shadcn-registry'
import { serializedThemeCss } from './token-serialize'
import { TOKEN_LINE_BREAK as NL, TOKEN_SECTION_GAP } from './token-text'
import type { SerializedThemeCss } from './token-types'

//
// TYPES
//

export interface TailwindAdapterAliasDeclaration {
  readonly alias: `--${string}`
  readonly canonical: `--${string}`
}

export interface TailwindAdapterSpecialAliasDeclaration extends TailwindAdapterAliasDeclaration {
  readonly adapterKind: 'special'
}

export interface TailwindAdapterBlocks {
  readonly rootRequiredAliasBlock: string
  readonly darkRequiredAliasBlock: string
  readonly rootExtraRuntimeAliasBlock: string
  readonly darkExtraRuntimeAliasBlock: string
  readonly rootSpecialAliasBlock: string
  readonly darkSpecialAliasBlock: string
  readonly combined: string
}

export interface TailwindAdapterOptions {
  readonly includeRequiredAliases?: boolean
  readonly includeExtraRuntimeAliases?: boolean
  readonly includeSpecialAliases?: boolean
}

//
// SELECTORS
//

const ROOT_SELECTOR = ':root' as const
const DARK_SELECTOR = '.dark' as const

//
// FORMATTING HELPERS
//

const INDENT = '  '

function serializeAliasDeclaration(
  declaration: TailwindAdapterAliasDeclaration,
): string {
  return `${INDENT}${declaration.alias}: var(${declaration.canonical});`
}

function serializeAliasBlock(
  selector: string,
  declarations: readonly TailwindAdapterAliasDeclaration[],
): string {
  if (declarations.length === 0) {
    return ''
  }

  const lines = declarations.map(serializeAliasDeclaration).join(NL)
  return `${selector} {${NL}${lines}${NL}}`
}

function createSectionComment(title: string): string {
  return `/* ${title} */`
}

function buildAliasSection(
  sectionComment: string,
  selector: string,
  declarations: readonly TailwindAdapterAliasDeclaration[],
): string {
  if (declarations.length === 0) {
    return ''
  }

  return [
    createSectionComment(sectionComment),
    serializeAliasBlock(selector, declarations),
  ].join(NL)
}

//
// DECLARATION BUILDERS
//

export function buildRequiredAliasDeclarations(): readonly TailwindAdapterAliasDeclaration[] {
  return shadcnRegistry.requiredColorAliases
    .filter((row) => row.emitKind === 'direct')
    .map((row) => ({
      alias: row.alias,
      canonical: row.canonical,
    }))
}

export function buildExtraRuntimeAliasDeclarations(): readonly TailwindAdapterAliasDeclaration[] {
  return shadcnRegistry.extraRuntimeAliases
    .filter((row) => row.emitKind === 'runtime-only')
    .map((row) => ({
      alias: row.alias,
      canonical: row.canonical,
    }))
}

export function buildSpecialAliasDeclarations(): readonly TailwindAdapterSpecialAliasDeclaration[] {
  return shadcnRegistry.wrappedAliases
    .filter((row) => row.emitKind === 'wrapped')
    .map((row) => ({
      alias: row.alias,
      canonical: row.canonical,
      adapterKind: 'special' as const,
    }))
}

//
// BLOCK BUILDERS
//

export function buildRootRequiredAliasBlock(
  declarations: readonly TailwindAdapterAliasDeclaration[] = buildRequiredAliasDeclarations(),
): string {
  return buildAliasSection(
    'shadcn required parity aliases (root)',
    ROOT_SELECTOR,
    declarations,
  )
}

export function buildDarkRequiredAliasBlock(
  declarations: readonly TailwindAdapterAliasDeclaration[] = buildRequiredAliasDeclarations(),
): string {
  return buildAliasSection(
    'shadcn required parity aliases (dark)',
    DARK_SELECTOR,
    declarations,
  )
}

export function buildRootExtraRuntimeAliasBlock(
  declarations: readonly TailwindAdapterAliasDeclaration[] = buildExtraRuntimeAliasDeclarations(),
): string {
  return buildAliasSection(
    'shadcn extra runtime aliases (root)',
    ROOT_SELECTOR,
    declarations,
  )
}

export function buildDarkExtraRuntimeAliasBlock(
  declarations: readonly TailwindAdapterAliasDeclaration[] = buildExtraRuntimeAliasDeclarations(),
): string {
  return buildAliasSection(
    'shadcn extra runtime aliases (dark)',
    DARK_SELECTOR,
    declarations,
  )
}

export function buildRootSpecialAliasBlock(
  declarations: readonly TailwindAdapterSpecialAliasDeclaration[] = buildSpecialAliasDeclarations(),
): string {
  return buildAliasSection(
    'shadcn special aliases (root)',
    ROOT_SELECTOR,
    declarations,
  )
}

export function buildDarkSpecialAliasBlock(
  declarations: readonly TailwindAdapterSpecialAliasDeclaration[] = buildSpecialAliasDeclarations(),
): string {
  return buildAliasSection(
    'shadcn special aliases (dark)',
    DARK_SELECTOR,
    declarations,
  )
}

//
// ROOT ADAPTER BUILDER
//

export function buildTailwindAdapterBlocks(
  options: TailwindAdapterOptions = {},
): TailwindAdapterBlocks {
  const includeRequiredAliases = options.includeRequiredAliases ?? true
  const includeExtraRuntimeAliases = options.includeExtraRuntimeAliases ?? true
  const includeSpecialAliases = options.includeSpecialAliases ?? true

  const requiredDeclarations = includeRequiredAliases
    ? buildRequiredAliasDeclarations()
    : []

  const extraDeclarations = includeExtraRuntimeAliases
    ? buildExtraRuntimeAliasDeclarations()
    : []

  const specialDeclarations = includeSpecialAliases
    ? buildSpecialAliasDeclarations()
    : []

  const rootRequiredAliasBlock =
    buildRootRequiredAliasBlock(requiredDeclarations)
  const darkRequiredAliasBlock =
    buildDarkRequiredAliasBlock(requiredDeclarations)
  const rootExtraRuntimeAliasBlock =
    buildRootExtraRuntimeAliasBlock(extraDeclarations)
  const darkExtraRuntimeAliasBlock =
    buildDarkExtraRuntimeAliasBlock(extraDeclarations)
  const rootSpecialAliasBlock = buildRootSpecialAliasBlock(specialDeclarations)
  const darkSpecialAliasBlock = buildDarkSpecialAliasBlock(specialDeclarations)

  const combined = [
    rootRequiredAliasBlock,
    darkRequiredAliasBlock,
    rootExtraRuntimeAliasBlock,
    darkExtraRuntimeAliasBlock,
    rootSpecialAliasBlock,
    darkSpecialAliasBlock,
  ]
    .filter((block) => block.length > 0)
    .join(TOKEN_SECTION_GAP)

  return {
    rootRequiredAliasBlock,
    darkRequiredAliasBlock,
    rootExtraRuntimeAliasBlock,
    darkExtraRuntimeAliasBlock,
    rootSpecialAliasBlock,
    darkSpecialAliasBlock,
    combined,
  }
}

//
// POST-SERIALIZE APPEND
//

export function appendTailwindAdapter(
  serialized: SerializedThemeCss = serializedThemeCss,
  options: TailwindAdapterOptions = {},
): string {
  const adapter = buildTailwindAdapterBlocks(options)

  return [serialized.combined, adapter.combined]
    .filter((block) => block.length > 0)
    .join(TOKEN_SECTION_GAP)
}
