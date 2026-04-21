export type SetupState =
  | "auth"
  | "workspace_required"
  | "profile_recommended"
  | "ready"

export interface AuthSetupSnapshot {
  readonly isAuthenticated: boolean
  readonly hasActiveOrganization: boolean
  readonly user:
    | {
        readonly name?: string | null
        readonly username?: string | null
        readonly displayUsername?: string | null
      }
    | null
    | undefined
}

export interface ResolveSetupStateOptions {
  readonly requireUsername?: boolean
  readonly useDisplayUsername?: boolean
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0
}

export function isProfileRecommended(
  snapshot: AuthSetupSnapshot,
  options: ResolveSetupStateOptions = {}
): boolean {
  const { user } = snapshot

  if (!user) {
    return false
  }

  if (!hasText(user.name)) {
    return true
  }

  if (!options.requireUsername) {
    return false
  }

  const username = options.useDisplayUsername
    ? user.displayUsername
    : user.username

  return !hasText(username)
}

export function resolveSetupState(
  snapshot: AuthSetupSnapshot,
  options: ResolveSetupStateOptions = {}
): SetupState {
  if (!snapshot.isAuthenticated) {
    return "auth"
  }

  if (!snapshot.hasActiveOrganization) {
    return "workspace_required"
  }

  if (isProfileRecommended(snapshot, options)) {
    return "profile_recommended"
  }

  return "ready"
}
