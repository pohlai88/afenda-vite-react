import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const navigateMock = vi.fn()
const refetchMock = vi.fn(async () => undefined)
const createOrganizationMock = vi.fn()
const setActiveOrganizationMock = vi.fn()
const listTenantCandidatesMock = vi.fn()
const activateAuthTenantContextMock = vi.fn()

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>("react-router-dom")

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock("@/app/_platform/auth", async () => {
  const actual = await vi.importActual<typeof import("@/app/_platform/auth")>(
    "@/app/_platform/auth"
  )

  return {
    ...actual,
    authOrganizationClient: {
      useListOrganizations: () => ({
        data: [],
        isPending: false,
      }),
      organization: {
        create: (...args: unknown[]) => createOrganizationMock(...args),
        setActive: (...args: unknown[]) => setActiveOrganizationMock(...args),
      },
    },
    useAfendaSession: () => ({
      data: {
        user: {
          email: "owner@acme.test",
          name: "Acme Owner",
        },
      },
      refetch: refetchMock,
    }),
    useAuthPostLoginDestination: () => "/app",
    activateAuthTenantContext: (...args: unknown[]) =>
      activateAuthTenantContextMock(...args),
    listAuthTenantCandidates: (...args: unknown[]) =>
      listTenantCandidatesMock(...args),
  }
})

import { WorkspaceSetupPage } from "../workspace-setup-page"

describe("WorkspaceSetupPage", () => {
  it("renders a dedicated tenant selector when activation requires tenant choice", async () => {
    createOrganizationMock.mockResolvedValue({
      error: null,
    })
    activateAuthTenantContextMock
      .mockRejectedValueOnce(new Error("tenant_selection_required"))
      .mockResolvedValueOnce({
        activated: true,
        authSessionId: "auth-session-1",
        tenantId: "tenant-2",
        membershipId: "membership-2",
        afendaUserId: "afenda-user-1",
      })
    listTenantCandidatesMock.mockResolvedValue({
      authSessionId: "auth-session-1",
      afendaUserId: "afenda-user-1",
      activeTenantId: null,
      activeMembershipId: null,
      defaultTenantId: "tenant-1",
      candidates: [
        {
          tenantId: "tenant-1",
          membershipId: "membership-1",
          tenantName: "Acme Operations",
          tenantCode: "ACME",
          isDefault: true,
        },
        {
          tenantId: "tenant-2",
          membershipId: "membership-2",
          tenantName: "Acme Supply",
          tenantCode: "ACME-SUPPLY",
          isDefault: false,
        },
      ],
    })

    render(<WorkspaceSetupPage />)

    fireEvent.change(screen.getByLabelText("setup.workspace.name_label"), {
      target: { value: "Acme Operations" },
    })
    fireEvent.click(
      screen.getByRole("button", { name: "setup.workspace.create_action" })
    )

    expect(
      await screen.findByText("setup.workspace.tenant_selector_title")
    ).toBeInTheDocument()
    expect(screen.getByText("Acme Operations")).toBeInTheDocument()
    expect(screen.getByText("Acme Supply")).toBeInTheDocument()
    expect(
      screen.getByText("setup.workspace.tenant_selector_default")
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getAllByRole("button", {
        name: "setup.workspace.tenant_selector_action",
      })[1]
    )

    await waitFor(() => {
      expect(activateAuthTenantContextMock).toHaveBeenLastCalledWith("tenant-2")
      expect(refetchMock).toHaveBeenCalled()
      expect(navigateMock).toHaveBeenCalledWith("/app", { replace: true })
    })
  })
})
