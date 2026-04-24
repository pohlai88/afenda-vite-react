import { describe, expect, it } from "vitest"

import { createModeAwareVerifyResponse } from "../src/plugins/features-sdk/explain/mode-aware-response.js"
import {
  summarizeSyncPackVerifyResult,
  summarizeSyncPackVerifyStep,
} from "../../features-sdk/src/sync-pack/verify/index.js"

describe("guided operator mode behavior", () => {
  it("keeps the response bounded to one exact next command", () => {
    const result = summarizeSyncPackVerifyResult([
      summarizeSyncPackVerifyStep("release-check", []),
      summarizeSyncPackVerifyStep("check", []),
      summarizeSyncPackVerifyStep("doctor", []),
      summarizeSyncPackVerifyStep("validate", []),
    ])

    const response = createModeAwareVerifyResponse("guided_operator", result)

    expect(typeof response.exactNextCommand).toBe("string")
    expect(response.exactNextCommand.split(/\s+/).length).toBeGreaterThan(1)
    expect(response.allowedTools).toEqual([
      "quickstart",
      "verify",
      "check",
      "doctor",
    ])
  })
})
