/**
 * @typedef {{
 *   requiredComponents?: string[]
 *   forbiddenIdentifiers?: string[]
 *   requiredComponentProps?: Record<string, string[]>
 *   forbiddenClassNameSnippets?: string[]
 * }} AppSurfaceBaselineOptions
 */

/**
 * @param {import('estree').Node | null | undefined} node
 * @returns {string | null}
 */
function getJsxName(node) {
  if (!node) return null
  if (node.type === "JSXIdentifier") {
    return node.name
  }
  return null
}

/**
 * @param {import('estree').Node | null | undefined} node
 * @returns {import('estree').Identifier | null}
 */
function getBoundIdentifier(node) {
  if (!node) return null
  if (node.type === "Identifier") {
    return node
  }
  return null
}

/**
 * @param {import('eslint').Rule.Node} node
 * @param {Set<string>} forbiddenIdentifiers
 * @returns {string | null}
 */
function getForbiddenIdentifierName(node, forbiddenIdentifiers) {
  if (node.type === "FunctionDeclaration") {
    const identifier = getBoundIdentifier(node.id)
    return identifier && forbiddenIdentifiers.has(identifier.name)
      ? identifier.name
      : null
  }

  if (node.type === "VariableDeclarator") {
    const identifier = getBoundIdentifier(node.id)
    return identifier && forbiddenIdentifiers.has(identifier.name)
      ? identifier.name
      : null
  }

  if (
    node.type === "ImportSpecifier" ||
    node.type === "ImportDefaultSpecifier" ||
    node.type === "ImportNamespaceSpecifier"
  ) {
    return forbiddenIdentifiers.has(node.local.name) ? node.local.name : null
  }

  if (node.type === "JSXOpeningElement") {
    const name = getJsxName(node.name)
    return name && forbiddenIdentifiers.has(name) ? name : null
  }

  return null
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require adopted authenticated routes to use the canonical AppSurface baseline and forbid route-local shell drift.",
    },
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          requiredComponents: {
            type: "array",
            items: { type: "string" },
          },
          forbiddenIdentifiers: {
            type: "array",
            items: { type: "string" },
          },
          requiredComponentProps: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string" },
            },
          },
          forbiddenClassNameSnippets: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    ],
    messages: {
      missingRequiredComponent:
        'Adopted app surface route must render "{{ componentName }}" as part of the enforced baseline.',
      forbiddenIdentifier:
        'Adopted app surface route must not use legacy route-owned surface identifier "{{ identifierName }}".',
      missingRequiredProp:
        'Component "{{ componentName }}" must include the "{{ propName }}" prop in adopted app-surface routes.',
      forbiddenClassNameSnippet:
        'Adopted app surface route must not use route-local wrapper classes containing "{{ classSnippet }}".',
    },
  },
  create(context) {
    const [options = /** @type {AppSurfaceBaselineOptions} */ ({})] =
      context.options
    const requiredComponents = new Set(options.requiredComponents ?? [])
    const forbiddenIdentifiers = new Set(options.forbiddenIdentifiers ?? [])
    const requiredComponentProps = options.requiredComponentProps ?? {}
    const forbiddenClassNameSnippets = new Set(
      options.forbiddenClassNameSnippets ?? []
    )
    const seenComponents = new Set()
    /** @type {Array<{ node: import('eslint').Rule.Node, componentName: string, propName: string }>} */
    const missingProps = []

    /**
     * @param {import('estree').Node & { attributes?: Array<import('estree').Node & { type: string, name?: { name: string }, value?: unknown }> }} node
     * @returns {string | null}
     */
    function getForbiddenClassSnippet(node) {
      if (forbiddenClassNameSnippets.size === 0 || !("attributes" in node)) {
        return null
      }

      const classNameAttribute = node.attributes?.find(
        (attribute) =>
          attribute.type === "JSXAttribute" &&
          attribute.name?.name === "className"
      )

      if (!classNameAttribute || classNameAttribute.type !== "JSXAttribute") {
        return null
      }

      const rawValue =
        classNameAttribute.value?.type === "Literal" &&
        typeof classNameAttribute.value.value === "string"
          ? classNameAttribute.value.value
          : classNameAttribute.value?.type === "JSXExpressionContainer" &&
              classNameAttribute.value.expression?.type === "Literal" &&
              typeof classNameAttribute.value.expression.value === "string"
            ? classNameAttribute.value.expression.value
            : null

      if (!rawValue) {
        return null
      }

      for (const snippet of forbiddenClassNameSnippets) {
        if (rawValue.includes(snippet)) {
          return snippet
        }
      }

      return null
    }

    return {
      /** @param {import('eslint').Rule.Node} node */
      "*"(node) {
        const forbiddenName = getForbiddenIdentifierName(
          node,
          forbiddenIdentifiers
        )
        if (forbiddenName) {
          context.report({
            node,
            messageId: "forbiddenIdentifier",
            data: {
              identifierName: forbiddenName,
            },
          })
        }
      },

      /**
       * @param {import('estree').Node & {
       *   name: import('estree').Node,
       *   attributes: Array<import('estree').Node & { type: string, name?: { name: string }, value?: unknown }>
       * }} node
       */
      JSXOpeningElement(node) {
        const componentName = getJsxName(node.name)
        const forbiddenClassSnippet = getForbiddenClassSnippet(node)
        if (forbiddenClassSnippet) {
          context.report({
            node,
            messageId: "forbiddenClassNameSnippet",
            data: {
              classSnippet: forbiddenClassSnippet,
            },
          })
        }

        if (!componentName) {
          return
        }

        seenComponents.add(componentName)

        const requiredProps = requiredComponentProps[componentName] ?? []
        if (requiredProps.length === 0) {
          return
        }

        const presentProps = new Set(
          node.attributes
            .filter((attribute) => attribute.type === "JSXAttribute")
            .map((attribute) => attribute.name?.name)
            .filter((name) => typeof name === "string")
        )

        for (const propName of requiredProps) {
          if (!presentProps.has(propName)) {
            missingProps.push({
              node,
              componentName,
              propName,
            })
          }
        }
      },

      "Program:exit"(node) {
        for (const componentName of requiredComponents) {
          if (!seenComponents.has(componentName)) {
            context.report({
              node,
              messageId: "missingRequiredComponent",
              data: {
                componentName,
              },
            })
          }
        }

        for (const missingProp of missingProps) {
          context.report({
            node: missingProp.node,
            messageId: "missingRequiredProp",
            data: {
              componentName: missingProp.componentName,
              propName: missingProp.propName,
            },
          })
        }
      },
    }
  },
}

export default rule
