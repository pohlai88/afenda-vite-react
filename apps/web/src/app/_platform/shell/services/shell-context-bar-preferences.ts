export const shellContextBarPreferencesStorageKey = "afenda.shell.contextBar.v1"

export const shellContextBarPreferencesSchemaVersion = 1 as const

interface ShellContextBarPreferencesPayload {
  version: number
  hiddenActionIds?: unknown
}

/**
 * Keeps only ids that still exist in current action catalog.
 */
export function normalizeHiddenContextBarActionIds(
  hiddenActionIds: readonly string[],
  availableActionIds: readonly string[]
): string[] {
  const available = new Set(availableActionIds)
  return hiddenActionIds.filter((id) => available.has(id))
}

/**
 * Parses stored payloads and tolerates schema drift by recovering known fields.
 */
export function parseShellContextBarPreferences(
  raw: string | null,
  availableActionIds: readonly string[]
): string[] {
  if (!raw) {
    return []
  }

  try {
    const payload = JSON.parse(raw) as ShellContextBarPreferencesPayload

    const hiddenActionIds = Array.isArray(payload.hiddenActionIds)
      ? payload.hiddenActionIds.filter(
          (id): id is string => typeof id === "string"
        )
      : []

    return normalizeHiddenContextBarActionIds(
      hiddenActionIds,
      availableActionIds
    )
  } catch {
    return []
  }
}

export function serializeShellContextBarPreferences(
  hiddenActionIds: readonly string[]
): string {
  return JSON.stringify({
    version: shellContextBarPreferencesSchemaVersion,
    hiddenActionIds: [...hiddenActionIds],
  })
}
