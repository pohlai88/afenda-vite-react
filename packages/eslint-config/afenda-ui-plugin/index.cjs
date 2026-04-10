/**
 * Local ESLint plugin: UI governance (semantic colors, no raw palette drift,
 * no inline style theming, semantic color stem allowlist vs @theme).
 * Co-located with @afenda/eslint-config so the shared config is self-contained.
 */
const { createSemanticTokenAllowlistRule } = require('./semantic-token-allowlist-rule.cjs')
const noDirectSemanticColorRule = require('./no-direct-semantic-color-rule.cjs')
const noLocalSemanticMapRule = require('./no-local-semantic-map-rule.cjs')
const noDirectRadixOutsideUiRule = require('./no-direct-radix-outside-ui-rule.cjs')
const RAW_TAILWIND_COLOR_RE =
  /\b(text|bg|border|ring|fill|stroke|outline|shadow|decoration|from|to|via|placeholder|caret|accent|divide|ring-offset)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(\/\d{1,3})?\b/u

const ARBITRARY_TAILWIND_COLOR_RE =
  /\b(text|bg|border|ring|fill|stroke|outline|shadow|decoration|from|to|via|placeholder|caret|accent|divide|ring-offset)-\[[^\]]*(#|rgb\(|rgba\(|hsl\(|hsla\(|oklch\(|var\()[^\]]*\]/u

const HARDCODED_COLOR_RE =
  /(#[0-9a-fA-F]{3,8}\b|\brgb\(|\brgba\(|\bhsl\(|\bhsla\(|\boklch\()/u

const HSL_VAR_RE = /hsl\(var\(/u

const STYLE_COLOR_KEYS = new Set([
  'color',
  'background',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'textDecorationColor',
  'fill',
  'stroke',
  'caretColor',
  'accentColor',
  'columnRuleColor',
])

/** JSX props whose string values are often literal colors (SVG + inline-like usage). */
const JSX_COLOR_PROP_NAMES = new Set([
  'stroke',
  'fill',
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
])

function extractStaticString(node) {
  if (!node) return null

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((q) => q.value.cooked || '').join('')
  }

  return null
}

function checkText(text) {
  const problems = []

  if (RAW_TAILWIND_COLOR_RE.test(text)) {
    problems.push('raw-tailwind-color')
  }
  if (ARBITRARY_TAILWIND_COLOR_RE.test(text)) {
    problems.push('arbitrary-tailwind-color')
  }
  if (HARDCODED_COLOR_RE.test(text)) {
    problems.push('hardcoded-color')
  }
  if (HSL_VAR_RE.test(text)) {
    problems.push('hsl-var-usage')
  }

  return problems
}

function reportProblems(context, node, problems) {
  for (const problem of problems) {
    context.report({
      node,
      messageId: problem,
    })
  }
}

function checkStringNode(context, node) {
  const text = extractStaticString(node)
  if (!text) return
  const problems = checkText(text)
  if (problems.length > 0) {
    reportProblems(context, node, problems)
  }
}

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

function walkExpressionForStrings(context, node) {
  if (!node) return

  const text = extractStaticString(node)
  if (text !== null) {
    const problems = checkText(text)
    if (problems.length > 0) {
      reportProblems(context, node, problems)
    }
    return
  }

  switch (node.type) {
    case 'ConditionalExpression':
      walkExpressionForStrings(context, node.consequent)
      walkExpressionForStrings(context, node.alternate)
      break
    case 'LogicalExpression':
      walkExpressionForStrings(context, node.left)
      walkExpressionForStrings(context, node.right)
      break
    case 'ArrayExpression':
      for (const element of node.elements) {
        if (element) walkExpressionForStrings(context, element)
      }
      break
    case 'ObjectExpression':
      for (const prop of node.properties) {
        if (prop.type === 'Property') {
          walkExpressionForStrings(context, prop.value)
        }
      }
      break
    case 'TemplateLiteral':
      if (node.expressions.length === 0) {
        walkExpressionForStrings(context, node)
      }
      break
    default:
      break
  }
}

function getPropertyName(prop) {
  if (!prop || prop.type !== 'Property' || prop.computed) return null

  if (prop.key.type === 'Identifier') return prop.key.name
  if (prop.key.type === 'Literal' && typeof prop.key.value === 'string') {
    return prop.key.value
  }

  return null
}

function isStyleObjectExpression(node) {
  return Boolean(node && node.type === 'ObjectExpression')
}

module.exports = {
  rules: {
    'no-raw-colors': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Disallow raw Tailwind colors, arbitrary color values, and hardcoded color usage in governed UI code.',
        },
        schema: [],
        messages: {
          'raw-tailwind-color':
            'Raw Tailwind palette utility detected. Use approved semantic token utilities instead.',
          'arbitrary-tailwind-color':
            'Arbitrary Tailwind color utility detected. Use approved semantic token utilities instead.',
          'hardcoded-color':
            'Hardcoded color value detected. Use approved semantic tokens or mapped utilities instead.',
          'hsl-var-usage':
            'hsl(var(--...)) detected. Use the approved token mapping / OKLCH strategy instead.',
        },
      },

      create(context) {
        const targetCallNames = new Set(['cn', 'cva', 'clsx', 'twMerge'])

        return {
          JSXAttribute(node) {
            const attrName =
              node.name && node.name.type === 'JSXIdentifier' ? node.name.name : null

            if (attrName === 'className') {
              if (!node.value) return

              if (node.value.type === 'Literal') {
                checkStringNode(context, node.value)
                return
              }

              if (
                node.value.type === 'JSXExpressionContainer' &&
                node.value.expression
              ) {
                walkExpressionForStrings(context, node.value.expression)
              }
              return
            }

            if (
              attrName &&
              JSX_COLOR_PROP_NAMES.has(attrName) &&
              node.value
            ) {
              if (node.value.type === 'Literal') {
                checkStringNode(context, node.value)
              } else if (
                node.value.type === 'JSXExpressionContainer' &&
                node.value.expression
              ) {
                walkExpressionForStrings(context, node.value.expression)
              }
              return
            }

            if (
              attrName === 'style' &&
              node.value &&
              node.value.type === 'JSXExpressionContainer' &&
              node.value.expression &&
              isStyleObjectExpression(node.value.expression)
            ) {
              for (const prop of node.value.expression.properties) {
                if (prop.type !== 'Property') continue

                const keyName = getPropertyName(prop)
                if (!keyName || !STYLE_COLOR_KEYS.has(keyName)) continue

                const text = extractStaticString(prop.value)
                if (!text) continue

                const problems = checkText(text)
                if (problems.length > 0) {
                  reportProblems(context, prop.value, problems)
                }
              }
            }
          },

          CallExpression(node) {
            if (!isTargetCall(node, targetCallNames)) return

            for (const arg of node.arguments) {
              if (arg.type === 'SpreadElement') {
                continue
              }
              walkExpressionForStrings(context, arg)
            }
          },
        }
      },
    },

    'no-inline-style-theming': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Disallow inline style-based visual theming in governed UI code.',
        },
        schema: [],
        messages: {
          inlineStyleTheming:
            'Inline style-based theming is not allowed in governed UI code. Use semantic utilities, token-backed classes, or approved component variants instead.',
        },
      },

      create(context) {
        return {
          JSXAttribute(node) {
            if (
              !node.name ||
              node.name.type !== 'JSXIdentifier' ||
              node.name.name !== 'style'
            ) {
              return
            }

            if (
              !node.value ||
              node.value.type !== 'JSXExpressionContainer' ||
              !node.value.expression ||
              !isStyleObjectExpression(node.value.expression)
            ) {
              return
            }

            for (const prop of node.value.expression.properties) {
              if (prop.type !== 'Property') continue

              const keyName = getPropertyName(prop)
              if (!keyName) continue

              if (!STYLE_COLOR_KEYS.has(keyName)) continue

              context.report({
                node: prop,
                messageId: 'inlineStyleTheming',
              })
            }
          },
        }
      },
    },

    'no-direct-semantic-color': noDirectSemanticColorRule,
    'semantic-token-allowlist': createSemanticTokenAllowlistRule(),
    'no-local-semantic-map': noLocalSemanticMapRule,
    'no-direct-radix-outside-ui': noDirectRadixOutsideUiRule,
  },
}
