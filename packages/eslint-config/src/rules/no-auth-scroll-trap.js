import { readFileSync } from "node:fs"
import path from "node:path"

const TARGET_SELECTORS = new Set([
  ".auth-root",
  ".auth-shell",
  ".auth-shell-content",
  ".auth-shell-grid",
])

const FIXED_VIEWPORT_HEIGHT_PATTERN = /(^|[;\s])height\s*:\s*100(?:d|s|l)?vh\b/i
const HIDDEN_OVERFLOW_PATTERN = /\boverflow(?:-x|-y)?\s*:\s*(hidden|clip)\b/i
const CSS_BLOCK_PATTERN = /([^{}]+)\{([^{}]*)\}/g

/**
 * @param {string} selectorText
 */
function findTargetSelectors(selectorText) {
  return selectorText
    .split(",")
    .map((selector) => selector.trim())
    .filter((selector) => TARGET_SELECTORS.has(selector))
}

/**
 * @param {string} cssSource
 */
function findViolations(cssSource) {
  const violations = []

  for (const match of cssSource.matchAll(CSS_BLOCK_PATTERN)) {
    const selectorText = match[1] ?? ""
    const declarations = match[2] ?? ""
    const selectors = findTargetSelectors(selectorText)

    if (selectors.length === 0) {
      continue
    }

    if (FIXED_VIEWPORT_HEIGHT_PATTERN.test(declarations)) {
      for (const selector of selectors) {
        violations.push({
          messageId: "fixedViewportHeight",
          selector,
        })
      }
    }

    if (HIDDEN_OVERFLOW_PATTERN.test(declarations)) {
      for (const selector of selectors) {
        violations.push({
          messageId: "hiddenOverflow",
          selector,
        })
      }
    }
  }

  return violations
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow public auth shell CSS patterns that create scroll traps or clipped content.",
    },
    schema: [],
    messages: {
      fixedViewportHeight:
        'Public auth shell selector "{{ selector }}" uses a fixed viewport height. Use min-height and content-driven layout instead.',
      hiddenOverflow:
        'Public auth shell selector "{{ selector }}" must not hide overflow. Fix the layout width or height instead of clipping content.',
    },
  },
  create(context) {
    return {
      /**
       * @param {import('estree').ImportDeclaration} node
       */
      ImportDeclaration(node) {
        const source = node.source?.value
        if (typeof source !== "string" || !source.endsWith("auth.css")) {
          return
        }

        const cssPath = path.resolve(path.dirname(context.filename), source)
        const cssSource = readFileSync(cssPath, "utf8")

        for (const violation of findViolations(cssSource)) {
          context.report({
            node,
            messageId: violation.messageId,
            data: {
              selector: violation.selector,
            },
          })
        }
      },
    }
  },
}

export default rule
