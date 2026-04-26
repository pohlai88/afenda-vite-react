/**
 * Typed Hono RPC calls for `/api/users` (pack layout).
 * platform · features · hono · users · api
 * Imports `../../../../rpc/web-*` directly (not `@/rpc`) to avoid a barrel ↔ `web-users` circular dependency.
 * Upstream: `rpc/web-*`, `web-client` `apiClient`.
 * @module app/_features/hono/users/users.api
 * @package @afenda/web
 */
import { apiClient } from "../../../../rpc/web-client"
import type { WebSuccessEnvelope } from "../../../../rpc/web-envelope.contract"
import type {
  WebCreateUserInput,
  WebUser,
} from "../../../../rpc/web-user.contract"

export async function fetchUsers(): Promise<WebSuccessEnvelope<WebUser[]>> {
  const response = await apiClient.api.users.$get()
  if (!response.ok) {
    throw new Error("Failed to fetch users.")
  }
  return (await response.json()) as WebSuccessEnvelope<WebUser[]>
}

export async function createUser(
  input: WebCreateUserInput
): Promise<WebSuccessEnvelope<WebUser>> {
  const response = await apiClient.api.users.$post({ json: input })
  if (!response.ok) {
    throw new Error("Failed to create user.")
  }
  return (await response.json()) as WebSuccessEnvelope<WebUser>
}
