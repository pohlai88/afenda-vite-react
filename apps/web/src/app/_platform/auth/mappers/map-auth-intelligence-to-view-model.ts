import { getAfendaAuthStepUpPolicy } from "../auth-client"
import type { AuthIntelligenceSnapshot } from "../contracts/auth-domain"
import type { AuthIntelligenceResource } from "../contracts/auth-view-model"

export const fallbackAuthIntelligenceSnapshot: AuthIntelligenceSnapshot = {
  trustLevel: "medium",
  score: 72,
  deviceLabel: "Unknown browser",
  regionLabel: "Unverified region",
  lastSeenLabel: "No previous trusted session",
  reasons: [
    {
      code: "auth.risk.new_device",
      label: "New device detected for this account.",
      severity: "warning",
    },
  ],
  passkeyAvailable: false,
  recommendedMethod: "password",
  stepUpPolicy: getAfendaAuthStepUpPolicy(),
}

export function createUnavailableAuthIntelligenceSnapshot(): AuthIntelligenceSnapshot {
  return fallbackAuthIntelligenceSnapshot
}

export function mapAuthIntelligenceToViewModel(
  snapshot: AuthIntelligenceSnapshot,
  options: { readonly isLoading: boolean; readonly errorCode: string | null }
): AuthIntelligenceResource {
  if (options.isLoading) {
    return { status: "loading", snapshot, code: null }
  }
  if (options.errorCode) {
    return { status: "unavailable", snapshot, code: options.errorCode }
  }
  return { status: "available", snapshot, code: null }
}
