import type { AuthIntelligenceSnapshot } from "../contracts/auth-domain"
import type { AuthIntelligenceResource } from "../contracts/auth-view-model"

import { mapAuthIntelligenceToViewModel } from "./map-auth-intelligence-to-view-model"

/**
 * Maps hook-shaped intelligence state to {@link AuthIntelligenceResource}
 * (same shape as login’s `intelligenceResource` on the flow controller).
 */
export function mapAuthIntelligenceResource(input: {
  readonly data: AuthIntelligenceSnapshot
  readonly isLoading: boolean
  readonly errorCode: string | null
}): AuthIntelligenceResource {
  return mapAuthIntelligenceToViewModel(input.data, {
    isLoading: input.isLoading,
    errorCode: input.errorCode,
  })
}
