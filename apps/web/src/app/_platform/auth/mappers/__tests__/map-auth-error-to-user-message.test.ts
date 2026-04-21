import { describe, expect, it } from "vitest"

import { mapAuthErrorToUserMessage } from "../map-auth-error-to-user-message"

describe("mapAuthErrorToUserMessage", () => {
  it("maps transactional email delivery failures to a stable user message", () => {
    expect(mapAuthErrorToUserMessage("AFENDA_EMAIL_DELIVERY_FAILED")).toContain(
      "could not send email"
    )
    expect(
      mapAuthErrorToUserMessage("Email could not be sent. Try again shortly.")
    ).toContain("could not send email")
  })

  it("maps tenant activation errors to setup-specific guidance", () => {
    expect(mapAuthErrorToUserMessage("tenant_selection_required")).toContain(
      "active operating context"
    )
    expect(
      mapAuthErrorToUserMessage("tenant_context_resolution_failed")
    ).toContain("workspace access")
    expect(mapAuthErrorToUserMessage("auth_not_configured")).toContain(
      "tenant activation"
    )
  })
})
