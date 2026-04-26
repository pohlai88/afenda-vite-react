import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    name: "@afenda/features-sdk",
    globals: true,
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
    pool: "threads",
    testTimeout: 30_000,
    mockReset: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: ".artifacts/vitest/coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts"],
    },
  },
})
