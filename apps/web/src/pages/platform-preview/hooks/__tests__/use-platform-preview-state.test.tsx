import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { usePlatformPreviewState } from "../use-platform-preview-state"

describe("usePlatformPreviewState", () => {
  it("starts with controller + payment-release defaults", () => {
    const { result } = renderHook(() => usePlatformPreviewState())

    expect(result.current.activeRole).toBe("controller")
    expect(result.current.activeScenario).toBe("payment-release")
    expect(result.current.inspectState.mode).toBe("preview")
    expect(result.current.inspectState.theme).toBe("light")
    expect(result.current.inspectState.stress).toBe("default")
  })

  it("jumpToBridge updates both role and scenario when targetScenario exists", () => {
    const { result } = renderHook(() => usePlatformPreviewState())

    const bridge = result.current.role.bridgeUp
    expect(bridge).toBeTruthy()

    act(() => {
      result.current.jumpToBridge(bridge!)
    })

    expect(result.current.activeRole).toBe("executive")
    expect(result.current.activeScenario).toBe("month-end-close")
  })

  it("jumpToRoleAndScenario updates role and optional scenario", () => {
    const { result } = renderHook(() => usePlatformPreviewState())

    act(() => {
      result.current.jumpToRoleAndScenario("operator", "integration-exception")
    })

    expect(result.current.activeRole).toBe("operator")
    expect(result.current.activeScenario).toBe("integration-exception")

    act(() => {
      result.current.jumpToRoleAndScenario("owner")
    })

    expect(result.current.activeRole).toBe("owner")
    expect(result.current.activeScenario).toBe("integration-exception")
  })

  it("exposes role-specific intro and closing content", () => {
    const { result } = renderHook(() => usePlatformPreviewState())

    act(() => {
      result.current.setActiveRole("executive")
    })

    expect(result.current.roleIntro.eyebrow).toContain("CFO / CTO")
    expect(result.current.roleClosing.primaryActionLabel).toContain("executive")
  })

  it("builds bridge targets from the active role", () => {
    const { result } = renderHook(() => usePlatformPreviewState())

    expect(result.current.bridgeTargets.length).toBeGreaterThan(0)
    expect(
      result.current.bridgeTargets.some(
        (item) => item.targetRoleCard.id === "executive"
      )
    ).toBe(true)
  })
})
