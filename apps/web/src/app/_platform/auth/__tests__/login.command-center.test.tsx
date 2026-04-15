import { act, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { initI18n } from "../../i18n"

import { AUTH_ROUTES } from "../auth-paths"
import { RouteAuthLogin } from "../routes/route-auth-login"

vi.mock("../hooks/use-auth-intelligence", () => ({
  useAuthIntelligence: () => ({
    data: {
      trustLevel: "high",
      score: 91,
      deviceLabel: "Managed workstation",
      regionLabel: "Bangkok workspace",
      lastSeenLabel: "Trusted session observed in the last 30 minutes.",
      reasons: [
        {
          code: "auth.risk.device-posture",
          label: "Device posture evaluated against recent secure sessions.",
          severity: "info",
        },
      ],
      passkeyAvailable: false,
      recommendedMethod: "password",
    },
    isLoading: false,
    errorCode: null,
  }),
}))

vi.mock("../auth-client", async () => {
  const actual = await vi.importActual<typeof import("../auth-client")>(
    "../auth-client"
  )
  return {
    ...actual,
    authClient: {
      ...actual.authClient,
      signIn: {
        email: vi.fn(async () => ({ error: null })),
        social: vi.fn(async () => ({ error: null })),
      },
      signOut: vi.fn(async () => ({ error: null })),
      useSession: vi.fn(() => ({ data: null, isPending: false })),
    },
  }
})

describe("LoginPage command center", () => {
  beforeAll(async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))
    )
    await initI18n()
  })

  it("renders intelligence HUD, challenge canvas, and continuity panel", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={[AUTH_ROUTES.login]}>
          <RouteAuthLogin />
        </MemoryRouter>
      )
    })

    expect(screen.getByText("Sign in")).toBeInTheDocument()
    expect(screen.getByText("Identity intelligence")).toBeInTheDocument()
    expect(screen.getByText("Session continuity")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Continue to method selection" })
    ).toBeInTheDocument()
  })
})
