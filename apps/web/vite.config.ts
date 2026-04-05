/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // Base configuration
    base: env.VITE_BASE_URL || '/',

    // Environment variables
    define: {
      __DEV__: command === 'serve',
    },

    // Plugin configuration
    plugins: [
      // React plugin with Fast Refresh
      react({
        // JSX runtime (automatic is recommended for React 17+)
        jsxRuntime: 'automatic',
        // JSX import source (can be customized for emotion, styled-components, etc.)
        // jsxImportSource: '@emotion/react', // Change this based on your needs
      }),

      // Legacy browser support (must be before other plugins)
      legacy({
        targets: ['defaults', 'not IE 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
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
            compilationMode: 'infer', // 'infer' | 'annotation' | 'all'
            target: '19', // React 19 runtime
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
        name: 'custom-env-plugin',
        config() {
          return {
            // Environment-specific configuration
            define: {
              'import.meta.env.__BUILD_TIME__': JSON.stringify(
                new Date().toISOString(),
              ),
            },
          }
        },
      },
    ],

    // Path resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '~': path.resolve(__dirname, './src'),
        // Add more aliases as needed
        components: path.resolve(__dirname, './src/components'),
        utils: path.resolve(__dirname, './src/utils'),
        hooks: path.resolve(__dirname, './src/hooks'),
        types: path.resolve(__dirname, './src/types'),
      },
    },

    // Development server configuration
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      host: env.VITE_HOST || 'localhost',
      open: env.VITE_OPEN_BROWSER === 'true',
      cors: true,
      // Proxy configuration for API calls
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
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
      host: env.VITE_PREVIEW_HOST || 'localhost',
    },

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      // Asset directory
      assetsDir: 'assets',
      // Source maps
      sourcemap: mode === 'development',
      // Minification
      minify: mode === 'production' ? 'esbuild' : false,
      // Target environments
      target: 'esnext',
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor'
              }
              if (id.includes('react-router')) {
                return 'router'
              }
              if (id.includes('@radix-ui')) {
                return 'ui'
              }
              // Legacy polyfills chunk
              if (
                id.includes('core-js') ||
                id.includes('regenerator-runtime')
              ) {
                return 'polyfills'
              }
              return 'vendor'
            }
          },
          // Asset file naming
          assetFileNames: (assetInfo) => {
            if (
              /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name ?? '')
            ) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name ?? '')) {
              return `assets/fonts/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          },
          // Chunk file naming (legacy plugin will add -legacy suffix automatically)
          chunkFileNames: 'assets/js/[name]-[hash].js',
          // Entry file naming (legacy plugin will add -legacy suffix automatically)
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      // CSS code splitting
      cssCodeSplit: true,
      // CSS minification
      cssMinify: mode === 'production',
    },

    // CSS configuration
    css: {
      // CSS modules
      modules: {
        localsConvention: 'camelCase',
      },
      // PostCSS configuration
      postcss: './postcss.config.js',
      // CSS preprocessor options
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/variables.scss";',
        },
        less: {
          modifyVars: {
            'primary-color': '#1890ff',
          },
        },
      },
    },

    // Dependency optimization
    optimizeDeps: {
      // Include dependencies that should be pre-bundled
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'zustand',
        'react-hook-form',
        'zod',
        'date-fns',
        // Add other large dependencies here
      ],
      // Exclude dependencies from pre-bundling
      exclude: [
        // Dependencies that should not be pre-bundled
        // 'some-large-library',
      ],
      // Force include dependencies
      force: command === 'build',
    },

    // Environment variables
    envPrefix: 'VITE_',

    // Worker configuration
    worker: {
      format: 'es',
      plugins: () => [
        // Worker-specific plugins
      ],
    },

    // Experimental features (Vite 8)
    experimental: {
      // Enable HMR partial accept
      hmrPartialAccept: true,
    },

    // Vitest (https://vitest.dev/guide/#configuring-vitest)
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['@afenda/testing/vitest/setup'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary', 'html'],
        exclude: [
          'node_modules/**',
          '**/*.d.ts',
          '**/*.{config,css}.{js,ts}',
          'dist/**',
        ],
      },
    },
  }
})
