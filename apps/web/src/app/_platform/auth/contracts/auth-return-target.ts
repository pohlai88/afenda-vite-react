export interface AuthReturnTarget {
  readonly pathname: string
  readonly search: string
  readonly hash: string
}

function normalizeSearch(search: string): string {
  if (search.length === 0) {
    return ""
  }
  return search.startsWith("?") ? search : `?${search}`
}

function normalizeHash(hash: string): string {
  if (hash.length === 0) {
    return ""
  }
  return hash.startsWith("#") ? hash : `#${hash}`
}

function isSafePathname(pathname: string): boolean {
  return pathname.startsWith("/") && !pathname.startsWith("//")
}

export function createAuthReturnTarget(
  pathname: string,
  search = "",
  hash = ""
): AuthReturnTarget {
  const safePathname = isSafePathname(pathname) ? pathname : "/app"

  return {
    pathname: safePathname,
    search: normalizeSearch(search),
    hash: normalizeHash(hash),
  }
}

function parseLegacyFromCombinedString(from: string): AuthReturnTarget | null {
  const t = from.trim()
  if (!t.startsWith("/") || t.startsWith("//")) {
    return null
  }
  try {
    const u = new URL(t, "http://local.invalid")
    return createAuthReturnTarget(u.pathname, u.search, u.hash)
  } catch {
    return null
  }
}

function structuredFromObject(from: unknown): AuthReturnTarget | null {
  if (!from || typeof from !== "object" || !("pathname" in from)) {
    return null
  }
  const o = from as Record<string, unknown>
  const pathname = typeof o.pathname === "string" ? o.pathname.trim() : ""
  const search = typeof o.search === "string" ? o.search.trim() : ""
  const hash = typeof o.hash === "string" ? o.hash.trim() : ""
  if (!isSafePathname(pathname)) {
    return null
  }
  return createAuthReturnTarget(pathname, search, hash)
}

/**
 * Accepts:
 * - new shape: { returnTarget: { pathname, search, hash } }
 * - legacy shape: { from: "/app/..." } or { from: { pathname, search, hash } }
 * - unknown input → fallback
 */
export function normalizeAuthReturnTarget(
  value: unknown,
  fallbackPath = "/app"
): AuthReturnTarget {
  if (value && typeof value === "object") {
    if ("returnTarget" in value) {
      const candidate = (value as { returnTarget?: unknown }).returnTarget
      if (candidate && typeof candidate === "object") {
        const pathname =
          typeof (candidate as { pathname?: unknown }).pathname === "string"
            ? (candidate as { pathname: string }).pathname.trim()
            : ""
        const search =
          typeof (candidate as { search?: unknown }).search === "string"
            ? (candidate as { search: string }).search.trim()
            : ""
        const hash =
          typeof (candidate as { hash?: unknown }).hash === "string"
            ? (candidate as { hash: string }).hash.trim()
            : ""

        if (isSafePathname(pathname)) {
          return createAuthReturnTarget(pathname, search, hash)
        }
      }
    }

    if ("from" in value) {
      const from = (value as { from?: unknown }).from
      const structured = structuredFromObject(from)
      if (structured) {
        return structured
      }
      if (typeof from === "string") {
        const trimmed = from.trim()
        const combined = parseLegacyFromCombinedString(trimmed)
        if (combined) {
          return combined
        }
        if (isSafePathname(trimmed)) {
          return createAuthReturnTarget(trimmed)
        }
      }
    }
  }

  return createAuthReturnTarget(fallbackPath)
}

export function authReturnTargetToPath(target: AuthReturnTarget): string {
  return `${target.pathname}${target.search}${target.hash}`
}

/** Parses an in-app path string (e.g. from {@link authPostLoginPath}) into a structured target. */
export function authReturnTargetFromPath(path: string): AuthReturnTarget {
  try {
    const u = new URL(path, "http://local.invalid")
    return createAuthReturnTarget(u.pathname, u.search, u.hash)
  } catch {
    return createAuthReturnTarget("/app")
  }
}

/** Maps React Router `location` to a normalized return target. */
export function authReturnTargetFromLocation(location: {
  readonly pathname: string
  readonly search: string
  readonly hash: string
}): AuthReturnTarget {
  return createAuthReturnTarget(
    location.pathname,
    location.search,
    location.hash
  )
}

/**
 * Resolves the in-app path string for post-login navigation.
 * Delegates to {@link normalizeAuthReturnTarget}.
 */
export function resolveAuthPostLoginDestination(
  state: unknown,
  fallbackPath: string
): string {
  return authReturnTargetToPath(normalizeAuthReturnTarget(state, fallbackPath))
}

/** @deprecated Use {@link resolveAuthPostLoginDestination} */
export function resolveAuthReturnPath(
  state: unknown,
  fallbackPath: string
): string {
  return resolveAuthPostLoginDestination(state, fallbackPath)
}

/** @deprecated Use {@link authReturnTargetToPath} */
export function serializeAuthReturnTarget(target: AuthReturnTarget): string {
  return authReturnTargetToPath(target)
}
