/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing from `@radix-ui/*`; use governed primitives (`radix-ui` package or ui-primitives).',
    },
    schema: [],
  },
  create(context) {
    return {
      /**
       * @param {import('estree').ImportDeclaration} node
       */
      ImportDeclaration(node) {
        const src = node.source?.value
        if (typeof src !== 'string') return
        if (src.startsWith('@radix-ui/')) {
          context.report({
            node,
            message:
              'Direct @radix-ui imports are not allowed; use the governed design-system primitives.',
          })
        }
      },
    }
  },
}

export default rule
