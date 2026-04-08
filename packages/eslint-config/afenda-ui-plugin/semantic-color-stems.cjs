/**
 * Stems allowed after governed color prefixes (text-, bg-, border-, ...).
 * Source of truth: `packages/shadcn-ui/src/lib/constant/foundation/token-stems.json`
 * which must stay aligned with `apps/web/src/index.css` `@theme inline` `--color-*`
 * names (the segment after `--color-`).
 */
const approvedColorStemValues = require('../../shadcn-ui/src/lib/constant/foundation/token-stems.json')

const SEMANTIC_COLOR_STEMS = new Set(approvedColorStemValues)

module.exports = { SEMANTIC_COLOR_STEMS }
