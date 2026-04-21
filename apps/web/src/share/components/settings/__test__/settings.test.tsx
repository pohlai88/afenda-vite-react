import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("../account/account-settings", () => ({
  AccountSettings: () => <div data-testid="account-settings">account</div>,
}))

vi.mock("../security/security-settings", () => ({
  SecuritySettings: () => <div data-testid="security-settings">security</div>,
}))

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        eyebrow: "Account Management",
        capabilities_title: "Available Controls",
        tabs_label: "Settings sections",
        "views.account.title": "Account Preferences",
        "views.account.description":
          "Manage identity details, sign-in address, visual preferences, and session continuity.",
        "views.account.summary":
          "Profile, email, and workspace continuity controls stay together.",
        "views.security.title": "Security & Sessions",
        "views.security.description":
          "Review passwords, linked providers, passkeys, active sessions, and destructive actions.",
        "views.security.summary":
          "Security controls stay explicit and easy to audit.",
      })[key] ?? key,
  }),
}))

vi.mock("@better-auth-ui/react", () => ({
  useAuthenticate: vi.fn(),
  useAuth: () => ({
    basePaths: {
      settings: "/app/settings",
    },
    emailAndPassword: {
      enabled: true,
    },
    localization: {
      auth: {
        password: "Password",
      },
      settings: {
        account: "Account",
        linkedAccounts: "Linked Accounts",
        manageAccounts: "Manage Accounts",
        passkeys: "Passkeys",
        security: "Security",
        settings: "Settings",
      },
    },
    multiSession: true,
    passkey: true,
    socialProviders: ["google"],
    viewPaths: {
      settings: {
        account: "account",
        security: "security",
      },
    },
    Link: ({ children, href }: { children: ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  }),
}))

import { Settings } from "../settings"

describe("Settings", () => {
  it("renders the account page header, navigation, and account content", () => {
    render(<Settings view="account" />)

    expect(
      screen.getByRole("heading", { name: "Account Preferences" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Account" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Security" })).toBeInTheDocument()
    expect(screen.getByText("Password")).toBeInTheDocument()
    expect(screen.getByTestId("account-settings")).toBeInTheDocument()
  })

  it("renders the security page header and security content", () => {
    render(<Settings view="security" />)

    expect(
      screen.getByRole("heading", { name: "Security & Sessions" })
    ).toBeInTheDocument()
    expect(screen.getByTestId("security-settings")).toBeInTheDocument()
  })
})
