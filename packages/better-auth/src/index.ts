export { createAfendaAuth } from "./create-afenda-auth.js"
export { resolveAfendaAuthCapabilityHooks } from "./create-afenda-auth.js"
export type { AfendaAuthCapabilityHooks } from "./create-afenda-auth.js"

/** Better Auth instance from {@link createAfendaAuth} — includes `handler`, `api`, `$Infer`, … */
export type AfendaAuth = ReturnType<
  typeof import("./create-afenda-auth.js").createAfendaAuth
>
