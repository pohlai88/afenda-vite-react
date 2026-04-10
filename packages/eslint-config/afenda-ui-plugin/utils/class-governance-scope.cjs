/**
 * Shared path → governance scope for afenda-ui ESLint rules.
 * **Mirror:** `packages/shadcn-ui/src/lib/constant/policy/class-governance-scope.ts` — keep logic identical.
 * Keep in sync with packages/eslint-config/afenda-ui-plugin/WAVE1_WAVE2_RULE_SPECS.md §0.
 *
 * @param {string} filePath Absolute or relative path (POSIX or Windows separators).
 * @returns {string | null}
 */
function resolveClassGovernanceScope(filePath) {
  const normalized = String(filePath).replace(/\\/g, '/')

  // Substrings work with or without a leading slash (relative paths, Windows, etc.).
  if (normalized.includes('packages/shadcn-ui/src/')) return 'ui-package'
  if (normalized.includes('apps/web/src/share/components/shell-ui/')) return 'app-shell'
  if (normalized.includes('apps/web/src/features/')) return 'feature-ui'
  if (normalized.includes('apps/web/src/share/')) return 'shared-app-ui'
  if (normalized.includes('/chart/') || normalized.includes('/charts/')) return 'chart-interop'
  if (
    normalized.includes('/rich-content/') ||
    normalized.includes('/editor/') ||
    normalized.includes('/markdown/')
  ) {
    return 'rich-content'
  }

  return null
}

module.exports = {
  resolveClassGovernanceScope,
}
