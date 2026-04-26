import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

import { BetterAuthSettingsView } from "./better-auth-settings-view"

vi.mock("@/share/components/settings/settings", () => ({
  Settings: ({
    view,
    embedded,
  }: {
    readonly view: string
    readonly embedded?: boolean
  }) => (
    <div data-testid="settings-view">
      <span>{view}</span>
      <span>{embedded ? "embedded" : "standalone"}</span>
    </div>
  ),
}))

vi.mock("@/app/_platform/auth", () => ({
  useAfendaSession: vi.fn(),
}))

vi.mock("@/app/_platform/auth/better-auth-ui/afenda-auth-ui-provider", () => ({
  AfendaAuthUiProvider: ({ children }: { readonly children: ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock("@/app/_platform/tenant/tenant-scope-context", () => ({
  useOptionalTenantScope: vi.fn(),
}))

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>("react-router-dom")

  return {
    ...actual,
    Link: ({
      children,
      to,
    }: {
      readonly children: ReactNode
      readonly to: string
    }) => <a href={to}>{children}</a>,
  }
})

import { useAfendaSession } from "@/app/_platform/auth"
import { useOptionalTenantScope } from "@/app/_platform/tenant/tenant-scope-context"

const mockedUseAfendaSession = vi.mocked(useAfendaSession)
const mockedUseOptionalTenantScope = vi.mocked(useOptionalTenantScope)

describe("BetterAuthSettingsView", () => {
  it("renders the account settings inside the canonical app surface", () => {
    mockedUseAfendaSession.mockReturnValue({
      isPending: false,
      data: {
        session: {
          id: "session-1",
        },
        user: {
          email: "ops@acme.test",
        },
      },
    } as never)
    mockedUseOptionalTenantScope.mockReturnValue({
      status: "ready",
      me: {
        tenant: {
          name: "Acme Operations",
        },
      },
    } as never)

    render(<BetterAuthSettingsView view="account" />)

    expect(
      screen.getByRole("heading", { name: "Account preferences" })
    ).toBeInTheDocument()
    expect(screen.getByText("Acme Operations")).toBeInTheDocument()
    expect(screen.getByText("ops@acme.test")).toBeInTheDocument()
    expect(screen.getByTestId("settings-view")).toHaveTextContent("embedded")
  })

  it("renders a governed loading state while the session is pending", () => {
    mockedUseAfendaSession.mockReturnValue({
      isPending: true,
      data: null,
    } as never)
    mockedUseOptionalTenantScope.mockReturnValue(null)

    render(<BetterAuthSettingsView view="security" />)

    expect(screen.getByText("Loading security settings")).toBeInTheDocument()
  })
})
