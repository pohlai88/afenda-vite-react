import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"

import { MarketingPageScaffold } from "../components"

describe("MarketingPageScaffold", () => {
  it("renders hero, ordered sections, and footer inside the shared marketing shell", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/marketing/company/about"]}>
        <MarketingPageScaffold
          title="Afenda ERP"
          tagline="About page"
          hero={<section data-testid="hero">Hero</section>}
          sections={[
            <section key="section-01" data-testid="section-01">
              Section 01
            </section>,
            <section key="section-02" data-testid="section-02">
              Section 02
            </section>,
          ]}
          footer={<footer data-testid="footer">Footer</footer>}
        />
      </MemoryRouter>
    )

    expect(screen.getByTestId("hero")).toBeInTheDocument()
    expect(screen.getByTestId("section-01")).toBeInTheDocument()
    expect(screen.getByTestId("section-02")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
    expect(container.querySelector(".marketing-shell-main")).not.toBeNull()
  })
})
