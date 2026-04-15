import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Theme contract / drift governance (Vitest).
 *
 * Catches:
 * - Wrong `theme.css` @import order
 * - `--af-*` leaking into `theme-shadcn-compat.css`
 * - non-`--af-*` definitions inside `theme-afenda-extensions.css`
 * - non-alias logic appearing inside bridge files
 * - extension references drifting away from canonical light/dark/layout/density sources
 * - mandatory `--af-*` semantic groups present in `theme-afenda-extensions.css` (contract completeness)
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
const themeDir = join(__dirname, '../src/theme')

/**
 * `:root` property names exposed by `theme-shadcn-compat.css` (shadcn-facing bridge).
 * `theme-afenda-extensions.css` must not reference these as `var()` upstream — use `--color-*` / layout instead.
 * Keep in sync when adding tokens to the compat file.
 */
const SHADCN_BRIDGE_NAMES = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--ring',
  '--ring-offset',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
  '--font-sans-compat',
  '--font-mono-compat',
  '--radius',
] as const

const SHADCN_BRIDGE_NAME_SET = new Set<string>(SHADCN_BRIDGE_NAMES)

/**
 * Mandatory semantic groups for `theme-afenda-extensions.css` (`:root` `--af-*` names).
 * If the product adds a token to the CSS file, add it here; if a group is retired, remove in sync.
 * `densityAware` covers density-driven **size** and **spacing** aliases.
 */
const AFENDA_EXTENSION_SEMANTIC_CONTRACT: Record<
  'border' | 'selection' | 'code' | 'table' | 'motion' | 'densityAware',
  readonly string[]
> = {
  border: [
    '--af-border-muted',
    '--af-border-strong',
    '--af-border-grid',
    '--af-border-focus',
  ],
  selection: ['--af-selection-bg', '--af-selection-foreground'],
  code: [
    '--af-code-bg',
    '--af-code-foreground',
    '--af-code-highlight',
    '--af-code-number',
  ],
  table: [
    '--af-table-header',
    '--af-table-row-hover',
    '--af-table-row-selected',
    '--af-table-row-stripe',
    '--af-table-cell-focus',
    '--af-table-pinned',
  ],
  motion: [
    '--af-animate-fade-in',
    '--af-animate-fade-out',
    '--af-animate-slide-top-in',
    '--af-animate-slide-top-out',
    '--af-animate-slide-bottom-in',
    '--af-animate-slide-bottom-out',
    '--af-animate-slide-left-in',
    '--af-animate-slide-left-out',
    '--af-animate-slide-right-in',
    '--af-animate-slide-right-out',
    '--af-animate-elevation-in',
    '--af-animate-elevation-out',
    '--af-animate-sidebar-in',
    '--af-animate-sidebar-out',
    '--af-animate-panel-in',
    '--af-animate-panel-out',
    '--af-animate-panel-in-left',
    '--af-animate-panel-out-left',
    '--af-animate-panel-out-right',
    '--af-animate-micro-lift',
  ],
  densityAware: [
    '--af-size-control-2xs',
    '--af-size-control-xs',
    '--af-size-control-sm',
    '--af-size-control-md',
    '--af-size-control-lg',
    '--af-size-control-xl',
    '--af-size-input-height',
    '--af-size-button-height',
    '--af-size-toolbar-height',
    '--af-size-filter-bar-height',
    '--af-size-shell-header-height',
    '--af-size-table-row-height',
    '--af-size-table-header-height',
    '--af-size-sidebar-item-height',
    '--af-size-tab-height',
    '--af-size-dialog-header-min-height',
    '--af-spacing-panel-padding-sm',
    '--af-spacing-panel-padding',
    '--af-spacing-panel-padding-lg',
    '--af-spacing-form-gap-tight',
    '--af-spacing-form-gap',
    '--af-spacing-inline-control-gap',
    '--af-spacing-toolbar-gap',
    '--af-spacing-section-gap',
  ],
}

function readThemeFile(name: string): string {
  return readFileSync(join(themeDir, name), 'utf8')
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function parseThemeImports(themeCss: string): string[] {
  const stripped = stripCssComments(themeCss)
  const out: string[] = []
  const re = /@import\s+['"](\.\/[^'"]+)['"]\s*;/g
  let m: RegExpExecArray | null
  while ((m = re.exec(stripped)) !== null) {
    out.push(m[1].replace('./', ''))
  }
  return out
}

/**
 * Top-level custom property definitions anywhere in the CSS string.
 * Useful for canonical source files.
 */
function definedCustomProperties(css: string): Set<string> {
  const stripped = stripCssComments(css)
  const names = new Set<string>()
  const re = /^\s*(--[\w-]+)\s*:/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(stripped)) !== null) {
    names.add(m[1])
  }
  return names
}

