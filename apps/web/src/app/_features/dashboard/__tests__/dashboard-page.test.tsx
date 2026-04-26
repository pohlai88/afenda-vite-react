import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import dashboardEn from "@/app/_platform/i18n/locales/en/dashboard.json"

import { DashboardPage } from "../dashboard-page"

function flattenMessages(
  input: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  return Object.entries(input).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        Object.assign(
          accumulator,
          flattenMessages(value as Record<string, unknown>, nextKey)
        )
      } else if (typeof value === "string") {
        accumulator[nextKey] = value
      }
      return accumulator
    },
    {}
  )
}

const dashboardMessages = flattenMessages(
  dashboardEn as Record<string, unknown>
)

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (
      key: string,
      options?: Record<string, string | number | undefined>
    ): string => {
      const template = dashboardMessages[key] ?? key
      if (!options) {
        return template
      }

      return Object.entries(options).reduce(
        (result, [name, value]) =>
          result.replaceAll(`{{${name}}}`, String(value ?? "")),
        template
      )
    },
  }),
}))

vi.mock("@/app/_platform/tenant", () => ({
  useTenantScope: () => ({
    status: "ready",
    me: {
      tenant: {
        memberships: [
          {
            tenantId: "tenant-1",
            membershipId: "membership-1",
            tenantName: "Acme Operations",
            tenantCode: "ACME",
            isDefault: true,
          },
        ],
      },
    },
  }),
}))

describe("DashboardPage", () => {
  it("renders the enriched dashboard surface", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", { name: "ERP Dashboard" })
    ).toBeInTheDocument()
    expect(screen.getByText("Acme Operations")).toBeInTheDocument()
    expect(screen.getByText("Revenue flow")).toBeInTheDocument()
    expect(screen.getByText("Module readiness")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "View Finance →" })
    ).toBeInTheDocument()
  })
})
