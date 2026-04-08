import { describe, expect, it } from 'vitest'

import { rankAndDedupeCommands } from '../command-palette-utils'
import type { PaletteCommand } from '../command-palette.types'

function cmd(
  partial: Omit<PaletteCommand, 'run'> & { run?: () => void },
): PaletteCommand {
  return {
    ...partial,
    run: partial.run ?? (() => {}),
  }
}

describe('rankAndDedupeCommands', () => {
  it('sorts by descending priority then title', () => {
    const a = cmd({
      id: 'a',
      kind: 'action',
      group: 'actions',
      title: 'Zebra',
      keywords: [],
      priority: 1,
    })
    const b = cmd({
      id: 'b',
      kind: 'action',
      group: 'actions',
      title: 'Alpha',
      keywords: [],
      priority: 10,
    })
    const c = cmd({
      id: 'c',
      kind: 'action',
      group: 'actions',
      title: 'Beta',
      keywords: [],
      priority: 10,
    })

    expect(rankAndDedupeCommands([a, b, c]).map((x) => x.id)).toEqual([
      'b',
      'c',
      'a',
    ])
  })

  it('keeps one row per id (highest priority wins)', () => {
    const low = cmd({
      id: 'same',
      kind: 'navigate',
      group: 'search',
      title: 'Nav',
      keywords: [],
      priority: 1,
    })
    const high = cmd({
      id: 'same',
      kind: 'navigate',
      group: 'search',
      title: 'Nav',
      keywords: [],
      priority: 99,
    })

    const out = rankAndDedupeCommands([low, high])
    expect(out).toHaveLength(1)
    expect(out[0]?.priority).toBe(99)
  })
})
