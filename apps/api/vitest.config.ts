import { getAfendaVitestNodeTestOptions } from "@afenda/vitest-config/vitest/defaults"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: getAfendaVitestNodeTestOptions(),
})
