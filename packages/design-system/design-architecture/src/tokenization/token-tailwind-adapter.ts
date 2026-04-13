/**
 * TOKEN TAILWIND ADAPTER (CLEAN, ENFORCED, SINGLE-LAYER)
 *
 * Purpose:
 * - Emit shadcn compatibility aliases from canonical tokens
 * - Emit aliases once on `:root` only; canonical `.dark` already switches `--color-*`,
 *   so `var(--color-*)` resolves correctly without duplicating the same block under `.dark`
 * - Prevent drift, duplicates, and invalid mappings
 *
 * Rules:
 * - This is an adapter, NOT a compiler
 * - Do not redefine canonical tokens
 * - Do not emit multiple :root or .dark blocks
 */

import { shadcnRegistry } from './shadcn-registry'
import { serializedThemeCss } from './token-serialize'
import { TOKEN_LINE_BREAK as NL, TOKEN_SECTION_GAP } from './token-text'
import type { SerializedThemeCss } from './token-types'

//
// GOVERNANCE — strict validation
//

const ALLOWED_CANONICAL_COLOR_PREFIX = '--color-'
const ALLOWED_CANONICAL_FONT_PREFIX = '--font-'

const ALLOWED_ALIAS_NAMES = new Set<string>([
  ...shadcnRegistry.colors.map((token) => `--${token}`),
  ...shadcnRegistry.extraRuntimeAliases.map((row) => row.alias),
  ...shadcnRegistry.wrappedAliases.map((row) => row.alias),
])

function validateAlias(alias: string, canonical: string): void {
  if (!ALLOWED_ALIAS_NAMES.has(alias)) {
    throw new Error(`Illegal alias name: ${alias}`)
  }

  const ok =
    canonical.startsWith(ALLOWED_CANONICAL_COLOR_PREFIX) ||
    canonical.startsWith(ALLOWED_CANONICAL_FONT_PREFIX)

  if (!ok) {
    throw new Error(
      `Alias ${alias} must map to canonical token, got: ${canonical}`,
    )
  }
}

//
// TYPES
//

export interface TailwindAdapterAliasDeclaration {
  readonly alias: `--${string}`
  readonly canonical: `--${string}`
}

export interface TailwindAdapterOptions {
  readonly includeRequiredAliases?: boolean
  readonly includeExtraRuntimeAliases?: boolean
  readonly includeSpecialAliases?: boolean
}

//
// HELPERS
//

const ROOT = ':root'
const INDENT = '  '

function serializeDeclaration(d: TailwindAdapterAliasDeclaration): string {
  return `${INDENT}${d.alias}: var(${d.canonical});`
}

function buildBlock(
  selector: string,
  declarations: readonly TailwindAdapterAliasDeclaration[],
): string {
  if (declarations.length === 0) return ''

  const lines = declarations.map(serializeDeclaration).join(NL)
  return `${selector} {${NL}${lines}${NL}}`
}

//
// BUILDERS (SAFE)
//

function buildRequired(): TailwindAdapterAliasDeclaration[] {
  const seen = new Set<string>()

  return shadcnRegistry.requiredColorAliases
    .filter((r) => r.emitKind === 'direct')
    .map((r) => {
      validateAlias(r.alias, r.canonical)

      if (seen.has(r.alias)) {
        throw new Error(`Duplicate alias: ${r.alias}`)
      }

      seen.add(r.alias)

      return { alias: r.alias, canonical: r.canonical }
    })
}

function buildExtra(): TailwindAdapterAliasDeclaration[] {
  const seen = new Set<string>()

  return shadcnRegistry.extraRuntimeAliases
    .filter((r) => r.emitKind === 'runtime-only')
    .map((r) => {
      validateAlias(r.alias, r.canonical)

      if (seen.has(r.alias)) {
        throw new Error(`Duplicate alias: ${r.alias}`)
      }

      seen.add(r.alias)

      return { alias: r.alias, canonical: r.canonical }
    })
}

function buildSpecial(): TailwindAdapterAliasDeclaration[] {
  const seen = new Set<string>()

  return shadcnRegistry.wrappedAliases
    .filter((r) => r.emitKind === 'wrapped')
    .map((r) => {
      validateAlias(r.alias, r.canonical)

      if (seen.has(r.alias)) {
        throw new Error(`Duplicate alias: ${r.alias}`)
      }

      seen.add(r.alias)

      return { alias: r.alias, canonical: r.canonical }
    })
}

//
// ROOT BUILDER (FIXED — SINGLE BLOCK ONLY)
//

export function buildTailwindAdapter(
  options: TailwindAdapterOptions = {},
): string {
  const required =
    (options.includeRequiredAliases ?? true) ? buildRequired() : []
  const extra = (options.includeExtraRuntimeAliases ?? true) ? buildExtra() : []
  const special = (options.includeSpecialAliases ?? true) ? buildSpecial() : []

  // 🔥 MERGE ALL — SINGLE SOURCE OF TRUTH
  const all = [...required, ...extra, ...special]

  if (all.length === 0) return ''

  const rootBlock = buildBlock(ROOT, all)
  const darkBlock = ''

  return [
    '/* =========================================================',
    '   4. SHADCN COMPATIBILITY ALIASES',
    '========================================================= */',
    rootBlock,
    darkBlock,
  ]
    .filter(Boolean)
    .join(NL)
}

//
// FINAL APPEND
//

export function appendTailwindAdapter(
  serialized: SerializedThemeCss = serializedThemeCss,
  options: TailwindAdapterOptions = {},
): string {
  const adapterBlock = buildTailwindAdapter(options)

  return [serialized.combined, adapterBlock]
    .filter((b) => b.length > 0)
    .join(TOKEN_SECTION_GAP)
}
