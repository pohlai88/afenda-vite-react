import { defineConfig } from "vitest/config"

/**
 * Self-contained Vitest config (no `@afenda/vitest-import` from workspace) for Windows ESM.
 *
 * Coverage policy:
 * - **100% thresholds** apply to **executable 7W1H audit code** (contracts + services + boundary),
 *   not to `audit-logs.schema.ts` / `audit-enums.schema.ts` (pure Drizzle DDL — excluded).
 * - Full-package line coverage including every `*.schema.ts` table module is not a useful gate:
 *   those files are declarative; covering them adds little beyond import smoke (`package-modules.smoke.test.ts`).
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
      include: ["src/7w1h-audit/**/*.ts"],
      exclude: [
        "node_modules/**",
        "src/7w1h-audit/**/__tests__/**",
        "src/7w1h-audit/audit-logs.schema.ts",
        "src/7w1h-audit/audit-enums.schema.ts",
        "**/*.d.ts",
      ],
      thresholds: {
        lines: 100,
        statements: 100,
        functions: 100,
        /** Optional filter combinations in `queryAuditLogs` make 100% branch coverage noisy. */
        branches: 90,
      },
    },
  },
})
