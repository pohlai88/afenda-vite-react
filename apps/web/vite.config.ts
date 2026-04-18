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
import { fileURLToPath } from "node:url"

/** Directory containing `vite.config.ts` — explicit `root` avoids mis-resolution when the config path differs from cwd. */
const configDir = path.dirname(fileURLToPath(import.meta.url))

/** Monorepo root — single `.env` / `.env.*` source for Vite + Vitest (`envDir`). */
const repoRoot = path.resolve(configDir, "..", "..")

/**
 * `BETTER_AUTH_API_KEY` is server-only (no `VITE_` prefix). When it is set in repo-root `.env`,
 * enable the Infra client plugin unless `VITE_BETTER_AUTH_INFRA=false` explicitly opts out.
 */
function resolveBetterAuthInfraClientFlag(
  env: Record<string, string>
): "true" | "false" {
  const explicit = env.VITE_BETTER_AUTH_INFRA
  if (explicit === "false") return "false"
  if (explicit === "true") return "true"
  return env.BETTER_AUTH_API_KEY?.trim() ? "true" : "false"
}

/** Default on unless `AFENDA_AUTH_ALL_PLUGINS` / `VITE_AFENDA_AUTH_ALL_PLUGINS` is `"false"`. */
function resolveAfendaAuthAllPluginsFlag(env: Record<string, string>): boolean {
  const v =
    env.VITE_AFENDA_AUTH_ALL_PLUGINS?.trim() ??
    env.AFENDA_AUTH_ALL_PLUGINS?.trim()
  return v !== "false"
}

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

