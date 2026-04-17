import { defineConfig } from "vitest/config"

/**
 * Self-contained Vitest config (no `@afenda/vitest-config` import) so Node/Vitest
 * does not load workspace `.ts` packages via bare ESM on Windows.
 *
 * Audit package coverage (Vitest 4+): explicit `coverage.include` for audit sources.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/**/__test__/**/*.{test,spec}.{ts,tsx}",
      "**/__tests__/**/*.{test,spec}.{ts,tsx}",
    ],
    setupFiles: [],
    pool: "threads",
    mockReset: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportOnFailure: true,
      include: ["src/audit/**/*.ts"],
      exclude: [
        "node_modules/**",
        "src/audit/**/__tests__/**",
        "src/audit/docs/**",
        "src/schema/governance/**",
        "src/audit/relations/**",
        "src/audit/index.ts",
        "src/audit/contracts/index.ts",
        "src/audit/read-model/**",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 95,
        statements: 95,
        functions: 95,
        branches: 90,
      },
    },
  },
})
