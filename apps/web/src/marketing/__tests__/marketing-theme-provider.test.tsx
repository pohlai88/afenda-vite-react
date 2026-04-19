import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

const nextThemesMocks = vi.hoisted(() => ({
  ThemeProvider: vi.fn(
    ({
      children,
      storageKey,
      themes,
      defaultTheme,
      enableSystem,
      disableTransitionOnChange,
    }: {
      children: ReactNode
      storageKey: string
      themes: string[]
      defaultTheme: string
      enableSystem: boolean
      disableTransitionOnChange: boolean
    }) => (
      <div
        data-testid="theme-provider"
        data-storage-key={storageKey}
        data-themes={themes.join(",")}
        data-default-theme={defaultTheme}
        data-enable-system={String(enableSystem)}
        data-disable-transition={String(disableTransitionOnChange)}
      >
        {children}
      </div>
    )
  ),
}))

vi.mock("next-themes", () => nextThemesMocks)
vi.mock("../../app/_platform/theme/theme-color-meta", () => ({
  ThemeColorMeta: () => <div data-testid="theme-color-meta" />,
}))

import {
  MarketingThemeProvider,
  VITE_MARKETING_THEME_STORAGE_KEY,
} from "../marketing-theme-provider"

describe("MarketingThemeProvider", () => {
  it("wires the canonical theme provider contract", () => {
    render(
      <MarketingThemeProvider>
        <div>marketing child</div>
      </MarketingThemeProvider>
    )

    const themeProvider = screen.getByTestId("theme-provider")

    expect(themeProvider).toHaveAttribute(
      "data-storage-key",
      VITE_MARKETING_THEME_STORAGE_KEY
    )
    expect(themeProvider).toHaveAttribute("data-themes", "light,dark")
    expect(themeProvider).toHaveAttribute("data-default-theme", "system")
    expect(themeProvider).toHaveAttribute("data-enable-system", "true")
    expect(themeProvider).toHaveAttribute("data-disable-transition", "true")
    expect(screen.getByText("marketing child")).toBeInTheDocument()
    expect(screen.getByTestId("theme-color-meta")).toBeInTheDocument()
  })
})
