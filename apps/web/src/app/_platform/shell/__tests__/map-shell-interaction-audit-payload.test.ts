import { describe, expect, it, vi } from "vitest"

import {
  mapShellInteractionAuditPayload,
  SHELL_INTERACTION_AUDIT_ACTION,
} from "../services/map-shell-interaction-audit-payload"

describe("mapShellInteractionAuditPayload", () => {
  it("maps envelope to request body with sevenW1H and subject", () => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "00000000-0000-4000-8000-0000000000aa",
    })

    const body = mapShellInteractionAuditPayload({
      kind: "shell.command",
      mechanism: "click",
      interactionPhase: "succeeded",
      commandId: "dashboard.refresh",
      tenantId: "00000000-0000-4000-8000-000000000001",
      pathname: "/app/dashboard",
      actorUserId: "00000000-0000-4000-8000-000000000002",
    })

    expect(body.action).toBe(SHELL_INTERACTION_AUDIT_ACTION)
    expect(body.interactionPhase).toBe("succeeded")
    expect(body.subject.type).toBe("shell_interaction")
    expect(body.subject.id).toBe("00000000-0000-4000-8000-0000000000aa")
    expect(body.commandId).toBe("dashboard.refresh")
    expect(body.tenantId).toBe("00000000-0000-4000-8000-000000000001")
    expect(body.metadata.module).toBe("apps/web")
    expect(body.metadata.route).toBe("/app/dashboard")
    expect(body.actor?.userId).toBe("00000000-0000-4000-8000-000000000002")
    expect(body.metadata.extra.sevenW1H.mechanism).toBe("click")
    expect(body.metadata.extra.sevenW1H.kind).toBe("shell.command")

    vi.unstubAllGlobals()
  })
})
