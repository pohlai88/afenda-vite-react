import { describe, expect, expectTypeOf, it } from "vitest"

import type { WebSuccessEnvelope } from "../web-envelope.contract"
import type { WebCreateUserInput, WebUser } from "../web-user.contract"
import {
  createUser,
  fetchUsers,
} from "../../app/_features/hono/users/users.api"
import { api, createApiClient } from "../web-client"

describe("rpc/web-client", () => {
  it("createApiClient returns a defined hono client", () => {
    const client = createApiClient("http://localhost:8787")
    expect(client).toBeDefined()
    expect(typeof client).toBe("function")
    expect(client.api.users).toBeDefined()
  })

  it("default api export is defined", () => {
    expect(api).toBeDefined()
  })

  it("keeps the users RPC surface type-safe", () => {
    const client = createApiClient("http://localhost:8787")

    expect(client.api.users).toBeDefined()
    expect(typeof fetchUsers).toBe("function")
    expect(typeof createUser).toBe("function")

    expectTypeOf(client).not.toBeAny()
    expectTypeOf(client.api.users).not.toBeAny()
    expectTypeOf(fetchUsers).returns.toEqualTypeOf<
      Promise<WebSuccessEnvelope<WebUser[]>>
    >()
    expectTypeOf(createUser).parameters.toEqualTypeOf<[WebCreateUserInput]>()
    expectTypeOf(createUser).returns.toEqualTypeOf<
      Promise<WebSuccessEnvelope<WebUser>>
    >()
  })
})
