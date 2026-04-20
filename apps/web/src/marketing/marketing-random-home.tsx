import { useEffect, useState, type ComponentType } from "react"

import { MARKETING_CONFIG } from "@/marketing/marketing.config"
import { MarketingLoadingFallback } from "@/marketing/marketing-loading-fallback"
import {
  resolveMarketingLandingVariantById,
  resolveMarketingLandingVariantId,
} from "@/marketing/marketing-page-registry"

type MarketingPageComponent = ComponentType<Record<string, never>>
type MarketingRandomHomeState =
  | { readonly status: "loading"; readonly Page: null }
  | { readonly status: "ready"; readonly Page: MarketingPageComponent }
  | { readonly status: "error"; readonly Page: null }

function resolveSessionStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/**
 * Public random-entry runtime for experimentation mode.
 *
 * Owns:
 * - session-based landing selection
 * - lazy loading of selected landing module
 * - loading and error fallback states
 *
 * Must not own:
 * - route composition
 * - flagship homepage policy
 * - catalog definitions
 */
export default function MarketingRandomHome() {
  const [state, setState] = useState<MarketingRandomHomeState>({
    status: "loading",
    Page: null,
  })

  useEffect(() => {
    let isActive = true

    async function loadPage() {
      try {
        const id = resolveMarketingLandingVariantId({
          storage: resolveSessionStorage(),
          persist: MARKETING_CONFIG.enableRandomPersistence,
        })

        const entry = resolveMarketingLandingVariantById(id)
        const module = await entry.load()

        if (!isActive) return

        setState({
          status: "ready",
          Page: module.default as MarketingPageComponent,
        })
      } catch {
        if (!isActive) return
        setState({
          status: "error",
          Page: null,
        })
      }
    }

    void loadPage()

    return () => {
      isActive = false
    }
  }, [])

  if (state.status === "error") {
    return (
      <div
        className="min-h-dvh bg-black text-white"
        role="alert"
        aria-live="polite"
      >
        <div className="flex min-h-dvh items-center justify-center px-6 text-center">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
              Marketing experience unavailable
            </div>
            <p className="mt-4 text-sm text-white/70">
              Please refresh and try again.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (state.status === "loading") {
    return <MarketingLoadingFallback />
  }

  const Page = state.Page
  return <Page />
}
