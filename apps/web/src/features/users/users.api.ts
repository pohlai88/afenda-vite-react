/**
 * Typed Hono RPC calls for `/api/users` (pack layout).
 * platform · features · users · api
 * Imports `../../api-client/web-*` directly (not `@/api-client`) to avoid a barrel ↔ `web-users` circular dependency.
 * Upstream: `api-client/web-*`, `web-client` `apiClient`.
 * @module features/users/users.api
 * @package @afenda/web
 */
import { apiClient } from "../../api-client/web-client"
import type { WebSuccessEnvelope } from "../../api-client/web-envelope"
import type { WebCreateUserInput, WebUser } from "../../api-client/web-user"

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
