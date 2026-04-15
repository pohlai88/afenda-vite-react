import { describe, expect, it } from 'vitest'

import { buildGovernanceModel } from '../core'

async function getComponent(name: string) {
  const { components } = await buildGovernanceModel()
  const component = components.find((entry) => entry.component === name)
  if (!component) {
    throw new Error(`Unable to find component "${name}" in governance model.`)
  }
  return component
}

describe('component governance extractor', { timeout: 60_000 }, () => {
  it('parses CVA variants/defaults for button', async () => {
    const button = await getComponent('button')

    expect(button.cvaDefinitions.length).toBe(1)
    expect(button.cvaDefinitions[0]?.variants.variant).toContain('default')
    expect(button.cvaDefinitions[0]?.variants.size).toContain('lg')
    expect(button.cvaDefinitions[0]?.defaultVariants.variant).toBe('default')
    expect(button.cvaDefinitions[0]?.defaultVariants.size).toBe('default')
  })

  it('parses multiple CVA definitions for input-group and item', async () => {
    const inputGroup = await getComponent('input-group')
    const item = await getComponent('item')

    expect(inputGroup.cvaDefinitions.length).toBeGreaterThanOrEqual(2)
    expect(item.cvaDefinitions.length).toBeGreaterThanOrEqual(2)
  })

  it('supports CVA definitions without explicit defaults', async () => {
    const navigationMenu = await getComponent('navigation-menu')

    expect(navigationMenu.cvaDefinitions.length).toBe(1)
    expect(navigationMenu.cvaDefinitions[0]?.defaultVariants).toEqual({})
  })

  it('supports non-CVA primitives', async () => {
    const input = await getComponent('input')
    const table = await getComponent('table')

    expect(input.cvaDefinitions).toEqual([])
    expect(table.cvaDefinitions).toEqual([])
    expect(input.dataSlots).toContain('input')
    expect(table.dataSlots).toContain('table')
  })
})
