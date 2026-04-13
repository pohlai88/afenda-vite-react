export function readOptionalInteger(
  raw: string | undefined,
  fallback: number
): number {
  if (raw === undefined || raw.trim() === "") {
    return fallback
  }

  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}
