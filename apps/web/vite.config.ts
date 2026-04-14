/// <reference types="vitest/config" />
import { getAfendaVitestTestOptions } from "@afenda/vitest-config/vitest/defaults"
import { DevTools } from "@vitejs/devtools"
import {
  defineConfig,
  loadEnv,
  type ConfigEnv,
  type PluginOption,
  type UserConfig,
} from "vite"
import { visualizer } from "rollup-plugin-visualizer"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import babel from "@rolldown/plugin-babel"
import legacy from "@vitejs/plugin-legacy"
import path from "path"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { config as loadDotenv } from "dotenv"

/** Directory containing `vite.config.ts` — explicit `root` avoids mis-resolution with `--configLoader native`. */
const configDir = path.dirname(fileURLToPath(import.meta.url))

// Repo-root `.env.neon` (process.cwd() candidates; safe for native + Rolldown config bundling)
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
      // Tailwind CSS v4 plugin (must be before React)
      tailwindcss(),

      // React plugin with Fast Refresh
      react({
        // JSX runtime (automatic is recommended for React 17+)
        jsxRuntime: "automatic",
        // JSX import source (can be customized for emotion, styled-components, etc.)
        // jsxImportSource: '@emotion/react', // Change this based on your needs
      }),

      // Legacy browser support (after @vitejs/plugin-react; see plugin-legacy docs)
      legacy({
        targets: ["defaults", "not IE 11"],
        additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
        renderLegacyChunks: true,
        polyfills: [
          // Add custom polyfills if needed
        ],
        modernPolyfills: [],
      }),

      // React Compiler with Babel
      babel({
        presets: [
          reactCompilerPreset({
            compilationMode: "infer", // 'infer' | 'annotation' | 'all'
            target: "19", // React 19 runtime
          }),
        ],
        // Additional Babel plugins can be added here
        plugins: [
          // Add any additional Babel plugins you need
          // ['@babel/plugin-proposal-decorators', { legacy: true }],
        ],
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
      // Minification
      minify: mode === "production" ? "esbuild" : false,
      // Target environments
      target: "esnext",
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: (id: string) => {
            if (!id.includes("node_modules")) return
            if (id.includes("react-router")) {
              return "router"
            }
            if (id.includes("@radix-ui")) {
              return "ui"
            }
            if (id.includes("core-js") || id.includes("regenerator-runtime")) {
              return "polyfills"
            }
            if (id.includes("node_modules/react-dom/")) {
              return "vendor-react-dom"
            }
            if (id.includes("node_modules/react/")) {
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
          // Chunk file naming (legacy plugin will add -legacy suffix automatically)
          chunkFileNames: "assets/js/[name]-[hash].js",
          // Entry file naming (legacy plugin will add -legacy suffix automatically)
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
