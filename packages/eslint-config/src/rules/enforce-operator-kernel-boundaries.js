import path from "node:path"

const operatorKernelWorkspaceSegment = `${path.sep}packages${path.sep}operator-kernel${path.sep}`
const featuresSdkWorkspaceSegment = `${path.sep}packages${path.sep}features-sdk${path.sep}`
const operatorKernelMcpAdapterSegment = `${path.sep}packages${path.sep}operator-kernel${path.sep}src${path.sep}mcp-adapter${path.sep}`
const operatorKernelRuntimeDirectory = `${path.sep}packages${path.sep}operator-kernel${path.sep}src${path.sep}runtime${path.sep}`
const operatorKernelRuntimeIndexSuffix = `${path.sep}packages${path.sep}operator-kernel${path.sep}src${path.sep}runtime${path.sep}index`
const operatorKernelCoreDirectory = `${path.sep}packages${path.sep}operator-kernel${path.sep}src${path.sep}core${path.sep}`
const operatorKernelPluginDirectory = `${path.sep}packages${path.sep}operator-kernel${path.sep}src${path.sep}plugins${path.sep}`
const publicFeaturesSdkSurface = "@afenda/features-sdk/sync-pack"

/**
 * @param {string} value
 * @returns {string}
 */
function normalizePath(value) {
  return value.replaceAll("/", path.sep)
}

/**
 * @param {string | null | undefined} filename
 * @returns {boolean}
 */
function isOperatorKernelFile(filename) {
  return (
    typeof filename === "string" &&
    filename.includes(operatorKernelWorkspaceSegment)
  )
}

/**
 * @param {string | null | undefined} filename
 * @returns {boolean}
 */
function isOperatorKernelMcpAdapterFile(filename) {
  return (
    typeof filename === "string" &&
    filename.includes(operatorKernelMcpAdapterSegment)
  )
}

/**
 * @param {string} importerFilename
 * @param {string} importPath
 * @returns {string | null}
 */
function resolveImportTarget(importerFilename, importPath) {
  if (!importPath.startsWith(".")) {
    return null
  }

  return path.normalize(
    path.resolve(path.dirname(importerFilename), importPath)
  )
}

/**
 * @param {string | null} resolvedTarget
 * @returns {boolean}
 */
function resolvesIntoFeaturesSdk(resolvedTarget) {
  return (
    typeof resolvedTarget === "string" &&
    resolvedTarget.includes(featuresSdkWorkspaceSegment)
  )
}

/**
 * @param {string} importPath
 * @returns {boolean}
 */
function isAllowedFeaturesSdkImport(importPath) {
  return importPath === publicFeaturesSdkSurface
}

/**
 * @param {string | null} resolvedTarget
 * @returns {boolean}
 */
function isRuntimeIndexTarget(resolvedTarget) {
  if (typeof resolvedTarget !== "string") {
    return false
  }

  const normalizedTarget = normalizePath(resolvedTarget)
  return (
    normalizedTarget.endsWith(`${operatorKernelRuntimeIndexSuffix}.ts`) ||
    normalizedTarget.endsWith(`${operatorKernelRuntimeIndexSuffix}.tsx`) ||
    normalizedTarget.endsWith(`${operatorKernelRuntimeIndexSuffix}.js`) ||
    normalizedTarget.endsWith(`${operatorKernelRuntimeIndexSuffix}.mjs`) ||
    normalizedTarget.endsWith(`${operatorKernelRuntimeIndexSuffix}.cjs`)
  )
}

/**
 * @param {string | null} resolvedTarget
 * @returns {boolean}
 */
function resolvesIntoMcpForbiddenInternalSurface(resolvedTarget) {
  if (typeof resolvedTarget !== "string") {
    return false
  }

  const normalizedTarget = normalizePath(resolvedTarget)

  if (normalizedTarget.includes(operatorKernelPluginDirectory)) {
    return true
  }

  if (normalizedTarget.includes(operatorKernelCoreDirectory)) {
    return true
  }

  return (
    normalizedTarget.includes(operatorKernelRuntimeDirectory) &&
    !isRuntimeIndexTarget(normalizedTarget)
  )
}

/**
 * @param {import('estree').ImportDeclaration | import('estree').ExportNamedDeclaration | import('estree').ExportAllDeclaration | import('estree').ImportExpression} node
 * @returns {import('estree').Literal | null}
 */
function getSourceLiteral(node) {
  if (node.type === "ImportExpression") {
    return node.source.type === "Literal" ? node.source : null
  }

  if ("source" in node && node.source?.type === "Literal") {
    return node.source
  }

  return null
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce the governed Operator Kernel boundary so the runtime only consumes public Features SDK and top-level runtime surfaces.",
    },
    schema: [],
    messages: {
      noRelativeFeaturesSdkSource:
        "RG-PKG-BOUNDARY-001: packages/operator-kernel may not reach into packages/features-sdk by relative path. Import the public @afenda/features-sdk/sync-pack surface instead.",
      noPrivateFeaturesSdkPackageSurface:
        'RG-PKG-BOUNDARY-001: packages/operator-kernel may consume only "{{ allowedImport }}" from Features SDK. Do not reach into other package subpaths.',
      mcpRuntimeOnly:
        "RG-PKG-BOUNDARY-001: packages/operator-kernel/src/mcp-adapter may import only the top-level runtime API. Do not reach into core, plugin, or runtime internals.",
      noMcpFeaturesSdkImport:
        "RG-PKG-BOUNDARY-001: packages/operator-kernel/src/mcp-adapter is transport-only and may not import Features SDK directly.",
    },
  },
  create(context) {
    const filename = context.filename

    if (!isOperatorKernelFile(filename)) {
      return {}
    }

    /**
     * @param {import('estree').ImportDeclaration | import('estree').ExportNamedDeclaration | import('estree').ExportAllDeclaration | import('estree').ImportExpression} node
     */
    function reportIfInvalid(node) {
      const sourceLiteral = getSourceLiteral(node)
      const importPath = sourceLiteral?.value
      if (typeof importPath !== "string") {
        return
      }

      const resolvedTarget = resolveImportTarget(filename, importPath)

      if (resolvesIntoFeaturesSdk(resolvedTarget)) {
        context.report({
          node: sourceLiteral,
          messageId: "noRelativeFeaturesSdkSource",
        })
        return
      }

      if (
        importPath.startsWith("@afenda/features-sdk") &&
        !isAllowedFeaturesSdkImport(importPath)
      ) {
        if (isOperatorKernelMcpAdapterFile(filename)) {
          context.report({
            node: sourceLiteral,
            messageId: "noMcpFeaturesSdkImport",
          })
          return
        }

        context.report({
          node: sourceLiteral,
          messageId: "noPrivateFeaturesSdkPackageSurface",
          data: {
            allowedImport: publicFeaturesSdkSurface,
          },
        })
        return
      }

      if (
        isOperatorKernelMcpAdapterFile(filename) &&
        resolvesIntoMcpForbiddenInternalSurface(resolvedTarget)
      ) {
        context.report({
          node: sourceLiteral,
          messageId: "mcpRuntimeOnly",
        })
      }
    }

    return {
      ImportDeclaration: reportIfInvalid,
      ExportNamedDeclaration: reportIfInvalid,
      ExportAllDeclaration: reportIfInvalid,
      ImportExpression: reportIfInvalid,
    }
  },
}

export default rule
