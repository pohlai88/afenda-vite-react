import type { AuthIntelligenceSnapshot } from "./auth-domain"

/**
 * View-shaped auth intelligence for hooks (loading / available / unavailable).
 */
export type AuthIntelligenceResource =
  | {
      readonly status: "loading"
      readonly snapshot: AuthIntelligenceSnapshot
      readonly code: null
    }
  | {
      readonly status: "available"
      readonly snapshot: AuthIntelligenceSnapshot
      readonly code: null
    }
  | {
      readonly status: "unavailable"
      readonly snapshot: AuthIntelligenceSnapshot
      readonly code: string | null
    }
