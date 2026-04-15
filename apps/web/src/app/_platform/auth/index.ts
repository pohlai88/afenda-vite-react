import { authClient } from "./auth-client"

export { MarketingAuthShell } from "./marketing-auth-shell"

export { authClient }
export {
  authAppCallbackUrl,
  authPasswordResetRedirectUrl,
} from "./auth-redirect-urls"

/** Same reactive session hook as `authClient.useSession` — stable export for route guards and chrome. */
export const useAfendaSession = authClient.useSession
