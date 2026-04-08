/** Reads a numeric HTTP status from an unknown error (e.g. TanStack Query failure). */
export function getHttpStatusFromUnknown(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined
  }
  if (
    !('status' in error) ||
    typeof (error as { status: unknown }).status !== 'number'
  ) {
    return undefined
  }
  return (error as { status: number }).status
}
