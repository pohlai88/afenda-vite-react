import tokenOnlyTailwind from './rules/token-only-tailwind.js'
import noInlineStyles from './rules/no-inline-styles.js'
import noDirectRadix from './rules/no-direct-radix.js'

/**
 * Afenda UI governance plugin (flat config). Rule ids: `afenda-ui/<rule-name>`.
 *
 * @type {import('eslint').ESLint.Plugin}
 */
const plugin = {
  meta: {
    name: 'eslint-plugin-afenda-ui',
    version: '0.0.0',
  },
  rules: {
    'token-only-tailwind': tokenOnlyTailwind,
    'no-inline-styles': noInlineStyles,
    'no-direct-radix': noDirectRadix,
  },
}

export default plugin
