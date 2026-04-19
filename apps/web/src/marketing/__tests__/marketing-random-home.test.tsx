import { act, render, screen } from "@testing-library/react"
import type { ReactElement } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const registryMocks = vi.hoisted(() => ({
  resolveMarketingLandingVariantId: vi.fn(),
  resolveMarketingLandingVariantById: vi.fn(),
}))

const configMocks = vi.hoisted(() => ({
  enableRandomPersistence: true,
}))

vi.mock("../marketing-page-registry", () => ({
  resolveMarketingLandingVariantId:
    registryMocks.resolveMarketingLandingVariantId,
  resolveMarketingLandingVariantById:
    registryMocks.resolveMarketingLandingVariantById,
}))

vi.mock("../marketing.config", () => ({
  MARKETING_CONFIG: {
    get enableRandomPersistence() {
      return configMocks.enableRandomPersistence
    },
  },
}))

import MarketingRandomHome from "../marketing-random-home"

describe("MarketingRandomHome", () => {
  beforeEach(() => {
    registryMocks.resolveMarketingLandingVariantId.mockReset()
    registryMocks.resolveMarketingLandingVariantById.mockReset()
    configMocks.enableRandomPersistence = true
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("shows the loading fallback while the selected page chunk is pending", async () => {
    let resolveModule:
      | ((value: { default: () => ReactElement }) => void)
      | undefined

    registryMocks.resolveMarketingLandingVariantId.mockReturnValue("Moire")
    registryMocks.resolveMarketingLandingVariantById.mockReturnValue({
      load: vi.fn(
        () =>
          new Promise((resolve) => {
            resolveModule = resolve
          })
      ),
    })

    render(<MarketingRandomHome />)

    expect(
      screen.getByLabelText("Loading marketing experience")
    ).toBeInTheDocument()

    await act(async () => {
      resolveModule?.({ default: () => <div>Loaded later</div> })
    })

    expect(screen.getByText("Loaded later")).toBeInTheDocument()
  })

  it("renders a resolved marketing page", async () => {
    const LandingVariant = () => <div>Resolved landing page</div>

    registryMocks.resolveMarketingLandingVariantId.mockReturnValue("Moire")
    registryMocks.resolveMarketingLandingVariantById.mockReturnValue({
      load: vi.fn().mockResolvedValue({ default: LandingVariant }),
    })

    await act(async () => {
      render(<MarketingRandomHome />)
    })

    expect(registryMocks.resolveMarketingLandingVariantId).toHaveBeenCalledWith(
      expect.objectContaining({
        persist: true,
        storage: window.sessionStorage,
      })
    )
    expect(screen.getByText("Resolved landing page")).toBeInTheDocument()
  })

  it("passes null storage when session storage is unavailable", async () => {
    const originalWindow = window

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        get sessionStorage() {
          throw new Error("session storage unavailable")
        },
      },
    })

    const LandingVariant = () => <div>Resolved with null storage</div>

    registryMocks.resolveMarketingLandingVariantId.mockReturnValue("Moire")
    registryMocks.resolveMarketingLandingVariantById.mockReturnValue({
      load: vi.fn().mockResolvedValue({ default: LandingVariant }),
    })

    await act(async () => {
      render(<MarketingRandomHome />)
    })

    expect(registryMocks.resolveMarketingLandingVariantId).toHaveBeenCalledWith(
      expect.objectContaining({
        persist: true,
        storage: null,
      })
    )
    expect(screen.getByText("Resolved with null storage")).toBeInTheDocument()

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    })
  })

  it("disables persistence when the marketing config turns random storage off", async () => {
    configMocks.enableRandomPersistence = false

    const LandingVariant = () => <div>No persistence</div>

    registryMocks.resolveMarketingLandingVariantId.mockReturnValue("Moire")
    registryMocks.resolveMarketingLandingVariantById.mockReturnValue({
      load: vi.fn().mockResolvedValue({ default: LandingVariant }),
    })

    await act(async () => {
      render(<MarketingRandomHome />)
    })

    expect(registryMocks.resolveMarketingLandingVariantId).toHaveBeenCalledWith(
      expect.objectContaining({
        persist: false,
        storage: window.sessionStorage,
      })
    )
    expect(screen.getByText("No persistence")).toBeInTheDocument()
  })

  it("does not update state after unmount when the chunk resolves late", async () => {
    let resolveModule:
      | ((value: { default: () => ReactElement }) => void)
      | undefined

    registryMocks.resolveMarketingLandingVariantId.mockReturnValue("Moire")
    registryMocks.resolveMarketingLandingVariantById.mockReturnValue({
      load: vi.fn(
        () =>
          new Promise<{ default: () => ReactElement }>((resolve) => {
            resolveModule = resolve
          })
      ),
    })

    const { unmount } = render(<MarketingRandomHome />)

    expect(
      screen.getByLabelText("Loading marketing experience")
    ).toBeInTheDocument()

    unmount()

    await act(async () => {
      resolveModule?.({ default: () => <div>Too late</div> })
    })
  })

  it("renders an error state when the page import fails", async () => {
    registryMocks.resolveMarketingLandingVariantId.mockReturnValue("Moire")
    registryMocks.resolveMarketingLandingVariantById.mockReturnValue({
      load: vi.fn().mockRejectedValue(new Error("boom")),
    })

    await act(async () => {
      render(<MarketingRandomHome />)
    })

    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(
      screen.getByText("Marketing experience unavailable")
    ).toBeInTheDocument()
  })
})
