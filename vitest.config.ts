import { defineConfig } from "vitest/config"

function project(name: string, extendsPath: string, groupOrder: number) {
  return {
    extends: extendsPath,
    test: {
      name,
      sequence: {
        groupOrder,
      },
    },
  }
}

export default defineConfig({
  test: {
    projects: [
      project("@afenda/web", "./apps/web/vite.config.ts", 0),
      project("@afenda/api", "./apps/api/vitest.config.ts", 1),
      project("@afenda/database", "./packages/_database/vitest.config.ts", 2),
      project(
        "@afenda/better-auth",
        "./packages/better-auth/vitest.config.ts",
        3
      ),
      project(
        "@afenda/design-system",
        "./packages/design-system/vitest.config.ts",
        4
      ),
      project("@afenda/events", "./packages/events/vitest.config.ts", 5),
      project(
        "@afenda/features-sdk",
        "./packages/features-sdk/vitest.config.ts",
        6
      ),
      project(
        "@afenda/pino-logger",
        "./packages/pino-logger/vitest.config.ts",
        7
      ),
      project(
        "@afenda/vitest-config",
        "./packages/vitest-config/vitest.config.ts",
        8
      ),
    ],
  },
})
