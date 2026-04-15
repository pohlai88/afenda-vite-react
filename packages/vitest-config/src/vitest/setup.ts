import path from "node:path"
import { createRequire } from "node:module"
import { pathToFileURL } from "node:url"

/**
 * Vite 8 `vite:import-analysis` does not resolve `@testing-library/jest-dom/vitest` when this file
 * lives outside the app `root`. Load the ESM entry explicitly: `require.resolve` for the subpath
 * targets `dist/vitest.js` (CJS), which breaks Vitest; `dist/vitest.mjs` is the correct module.
 */
const requireFromSetup = createRequire(import.meta.url)
const jestDomRoot = path.dirname(
  requireFromSetup.resolve("@testing-library/jest-dom/package.json")
)
await import(pathToFileURL(path.join(jestDomRoot, "dist/vitest.mjs")).href)
