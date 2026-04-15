/**
 * Path helpers for the blocking theme script in `index.html` and React Router.
 *
 * Vite `config.base` (e.g. `/my-app/`) prefixes `location.pathname` in the browser; React Router
 * uses `basename` from `import.meta.env.BASE_URL`. Theme/density/motion must strip that prefix
 * before testing `/app/*`, or first-paint classes read the wrong localStorage branch.
 *
 * - Algorithm below is duplicated (minified) in `index.html`; keep behavior identical — covered by Vitest.
 * - `config.base` is injected at build/dev time via `injectViteBaseForThemeScript` in `vite.config.ts`.
 *
 * @see ../../../../index.html — inline script uses injected `viteBase` + same strip logic.
 */

/**
 * Strips Vite's configured public path from `pathname` so segment checks match the SPA route tree.
 */
export function pathAfterViteBase(pathname: string, base: string): string {
  const raw = base.trim()
  if (!raw || raw === "/") return pathname
  const prefix = raw.endsWith("/") ? raw.slice(0, -1) : raw
  if (prefix === "") return pathname
  if (pathname === prefix || pathname === prefix + "/") return "/"
  if (pathname.startsWith(prefix + "/")) return pathname.slice(prefix.length)
  return pathname
}

/** True when the app shell route (`/app/*`) is active — same rule as marketing vs app theme keys. */
export function isAppShellPath(pathname: string, base: string): boolean {
  return /^\/app(\/|$)/.test(pathAfterViteBase(pathname, base))
}
