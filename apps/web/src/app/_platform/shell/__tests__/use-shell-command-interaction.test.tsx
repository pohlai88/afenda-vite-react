import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useShellCommandInteraction } from "../hooks/use-shell-command-interaction"

describe("useShellCommandInteraction", () => {
  it("reflects running state and blocks duplicate starts for block concurrency", () => {
    const { result } = renderHook(() => useShellCommandInteraction())
    const ctx = { commandId: "orders.create", intent: "modal-submit" as const }

    expect(result.current.isRunning("orders.create")).toBe(false)
    act(() => {
      expect(result.current.start(ctx)).toBe(true)
    })
    expect(result.current.isRunning("orders.create")).toBe(true)
    act(() => {
      expect(result.current.start(ctx)).toBe(false)
    })

    act(() => {
      result.current.finish("orders.create")
    })
    expect(result.current.isRunning("orders.create")).toBe(false)
  })

  it("allows repeated starts for replace concurrency", () => {
    const { result } = renderHook(() => useShellCommandInteraction())
    const ctx = {
      commandId: "dashboard.refresh",
      intent: "background-refresh" as const,
    }

    act(() => {
      expect(result.current.start(ctx)).toBe(true)
    })
    act(() => {
      expect(result.current.start(ctx)).toBe(true)
    })
    act(() => {
      result.current.finish("dashboard.refresh")
    })
    expect(result.current.isRunning("dashboard.refresh")).toBe(false)
  })

  it("run executes, returns result, and releases", async () => {
    const { result } = renderHook(() => useShellCommandInteraction())
    const ctx = { commandId: "y", intent: "modal-submit" as const }

    let runResult: Awaited<ReturnType<typeof result.current.run<number>>>
    await act(async () => {
      runResult = await result.current.run(ctx, async () => 42)
    })

    expect(runResult!).toEqual({ started: true, result: 42 })
    expect(result.current.isRunning("y")).toBe(false)
  })

  it("run returns started false when blocked", async () => {
    const { result } = renderHook(() => useShellCommandInteraction())
    const ctx = { commandId: "z", intent: "modal-submit" as const }

    act(() => {
      expect(result.current.start(ctx)).toBe(true)
    })

    let runResult: Awaited<ReturnType<typeof result.current.run<number>>>
    await act(async () => {
      runResult = await result.current.run(ctx, async () => 1)
    })

    expect(runResult!).toEqual({ started: false })
    act(() => {
      result.current.finish("z")
    })
  })

  it("run captures error and still releases", async () => {
    const { result } = renderHook(() => useShellCommandInteraction())
    const ctx = { commandId: "err", intent: "modal-submit" as const }
    const boom = new Error("fail")

    let runResult: Awaited<ReturnType<typeof result.current.run<number>>>
    await act(async () => {
      runResult = await result.current.run(ctx, async () => {
        throw boom
      })
    })

    expect(runResult!.started).toBe(true)
    if (runResult!.started && "error" in runResult!) {
      expect(runResult.error).toBe(boom)
    }
    expect(result.current.isRunning("err")).toBe(false)
  })
})
