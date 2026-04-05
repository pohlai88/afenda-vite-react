export function toDisplayName(value: string | null) {
  if (!value || value.trim().length === 0) {
    return 'User'
  }

  return value
}
