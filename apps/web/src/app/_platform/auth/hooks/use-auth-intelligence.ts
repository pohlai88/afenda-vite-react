import { useEffect, useState } from "react"

import type { AuthIntelligenceSnapshot } from "../types/auth-ecosystem"
import {
  fetchAuthIntelligenceSnapshot,
  resolveAuthErrorCode,
} from "../services/auth-ecosystem-service"

const fallbackIntelligenceSnapshot: AuthIntelligenceSnapshot = {
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
}

export function useAuthIntelligence() {
  const [data, setData] = useState<AuthIntelligenceSnapshot>(
    fallbackIntelligenceSnapshot
  )
  const [isLoading, setLoading] = useState(true)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErrorCode(null)

    void (async () => {
      try {
        const snapshot = await fetchAuthIntelligenceSnapshot()
        if (cancelled) {
          return
        }
        setData(snapshot)
      } catch (error) {
        if (cancelled) {
          return
        }
        setErrorCode(resolveAuthErrorCode(error))
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { data, isLoading, errorCode } as const
}
