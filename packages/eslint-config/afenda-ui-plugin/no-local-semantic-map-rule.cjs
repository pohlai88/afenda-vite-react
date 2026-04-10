/**
 * ESLint rule: no-local-semantic-map
 *
 * Prevents the creation of inline class mapping tables outside the governed
 * @afenda/shadcn-ui package. Detects:
 *
 * 1. Variables whose identifier ends with ClassMap, ToneMap, StyleMap,
 *    SeverityMap, or Presentation that contain Tailwind class strings.
 * 2. Variables with a type annotation of Record<SemanticTone|TruthSeverity|
 *    SemanticEmphasis|SemanticSurface|SemanticDensity|SemanticSize, ...>
 *    whose value object contains Tailwind class patterns.
 *
 * The fix: move the mapping into packages/shadcn-ui/src/semantic/domain/ and
 * expose a governed accessor function.
 */
const {
  containsSemanticIntentClass,
} = require('./semantic-intent-stems.cjs')

/** Variable name suffixes that signal unauthorized semantic mapping. */
const FORBIDDEN_SUFFIXES = [
  'ClassMap',
  'ToneMap',
  'StyleMap',
  'SeverityMap',
]

/** Type names that, when used as Record keys, indicate a semantic class map. */
const SEMANTIC_KEY_TYPES = new Set([
  'SemanticTone',
  'TruthSeverity',
  'SemanticEmphasis',
  'SemanticSurface',
  'SemanticDensity',
  'SemanticSize',
  'SemanticStatus',
  'SemanticIntent',
])

/** Patterns that identify a Tailwind utility class value. */
const TAILWIND_CLASS_RE =
  /\b(bg|text|border|ring|fill|stroke|shadow|rounded|gap|px|py|p|m|mx|my|flex|grid|hidden|block|inline)-/

function extractStaticString(node) {
  if (!node) return null

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value
  }

  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((quasi) => quasi.value.cooked || '').join('')
  }

  return null
}

function collectObjectStrings(node, strings = []) {
  if (!node || node.type !== 'ObjectExpression') return strings

  for (const prop of node.properties) {
    if (prop.type !== 'Property') continue

    const text = extractStaticString(prop.value)
    if (text !== null) {
      strings.push(text)
      continue
    }

    if (prop.value.type === 'ObjectExpression') {
      collectObjectStrings(prop.value, strings)
    }
  }

  return strings
}

function hasTailwindClassInObject(node) {
  return collectObjectStrings(node).some((text) => TAILWIND_CLASS_RE.test(text))
}

function countSemanticIntentStringsInObject(node) {
  return collectObjectStrings(node).filter((text) =>
    containsSemanticIntentClass(text)
  ).length
}

function hasForbiddenSuffix(name) {
  return FORBIDDEN_SUFFIXES.some((suffix) => name.endsWith(suffix))
}

function getRecordKeyTypeName(typeAnnotation) {
  // Handle TSTypeAnnotation wrapper
  const typeNode =
    typeAnnotation &&
    typeAnnotation.type === 'TSTypeAnnotation' &&
    typeAnnotation.typeAnnotation
      ? typeAnnotation.typeAnnotation
      : typeAnnotation

  if (!typeNode) return null

  // Record<KeyType, ...> → TSTypeReference { typeName: 'Record', typeParameters: [KeyType, ...] }
  if (
    typeNode.type === 'TSTypeReference' &&
    typeNode.typeName &&
    typeNode.typeName.name === 'Record' &&
    ((typeNode.typeArguments && typeNode.typeArguments.params.length >= 1) ||
      (typeNode.typeParameters && typeNode.typeParameters.params.length >= 1))
  ) {
    const keyParam =
      (typeNode.typeArguments || typeNode.typeParameters).params[0]
    if (keyParam.type === 'TSTypeReference' && keyParam.typeName) {
      return keyParam.typeName.name || null
    }
  }
  return null
}

function getAssignedOrReturnedString(statement) {
  if (!statement) return null

  if (statement.type === 'ReturnStatement') {
    return extractStaticString(statement.argument)
  }

  if (
    statement.type === 'ExpressionStatement' &&
    statement.expression &&
    statement.expression.type === 'AssignmentExpression'
  ) {
    return extractStaticString(statement.expression.right)
  }

  return null
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow inline semantic class mapping tables outside the governed @afenda/shadcn-ui package.',
      url: 'https://github.com/NexusCanon/afenda-react-vite/packages/shadcn-ui/RULES.md',
    },
    schema: [],
    messages: {
      noLocalSemanticMap:
        'Semantic class mapping belongs in @afenda/shadcn-ui. ' +
        'Use a governed resolver (e.g. getIntegritySeverityPresentation, getBadgeToneClass) ' +
        'or request a new accessor from packages/shadcn-ui/src/semantic/.',
    },
  },

  create(context) {
    return {
      ConditionalExpression(node) {
        const consequentText = extractStaticString(node.consequent)
        const alternateText = extractStaticString(node.alternate)

        if (!consequentText || !alternateText) return
        if (!containsSemanticIntentClass(consequentText)) return
        if (!containsSemanticIntentClass(alternateText)) return

        context.report({ node, messageId: 'noLocalSemanticMap' })
      },

      SwitchStatement(node) {
        let semanticBranchCount = 0

        for (const caseNode of node.cases) {
          for (const statement of caseNode.consequent) {
            const text = getAssignedOrReturnedString(statement)
            if (text && containsSemanticIntentClass(text)) {
              semanticBranchCount += 1
              break
            }
          }
        }

        if (semanticBranchCount >= 3) {
          context.report({ node, messageId: 'noLocalSemanticMap' })
        }
      },

      VariableDeclarator(node) {
        // Only check variable names that are identifiers
        if (!node.id || node.id.type !== 'Identifier') return
        const name = node.id.name
        const init = node.init

        // Check 1: forbidden suffix naming convention
        if (hasForbiddenSuffix(name) && init) {
          if (hasTailwindClassInObject(init)) {
            context.report({ node: node.id, messageId: 'noLocalSemanticMap' })
            return
          }
          // Also flag if the value is an object with any string values that look like classes
          if (init.type === 'ObjectExpression') {
            for (const prop of init.properties) {
              if (prop.type !== 'Property') continue
              if (
                prop.value.type === 'Literal' &&
                typeof prop.value.value === 'string' &&
                TAILWIND_CLASS_RE.test(prop.value.value)
              ) {
                context.report({ node: node.id, messageId: 'noLocalSemanticMap' })
                return
              }
            }
          }
        }

        // Check 2: Record<SemanticType, ...> type annotation with Tailwind class values
        const typeAnnotation = node.id.typeAnnotation
        if (typeAnnotation) {
          const keyTypeName = getRecordKeyTypeName(typeAnnotation)
          if (keyTypeName && SEMANTIC_KEY_TYPES.has(keyTypeName) && init) {
            if (hasTailwindClassInObject(init)) {
              context.report({ node: node.id, messageId: 'noLocalSemanticMap' })
              return
            }
          }
        }

        if (
          init &&
          init.type === 'ObjectExpression' &&
          countSemanticIntentStringsInObject(init) >= 3
        ) {
          context.report({ node: node.id, messageId: 'noLocalSemanticMap' })
        }
      },
    }
  },
}
