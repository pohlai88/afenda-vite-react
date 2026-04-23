/**
 * Re-exports route sub-apps. Sub-apps are mounted in `createApp()` (`app.ts`).
 *
 * @module routes/index
 */
export { authCompanionRoutes } from "./auth-companion-routes.js"
export { betterAuthRoutes } from "./better-auth-routes.js"
export { healthRoutes } from "./health.js"
export { meRoutes } from "./me.js"
export { operationsRoutes } from "./operations.js"
export { userRoutes } from "./users.js"
