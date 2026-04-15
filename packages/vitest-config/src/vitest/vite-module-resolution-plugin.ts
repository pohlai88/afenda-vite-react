import path from "node:path"
import { createRequire } from "node:module"
import { statSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { Plugin } from "vite"

export interface VitestModuleResolutionPluginOptions {
  /**
   * Resolve bare package specifiers via `require.resolve` + Vitest ESM remap. Some packages (e.g.
   * icon libraries) must stay on Vite's default resolver — set `false` for those workspaces.
   * @default true
   */
  bare?: boolean
}

/**
 * Vitest + Vite 8 (notably on Windows): extensionless TS imports, directory imports (`../i18n` →
 * `index.ts`), `*.config` stems, and (optionally) pnpm bare specifiers in `vite:import-analysis`.
 * When bare resolution is on: `vitest` → `index.cjs` is remapped to `dist/index.js`.
 */
export function vitestModuleResolutionPlugin(
  options: VitestModuleResolutionPluginOptions = {}
): Plugin {
  const resolveBare = options.bare !== false
  const tryExtensions = [
    ".ts",
    ".tsx",
    ".mts",
    ".cts",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".json",
  ] as const
  const indexNames = [
    "index.ts",
    "index.tsx",
    "index.mts",
    "index.js",
    "index.mjs",
    "index.jsx",
  ] as const

  function importerToFsPath(importer: string | undefined): string | undefined {
    if (!importer) return undefined
    if (importer.startsWith("file:")) return fileURLToPath(importer)
    return importer
  }

  return {
    name: "afenda-vitest-module-resolution",
    enforce: "pre",
    resolveId(source, importer) {
      if (source.startsWith("\0") || source.startsWith("/@")) return

      const q = source.indexOf("?")
      const pathname = q === -1 ? source : source.slice(0, q)
      const suffix = q === -1 ? "" : source.slice(q)

      const importerPath = importerToFsPath(importer)
      if (!importerPath) return

      if (resolveBare) {
        if (
          !pathname.startsWith(".") &&
          !path.isAbsolute(pathname) &&
          !pathname.startsWith("/") &&
          !pathname.startsWith("file:")
        ) {
          try {
            const req = createRequire(importerPath)
            let resolved = req.resolve(pathname)
            if (
              pathname === "vitest" &&
              resolved.endsWith(`${path.sep}index.cjs`)
            ) {
              resolved = path.join(path.dirname(resolved), "dist", "index.js")
            }
            return resolved + suffix
          } catch {
            return
          }
        }
      }

      if (!pathname.startsWith(".")) return

      const abs = path.resolve(path.dirname(importerPath), pathname)
      const ext = path.extname(abs)
      const knownSourceExt = /^\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|json)$/i

      if (ext && knownSourceExt.test(ext)) {
        try {
          if (statSync(abs).isFile()) return abs + suffix
        } catch {
          /* file missing — try NodeNext `.js` → `.ts` below */
        }
        // NodeNext tests often import `../foo.js` while sources are `foo.ts`
        if (/\.(js|mjs|cjs)$/i.test(ext)) {
          const stem = abs.slice(0, -ext.length)
          for (const e of [".ts", ".tsx", ".mts"] as const) {
            try {
              if (statSync(stem + e).isFile()) return stem + e + suffix
            } catch {
              /* try next */
            }
          }
        }
        return
      }

      for (const e of tryExtensions) {
        const file = abs + e
        try {
          if (statSync(file).isFile()) return file + suffix
        } catch {
          /* try next */
        }
      }

      try {
        if (statSync(abs).isDirectory()) {
          for (const idx of indexNames) {
            const file = path.join(abs, idx)
            try {
              if (statSync(file).isFile()) return file + suffix
            } catch {
              /* try next */
            }
          }
        }
      } catch {
        /* not a directory */
      }
    },
  }
}
