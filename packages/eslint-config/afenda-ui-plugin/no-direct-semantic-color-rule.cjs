const {
  findSemanticIntentTokens,
} = require('./semantic-intent-stems.cjs')

function reportForText(context, text, node) {
  for (const match of findSemanticIntentTokens(text)) {
    context.report({
      node,
      messageId: 'noDirectSemanticColor',
      data: {
        token: match.token,
      },
    })
  }
}

function walkExpressionForSemanticColors(context, node) {
  if (!node) return

  if (node.type === 'Literal' && typeof node.value === 'string') {
    reportForText(context, node.value, node)
    return
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    const text = node.quasis.map((quasi) => quasi.value.cooked || '').join('')
    reportForText(context, text, node)
    return
  }

  switch (node.type) {
    case 'ConditionalExpression':
      walkExpressionForSemanticColors(context, node.consequent)
      walkExpressionForSemanticColors(context, node.alternate)
      break
    case 'LogicalExpression':
      walkExpressionForSemanticColors(context, node.left)
      walkExpressionForSemanticColors(context, node.right)
      break
    case 'ArrayExpression':
      for (const element of node.elements) {
        if (element) walkExpressionForSemanticColors(context, element)
      }
      break
    case 'ObjectExpression':
      for (const property of node.properties) {
        if (property.type === 'Property') {
          walkExpressionForSemanticColors(context, property.value)
        }
      }
      break
    default:
      break
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

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct composition of semantic-intent color classes in feature code.',
    },
    schema: [
      {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    ],
    messages: {
      noDirectSemanticColor:
        'Semantic color "{{token}}" must come from a governed resolver or semantic component. Do not compose semantic color classes directly in feature code.',
    },
  },

  create(context) {
    const targetCallNames = new Set(['cn', 'cva', 'clsx', 'twMerge'])

    return {
      JSXAttribute(node) {
        const attrName =
          node.name && node.name.type === 'JSXIdentifier' ? node.name.name : null

        if (attrName !== 'className' || !node.value) return

        if (node.value.type === 'Literal') {
          walkExpressionForSemanticColors(context, node.value)
          return
        }

        if (
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression
        ) {
          walkExpressionForSemanticColors(context, node.value.expression)
        }
      },

      CallExpression(node) {
        if (!isTargetCall(node, targetCallNames)) return

        for (const arg of node.arguments) {
          if (arg.type === 'SpreadElement') continue
          walkExpressionForSemanticColors(context, arg)
        }
      },
    }
  },
}
