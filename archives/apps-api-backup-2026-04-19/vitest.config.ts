import { getAfendaVitestNodeTestOptions } from "@afenda/vitest-config/vitest/defaults"
import { vitestModuleResolutionPlugin } from "@afenda/vitest-config/vitest/vite-module-resolution-plugin"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [vitestModuleResolutionPlugin()],
  test: getAfendaVitestNodeTestOptions(),
})
