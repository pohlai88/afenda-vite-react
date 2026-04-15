import { useCallback, useEffect, useState } from "react"

import type { AuthSessionsPayload } from "../contracts/auth-domain"
import { normalizeAuthServiceErrorCode } from "../services/auth-error-service"
import {
  fetchAuthSessionsPayload,
  revokeAuthSession,
} from "../services/auth-session-service"

export function useAuthSessions(enabled: boolean) {
  const [data, setData] = useState<AuthSessionsPayload | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setErrorCode(null)

    try {
      const payload = await fetchAuthSessionsPayload()
      setData(payload)
    } catch (error) {
      setErrorCode(normalizeAuthServiceErrorCode(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    void reload()
  }, [enabled, reload])

  const revokeSession = useCallback(
    async (sessionId: string) => {
      await revokeAuthSession(sessionId)
      await reload()
    },
    [reload]
  )

  return {
    data,
    isLoading,
    errorCode,
    reload,
    revokeSession,
  } as const
}
