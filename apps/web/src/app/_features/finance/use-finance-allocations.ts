import { useQuery } from "@tanstack/react-query"

import { useOptionalTenantIdHeaders } from "@/app/_platform/tenant/tenant-scope-context"

import { fetchFinanceAllocations } from "./finance.api"

export function createFinanceAllocationsQueryKey(tenantId: string | undefined) {
  return ["finance-allocations", tenantId ?? "session-default"] as const
}

export function useFinanceAllocations() {
  const tenantHeaders = useOptionalTenantIdHeaders()
  const tenantId = tenantHeaders["X-Tenant-Id"]

  return useQuery({
    queryKey: createFinanceAllocationsQueryKey(tenantId),
    queryFn: () => fetchFinanceAllocations(tenantHeaders),
  })
}
