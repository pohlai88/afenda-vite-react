/**
 * ESLint rule: no-direct-radix-outside-ui
 *
 * Blocks direct @radix-ui/react-* imports outside the governed UI package.
 * Scope classification is delegated to the shared class-governance-scope util.
 */
'use strict'

const { resolveClassGovernanceScope } = require('./utils/class-governance-scope.cjs')

const RADIX_REACT_PACKAGE_RE = /^@radix-ui\/react-[a-z0-9]+(?:-[a-z0-9]+)*$/u

function getSourceText(source) {
  if (!source) return null
  if (typeof source.value === 'string') return source.value
  if (source.type === 'Literal' && typeof source.value === 'string') return source.value
  return null
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct @radix-ui/react-* imports outside governed UI package.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowDirectRadixImportOutsideUiPackage: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      directRadixOutsideUi:
        'Direct Radix import "{{packageName}}" is not allowed outside the governed UI package. Use governed wrappers/components instead.',
    },
  },

  create(context) {
    const options = context.options[0] || {}
    const allowOutsideUi = options.allowDirectRadixImportOutsideUiPackage === true

    const filename = context.filename || context.getFilename()
    const scope = resolveClassGovernanceScope(filename)
    if (scope === 'ui-package' || allowOutsideUi) {
      return {}
    }

    return {
      ImportDeclaration(node) {
        const packageName = getSourceText(node.source)
        if (!packageName || !RADIX_REACT_PACKAGE_RE.test(packageName)) return

        context.report({
          node,
          messageId: 'directRadixOutsideUi',
          data: { packageName },
        })
      },
      ImportExpression(node) {
        const packageName = getSourceText(node.source)
        if (!packageName || !RADIX_REACT_PACKAGE_RE.test(packageName)) return

        context.report({
          node,
          messageId: 'directRadixOutsideUi',
          data: { packageName },
        })
      },
    }
  },
}
