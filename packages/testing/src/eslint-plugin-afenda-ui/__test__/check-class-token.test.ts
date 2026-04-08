import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)

const { checkClassToken } = require(
  '@afenda/eslint-config/afenda-ui-plugin/semantic-token-allowlist-rule',
) as {
  checkClassToken: (
    token: string,
    stemSet: Set<string>,
  ) => { type: 'ignore' | 'ok' | 'bad'; token?: string }
}

const { SEMANTIC_COLOR_STEMS } = require(
  '@afenda/eslint-config/afenda-ui-plugin/semantic-color-stems',
) as { SEMANTIC_COLOR_STEMS: Set<string> }

const stems = SEMANTIC_COLOR_STEMS

describe('checkClassToken (afenda-ui semantic-token-allowlist)', () => {
  it('accepts semantic stems for text and bg', () => {
    expect(checkClassToken('text-foreground', stems)).toEqual({ type: 'ok' })
    expect(checkClassToken('bg-background', stems)).toEqual({ type: 'ok' })
    expect(checkClassToken('border-border-default', stems)).toEqual({
      type: 'ok',
    })
  })

  it('accepts variants and opacity modifiers', () => {
    expect(checkClassToken('dark:hover:bg-primary/80', stems)).toEqual({
      type: 'ok',
    })
    expect(checkClassToken('focus-visible:ring-ring/30', stems)).toEqual({
      type: 'ok',
    })
  })

  it('accepts token arbitrary bracket and Tailwind v4 paren theme', () => {
    expect(checkClassToken('bg-[var(--color-truth-valid)]', stems)).toEqual({
      type: 'ok',
    })
    expect(checkClassToken('border-(--color-border)', stems)).toEqual({
      type: 'ok',
    })
  })

  it('rejects unknown semantic-like color stems', () => {
    expect(checkClassToken('text-soft-card', stems)).toEqual({
      type: 'bad',
      token: 'text-soft-card',
    })
    expect(checkClassToken('bg-made-up-stem', stems)).toEqual({
      type: 'bad',
      token: 'bg-made-up-stem',
    })
  })

  it('rejects non-var color arbitraries', () => {
    expect(checkClassToken('bg-[#fff]', stems)).toEqual({
      type: 'bad',
      token: 'bg-[#fff]',
    })
  })

  it('ignores typography and layout class tokens', () => {
    expect(checkClassToken('text-sm', stems)).toEqual({ type: 'ignore' })
    expect(checkClassToken('text-sm/relaxed', stems)).toEqual({
      type: 'ignore',
    })
    expect(checkClassToken('text-link', stems)).toEqual({ type: 'ignore' })
    expect(checkClassToken('text-micro', stems)).toEqual({ type: 'ignore' })
    expect(checkClassToken('border-b', stems)).toEqual({ type: 'ignore' })
    expect(checkClassToken('border-t', stems)).toEqual({ type: 'ignore' })
    expect(checkClassToken('bg-gradient-to-br', stems)).toEqual({
      type: 'ignore',
    })
    expect(checkClassToken('ring-[3px]', stems)).toEqual({ type: 'ignore' })
    expect(checkClassToken('text-[0.8rem]', stems)).toEqual({
      type: 'ignore',
    })
  })

  it('respects extendStems via caller-provided Set', () => {
    const extended = new Set(stems)
    extended.add('pilot-feature-accent')
    expect(checkClassToken('text-pilot-feature-accent', extended)).toEqual({
      type: 'ok',
    })
    expect(checkClassToken('text-pilot-feature-accent', stems)).toEqual({
      type: 'bad',
      token: 'text-pilot-feature-accent',
    })
  })
})