/**
 * Extract all :root blocks from a CSS file.
 * We keep this intentionally simple because the theme bridge files are flat.
 */
function rootBlocks(css: string): string[] {
  const stripped = stripCssComments(css)
  const blocks: string[] = []
  const re = /:root\s*\{([\s\S]*?)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(stripped)) !== null) {
    blocks.push(m[1])
  }
  return blocks
}

/**
 * Custom property definitions declared inside :root blocks only.
 */
function rootDefinedCustomProperties(css: string): string[] {
  const defs: string[] = []
  for (const block of rootBlocks(css)) {
    const re = /^\s*(--[\w-]+)\s*:/gm
    let m: RegExpExecArray | null
    while ((m = re.exec(block)) !== null) {
      defs.push(m[1])
    }
  }
  return defs
}

/**
 * Map of :root custom property name -> raw declaration value.
 * Used to enforce alias-only bridge files.
 */
function rootCustomPropertyValues(css: string): Map<string, string> {
  const values = new Map<string, string>()
  for (const block of rootBlocks(css)) {
    const re = /^\s*(--[\w-]+)\s*:\s*([^;]+);/gm
    let m: RegExpExecArray | null
    while ((m = re.exec(block)) !== null) {
      values.set(m[1], m[2].trim())
    }
  }
  return values
}

/**
 * Unique variable references, including the first argument of fallback forms:
 * - var(--x)
 * - var(--x, fallback)
 */
function uniqueVarReferences(css: string): string[] {
  const stripped = stripCssComments(css)
  const refs = new Set<string>()
  const re = /var\(\s*(--[\w-]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(stripped)) !== null) {
    refs.add(m[1])
  }
  return [...refs]
}

/** Alias-only means a single var(--token) value, no logic, no fallbacks, no color-mix. */
function collectAliasOnlyRootViolations(
  css: string,
  allowedName: (name: string) => boolean,
): { badNames: string[]; badValues: string[] } {
  const values = rootCustomPropertyValues(css)
  const badNames: string[] = []
  const badValues: string[] = []

  for (const [name, value] of values.entries()) {
    if (!allowedName(name)) {
      badNames.push(name)
      continue
    }

    if (!/^var\(--[\w-]+\)$/.test(value)) {
      badValues.push(`${name}: ${value}`)
    }
  }

  return { badNames, badValues }
}

