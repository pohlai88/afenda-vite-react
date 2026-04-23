import { useQuery } from "@tanstack/react-query"

import { useOptionalTenantIdHeaders } from "@/app/_platform/tenant"

import { fetchOpsAuditFeed } from "../services/workspace-ops.api"

export function createOpsAuditFeedQueryKey(input: {
  readonly tenantId: string | undefined
  readonly limit: number
}) {
  return [
    "ops-audit-feed",
    input.tenantId ?? "session-default",
    input.limit,
  ] as const
}

export function useOpsAuditFeed(options: { readonly limit?: number } = {}) {
  const tenantHeaders = useOptionalTenantIdHeaders()
  const tenantId = tenantHeaders["X-Tenant-Id"]
  const limit = options.limit ?? 20

  return useQuery({
    queryKey: createOpsAuditFeedQueryKey({ tenantId, limit }),
    queryFn: () => fetchOpsAuditFeed(tenantHeaders, { limit }),
  })
}
