/**
 * Workspace Vitest global setup: matchers and hooks shared by apps that run Vitest.
 * Apps reference `@afenda/testing/vitest/setup` from `vite.config.ts` `test.setupFiles`
 * (see `apps/web/vite.config.ts`).
 */
import '@testing-library/jest-dom/vitest'
