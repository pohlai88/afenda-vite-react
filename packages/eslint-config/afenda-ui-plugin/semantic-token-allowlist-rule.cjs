/**
 * ESLint rule: governed color utilities must use stems from @theme --color-*.
 */
const { SEMANTIC_COLOR_STEMS: DEFAULT_STEMS } = require('./semantic-color-stems.cjs')

/** Stems that are never allowlist-checked (keywords / engine values). */
const SKIP_STEMS = new Set([
  'transparent',
  'current',
  'inherit',
  'none',
  'hidden',
  'auto',
  'black',
  'white',
])

/** Only arbitrary color utilities that reference CSS variables (token bridge). */
const ARBITRARY_VAR_BRACKET_RE = /^\[var\(--[\w-]+\)\]$/u

/** Tailwind v4: `bg-(--color-foo)` / `border-(--color-bar)` theme references. */
const ARBITRARY_PAREN_THEME_RE = /^\(--[\w-]+\)$/u

/** ring-[3px], text-[0.8rem], size arbitrary - not theme colors. */
const ARBITRARY_DIMENSION_RE =
  /^\[(\d+(\.\d+)?)(px|rem|em|%)?\]$/u

/** System UI colors for native widgets, e.g. `[Canvas]`. */
const ARBITRARY_SYSTEM_NAMED_RE = /^\[[A-Za-z][A-Za-z0-9]*\]$/u

const ORDERED_PREFIXES = [
  'border-spacing-x-',
  'border-spacing-y-',
  'border-spacing-',
  'border-x-',
  'border-y-',
  'border-t-',
  'border-r-',
  'border-b-',
  'border-l-',
  'border-s-',
  'border-e-',
  'outline-offset-',
  'ring-offset-',
  'ring-',
  'from-',
  'to-',
  'via-',
  'placeholder-',
  'caret-',
  'accent-',
  'decoration-',
  'divide-',
  'text-',
  'bg-',
  'fill-',
  'stroke-',
  'outline-',
  'border-',
]

/** `text-*` utilities that are not theme colors (typography / alignment / transform). */
const TEXT_NON_COLOR_STEMS = new Set([
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
  'left',
  'right',
  'center',
  'justify',
  'start',
  'end',
  'balance',
  'pretty',
  'ellipsis',
  'clip',
  'wrap',
  'nowrap',
  'underline',
  'overline',
  'line-through',
  'no-underline',
  'uppercase',
  'lowercase',
  'capitalize',
  'normal-case',
  'sub',
  'super',
  /** From `apps/web/src/index.css` `@utility` aliases */
  'link',
  'micro',
])

/** `border-*` utilities that are width/style/layout, not theme colors. */
const BORDER_NON_COLOR_STEMS = new Set([
  'collapse',
  'separate',
  'solid',
  'dashed',
  'dotted',
  'double',
  'hidden',
])

/** `outline-*` layout / style (not theme color name). */
const OUTLINE_NON_COLOR_STEMS = new Set([
  'none',
  'hidden',
  'solid',
  'dashed',
  'dotted',
  'double',
])

/** `decoration-*` non-color. */
const DECORATION_NON_COLOR_STEMS = new Set([
  'solid',
  'dashed',
  'dotted',
  'double',
  'wavy',
  'from-font',
  'auto',
  'underline',
  'overline',
  'line-through',
  'no-underline',
])

/** `ring-inset` and similar. */
const RING_NON_COLOR_STEMS = new Set(['inset'])

function splitLeadingVariants(className) {
  let depth = 0
  const segments = []
  let start = 0
  for (let i = 0; i < className.length; i += 1) {
    const c = className[i]
    if (c === '[') depth += 1
    else if (c === ']') depth = Math.max(0, depth - 1)
    else if (c === ':' && depth === 0) {
      segments.push(className.slice(start, i))
      start = i + 1
    }
  }
  segments.push(className.slice(start))
  return segments
}

function stripImportantAndOpacity(utility) {
  let u = utility.replace(/^!+/, '').replace(/!+$/u, '')
  const slashIdx = u.lastIndexOf('/')
  if (slashIdx > 0) {
    const after = u.slice(slashIdx + 1)
    if (
      /^[\d.]+$/.test(after) ||
      /^\[[\d.]+\]$/.test(after) ||
      /^\d+%$/.test(after)
    ) {
      u = u.slice(0, slashIdx)
    } else if (
      /^(none|tight|snug|normal|relaxed|loose)$/.test(after)
    ) {
      u = u.slice(0, slashIdx)
    }
  }
  return u
}

