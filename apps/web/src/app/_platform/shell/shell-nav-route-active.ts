/**
 * Whether `pathname` should count as active for a shell nav `href`.
 *
 * **Today:** exact match only.
 * **Next evolution:** prefix match for feature roots, optional per-item matchers when
 * detail routes or query-preserved URLs ship (keep call sites on this helper).
 */
export function isShellNavRouteActive(pathname: string, href: string): boolean {
  return pathname === href
}
