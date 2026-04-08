import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const approvedColorStemValues = require('../../../../shadcn-ui/src/lib/constant/foundation/token-stems.json') as string[]
const { SEMANTIC_COLOR_STEMS } = require(
  '@afenda/eslint-config/afenda-ui-plugin/semantic-color-stems'
) as { SEMANTIC_COLOR_STEMS: Set<string> }

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectoryPath = path.dirname(currentFilePath)
const repoRootPath = path.resolve(currentDirectoryPath, '../../../../..')
const appIndexCssPath = path.join(repoRootPath, 'apps/web/src/index.css')
const tokenContractSourcePath = path.join(
  repoRootPath,
  'packages/shadcn-ui/src/lib/constant/foundation/token-contract.ts'
)

function extractThemeInlineBlock(cssText: string): string {
  const match = cssText.match(/@theme\s+inline\s*\{([\s\S]*?)\n\}/u)

  if (!match) {
    throw new Error('Could not find the @theme inline block in apps/web/src/index.css.')
  }

  return match[1]
}

function extractColorStemsFromThemeInline(cssText: string): Set<string> {
  const stems = new Set<string>()
  const themeInlineBlock = extractThemeInlineBlock(cssText)
  const colorStemPattern = /--color-([\w-]+)\s*:/gu

  for (const match of themeInlineBlock.matchAll(colorStemPattern)) {
    stems.add(match[1])
  }

  return stems
}

function getMissingValues(source: Set<string>, target: Set<string>): string[] {
  return [...source].filter((value) => !target.has(value)).sort()
}

describe('token contract sync', () => {
  it('keeps CSS, TS, and ESLint stem sources aligned', () => {
    const cssText = readFileSync(appIndexCssPath, 'utf8')
    const tokenContractSource = readFileSync(tokenContractSourcePath, 'utf8')
    const cssStems = extractColorStemsFromThemeInline(cssText)
    const typescriptStems = new Set(approvedColorStemValues)
    const eslintStems = new Set<string>(SEMANTIC_COLOR_STEMS)

    expect(tokenContractSource).toContain('from "./token-stems.json"')
    expect(tokenContractSource).toContain('z.enum(approvedColorStemValues)')
    expect(getMissingValues(cssStems, typescriptStems)).toEqual([])
    expect(getMissingValues(typescriptStems, cssStems)).toEqual([])
    expect(getMissingValues(eslintStems, typescriptStems)).toEqual([])
    expect(getMissingValues(typescriptStems, eslintStems)).toEqual([])
  })
})
