/**
 * Deep merge for plain objects (legacy Supabase theme overrides).
 * Matches the historical `mergeDeep` behavior: mutates `target`.
 */
export function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item) && typeof item === "object" && !Array.isArray(item)
}

export function mergeDeep(
  target: Record<string, unknown>,
  ...sources: unknown[]
): Record<string, unknown> {
  if (sources.length === 0) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key of Object.keys(source)) {
      const value = source[key]
      if (isObject(value)) {
        if (!isObject(target[key])) {
          Object.assign(target, { [key]: {} })
        }
        mergeDeep(target[key] as Record<string, unknown>, value)
      } else {
        Object.assign(target, { [key]: value })
      }
    }
  }

  return mergeDeep(target, ...sources)
}
