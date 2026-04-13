import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { TOKEN_AUTHORITY_BOUNDARIES } from '../src/governance'

/** Monorepo root (…/afenda-react-vite), four levels up from this file. */
function monorepoRoot(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    '..',
    '..',
  )
}

describe('token-authority-boundaries', () => {
  it('lists paths that exist on disk (catch renames without updating the map)', () => {
    const root = monorepoRoot()

    const tokenizationDir = path.join(
      root,
      TOKEN_AUTHORITY_BOUNDARIES.designSystemTokenizationRoot,
    )
    expect(existsSync(tokenizationDir)).toBe(true)
  })

  it('keeps the canonical package import stable', () => {
    expect(TOKEN_AUTHORITY_BOUNDARIES.designSystemTokensImport).toBe(
      '@afenda/design-system/tokenization',
    )
  })
})
