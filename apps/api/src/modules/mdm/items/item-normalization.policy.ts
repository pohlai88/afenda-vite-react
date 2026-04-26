/**
 * Item normalization policy: deterministic naming and code rules for canonical MDM items.
 * module · mdm · items · policy
 * Upstream: string inputs from routes and legacy adapters. Downstream: item service.
 * Side effects: none.
 * Coupling: keeps item identity formatting consistent across direct writes and legacy imports.
 * experimental
 * @module modules/mdm/items/item-normalization.policy
 * @package @afenda/api
 */

function compactWhitespace(value: string): string {
  return value.trim().replace(/\s+/gu, " ")
}

export function normalizeItemName(value: string): string {
  return compactWhitespace(value)
}

export function normalizeItemCanonicalName(value: string): string {
  return compactWhitespace(value).toUpperCase()
}

export function normalizeItemCode(input: {
  readonly itemCode?: string
  readonly itemName: string
}): string {
  const source = input.itemCode?.trim() || input.itemName

  return compactWhitespace(source)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
}

export function normalizeItemUomCode(value: string | undefined): string {
  if (!value?.trim()) {
    return "EA"
  }

  return compactWhitespace(value).toUpperCase()
}
