import type { GlobalSearchResult } from '@/share/components/providers/global-search-provider.types'

import type { TopNavItem } from '../navigation'

/** Result `type` key for nav-backed global search hits. */
export const GLOBAL_SEARCH_NAV_TYPE = 'navigation' as const

/**
 * Lightweight token match over permitted nav items (labels + paths). Not a full fuzzy engine;
 * swap `fetchResults` in `GlobalSearchBar` for server-side or Fuse-backed search when available.
 */
export function buildNavGlobalSearchResults(
  items: readonly TopNavItem[],
  query: string,
  limit = 8,
): GlobalSearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const tokens = q.split(/\s+/).filter(Boolean)
  const scored: { item: TopNavItem; score: number }[] = []

  for (const item of items) {
    const labelLower = item.label.toLowerCase()
    const hay = `${item.label} ${item.to}`.toLowerCase()
    let score = 0
    for (const tok of tokens) {
      if (labelLower.startsWith(tok)) score += 4
      else if (labelLower.includes(tok)) score += 2
      else if (hay.includes(tok)) score += 1
    }
    if (score > 0) scored.push({ item, score })
  }

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ item }) => ({
    id: `nav:${item.to}`,
    type: GLOBAL_SEARCH_NAV_TYPE,
    title: item.label,
    subtitle: item.to,
    url: item.to,
  }))
}
