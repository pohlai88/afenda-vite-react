/// <reference types="vitest/config" />
/**
 * Build hygiene (see also `package.json` scripts):
 * - **Rollup circular chunk warnings** — avoided by not splitting `@radix-ui` into its own chunk and by
 *   keeping `react`, `react-dom`, and `scheduler` in one `vendor-react` manual chunk.
 * - **Node `ExperimentalWarning` (WASI)** — Tailwind/Lightning CSS can load WASM; Node 22 prints a harmless
 *   warning. Scripts invoke Vite/Vitest via `node --disable-warning=ExperimentalWarning …` so CI logs stay clean.
 */
import { getAfendaVitestTestOptions } from "@afenda/vitest-config/vitest/defaults"
import { DevTools } from "@vitejs/devtools"
import {
  defineConfig,
  loadEnv,
  type ConfigEnv,
  type Plugin,
  type PluginOption,
  type UserConfig,
} from "vite"
import { visualizer } from "rollup-plugin-visualizer"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { config as loadDotenv } from "dotenv"

/** Directory containing `vite.config.ts` — explicit `root` avoids mis-resolution with `--configLoader native`. */
const configDir = path.dirname(fileURLToPath(import.meta.url))

/**
 * Injects Vite `config.base` into `index.html` so the blocking theme script strips the public path
 * before `/app/*` detection (aligned with React Router `basename`). Must match
 * `theme-inline-path.ts` semantics — see `transformIndexHtml` + `__VITE_RESOLVED_BASE_JSON__`.
 */
function injectViteBaseForThemeScript(): Plugin {
  let resolvedBase = "/"
  return {
    name: "inject-vite-base-for-theme-script",
    configResolved(config) {
      resolvedBase = config.base
    },
    transformIndexHtml(html) {
      return html.replace(
        /__VITE_RESOLVED_BASE_JSON__/g,
        JSON.stringify(resolvedBase)
      )
    },
  }
}

// Repo-root `.env.neon` (process.cwd() candidates; safe for `--configLoader native` bundling)
for (const envPath of [
  path.join(process.cwd(), ".env.neon"),
  path.join(process.cwd(), "..", ".env.neon"),
  path.join(process.cwd(), "..", "..", ".env.neon"),
]) {
  if (existsSync(envPath)) {
    loadDotenv({ path: envPath, override: false })
    break
  }
}

