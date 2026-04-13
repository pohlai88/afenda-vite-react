/**
 * TOKEN SERIALIZE (FIXED STRUCTURE)
 *
 * Output order (STRICT):
 * 1. @theme static
 * 2. .dark (colors only)
 * 3. :root (runtime only)
 * 4. @keyframes
 *
 * NO duplicate :root blocks allowed.
 */

import type { KeyframeToken } from './token-constants'
import { bridgedThemeTokens } from './token-bridge'
import { TOKEN_LINE_BREAK as NL, TOKEN_SECTION_GAP } from './token-text'
import type {
  BridgedThemeTokens,
  CssDeclaration,
  KeyframeBlock,
  SerializedThemeCss,
} from './token-types'

// =============================================================================
// Formatting helpers
// =============================================================================

const INDENT = '  '
const DOUBLE_INDENT = '    '

function serializeDeclaration(declaration: CssDeclaration): string {
  return `${INDENT}${declaration.name}: ${declaration.value};`
}

function serializeDeclarationBlock(
  selector: string,
  declarations: ReadonlyArray<CssDeclaration>,
): string {
  if (declarations.length === 0) return ''

  const lines = declarations.map(serializeDeclaration).join(NL)
  return `${selector} {${NL}${lines}${NL}}`
}

// =============================================================================
// Keyframes (unchanged)
// =============================================================================

function getPercentageStepValue(stepName: string): number | null {
  const match = /^(\d+(?:\.\d+)?)%$/.exec(stepName)
  return match ? Number(match[1]) : null
}

function compareKeyframeStepNames(left: string, right: string): number {
  if (left === right) return 0
  if (left === 'from') return -1
  if (right === 'from') return 1
  if (left === 'to') return 1
  if (right === 'to') return -1

  const leftPercentage = getPercentageStepValue(left)
  const rightPercentage = getPercentageStepValue(right)

  if (leftPercentage !== null && rightPercentage !== null) {
    return leftPercentage - rightPercentage
  }

  if (leftPercentage !== null) return -1
  if (rightPercentage !== null) return 1

  return left.localeCompare(right)
}

function getOrderedKeyframeStepNames(block: KeyframeBlock): string[] {
  return Object.keys(block).sort(compareKeyframeStepNames)
}

function serializeKeyframeStyleRecord(
  styleRecord: KeyframeBlock[string],
): string {
  return Object.entries(styleRecord)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([prop, value]) => `${DOUBLE_INDENT}${prop}: ${value};`)
    .join(NL)
}

function serializeKeyframeSteps(block: KeyframeBlock): string {
  return getOrderedKeyframeStepNames(block)
    .filter((step) => block[step] != null)
    .map((step) => {
      const styles = serializeKeyframeStyleRecord(block[step]!)
      return `${INDENT}${step} {${NL}${styles}${NL}${INDENT}}`
    })
    .join(NL)
}

function serializeKeyframe(name: KeyframeToken, block: KeyframeBlock): string {
  return `@keyframes ${name} {${NL}${serializeKeyframeSteps(block)}${NL}}`
}

// =============================================================================
// Sections
// =============================================================================

export function serializeThemeStaticBlock(
  bridged: BridgedThemeTokens = bridgedThemeTokens,
): string {
  return serializeDeclarationBlock(
    '@theme static',
    bridged.themeStaticDeclarations,
  )
}

export function serializeDarkModeBlock(
  bridged: BridgedThemeTokens = bridgedThemeTokens,
): string {
  return serializeDeclarationBlock('.dark', bridged.darkModeDeclarations)
}

export function serializeRuntimeRootBlock(
  bridged: BridgedThemeTokens = bridgedThemeTokens,
): string {
  return serializeDeclarationBlock(
    ':root',
    bridged.runtimeParameterDeclarations,
  )
}

export function serializeKeyframesBlock(
  bridged: BridgedThemeTokens = bridgedThemeTokens,
): string {
  return bridged.keyframes
    .map(([name, block]) => serializeKeyframe(name, block))
    .join(TOKEN_SECTION_GAP)
}

// =============================================================================
// Root serializer (FIXED ORDER)
// =============================================================================

export function serializeThemeCss(
  bridged: BridgedThemeTokens = bridgedThemeTokens,
): SerializedThemeCss {
  const themeStaticBlock = serializeThemeStaticBlock(bridged)
  const darkModeBlock = serializeDarkModeBlock(bridged)
  const runtimeRootBlock = serializeRuntimeRootBlock(bridged)
  const keyframesBlock = serializeKeyframesBlock(bridged)

  const combined = [
    themeStaticBlock,
    darkModeBlock,
    runtimeRootBlock,
    keyframesBlock,
  ]
    .filter((b) => b.length > 0)
    .join(TOKEN_SECTION_GAP)

  return {
    themeStaticBlock,
    darkModeBlock,
    runtimeParameterBlock: runtimeRootBlock,
    keyframesBlock,
    combined,
  }
}

export const serializedThemeCss = serializeThemeCss()
