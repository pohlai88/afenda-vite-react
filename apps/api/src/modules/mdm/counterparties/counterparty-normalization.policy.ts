/**
 * Counterparty normalization policy: canonical naming/code shaping before persistence.
 * Owns deterministic normalization only; no transport or repository logic.
 * module · mdm · counterparties · policy
 * Upstream: none. Downstream: counterparty.service, tests.
 * Side effects: none.
 * Coupling: keeps MDM write behavior stable across API callers and future persistence backends.
 * stable
 * @module modules/mdm/counterparties/counterparty-normalization.policy
 * @package @afenda/api
 */
function compactWhitespace(value: string): string {
  return value.trim().replace(/\s+/gu, " ")
}

export function normalizeCounterpartyDisplayName(value: string): string {
  return compactWhitespace(value)
}

export function normalizeCounterpartyCanonicalName(value: string): string {
  return compactWhitespace(value).toUpperCase()
}

export function normalizeCounterpartyCode(input: {
  readonly code?: string
  readonly displayName: string
}): string {
  const source = input.code?.trim() || input.displayName

  const normalized = compactWhitespace(source)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/gu, "-")
    .replace(/^-+/u, "")
    .replace(/-+$/u, "")
    .slice(0, 50)

  return normalized.length > 0 ? normalized : "COUNTERPARTY"
}
