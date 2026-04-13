import { describe, expect, it } from "vitest"

import { resolveShellCommandInteractionPolicy } from "../services/resolve-shell-command-interaction-policy"

describe("resolveShellCommandInteractionPolicy", () => {
  it("returns header-action defaults", () => {
    expect(
      resolveShellCommandInteractionPolicy({
        commandId: "dashboard.refresh",
        intent: "header-action",
      })
    ).toEqual({
      concurrency: "block",
      presentation: "non-blocking",
      disableTriggerWhileRunning: true,
      showLoadingIndicator: true,
    })
  })

  it("returns modal-submit blocking policy", () => {
    expect(
      resolveShellCommandInteractionPolicy({
        commandId: "orders.create",
        intent: "modal-submit",
      })
    ).toEqual({
      concurrency: "block",
      presentation: "blocking",
      disableTriggerWhileRunning: true,
      showLoadingIndicator: true,
    })
  })

  it("returns background-refresh replacement policy", () => {
    expect(
      resolveShellCommandInteractionPolicy({
        commandId: "dashboard.refresh",
        intent: "background-refresh",
      })
    ).toEqual({
      concurrency: "replace",
      presentation: "non-blocking",
      disableTriggerWhileRunning: false,
      showLoadingIndicator: false,
    })
  })
})
