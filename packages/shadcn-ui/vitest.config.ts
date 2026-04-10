/// <reference types="vitest/config" />
import { defineConfig } from "vite"

import { getAfendaVitestTestOptions } from "@afenda/testing/vitest/defaults"

export default defineConfig({
  test: {
    ...getAfendaVitestTestOptions(),
    name: "@afenda/shadcn-ui",
  },
})
