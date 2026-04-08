const { SEMANTIC_COLOR_STEMS } = require('./semantic-color-stems.cjs')
const {
  classifyClassToken,
} = require('./semantic-token-allowlist-rule.cjs')

const LAYOUT_STEM_VALUES = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'border',
  'input',
  'ring',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'surface',
  'surface-foreground',
  'surface-raised',
  'surface-raised-foreground',
  'surface-hero',
  'surface-hero-foreground',
  'foreground-default',
  'foreground-light',
  'foreground-lighter',
  'foreground-muted',
  'foreground-contrast',
  'background-default',
  'background-200',
  'background-alternative-default',
  'background-alternative-200',
  'background-surface-75',
  'background-surface-100',
  'background-surface-200',
  'background-surface-300',
  'background-surface-400',
  'background-muted',
  'background-selection',
  'background-control',
  'background-overlay-default',
  'background-overlay-hover',
  'background-button-default',
  'background-dialog-default',
  'background-dash-canvas',
  'background-dash-sidebar',
  'border-default',
  'border-muted',
  'border-secondary',
  'border-alternative',
  'border-overlay',
  'border-control',
  'border-strong',
  'border-stronger',
  'border-button-default',
  'border-button-hover',
]

const LAYOUT_STEMS = new Set(LAYOUT_STEM_VALUES)
const SEMANTIC_INTENT_STEMS = new Set(
  [...SEMANTIC_COLOR_STEMS].filter((stem) => !LAYOUT_STEMS.has(stem))
)

function getSemanticIntentTokenMatch(token) {
  const result = classifyClassToken(token, SEMANTIC_COLOR_STEMS)
  if (result.type !== 'ok') return null
  if (!SEMANTIC_INTENT_STEMS.has(result.stem)) return null

  return {
    prefix: result.prefix,
    stem: result.stem,
    token,
  }
}

function findSemanticIntentTokens(text) {
  const matches = []

  for (const rawToken of text.split(/\s+/)) {
    if (!rawToken) continue
    const match = getSemanticIntentTokenMatch(rawToken)
    if (match) matches.push(match)
  }

  return matches
}

function containsSemanticIntentClass(text) {
  return findSemanticIntentTokens(text).length > 0
}

module.exports = {
  LAYOUT_STEMS,
  SEMANTIC_INTENT_STEMS,
  containsSemanticIntentClass,
  findSemanticIntentTokens,
  getSemanticIntentTokenMatch,
}
