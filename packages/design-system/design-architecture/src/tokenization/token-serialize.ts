/**
 * TOKEN SERIALIZE
 *
 * Serializes bridged token data into deterministic CSS text fragments.
 *
 * Rules:
 * - consume bridged data only
 * - preserve stable section order
 * - preserve stable declaration order
 * - emit text only
 * - do not invent tokens
 *
 * Output sections:
 * - @theme static { ... }
 * - .dark { ... }
 * - :root { ... } for runtime parameters
 * - @keyframes ...
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
  if (declarations.length === 0) {
    return ''
  }

  const lines = declarations.map(serializeDeclaration).join(NL)
  return `${selector} {${NL}${lines}${NL}}`
}

function getPercentageStepValue(stepName: string): number | null {
  const match = /^(\d+(?:\.\d+)?)%$/.exec(stepName)
  return match ? Number(match[1]) : null
}

function compareKeyframeStepNames(left: string, right: string): number {
  if (left === right) {
    return 0
  }

  if (left === 'from') {
    return -1
  }

  if (right === 'from') {
    return 1
  }

  if (left === 'to') {
    return 1
  }

  if (right === 'to') {
    return -1
  }

  const leftPercentage = getPercentageStepValue(left)
  const rightPercentage = getPercentageStepValue(right)

  if (leftPercentage !== null && rightPercentage !== null) {
    return leftPercentage - rightPercentage
  }

  if (leftPercentage !== null) {
    return -1
  }

  if (rightPercentage !== null) {
    return 1
  }

  return left.localeCompare(right)
}

function getOrderedKeyframeStepNames(block: KeyframeBlock): string[] {
  return Object.keys(block).sort(compareKeyframeStepNames)
}

function serializeKeyframeStyleRecord(
  styleRecord: KeyframeBlock[string],
): string {
  return Object.entries(styleRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([property, value]) => `${DOUBLE_INDENT}${property}: ${value};`)
    .join(NL)
}

function serializeKeyframeSteps(block: KeyframeBlock): string {
  return getOrderedKeyframeStepNames(block)
    .map((stepName) => {
      const styleRecord = block[stepName]

      if (!styleRecord) {
        return ''
      }

      const styleLines = serializeKeyframeStyleRecord(styleRecord)
      return `${INDENT}${stepName} {${NL}${styleLines}${NL}${INDENT}}`
    })
    .filter((value) => value.length > 0)
    .join(NL)
}

function serializeKeyframe(name: KeyframeToken, block: KeyframeBlock): string {
  const steps = serializeKeyframeSteps(block)
  return `@keyframes ${name} {${NL}${steps}${NL}}`
}

// =============================================================================
// Section serializers
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

export function serializeRuntimeParameterBlock(
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
// Root serializer
// =============================================================================

export function serializeThemeCss(
  bridged: BridgedThemeTokens = bridgedThemeTokens,
): SerializedThemeCss {
  const themeStaticBlock = serializeThemeStaticBlock(bridged)
  const darkModeBlock = serializeDarkModeBlock(bridged)
  const runtimeParameterBlock = serializeRuntimeParameterBlock(bridged)
  const keyframesBlock = serializeKeyframesBlock(bridged)

  const combined = [
    themeStaticBlock,
    darkModeBlock,
    runtimeParameterBlock,
    keyframesBlock,
  ]
    .filter((block) => block.length > 0)
    .join(TOKEN_SECTION_GAP)

  return {
    themeStaticBlock,
    darkModeBlock,
    runtimeParameterBlock,
    keyframesBlock,
    combined,
  }
}

// =============================================================================
// Canonical serialized export
// =============================================================================

export const serializedThemeCss = serializeThemeCss()
