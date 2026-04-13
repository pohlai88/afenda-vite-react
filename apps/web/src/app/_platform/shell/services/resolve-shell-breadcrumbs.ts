/**
 * SHELL BREADCRUMB RESOLVER
 *
 * Pure resolution logic for app-shell breadcrumbs.
 * This module converts breadcrumb descriptors into render-ready items and owns
 * the structural breadcrumb rules so they do not drift into JSX.
 *
 * Rules:
 * - empty input resolves to an empty list
 * - the final segment is always the current page
 * - only non-terminal segments with a valid target may become links
 * - a segment targeting the current pathname must not resolve as a link
 * - path comparisons use normalized values
 */

import type {
  ResolveShellBreadcrumbsOptions,
  ShellBreadcrumbResolvedItem,
} from "../contract/shell-breadcrumb-contract"

/** Normalize paths so descriptor `to` values match `useLocation().pathname` comparisons. */
export function normalizeShellBreadcrumbPath(
  path: string | undefined
): string | undefined {
  if (typeof path !== "string") {
    return undefined
  }

  const trimmed = path.trim()

  if (trimmed.length === 0) {
    return undefined
  }

  if (trimmed.length > 1) {
    return trimmed.replace(/\/+$/, "")
  }

  return trimmed
}

function shouldResolveAsLink(
  isCurrentPage: boolean,
  targetPath: string | undefined,
  currentPath: string
): boolean {
  if (isCurrentPage) {
    return false
  }

  if (typeof targetPath !== "string" || targetPath.length === 0) {
    return false
  }

  if (targetPath === currentPath) {
    return false
  }

  return true
}

export function resolveShellBreadcrumbs(
  options: ResolveShellBreadcrumbsOptions
): ShellBreadcrumbResolvedItem[] {
  const currentPath = normalizeShellBreadcrumbPath(options.pathname) ?? "/"

  if (options.segments.length === 0) {
    return []
  }

  return options.segments.map((segment, index) => {
    const isCurrentPage = index === options.segments.length - 1
    const normalizedTarget = normalizeShellBreadcrumbPath(segment.to)
    const kind = shouldResolveAsLink(
      isCurrentPage,
      normalizedTarget,
      currentPath
    )
      ? "link"
      : "page"

    return {
      id: segment.id,
      labelKey: segment.labelKey,
      label: options.translate(segment.labelKey),
      to: normalizedTarget,
      kind,
      isCurrentPage,
    }
  })
}
