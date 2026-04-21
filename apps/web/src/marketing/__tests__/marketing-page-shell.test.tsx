import { render, screen, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { MarketingPageShell } from "../pages/_components"

describe("MarketingPageShell", () => {
  it("renders a safe shell with skip link and full mobile/footer page directory", () => {
    render(
      <MemoryRouter>
        <MarketingPageShell>
          <section>
            <h1>Shell Test</h1>
          </section>
        </MarketingPageShell>
      </MemoryRouter>
    )

    expect(
      screen.getByRole("link", { name: /Skip to content/i })
    ).toHaveAttribute("href", "#main-content")

    expect(screen.getByRole("banner")).toBeInTheDocument()

    const pageDirectory = screen.getByRole("navigation", {
      name: /Marketing page directory/i,
    })

    expect(
      within(pageDirectory).getByRole("link", { name: /Privacy Policy/i })
    ).toHaveAttribute("href", "/marketing/legal/privacy-policy")

    expect(
      within(pageDirectory).getByRole("link", { name: /Asia Pacific/i })
    ).toHaveAttribute("href", "/marketing/regional/asia-pacific")

    expect(
      screen.getByText(
        /Product, company, campaign, legal, and regional surfaces stay wired/i
      )
    ).toBeInTheDocument()
  })

  it("can hide the shared header while preserving the main content and footer", () => {
    render(
      <MemoryRouter>
        <MarketingPageShell hideHeader>
          <section>
            <h1>Flagship Hero</h1>
          </section>
        </MarketingPageShell>
      </MemoryRouter>
    )

    expect(screen.queryByRole("banner")).not.toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /Flagship Hero/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("navigation", { name: /Marketing footer navigation/i })
    ).toBeInTheDocument()
  })
})
