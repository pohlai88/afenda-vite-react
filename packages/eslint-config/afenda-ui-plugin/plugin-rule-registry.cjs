/**
 * Single source of truth for which rule names are registered on the afenda-ui
 * ESLint plugin. Derived from index.cjs at load time so keys cannot drift.
 *
 * Used by governance validators and CI to prove manifest ↔ plugin alignment.
 */
'use strict'

const { rules } = require('./index.cjs')

/** @type {ReadonlyArray<string>} */
const AFENDA_UI_PLUGIN_RULE_NAMES = Object.freeze(
  Object.keys(rules).sort((a, b) => a.localeCompare(b))
)

module.exports = {
  AFENDA_UI_PLUGIN_RULE_NAMES,
}
