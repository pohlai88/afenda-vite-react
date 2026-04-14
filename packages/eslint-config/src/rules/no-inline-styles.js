/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow inline `style={...}` on JSX elements; prefer tokens and utilities.',
    },
    schema: [],
  },
  create(context) {
    return {
      /**
       * @param {import('estree').Node & { type: 'JSXAttribute'; name?: unknown }} node
       */
      JSXAttribute(node) {
        const name = node.name
        if (
          name &&
          typeof name === 'object' &&
          'type' in name &&
          name.type === 'JSXIdentifier' &&
          'name' in name &&
          name.name === 'style'
        ) {
          context.report({
            node,
            message:
              'Inline styles are not allowed here; use design tokens and Tailwind utilities instead.',
          })
        }
      },
    }
  },
}

export default rule
