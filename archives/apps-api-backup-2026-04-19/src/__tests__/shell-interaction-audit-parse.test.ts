/**
 * Unit tests for shell interaction audit JSON parsing (`parseShellInteractionAuditBody`).
 *
 * @module __tests__/shell-interaction-audit-parse.test
 */
import { describe, expect, it } from "vitest"

import { parseShellInteractionAuditBody } from "../modules/shell-interaction-audit/shell-interaction-audit.js"

describe("parseShellInteractionAuditBody", () => {
  it("parses valid payload", () => {
    const raw = {
      action: "shell.interaction.recorded",
      interactionPhase: "succeeded",
      subject: { type: "shell_interaction", id: "sub-1" },
      commandId: "dashboard.refresh",
      tenantId: "00000000-0000-4000-8000-000000000001",
      metadata: {
        module: "apps/web",
        route: "/app",
        extra: {
          sevenW1H: {
            kind: "shell.command",
            mechanism: "click",
          },
        },
      },
    }

    const parsed = parseShellInteractionAuditBody(raw)
    expect(parsed).not.toBeNull()
    expect(parsed?.interactionPhase).toBe("succeeded")
    expect(parsed?.subject.id).toBe("sub-1")
    expect(parsed?.metadata.extra.sevenW1H.kind).toBe("shell.command")
  })

  it("rejects unknown action", () => {
    expect(
      parseShellInteractionAuditBody({
        action: "other.action",
        interactionPhase: "succeeded",
        subject: { type: "shell_interaction", id: "x" },
        metadata: { module: "apps/web", extra: { sevenW1H: {} } },
      })
    ).toBeNull()
  })
})
