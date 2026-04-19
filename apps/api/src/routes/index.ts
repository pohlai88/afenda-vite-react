/**
 * Re-exports route sub-apps. Sub-apps are mounted in `createApp()` (`app.ts`).
 *
 * @module routes/index
 */
export { authRoutes } from "./auth.js"
export { healthRoutes } from "./health.js"
export { userRoutes } from "./users.js"