// https://vite.dev/config/
async function resolveUserConfig({
  command,
  mode,
}: ConfigEnv): Promise<UserConfig> {
  // Load environment variables
  const env = loadEnv(mode, configDir, "")
  const analyze = mode === "analyze"
  const devToolsPlugins =
    command === "serve" && process.env.VITEST !== "true"
      ? await DevTools({ builtinDevTools: true })
      : []

  return {
    root: configDir,

    // Base configuration
    base: env.VITE_BASE_URL || "/",

    // Environment variables + Vue feature flags (transitive via @vitejs/devtools UI).
    // See https://vuejs.org/api/compile-time-flags.html — required for vue `esm-bundler` builds.
    define: {
      __DEV__: command === "serve",
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
    },

    // Tailwind v4 ships its own CSS pipeline (Lightning CSS / Oxide internals).
    // Do not add lightningcss, magic-string, or source-map-js as app deps—Vite +
    // @tailwindcss/vite handle integration. Dev CSS sourcemaps help trace utilities in DevTools.
    css: {
      devSourcemap: true,
    },

    // Plugin configuration
    plugins: [
      injectViteBaseForThemeScript(),
      // Tailwind CSS v4 plugin (must be before React)
      tailwindcss(),

      // React Fast Refresh + React Compiler (`babel-plugin-react-compiler` via `react({ babel })`).
      react({
        jsxRuntime: "automatic",
        babel: {
          plugins: [
            [
              "babel-plugin-react-compiler",
              {
                compilationMode: "infer",
              },
            ],
          ],
        },
      }),

      // Custom plugins can be added here
      // Example: custom plugin for environment-specific behavior
      {
        name: "custom-env-plugin",
        config() {
          return {
            // Environment-specific configuration
            define: {
              "import.meta.env.__BUILD_TIME__": JSON.stringify(
                new Date().toISOString()
              ),
            },
          }
        },
      },

      ...(analyze
        ? [
            visualizer({
              filename: path.resolve(configDir, "dist/stats.html"),
              gzipSize: true,
              brotliSize: true,
              template: "treemap",
              open: false,
            }) as PluginOption,
          ]
        : []),

      ...devToolsPlugins,
    ],

    // Path resolution — same-package imports use relative paths; workspace
    // packages use `package.json` names (`@afenda/*`). See `tsconfig.app.json`.

    // Development server configuration
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      host: env.VITE_HOST || "localhost",
      open: env.VITE_OPEN_BROWSER === "true",
      warmup: {
        clientFiles: ["./src/main.tsx", "./src/App.tsx", "./src/index.css"],
      },
      cors: true,
      // Proxy configuration for API calls
      proxy: {
        // Better Auth and other `/api/*` routes (except `/api/v1`) forward as-is — Hono serves `/api/auth/*` on the API host.
        "/api/v1": {
          target: env.VITE_API_URL || "http://localhost:3001",
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      },
      // HMR configuration
      hmr: {
        port: parseInt(env.VITE_HMR_PORT) || 24678,
      },
    },

    // Preview server configuration (for production preview)
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT) || 4173,
      host: env.VITE_PREVIEW_HOST || "localhost",
    },

    // Build configuration
    build: {
      // Output directory
      outDir: "dist",
      // Asset directory
      assetsDir: "assets",
      // Source maps
      sourcemap: mode === "development",
      minify: mode === "production" ? "esbuild" : false,
      // Target environments
      target: "esnext",
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunks: keep splits that rarely change together (router, polyfills, React core).
          // Do not isolate @radix-ui into its own chunk — it shares edges with react/react-dom and
          // the catch-all vendor bucket, which produced Rollup "Circular chunk" warnings.
          // Merge react + react-dom + scheduler into one chunk to avoid react <-> react-dom cycles.
          manualChunks: (id: string) => {
            if (!id.includes("node_modules")) return
            if (id.includes("react-router")) {
              return "router"
            }
            if (id.includes("core-js") || id.includes("regenerator-runtime")) {
              return "polyfills"
            }
            if (
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react/") ||
              id.includes("node_modules/scheduler")
            ) {
              return "vendor-react"
            }
            return "vendor"
          },
          // Asset file naming
          assetFileNames: (assetInfo: { name?: string | null }) => {
            if (
              /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name ?? "")
            ) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name ?? "")) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
        },
      },
      // CSS code splitting
      cssCodeSplit: true,
      // CSS minification
      cssMinify: mode === "production",

      // Rolldown DevTools data: enable only for `vite build --mode analyze` so
      // default production keeps `rollupOptions.output` manual chunking intact.
      ...(analyze
        ? {
            rolldownOptions: {
              devtools: {},
            },
          }
        : {}),
    },

    // Dependency optimization
    optimizeDeps: {
      // Include dependencies that should be pre-bundled
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "zustand",
        "react-hook-form",
        "zod",
        "date-fns",
        "i18next",
        "react-i18next",
        "i18next-browser-languagedetector",
        // Add other large dependencies here
      ],
      // Exclude dependencies from pre-bundling
      exclude: [
        // Dependencies that should not be pre-bundled
        // 'some-large-library',
      ],
      // Force include dependencies
      force: command === "build",
    },

    // Environment variables
    envPrefix: "VITE_",

    // Worker configuration
    worker: {
      format: "es",
      plugins: () => [
        // Worker-specific plugins
      ],
    },

    // Experimental features (Vite 8)
    experimental: {
      // Enable HMR partial accept
      hmrPartialAccept: true,
    },

    // Vitest — shared defaults from @afenda/vitest-config (see packages/vitest-config/src/vitest/defaults.ts)
    test: getAfendaVitestTestOptions(),
  }
}

export default defineConfig(
  resolveUserConfig as (env: ConfigEnv) => UserConfig | Promise<UserConfig>
)
