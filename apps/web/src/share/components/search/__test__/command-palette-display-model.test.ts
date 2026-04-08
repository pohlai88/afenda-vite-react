import { describe, expect, it } from 'vitest'

import {
  buildPaletteBrowseBlocks,
  buildPaletteQueryCommands,
} from '../command-palette-display-model'
import type { PaletteCommand, PaletteGroup } from '../command-palette.types'

function cmd(
  id: string,
  overrides: Partial<PaletteCommand> &
    Pick<PaletteCommand, 'kind' | 'group' | 'title'>,
): PaletteCommand {
  return {
    id,
    keywords: [],
    priority: 1,
    run: () => {},
    ...overrides,
  }
}

function mapFrom(
  entries: Array<[PaletteGroup, PaletteCommand[]]>,
): Map<PaletteGroup, PaletteCommand[]> {
  return new Map(entries)
}

describe('buildPaletteQueryCommands', () => {
  it('merges groups in PALETTE_GROUP_ORDER and dedupes by id (higher priority wins)', () => {
    const dupLow = cmd('nav:a', {
      kind: 'navigate',
      group: 'search',
      title: 'A',
      priority: 1,
    })
    const dupHigh = cmd('nav:a', {
      kind: 'navigate',
      group: 'actions',
      title: 'A',
      priority: 50,
    })
    const other = cmd('other', {
      kind: 'action',
      group: 'actions',
      title: 'Z',
      priority: 10,
    })

    const groups = mapFrom([
      ['recent', [dupLow]],
      ['search', []],
      ['actions', [dupHigh, other]],
    ])

    const ranked = buildPaletteQueryCommands(groups)
    const navRows = ranked.filter((c) => c.id === 'nav:a')
    expect(navRows).toHaveLength(1)
    expect(navRows[0]?.priority).toBe(50)
  })
})

describe('buildPaletteBrowseBlocks', () => {
  it('splits search group by section label', () => {
    const a = cmd('1', {
      kind: 'navigate',
      group: 'search',
      section: 'Area A',
      title: 'One',
    })
    const b = cmd('2', {
      kind: 'navigate',
      group: 'search',
      section: 'Area B',
      title: 'Two',
    })
    const groups = mapFrom([
      ['search', [b, a]],
      ['audit', []],
    ])

    const blocks = buildPaletteBrowseBlocks(groups)
    expect(blocks).toHaveLength(2)
    expect(blocks.map((x) => x.sectionLabel).sort()).toEqual([
      'Area A',
      'Area B',
    ])
  })
})
