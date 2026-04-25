const childProcessModulePattern = /^(?:node:)?child_process$/u
const operatorKernelRuntimePathPattern =
  /[\\/]packages[\\/]operator-kernel[\\/]src[\\/].+\.[cm]?[jt]sx?$/u

const blockedProcessApis = new Set([
  "exec",
  "execFile",
  "execFileSync",
  "execSync",
  "fork",
  "spawn",
  "spawnSync",
])

/**
 * @param {string | null | undefined} filename
 * @returns {boolean}
 */
function isOperatorKernelRuntimeFile(filename) {
  return (
    typeof filename === "string" &&
    operatorKernelRuntimePathPattern.test(filename)
  )
}

/**
 * @param {import('estree').ImportDeclaration | import('estree').ImportExpression | import('estree').CallExpression} node
 * @returns {string | null}
 */
function getImportTarget(node) {
  if (node.type === "ImportDeclaration") {
    return typeof node.source.value === "string" ? node.source.value : null
  }

  if (node.type === "ImportExpression") {
    return node.source.type === "Literal" &&
      typeof node.source.value === "string"
      ? node.source.value
      : null
  }

  if (
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "require" &&
    node.arguments[0]?.type === "Literal" &&
    typeof node.arguments[0].value === "string"
  ) {
    return node.arguments[0].value
  }

  return null
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow child_process imports and subprocess execution inside the governed Operator Kernel runtime layer.",
    },
    schema: [],
    messages: {
      noChildProcessImport:
        "RG-EXEC-001: packages/operator-kernel/src may not import child_process. Execute Sync-Pack workflows through the public SDK instead of spawning subprocesses.",
      noSubprocessCall:
        'RG-EXEC-001: packages/operator-kernel/src may not execute subprocess APIs such as "{{ api }}". Route execution through the typed SDK workflow catalog instead.',
    },
  },
  create(context) {
    const filename = context.filename
    if (!isOperatorKernelRuntimeFile(filename)) {
      return {}
    }

    const blockedLocalNames = new Set()
    const blockedNamespaces = new Set()

    return {
      ImportDeclaration(node) {
        const importPath = getImportTarget(node)
        if (!importPath || !childProcessModulePattern.test(importPath)) {
          return
        }

        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportNamespaceSpecifier") {
            blockedNamespaces.add(specifier.local.name)
            continue
          }

          if (specifier.type === "ImportSpecifier") {
            blockedLocalNames.add(specifier.local.name)
            continue
          }

          blockedLocalNames.add(specifier.local.name)
        }

        context.report({
          node: node.source,
          messageId: "noChildProcessImport",
        })
      },
      ImportExpression(node) {
        const importPath = getImportTarget(node)
        if (!importPath || !childProcessModulePattern.test(importPath)) {
          return
        }

        context.report({
          node,
          messageId: "noChildProcessImport",
        })
      },
      VariableDeclarator(node) {
        if (
          node.init?.type !== "CallExpression" ||
          node.init.callee.type !== "Identifier" ||
          node.init.callee.name !== "require"
        ) {
          return
        }

        const importPath = getImportTarget(node.init)
        if (!importPath || !childProcessModulePattern.test(importPath)) {
          return
        }

        if (node.id.type === "Identifier") {
          blockedLocalNames.add(node.id.name)
        }

        if (node.id.type === "ObjectPattern") {
          for (const property of node.id.properties) {
            if (
              property.type === "Property" &&
              property.value.type === "Identifier"
            ) {
              blockedLocalNames.add(property.value.name)
            }
          }
        }

        context.report({
          node: node.init,
          messageId: "noChildProcessImport",
        })
      },
      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          blockedLocalNames.has(node.callee.name) &&
          blockedProcessApis.has(node.callee.name)
        ) {
          context.report({
            node,
            messageId: "noSubprocessCall",
            data: {
              api: node.callee.name,
            },
          })
          return
        }

        if (
          node.callee.type === "MemberExpression" &&
          !node.callee.computed &&
          node.callee.object.type === "Identifier" &&
          blockedNamespaces.has(node.callee.object.name) &&
          node.callee.property.type === "Identifier" &&
          blockedProcessApis.has(node.callee.property.name)
        ) {
          context.report({
            node,
            messageId: "noSubprocessCall",
            data: {
              api: node.callee.property.name,
            },
          })
        }
      },
    }
  },
}

export default rule
