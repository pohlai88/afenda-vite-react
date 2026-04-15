/// <reference types="vitest/config" />
import { defineConfig } from "vite"

import { getAfendaVitestTestOptions } from "@afenda/vitest-config/vitest/defaults"
import { vitestModuleResolutionPlugin } from "@afenda/vitest-config/vitest/vite-module-resolution-plugin"

export default defineConfig({
  plugins: [vitestModuleResolutionPlugin()],
  test: {
    ...getAfendaVitestTestOptions({ environment: "node", setupFiles: [] }),
    name: "@afenda/vitest-config",
  },
})
