const titles: Record<string, string> = {
  "auth.session.created": "Signed in on a new session",
  "auth.session.revoked": "Session ended",
  "auth.account.linked": "Account linked",
  "auth.user.updated": "Account details updated",
}

export function mapAuthRecentEventTitle(action: string): string {
  return titles[action] ?? action
}
