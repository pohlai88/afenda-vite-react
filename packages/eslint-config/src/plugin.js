import tokenOnlyTailwind from "./rules/token-only-tailwind.js"
import noInlineStyles from "./rules/no-inline-styles.js"
import noDirectRadix from "./rules/no-direct-radix.js"
import noAuthScrollTrap from "./rules/no-auth-scroll-trap.js"
import requireAppSurfaceBaseline from "./rules/require-app-surface-baseline.js"
import enforceClineBoundaries from "./rules/enforce-cline-boundaries.js"
import noClineChildProcess from "./rules/no-cline-child-process.js"

/**
 * Afenda UI governance plugin (flat config). Rule ids: `afenda-ui/<rule-name>`.
 *
 * @type {import('eslint').ESLint.Plugin}
 */
const plugin = {
  meta: {
    name: "eslint-plugin-afenda-ui",
    version: "0.0.0",
  },
  rules: {
    "token-only-tailwind": tokenOnlyTailwind,
    "no-inline-styles": noInlineStyles,
    "no-direct-radix": noDirectRadix,
    "no-auth-scroll-trap": noAuthScrollTrap,
    "require-app-surface-baseline": requireAppSurfaceBaseline,
    "enforce-cline-boundaries": enforceClineBoundaries,
    "no-cline-child-process": noClineChildProcess,
  },
}

export default plugin
