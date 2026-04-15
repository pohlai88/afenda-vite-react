import { useEffect, useState } from "react"

import { createUnavailableAuthIntelligenceSnapshot } from "../mappers/map-auth-intelligence-to-view-model"
import { normalizeAuthServiceErrorCode } from "../services/auth-error-service"
import { fetchAuthIntelligenceSnapshot } from "../services/auth-intelligence-service"

export function useAuthIntelligence() {
  const [data, setData] = useState(
    createUnavailableAuthIntelligenceSnapshot()
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
        setErrorCode(normalizeAuthServiceErrorCode(error))
        setData(createUnavailableAuthIntelligenceSnapshot())
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
