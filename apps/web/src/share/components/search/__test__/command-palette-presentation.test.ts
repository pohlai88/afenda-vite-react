import { describe, expect, it } from 'vitest'

import {
  paletteCommandRowClassName,
  paletteSeverityBadgeLabel,
} from '../command-palette-presentation'

describe('paletteCommandRowClassName', () => {
  it('emphasizes broken severity', () => {
    expect(paletteCommandRowClassName({ severity: 'broken' })).toContain(
      'truth-broken',
    )
    expect(paletteCommandRowClassName({ severity: 'warning' })).toBeUndefined()
  })
})

describe('paletteSeverityBadgeLabel', () => {
  it('hides neutral and empty severity', () => {
    expect(paletteSeverityBadgeLabel({ severity: 'neutral' })).toBeNull()
    expect(paletteSeverityBadgeLabel({})).toBeNull()
  })

  it('shows non-neutral labels', () => {
    expect(paletteSeverityBadgeLabel({ severity: 'broken' })).toBe('broken')
  })
})
