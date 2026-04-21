import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

type SessionState = {
  data: { session?: { id: string } } | null
  isPending: boolean
}

let mockSessionState: SessionState = {
  data: null,
  isPending: false,
}

vi.mock("../auth-client", () => ({
  authClient: {
    useSession: () => mockSessionState,
  },
}))

vi.mock("@/share/components/auth/auth", () => ({
  Auth: ({ view }: { view: string }) => (
    <div data-testid="auth-view" data-view={view}>
      {view}
    </div>
  ),
}))

import { RouteAuthUnified } from "../routes/route-auth-unified"

function renderRoute(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/" element={<div data-testid="home">home</div>} />
        <Route path="/app" element={<div data-testid="app-home">app</div>} />
        <Route path="/auth/*" element={<RouteAuthUnified />} />
      </Routes>
    </MemoryRouter>
  )
}

describe("RouteAuthUnified", () => {
  it.each([
    ["/auth/login", "signIn"],
    ["/auth/register", "signUp"],
    ["/auth/magic-link", "magicLink"],
    ["/auth/forgot-password", "forgotPassword"],
    ["/auth/reset-password", "resetPassword"],
    ["/auth/sign-out", "signOut"],
  ])("maps %s to the %s auth view", (pathname, view) => {
    mockSessionState = {
      data: null,
      isPending: false,
    }

    renderRoute(pathname)

    expect(screen.getByTestId("auth-view")).toHaveAttribute("data-view", view)
  })

  it("redirects unknown auth segments to the home route", async () => {
    mockSessionState = {
      data: null,
      isPending: false,
    }

    renderRoute("/auth/unknown")

    expect(await screen.findByTestId("home")).toBeInTheDocument()
  })

  it("redirects authenticated users away from guest auth routes", async () => {
    mockSessionState = {
      data: { session: { id: "session-1" } },
      isPending: false,
    }

    renderRoute("/auth/login")

    expect(await screen.findByTestId("app-home")).toBeInTheDocument()
  })
})
