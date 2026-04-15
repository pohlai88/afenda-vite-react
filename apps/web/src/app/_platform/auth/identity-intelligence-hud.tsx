import type { AuthIntelligenceSnapshot } from "./contracts/auth-domain"
import { IdentityIntelligencePanel } from "./components/panels/identity-intelligence-panel"
import { mapAuthIntelligenceToViewModel } from "./mappers/map-auth-intelligence-to-view-model"

type IdentityIntelligenceHudProps = {
  readonly snapshot: AuthIntelligenceSnapshot
  readonly loading: boolean
  readonly errorCode?: string | null
}

export function IdentityIntelligenceHud({
  snapshot,
  loading,
  errorCode = null,
}: IdentityIntelligenceHudProps) {
  const resource = mapAuthIntelligenceToViewModel(snapshot, {
    isLoading: loading,
    errorCode,
  })
  return <IdentityIntelligencePanel resource={resource} />
}