describe('theme contract (drift governance)', () => {
  const themeCss = readThemeFile('theme.css')
  const tailwindBridge = readThemeFile('theme-tailwind-bridge.css')
  const afExtensions = readThemeFile('theme-afenda-extensions.css')
  const shadcnCompat = readThemeFile('theme-shadcn-compat.css')
  const light = readThemeFile('theme-tokens-light.css')
  const dark = readThemeFile('theme-dark.css')
  const layout = readThemeFile('theme-tokens-layout.css')
  const density = readThemeFile('theme-density.css')

  const lightDefs = definedCustomProperties(light)
  const darkDefs = definedCustomProperties(dark)
  const layoutDefs = definedCustomProperties(layout)
  const densityDefs = definedCustomProperties(density)

  it('theme.css @import order: light → dark → keyframes → reduced-motion → layout → density → shadcn-compat → afenda-extensions → tailwind-bridge', () => {
    const imports = parseThemeImports(themeCss)
    const expected = [
      'theme-tokens-light.css',
      'theme-dark.css',
      'theme-keyframes.css',
      'theme-reduced-motion.css',
      'theme-tokens-layout.css',
      'theme-density.css',
      'theme-shadcn-compat.css',
      'theme-afenda-extensions.css',
      'theme-tailwind-bridge.css',
    ]
    expect(imports).toEqual(expected)
  })

  it('theme-tailwind-bridge.css stays documentation-only (no :root / no custom properties)', () => {
    const stripped = stripCssComments(tailwindBridge)
    expect(stripped).not.toMatch(/:root\s*\{/)
    expect(stripped).not.toMatch(/^\s*--[\w-]+\s*:/m)
  })

  it('theme-shadcn-compat.css must not mention --af- outside comments', () => {
    const stripped = stripCssComments(shadcnCompat)
    expect(stripped).not.toMatch(/--af-/)
  })

  it('theme-shadcn-compat.css stays alias-only and exposes only shadcn-facing names', () => {
    const { badNames, badValues } = collectAliasOnlyRootViolations(shadcnCompat, (name) =>
      SHADCN_BRIDGE_NAME_SET.has(name),
    )
    expect(
      badNames,
      'theme-shadcn-compat.css has unexpected property names:\n' + badNames.join('\n'),
    ).toEqual([])
    expect(
      badValues,
      'theme-shadcn-compat.css must stay alias-only:\n' + badValues.join('\n'),
    ).toEqual([])
  })

  it('theme-afenda-extensions.css defines only --af-* custom properties inside :root', () => {
    const defined = rootDefinedCustomProperties(afExtensions)
    expect(defined.length).toBeGreaterThan(0)

    const nonAf = defined.filter((name) => !name.startsWith('--af-'))
    expect(nonAf, `Non --af-* definitions in extensions:\n${nonAf.join('\n')}`).toEqual([])
  })

  it('theme-afenda-extensions.css stays alias-only', () => {
    const { badNames, badValues } = collectAliasOnlyRootViolations(
      afExtensions,
      (name) => name.startsWith('--af-'),
    )
    expect(
      badNames,
      'theme-afenda-extensions.css has unexpected property names:\n' + badNames.join('\n'),
    ).toEqual([])
    expect(
      badValues,
      'theme-afenda-extensions.css must stay alias-only:\n' + badValues.join('\n'),
    ).toEqual([])
  })

  it('theme-afenda-extensions.css defines every mandatory semantic group (contract completeness)', () => {
    const defined = new Set(rootDefinedCustomProperties(afExtensions))
    const missing: string[] = []

    for (const [group, names] of Object.entries(AFENDA_EXTENSION_SEMANTIC_CONTRACT)) {
      for (const name of names) {
        if (!defined.has(name)) {
          missing.push(`${group}: ${name}`)
        }
      }
    }

    expect(
      missing,
      `Missing --af-* tokens (update theme-afenda-extensions.css or AFENDA_EXTENSION_SEMANTIC_CONTRACT):\n${missing.join('\n')}`,
    ).toEqual([])
  })

  it('theme-afenda-extensions.css must not reference shadcn aliases as upstream sources', () => {
    const refs = uniqueVarReferences(afExtensions).filter((name) => !name.startsWith('--af-'))

    const shadcnAliasRefs = refs.filter((name) => SHADCN_BRIDGE_NAME_SET.has(name))

    expect(
      shadcnAliasRefs,
      `Extensions must reference canonical upstream tokens, not shadcn aliases:\n${shadcnAliasRefs.join('\n')}`,
    ).toEqual([])
  })

  it('theme-afenda-extensions.css var() references resolve to canonical sources', () => {
    const refs = uniqueVarReferences(afExtensions).filter((r) => !r.startsWith('--af-'))
    const missing: string[] = []

    for (const ref of refs) {
      if (ref.startsWith('--color-')) {
        const inLight = lightDefs.has(ref)
        const inDark = darkDefs.has(ref)

        if (!inLight) missing.push(`${ref} (missing in theme-tokens-light.css)`)
        if (!inDark) missing.push(`${ref} (missing in theme-dark.css)`)
        continue
      }

      if (
        ref.startsWith('--text-') ||
        ref.startsWith('--font-') ||
        ref.startsWith('--radius-') ||
        ref.startsWith('--leading-') ||
        ref.startsWith('--tracking-')
      ) {
        if (!layoutDefs.has(ref)) missing.push(`${ref} (missing in theme-tokens-layout.css)`)
        continue
      }

      if (ref.startsWith('--animate-')) {
        if (!layoutDefs.has(ref)) missing.push(`${ref} (missing in theme-tokens-layout.css)`)
        continue
      }

      if (ref.startsWith('--size-') || ref.startsWith('--spacing-')) {
        if (layoutDefs.has(ref) || densityDefs.has(ref)) continue
        missing.push(`${ref} (expected in theme-tokens-layout.css or theme-density.css)`)
        continue
      }

      missing.push(`${ref} (unexpected reference — extend theme-contract-drift.test.ts buckets)`)
    }

    expect(missing, missing.join('\n')).toEqual([])
  })
})
