/**
 * @typedef {import('eslint').Rule.RuleContext} RuleContext
 */

const ALLOWED_PREFIXES = [
  /^bg-(background|card|popover|primary|secondary|muted|accent|destructive|surface|sidebar|selection)$/,
  /^text-(foreground|card-foreground|popover-foreground|primary-foreground|secondary-foreground|muted-foreground|accent-foreground|destructive-foreground|surface-foreground|sidebar-foreground|selection-foreground)$/,
  /^border-(border|input|sidebar-border)$/,
  /^ring-(ring)$/,
  /^outline-(ring)$/,
  /^font-(sans|mono)$/,
  /^rounded-\[var\(--radius.*\)\]$/,
  /^h-\[var\(--size-.*\)\]$/,
  /^min-h-\[var\(--size-.*\)\]$/,
  /^max-h-\[var\(--size-.*\)\]$/,
  /^w-\[var\(--size-.*\)\]$/,
  /^p-\[var\(--spacing-.*\)\]$/,
  /^px-\[var\(--spacing-.*\)\]$/,
  /^py-\[var\(--spacing-.*\)\]$/,
  /^gap-\[var\(--spacing-.*\)\]$/,
  /^animate-\[var\(--animate-.*\)\]$/,
  /^flex$/,
  /^inline-flex$/,
  /^items-center$/,
  /^justify-center$/,
  /^justify-between$/,
  /^grid$/,
  /^inline-grid$/,
  /^block$/,
  /^inline-block$/,
  /^hidden$/,
]

/** Default Tailwind palette scales (e.g. `bg-blue-500`) — drift from design tokens */
const PALETTE_FORBIDDEN_PATTERNS = [
  /bg-\w+-\d+/,
  /text-\w+-\d+/,
  /border-\w+-\d+/,
  /ring-\w+-\d+/,
]

const FORBIDDEN_PATTERNS = [
  ...PALETTE_FORBIDDEN_PATTERNS,
  /\bp-\d+/,
  /\bpx-\d+/,
  /\bpy-\d+/,
  /\bgap-\d+/,
  /\bh-\d+/,
  /\bw-\d+/,
  /\btext-(xs|sm|base|lg|xl|\d)/,
  /\brounded(-\w+)?$/,
]

/**
 * @param {string} token
 */
function isAllowed(token) {
  return ALLOWED_PREFIXES.some((r) => r.test(token))
}

/**
 * @param {string} token
 * @param {readonly RegExp[]} patterns
 */
function isForbidden(token, patterns) {
  return patterns.some((r) => r.test(token))
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Restrict Tailwind className tokens to the governed allowlist (see TOKEN_COMPONENT_CONTRACT).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          driftOnly: {
            type: 'boolean',
            description:
              'If true, only flag default palette scales (e.g. bg-blue-500) and skip the strict allowlist (for app shell / semantic ui-* layers).',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const driftOnly = context.options[0]?.driftOnly === true
    const forbiddenPatterns = driftOnly ? PALETTE_FORBIDDEN_PATTERNS : FORBIDDEN_PATTERNS

    return {
      /**
       * @param {import('estree').Node & {
       *   type: 'JSXAttribute'
       *   name?: { type?: string; name?: string }
       *   value?: { type?: string; value?: unknown } | null
       * }} node
       */
      JSXAttribute(node) {
        if (node.name?.type !== 'JSXIdentifier' || node.name.name !== 'className') {
          return
        }

        const attrValue = node.value
        if (!attrValue || attrValue.type !== 'Literal') return
        const raw = attrValue.value
        if (typeof raw !== 'string') return

        const tokens = raw.split(/\s+/).filter(Boolean)

        for (const t of tokens) {
          if (isForbidden(t, forbiddenPatterns) && !isAllowed(t)) {
            context.report({
              node,
              message: `Forbidden Tailwind class "${t}". Use token-based utilities only.`,
            })
            continue
          }

          if (driftOnly) continue

          if (
            !isAllowed(t) &&
            !t.startsWith('[') &&
            !t.startsWith('data-') &&
            !t.startsWith('aria-')
          ) {
            context.report({
              node,
              message: `Non-token utility "${t}" is not allowed. Use token-mapped classes.`,
            })
          }
        }
      },
    }
  },
}

export default rule
