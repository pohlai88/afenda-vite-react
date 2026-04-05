/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

import { getAfendaVitestTestOptions } from './src/vitest/defaults'

export default defineConfig({
  test: {
    ...getAfendaVitestTestOptions({ environment: 'node', setupFiles: [] }),
    name: '@afenda/testing',
  },
})
