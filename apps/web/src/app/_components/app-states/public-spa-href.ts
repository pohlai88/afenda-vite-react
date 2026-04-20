/**
 * Public marketing/auth home path for full-document navigation (e.g. `<a href>`)
 * when the SPA is deployed under a non-root Vite `base`.
 *
 * Guarantees:
 * - Always returns "/" OR "/segment[/segment]" (no trailing slash except root).
 * - Never returns an empty string.
 * - Falls back to "/" for unexpected protocol or protocol-relative values.
 */
export function normalizePublicSpaBasePath(
  rawBase: string | null | undefined
): string {
  const trimmedBase = rawBase?.trim() ?? ""

  if (trimmedBase === "" || trimmedBase === "/") {
    return "/"
  }

  if (
    trimmedBase.startsWith("//") ||
    /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedBase)
  ) {
    return "/"
  }

  const segments = trimmedBase.split("/").filter(Boolean)

  if (segments.length === 0) {
    return "/"
  }

  return `/${segments.join("/")}`
}

export function publicSpaHomeHref(): string {
  return normalizePublicSpaBasePath(import.meta.env.BASE_URL)
}
