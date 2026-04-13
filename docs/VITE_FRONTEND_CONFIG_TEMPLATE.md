# Vite Config Template (Scaffold)

Use this as the default `vite.config.ts` baseline for new frontend apps.

```ts
/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isServe = command === 'serve'
  const isAnalyze = mode === 'analyze'

  return {
    base: env.VITE_BASE_URL || '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      // Prefer explicit extensions in imports for startup performance-sensitive code.
      // Keep default resolution unless profiling shows a need.
    },
    server: {
      port: env.VITE_PORT ? Number(env.VITE_PORT) : 5173,
      proxy: {
        '/api': env.VITE_API_PROXY_TARGET
          ? {
              target: env.VITE_API_PROXY_TARGET,
              changeOrigin: true,
            }
          : undefined,
      },
      warmup: {
        // Warm only frequently-hit files.
        clientFiles: ['./src/main.tsx', './src/App.tsx'],
      },
    },
    build: {
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
        },
      },
      // Keep this disabled by default unless CSP policy requires.
      // assetsInlineLimit: 0,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['@afenda/vitest-config/vitest/setup'],
      include: ['src/**/__test__/**/*.{test,spec}.{ts,tsx}'],
    },
    define: {
      __DEV__: isServe,
      __ANALYZE__: isAnalyze,
    },
  }
})
```

## Bootstrap Recovery Template

Create `src/vite-preload-recovery.ts` and import it from `main.tsx`:

```ts
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    // Clear stale chunk references after deploy.
    window.location.reload()
  })
}
```

## Env Contract

Recommended files:

- `.env` for shared non-sensitive defaults
- `.env.development` for local dev defaults
- `.env.production` for production defaults
- `.env.local` and `.env.*.local` for local-only overrides (gitignored)

Rule:

- `VITE_*` is public and shipped to the browser.
- Secrets must never use `VITE_*`.

Add `vite-env.d.ts` for typed `import.meta.env`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string
  readonly VITE_PORT?: string
  readonly VITE_API_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Performance/Plugin Audit Commands

- `vite --debug plugin-transform`
- `vite --profile`
- `pnpm --filter @afenda/web build:analyze`
