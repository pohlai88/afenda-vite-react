/**
 * Public marketing/auth home path for full-document navigation (e.g. `<a href>`) when the
 * SPA is deployed under a non-root Vite `base`. Matches `import.meta.env.BASE_URL`.
 */
export function publicSpaHomeHref(): string {
  const base = import.meta.env.BASE_URL
  if (base === "/" || base === "") return "/"
  return base.endsWith("/") ? base.slice(0, -1) || "/" : base
}
