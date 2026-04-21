import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

const signUpEmail = vi.fn()

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        panel_title: "Create Account",
        panel_description: "Create your Afenda access.",
      })[key] ?? key,
  }),
}))

vi.mock("@/app/_platform/auth", () => ({
  useAuthPostLoginDestination: () => "/app",
}))

vi.mock("@better-auth-ui/react", () => ({
  useAuth: () => ({
    basePaths: {
      auth: "/auth",
    },
    emailAndPassword: {
      enabled: true,
      confirmPassword: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: false,
    },
    localization: {
      auth: {
        alreadyHaveAnAccount: "Already have an account?",
        confirmPassword: "Confirm password",
        confirmPasswordPlaceholder: "Confirm password",
        email: "Email",
        emailPlaceholder: "name@company.com",
        hidePassword: "Hide password",
        or: "or",
        password: "Password",
        passwordPlaceholder: "Enter a password",
        passwordsDoNotMatch: "Passwords do not match.",
        showPassword: "Show password",
        signIn: "Sign in",
        signUp: "Create account",
      },
    },
    magicLink: false,
    redirectTo: "/app",
    socialProviders: [],
    viewPaths: {
      auth: {
        signIn: "login",
      },
    },
    navigate: vi.fn(),
    Link: ({ children, href }: { children: ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  }),
  useSignUpEmail: () => ({
    mutate: signUpEmail,
    isPending: false,
  }),
}))

import { SignUp } from "../sign-up"

describe("SignUp", () => {
  it("shows an inline confirm-password error and focuses the field when passwords do not match", async () => {
    const user = userEvent.setup()

    render(<SignUp />)

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
    await user.type(screen.getByLabelText("Email"), "jane@example.com")
    await user.type(screen.getByLabelText("Password"), "password-123")

    const confirmPasswordInput = screen.getByLabelText("Confirm password")
    await user.type(confirmPasswordInput, "password-456")
    await user.click(screen.getByRole("button", { name: "Create account" }))

    expect(signUpEmail).not.toHaveBeenCalled()
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument()
    expect(confirmPasswordInput).toHaveFocus()
  })
})