function isNonColorArbitraryBracket(stem) {
  if (!stem.startsWith('[')) return false
  if (ARBITRARY_VAR_BRACKET_RE.test(stem)) return false
  if (ARBITRARY_DIMENSION_RE.test(stem)) return true
  if (ARBITRARY_SYSTEM_NAMED_RE.test(stem)) return true
  return false
}

function isThemeParenArbitrary(stem) {
  return ARBITRARY_PAREN_THEME_RE.test(stem)
}

function shouldSkipStem(stem) {
  if (!stem) return true
  if (SKIP_STEMS.has(stem)) return true
  if (/^\d+(\.\d+)?$/.test(stem)) return true
  if (/^\[[\d.]+\]$/.test(stem)) return true
  if (/^\d+%$/.test(stem)) return true
  return false
}

function isBgNonColorStem(stem) {
  if (stem.startsWith('gradient-')) return true
  if (stem.startsWith('blend-')) return true
  if (
    /^(auto|fixed|local|scroll|left|right|top|bottom|center)$/.test(stem)
  ) {
    return true
  }
  if (stem.startsWith('clip-')) return true
  if (stem.startsWith('origin-')) return true
  if (stem.startsWith('repeat-')) return true
  if (stem.startsWith('size-')) return true
  if (stem.startsWith('position-')) return true
  return false
}

const DIVIDE_NON_COLOR_STEMS = new Set([
  'solid',
  'dashed',
  'dotted',
  'double',
  'none',
])

function isDivideLayoutStem(stem) {
  return /^(x|y)(-\d+)?$/.test(stem)
}

/**
 * @returns {{
 *   type: 'ignore'
 * } | {
 *   type: 'bad',
 *   token: string
 * } | {
 *   type: 'ok',
 *   prefix: string,
 *   stem: string
 * }}
 */
