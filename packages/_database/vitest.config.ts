import { getAfendaVitestNodeTestOptions } from "@afenda/vitest-config/vitest/defaults"
import { defineConfig } from "vitest/config"

const base = getAfendaVitestNodeTestOptions()

/**
 * Audit package coverage (Vitest 4+).
 *
 * `coverage.all` was removed upstream; use an explicit `coverage.include` glob so
 * matched sources appear in the report even when not imported by a test (see
 * Vitest migration guide). Thresholds below apply to that included set.
 */
export default defineConfig({
  test: {
    ...base,
    coverage: {
      ...base.coverage,
      reportOnFailure: true,
      include: ["src/audit/**/*.ts"],
      exclude: [
        "node_modules/**",
        "src/audit/**/__tests__/**",
        "src/audit/docs/**",
        "src/audit/schema/**",
        "src/audit/relations/**",
        "src/audit/index.ts",
        "src/audit/contracts/index.ts",
        "src/audit/read-model/index.ts",
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
