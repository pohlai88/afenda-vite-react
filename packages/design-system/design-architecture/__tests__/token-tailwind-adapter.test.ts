import { describe, expect, it } from 'vitest'

import {
  appendTailwindAdapter,
  buildTailwindAdapter,
} from '../src/tokenization/token-tailwind-adapter'
import { serializedThemeCss } from '../src/tokenization/token-serialize'

describe('token-tailwind-adapter', () => {
  it('emits required aliases on :root only (no duplicate .dark alias block)', () => {
    const adapter = buildTailwindAdapter()

    expect(adapter).toContain(':root')
    expect(adapter).toContain('--background: var(--color-background);')
    expect(adapter).toContain('--ring-offset: var(--color-ring-offset);')
    expect(adapter).toContain('4. SHADCN COMPATIBILITY ALIASES')

    expect(adapter).not.toContain('.dark {')
  })

  it('can disable extra runtime and special aliases independently', () => {
    const adapter = buildTailwindAdapter({
      includeExtraRuntimeAliases: false,
      includeSpecialAliases: false,
    })

    expect(adapter).toContain('--background: var(--color-background);')
    expect(adapter).not.toContain('.dark {')

    expect(adapter).not.toContain('--font-family-sans: var(--font-sans);')
    expect(adapter).not.toContain('--selection-bg: var(--color-primary-100);')
  })

  it('appends adapter css after serialized core output', () => {
    const adapted = appendTailwindAdapter(serializedThemeCss)

    expect(adapted.startsWith(serializedThemeCss.combined)).toBe(true)
    expect(adapted).toContain('@theme static')
    expect(adapted).toContain('.dark')
    expect(adapted).toContain('4. SHADCN COMPATIBILITY ALIASES')
    expect(adapted).toContain('--background: var(--color-background);')

    const shadcnSection = adapted.split('4. SHADCN COMPATIBILITY ALIASES')[1]
    expect(shadcnSection).toBeDefined()
    expect(shadcnSection).toContain(':root')
    expect(shadcnSection).not.toContain('.dark {')
  })
})
