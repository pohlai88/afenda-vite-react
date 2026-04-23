import { render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { initI18n } from "../../../i18n"
import {
  TenantScopeTestDoubleProvider,
  type TenantScopeState,
} from "../../../tenant"
import { ShellTopNavTenantIndicator } from "../shell-top-nav-block/shell-top-nav-tenant-indicator"

describe("ShellTopNavTenantIndicator", () => {
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

  it("renders the active tenant label when tenant scope is ready", () => {
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
      selectedTenantId: "tenant-2",
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
      setSelectedTenantId: vi.fn(),
    }

    render(
      <TenantScopeTestDoubleProvider value={readyScope}>
        <ShellTopNavTenantIndicator />
      </TenantScopeTestDoubleProvider>
    )

    expect(screen.getByText("Tenant: Acme Supply")).toBeInTheDocument()
  })
})