// https://vite.dev/config/
async function resolveUserConfig({
  command,
  mode,
}: ConfigEnv): Promise<UserConfig> {
  // Load environment variables (same directory as `envDir` — Vite env + mode files)
  const env = loadEnv(mode, repoRoot, "")
  const analyze = mode === "analyze"
  const devToolsPlugins =
    command === "serve" &&
    process.env.VITEST !== "true" &&
    process.env.E2E !== "true"
      ? await DevTools({ builtinDevTools: true })
      : []

  return {
    root: configDir,
    /** Keep all `.env` / `.env.[mode]` / `*.local` files at repo root — one place to edit. */
    envDir: repoRoot,

    // Base configuration
    base: env.VITE_BASE_URL || "/",

    // Environment variables + Vue feature flags (transitive via @vitejs/devtools UI).
    // See https://vuejs.org/api/compile-time-flags.html — required for vue `esm-bundler` builds.
    define: {
      __DEV__: command === "serve",
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      "import.meta.env.VITE_BETTER_AUTH_INFRA": JSON.stringify(
        resolveBetterAuthInfraClientFlag(env)
      ),
      /** Mirrors `AFENDA_AUTH_ALL_PLUGINS` — when `true`, load full Better Auth client plugin stack. */
      "import.meta.env.VITE_AFENDA_AUTH_ALL_PLUGINS": JSON.stringify(
        resolveAfendaAuthAllPluginsFlag(env) ? "true" : "false"
      ),
      /** Mirrors server `AFENDA_AUTH_STEP_UP_POLICY` when `VITE_*` override omitted. */
      "import.meta.env.VITE_AFENDA_AUTH_STEP_UP_POLICY": JSON.stringify(
        env.VITE_AFENDA_AUTH_STEP_UP_POLICY?.trim() ||
          env.AFENDA_AUTH_STEP_UP_POLICY?.trim() ||
          "off"
      ),
      /** Mirrors server `AFENDA_AUTH_REQUIRE_EMAIL_VERIFICATION` (strict sign-in / register UX). */
      "import.meta.env.VITE_AFENDA_AUTH_REQUIRE_EMAIL_VERIFICATION":
        JSON.stringify(
          env.VITE_AFENDA_AUTH_REQUIRE_EMAIL_VERIFICATION?.trim() === "true" ||
            env.AFENDA_AUTH_REQUIRE_EMAIL_VERIFICATION?.trim() === "true"
            ? "true"
            : "false"
        ),
      /** Pair with `AFENDA_AUTH_PASSKEY_ENABLED` — `passkeyClient` must match `createAfendaAuth` plugin. */
      "import.meta.env.VITE_AFENDA_AUTH_PASSKEY_ENABLED": JSON.stringify(
        env.VITE_AFENDA_AUTH_PASSKEY_ENABLED?.trim() === "true" ||
          env.AFENDA_AUTH_PASSKEY_ENABLED?.trim() === "true"
          ? "true"
          : "false"
      ),
      /** Pair with `AFENDA_AUTH_MFA_ENABLED` — `twoFactorClient` must match `createAfendaAuth` plugin. */
      "import.meta.env.VITE_AFENDA_AUTH_MFA_ENABLED": JSON.stringify(
        env.VITE_AFENDA_AUTH_MFA_ENABLED?.trim() === "true" ||
          env.AFENDA_AUTH_MFA_ENABLED?.trim() === "true"
          ? "true"
          : "false"
      ),
      /** Pair with `AFENDA_AUTH_MAGIC_LINK_ENABLED` — `magicLinkClient` must match `magicLink()` plugin. */
      "import.meta.env.VITE_AFENDA_AUTH_MAGIC_LINK_ENABLED": JSON.stringify(
        env.VITE_AFENDA_AUTH_MAGIC_LINK_ENABLED?.trim() === "true" ||
          env.AFENDA_AUTH_MAGIC_LINK_ENABLED?.trim() === "true"
          ? "true"
          : "false"
      ),
      /** Pair with `AFENDA_AUTH_AGENT_AUTH_ENABLED` — `agentAuthClient` must match `agentAuth()`. */
      "import.meta.env.VITE_AFENDA_AUTH_AGENT_AUTH_ENABLED": JSON.stringify(
        env.VITE_AFENDA_AUTH_AGENT_AUTH_ENABLED?.trim() === "true" ||
          env.AFENDA_AUTH_AGENT_AUTH_ENABLED?.trim() === "true"
          ? "true"
          : "false"
      ),
      /** Kill-switch mirror — when `true`, `agentAuthClient` is omitted (matches `AFENDA_AUTH_DISABLE_AGENT_AUTH`). */
      "import.meta.env.VITE_AFENDA_AUTH_DISABLE_AGENT_AUTH": JSON.stringify(
        env.VITE_AFENDA_AUTH_DISABLE_AGENT_AUTH?.trim() === "true" ||
          env.AFENDA_AUTH_DISABLE_AGENT_AUTH?.trim() === "true"
          ? "true"
          : "false"
      ),
      /** Kill-switch mirror for OAuth device grant — matches `AFENDA_AUTH_DISABLE_DEVICE_AUTHORIZATION`. */
      "import.meta.env.VITE_AFENDA_AUTH_DISABLE_DEVICE_AUTHORIZATION":
        JSON.stringify(
          env.VITE_AFENDA_AUTH_DISABLE_DEVICE_AUTHORIZATION?.trim() ===
            "true" ||
            env.AFENDA_AUTH_DISABLE_DEVICE_AUTHORIZATION?.trim() === "true"
            ? "true"
            : "false"
        ),
      /** Pair with `AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED` — `oneTapClient` must match `oneTap()`. */
      "import.meta.env.VITE_AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED": JSON.stringify(
        env.VITE_AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED?.trim() === "true" ||
          env.AFENDA_AUTH_GOOGLE_ONE_TAP_ENABLED?.trim() === "true"
          ? "true"
          : "false"
      ),
      /** Public web client ID for GIS One Tap (often same as `GOOGLE_CLIENT_ID`). */
      "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(
        env.VITE_GOOGLE_CLIENT_ID?.trim() || env.GOOGLE_CLIENT_ID?.trim() || ""
      ),
      /** Workspace demo / governed API — same UUID as server `DEMO_TENANT_ID` (turbo passes through). */
      "import.meta.env.VITE_DEMO_TENANT_ID": JSON.stringify(
        env.VITE_DEMO_TENANT_ID?.trim() || env.DEMO_TENANT_ID?.trim() || ""
      ),
      /** Local dev: prefill login email from `AFENDA_DEV_LOGIN_*` — never embed passwords in the bundle. */
      "import.meta.env.VITE_AFENDA_DEV_LOGIN_ENABLED": JSON.stringify(
        env.VITE_AFENDA_DEV_LOGIN_ENABLED === "true" ||
          env.AFENDA_DEV_LOGIN_ENABLED === "true"
          ? "true"
          : "false"
      ),
      "import.meta.env.VITE_DEV_LOGIN_EMAIL": JSON.stringify(
        env.VITE_DEV_LOGIN_EMAIL?.trim() ||
          env.AFENDA_DEV_LOGIN_EMAIL?.trim() ||
          ""
      ),
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

    resolve: {
      alias: {
        "@": path.join(configDir, "src"),
      },
    },

    // Path resolution — `@/*` maps to `src/*` (see `tsconfig.app.json`); workspace
    // packages use `package.json` names (`@afenda/*`).

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
        // Agent Auth discovery document (Better Auth plugin) — same origin as SPA in dev.
        "/.well-known/agent-configuration": {
          target: env.VITE_API_URL || "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
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

    // Vitest — extend shared defaults with apps/web setup (jest-dom + RTL cleanup + browser shims)
    test: {
      ...(() => {
        const base = getAfendaVitestTestOptions()
        // Default `threads` pool can time out spawning workers on some Windows setups; forks is more stable.
        if (!process.env.VITEST_POOL && process.platform === "win32") {
          return { ...base, pool: "forks" as const }
        }
        return base
      })(),
      environment: "jsdom",
      setupFiles: [path.join(configDir, "vitest.setup.ts")],
      globals: true,
      css: true,
      /** Heavy RTL suites + Windows CI can exceed Vitest’s 5s default under parallel load. */
      testTimeout: 15_000,
    },
  }
}

export default defineConfig(
  resolveUserConfig as (env: ConfigEnv) => UserConfig | Promise<UserConfig>
)
