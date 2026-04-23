import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { TooltipProvider } from "@afenda/design-system/ui-primitives"

import { initI18n } from "../../../i18n"
import {
  TenantScopeTestDoubleProvider,
  type TenantScopeState,
} from "../../../tenant"
import { ShellTopNavTenantSwitcher } from "../shell-top-nav-block/shell-top-nav-tenant-switcher"

const refetchMock = vi.fn(async () => undefined)
const activateAuthTenantContextMock = vi.fn()
const listAuthTenantCandidatesMock = vi.fn()
const setSelectedTenantIdMock = vi.fn()

vi.mock("../../../auth", () => ({
  activateAuthTenantContext: (...args: unknown[]) =>
    activateAuthTenantContextMock(...args),
  listAuthTenantCandidates: (...args: unknown[]) =>
    listAuthTenantCandidatesMock(...args),
  useAfendaSession: () => ({
    data: {
      session: { id: "auth-session-1" },
    },
    refetch: refetchMock,
  }),
}))

describe("ShellTopNavTenantSwitcher", () => {
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

  it("switches tenant context from the shell chrome", async () => {
    const user = userEvent.setup()

    const readyScope: TenantScopeState = {
      status: "ready",
      me: {
        betterAuth: {
          user: {},
          session: {},
        },
        afenda: {
          afendaUserId: "afenda-user-1",
          tenantIds: ["tenant-1", "tenant-2"],
          defaultTenantId: "tenant-1",
        },
      },
      selectedTenantId: "tenant-1",
      tenantChoices: [
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
      setSelectedTenantId: setSelectedTenantIdMock,
    }

    activateAuthTenantContextMock.mockResolvedValue({
      activated: true,
      authSessionId: "auth-session-1",
      tenantId: "tenant-2",
      membershipId: "membership-2",
      afendaUserId: "afenda-user-1",
    })

    render(
      <TooltipProvider>
        <TenantScopeTestDoubleProvider value={readyScope}>
          <ShellTopNavTenantSwitcher />
        </TenantScopeTestDoubleProvider>
      </TooltipProvider>
    )

    const switcher = await screen.findByLabelText("Switch active workspace")
    await user.selectOptions(switcher, "tenant-2")

    await waitFor(() => {
      expect(activateAuthTenantContextMock).toHaveBeenCalledWith("tenant-2")
      expect(setSelectedTenantIdMock).toHaveBeenCalledWith("tenant-2")
      expect(refetchMock).toHaveBeenCalled()
    })

    expect(listAuthTenantCandidatesMock).not.toHaveBeenCalled()
  })
})
