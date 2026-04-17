/**
 * Redacts credentials from a Postgres URL for logs and reports.
 */
export function maskDatabaseUrl(url: string | undefined): string {
  if (!url) {
    return "(no DATABASE_URL)"
  }
  try {
    const u = new URL(url)
    if (u.password) {
      u.password = "****"
    }
    if (u.username) {
      u.username = u.username.length > 0 ? "****" : ""
    }
    return u.toString()
  } catch {
    return url.replace(/:[^:@/]+@/, ":****@")
  }
}
