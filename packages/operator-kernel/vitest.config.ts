import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    name: "@afenda/operator-kernel",
    globals: true,
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts"],
    pool: "threads",
    mockReset: true,
  },
})