function classifyClassToken(token, stemSet) {
  const segments = splitLeadingVariants(token.trim())
  if (segments.length === 0 || !segments[segments.length - 1].trim()) {
    return { type: 'ignore' }
  }

  const base = stripImportantAndOpacity(segments[segments.length - 1].trim())

  for (const prefix of ORDERED_PREFIXES) {
    if (!base.startsWith(prefix)) continue

    const stem = base.slice(prefix.length)
    if (stem === '') return { type: 'ignore' }

    if (stem.startsWith('[')) {
      if (ARBITRARY_VAR_BRACKET_RE.test(stem)) return { type: 'ok' }
      if (isNonColorArbitraryBracket(stem)) return { type: 'ignore' }
      return { type: 'bad', token }
    }

    if (stem.startsWith('(')) {
      if (isThemeParenArbitrary(stem)) return { type: 'ok' }
      return { type: 'bad', token }
    }

    if (shouldSkipStem(stem)) return { type: 'ignore' }

    if (prefix === 'text-') {
      if (TEXT_NON_COLOR_STEMS.has(stem)) return { type: 'ignore' }
      if (/^indent-/.test(stem)) return { type: 'ignore' }
      if (/^opacity-/.test(stem)) return { type: 'ignore' }
      if (/^leading-/.test(stem)) return { type: 'ignore' }
      if (/^tracking-/.test(stem)) return { type: 'ignore' }
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (prefix === 'bg-') {
      if (isBgNonColorStem(stem)) return { type: 'ignore' }
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (
      prefix === 'border-' ||
      prefix.startsWith('border-') ||
      prefix.startsWith('border-spacing')
    ) {
      /** Side shorthands: `border-b`, `border-s`, `border-e`, etc. */
      if (/^[btlrxyse]$/u.test(stem)) return { type: 'ignore' }
      if (BORDER_NON_COLOR_STEMS.has(stem)) return { type: 'ignore' }
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (prefix === 'ring-') {
      if (RING_NON_COLOR_STEMS.has(stem)) return { type: 'ignore' }
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (prefix === 'ring-offset-' || prefix === 'outline-offset-') {
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (prefix === 'outline-') {
      if (OUTLINE_NON_COLOR_STEMS.has(stem)) return { type: 'ignore' }
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (prefix === 'decoration-') {
      if (DECORATION_NON_COLOR_STEMS.has(stem)) return { type: 'ignore' }
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (prefix === 'divide-') {
      if (isDivideLayoutStem(stem)) return { type: 'ignore' }
      if (DIVIDE_NON_COLOR_STEMS.has(stem)) return { type: 'ignore' }
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (prefix === 'from-' || prefix === 'to-' || prefix === 'via-') {
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (
      prefix === 'placeholder-' ||
      prefix === 'caret-' ||
      prefix === 'accent-'
    ) {
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    if (prefix === 'fill-' || prefix === 'stroke-') {
      if (stemSet.has(stem)) return { type: 'ok', prefix, stem }
      return { type: 'bad', token }
    }

    return { type: 'ignore' }
  }

  return { type: 'ignore' }
}

/**
 * @returns {{ type: 'ignore' } | { type: 'bad', token: string } | { type: 'ok' }}
 */
function checkClassToken(token, stemSet) {
  const result = classifyClassToken(token, stemSet)
  if (result.type === 'ok') return { type: 'ok' }
  return result
}

function checkClassString(text, stemSet) {
  /** @type {string[]} */
  const bad = []
  for (const raw of text.split(/\s+/)) {
    if (!raw) continue
    const r = checkClassToken(raw, stemSet)
    if (r.type === 'bad') bad.push(r.token)
  }
  return bad
}

function createSemanticTokenAllowlistRule() {
  return {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Disallow ad hoc Tailwind color utilities outside the approved semantic token stems from @theme.',
      },
      schema: [
        {
          type: 'object',
          properties: {
            extendStems: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        notInAllowlist:
          'Color utility "{{token}}" is not mapped to an approved @theme --color-* stem. Use a documented semantic token (see apps/web/src/index.css @theme inline) or extendStems for a deliberate exception.',
      },
    },

    create(context) {
      const opts = context.options[0] ?? {}
      const extend = Array.isArray(opts.extendStems) ? opts.extendStems : []
      const stemSet = new Set(DEFAULT_STEMS)
      for (const s of extend) {
        if (typeof s === 'string' && s) stemSet.add(s)
      }

      function reportForText(text, node) {
        const bad = checkClassString(text, stemSet)
        for (const token of bad) {
          context.report({
            node,
            messageId: 'notInAllowlist',
            data: { token },
          })
        }
      }

      function walkExpressionForAllowlist(node) {
        if (!node) return

        if (node.type === 'Literal' && typeof node.value === 'string') {
          reportForText(node.value, node)
          return
        }

        if (
          node.type === 'TemplateLiteral' &&
          node.expressions.length === 0
        ) {
          const text = node.quasis.map((q) => q.value.cooked || '').join('')
          reportForText(text, node)
          return
        }

        switch (node.type) {
          case 'ConditionalExpression':
            walkExpressionForAllowlist(node.consequent)
            walkExpressionForAllowlist(node.alternate)
            break
          case 'LogicalExpression':
            walkExpressionForAllowlist(node.left)
            walkExpressionForAllowlist(node.right)
            break
          case 'ArrayExpression':
            for (const el of node.elements) {
              if (el) walkExpressionForAllowlist(el)
            }
            break
          case 'ObjectExpression':
            for (const prop of node.properties) {
              if (prop.type === 'Property') {
                walkExpressionForAllowlist(prop.value)
              }
            }
            break
          default:
            break
        }
      }

      const targetCallNames = new Set(['cn', 'cva', 'clsx', 'twMerge'])

      function isTargetCall(node, names) {
        return (
          node &&
          node.type === 'CallExpression' &&
          node.callee &&
          ((node.callee.type === 'Identifier' && names.has(node.callee.name)) ||
            (node.callee.type === 'MemberExpression' &&
              !node.callee.computed &&
              node.callee.property &&
              node.callee.property.type === 'Identifier' &&
              names.has(node.callee.property.name)))
        )
      }

      return {
        JSXAttribute(node) {
          const attrName =
            node.name && node.name.type === 'JSXIdentifier'
              ? node.name.name
              : null

          if (attrName === 'className') {
            if (!node.value) return
            if (node.value.type === 'Literal') {
              walkExpressionForAllowlist(node.value)
              return
            }
            if (
              node.value.type === 'JSXExpressionContainer' &&
              node.value.expression
            ) {
              walkExpressionForAllowlist(node.value.expression)
            }
          }
        },

        CallExpression(node) {
          if (!isTargetCall(node, targetCallNames)) return
          for (const arg of node.arguments) {
            if (arg.type === 'SpreadElement') continue
            walkExpressionForAllowlist(arg)
          }
        },
      }
    },
  }
}

module.exports = {
  ORDERED_PREFIXES,
  checkClassToken,
  classifyClassToken,
  createSemanticTokenAllowlistRule,
  splitLeadingVariants,
  stripImportantAndOpacity,
}
