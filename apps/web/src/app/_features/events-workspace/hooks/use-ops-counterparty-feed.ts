import { useQuery } from "@tanstack/react-query"

import { useOptionalTenantIdHeaders } from "@/app/_platform/tenant/tenant-scope-context"

import { fetchOpsCounterpartyFeed } from "../services/workspace-ops.api"

export function createOpsCounterpartyFeedQueryKey(
  tenantId: string | undefined
) {
  return ["ops-counterparty-feed", tenantId ?? "session-default"] as const
}

export function useOpsCounterpartyFeed() {
  const tenantHeaders = useOptionalTenantIdHeaders()
  const tenantId = tenantHeaders["X-Tenant-Id"]

  return useQuery({
    queryKey: createOpsCounterpartyFeedQueryKey(tenantId),
    queryFn: () => fetchOpsCounterpartyFeed(tenantHeaders),
  })
}
