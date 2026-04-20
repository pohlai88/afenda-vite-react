import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { useFeatureTemplate } from "../hooks/use-feature-template"
import type { FeatureTemplateDefinition } from "../types/feature-template"

const { fetchFeatureTemplateMock } = vi.hoisted(() => ({
  fetchFeatureTemplateMock: vi.fn(),
}))

vi.mock("../services/feature-template-service", () => ({
  fetchFeatureTemplate: fetchFeatureTemplateMock,
}))

function createFeature(
  overrides: Partial<FeatureTemplateDefinition> = {}
): FeatureTemplateDefinition {
  return {
    slug: "events",
    title: "Event log",
    description: "Operational stream for ERP events.",
    workspaceLabel: "Acme Treasury Ltd",
    scopeLabel: "Finance / Accounts payable",
    status: "healthy",
    routePath: "/app/events",
    metrics: [],
    records: [
      {
        id: "evt-1028",
        title: "Invoice approval workflow advanced",
        description: "Finance moved INV-1042 from review to posting.",
        status: "healthy",
        owner: "Finance operations",
        updatedAt: "2026-04-13T08:20:00.000Z",
      },
    ],
    ...overrides,
  }
}

afterEach(() => {
  fetchFeatureTemplateMock.mockReset()
})

describe("useFeatureTemplate", () => {
  it("loads the feature contract and exposes the command catalog", async () => {
    fetchFeatureTemplateMock.mockResolvedValue(createFeature())

    const { result } = renderHook(() => useFeatureTemplate("events"))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.feature?.slug).toBe("events")
    expect(result.current.errorMessage).toBeNull()
    expect(result.current.commands.length).toBeGreaterThan(0)
  })

  it("exposes an error state when loading fails", async () => {
    fetchFeatureTemplateMock.mockRejectedValue(
      new Error("Feature fetch failed")
    )

    const { result } = renderHook(() => useFeatureTemplate("events"))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.feature).toBeNull()
    expect(result.current.errorMessage).toBe("Feature fetch failed")
    expect(result.current.actionResult).toBeNull()
  })

  it("reloads on explicit refresh and on the refresh command", async () => {
    fetchFeatureTemplateMock.mockResolvedValue(createFeature())

    const { result } = renderHook(() => useFeatureTemplate("events"))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.reload()
    })

    await waitFor(() => {
      expect(fetchFeatureTemplateMock).toHaveBeenCalledTimes(2)
    })

    act(() => {
      result.current.runCommand("refresh-view")
    })

    expect(result.current.actionResult?.commandId).toBe("refresh-view")

    await waitFor(() => {
      expect(fetchFeatureTemplateMock).toHaveBeenCalledTimes(3)
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.actionResult?.message).toBe(
      "Event log refreshed for the active workspace scope."
    )
  })
})
