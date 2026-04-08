import { describe, expect, it } from 'vitest'

import type { TruthActionBarTab } from '@afenda/core/truth-ui'

import { resolveEffectiveActionBarTabs } from '../action-bar-effective-tabs'

const tabs: TruthActionBarTab[] = [
  { key: 'a', labelKey: 'a', path: '/a', icon: 'Circle' },
  { key: 'b', labelKey: 'b', path: '/b', icon: 'Circle' },
  { key: 'c', labelKey: 'c', path: '/c', icon: 'Circle' },
]

describe('resolveEffectiveActionBarTabs', () => {
  it('returns all tabs when scope has no saved selection', () => {
    expect(resolveEffectiveActionBarTabs(tabs, 'mod', {})).toEqual(tabs)
  })

  it('filters and orders by saved keys', () => {
    expect(
      resolveEffectiveActionBarTabs(tabs, 'mod', { mod: ['c', 'a'] }),
    ).toEqual([tabs[2], tabs[0]])
  })

  it('drops unknown keys', () => {
    expect(
      resolveEffectiveActionBarTabs(tabs, 'mod', { mod: ['a', 'ghost', 'b'] }),
    ).toEqual([tabs[0], tabs[1]])
  })

  it('empty array means user hid everything', () => {
    expect(resolveEffectiveActionBarTabs(tabs, 'mod', { mod: [] })).toEqual([])
  })
})
