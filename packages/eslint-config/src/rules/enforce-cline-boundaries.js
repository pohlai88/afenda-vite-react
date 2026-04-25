import path from "node:path"

const clineWorkspaceSegment = `${path.sep}packages${path.sep}cline${path.sep}`
const featuresSdkWorkspaceSegment = `${path.sep}packages${path.sep}features-sdk${path.sep}`
const clineMcpServerSegment = `${path.sep}packages${path.sep}cline${path.sep}src${path.sep}mcp-server${path.sep}`
const clineRuntimeDirectory = `${path.sep}packages${path.sep}cline${path.sep}src${path.sep}runtime${path.sep}`
const clineRuntimeIndexSuffix = `${path.sep}packages${path.sep}cline${path.sep}src${path.sep}runtime${path.sep}index`
const clineCoreDirectory = `${path.sep}packages${path.sep}cline${path.sep}src${path.sep}core${path.sep}`
const clinePluginDirectory = `${path.sep}packages${path.sep}cline${path.sep}src${path.sep}plugins${path.sep}`
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
function isClineFile(filename) {
  return (
    typeof filename === "string" && filename.includes(clineWorkspaceSegment)
  )
}

/**
 * @param {string | null | undefined} filename
 * @returns {boolean}
 */
function isClineMcpServerFile(filename) {
  return (
    typeof filename === "string" && filename.includes(clineMcpServerSegment)
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
    normalizedTarget.endsWith(`${clineRuntimeIndexSuffix}.ts`) ||
    normalizedTarget.endsWith(`${clineRuntimeIndexSuffix}.tsx`) ||
    normalizedTarget.endsWith(`${clineRuntimeIndexSuffix}.js`) ||
    normalizedTarget.endsWith(`${clineRuntimeIndexSuffix}.mjs`) ||
    normalizedTarget.endsWith(`${clineRuntimeIndexSuffix}.cjs`)
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

  if (normalizedTarget.includes(clinePluginDirectory)) {
    return true
  }

  if (normalizedTarget.includes(clineCoreDirectory)) {
    return true
  }

  return (
    normalizedTarget.includes(clineRuntimeDirectory) &&
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
        "Enforce the governed Cline boundary so the runtime only consumes public Features SDK and top-level runtime surfaces.",
    },
    schema: [],
    messages: {
      noRelativeFeaturesSdkSource:
        "RG-PKG-BOUNDARY-001: packages/cline may not reach into packages/features-sdk by relative path. Import the public @afenda/features-sdk/sync-pack surface instead.",
      noPrivateFeaturesSdkPackageSurface:
        'RG-PKG-BOUNDARY-001: packages/cline may consume only "{{ allowedImport }}" from Features SDK. Do not reach into other package subpaths.',
      mcpRuntimeOnly:
        "RG-PKG-BOUNDARY-001: packages/cline/src/mcp-server may import only the top-level runtime API. Do not reach into core, plugin, or runtime internals.",
      noMcpFeaturesSdkImport:
        "RG-PKG-BOUNDARY-001: packages/cline/src/mcp-server is transport-only and may not import Features SDK directly.",
    },
  },
  create(context) {
    const filename = context.filename

    if (!isClineFile(filename)) {
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
        if (isClineMcpServerFile(filename)) {
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
        isClineMcpServerFile(filename) &&
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
