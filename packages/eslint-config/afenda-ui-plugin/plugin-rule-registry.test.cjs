'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { rules } = require('./index.cjs')
const { AFENDA_UI_PLUGIN_RULE_NAMES } = require('./plugin-rule-registry.cjs')

test('plugin-rule-registry matches index.cjs rule keys', () => {
  const fromIndex = Object.keys(rules).sort((a, b) => a.localeCompare(b))
  assert.deepEqual([...AFENDA_UI_PLUGIN_RULE_NAMES], fromIndex)
})
