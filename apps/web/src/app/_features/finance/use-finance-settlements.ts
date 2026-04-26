import { useQuery } from "@tanstack/react-query"

import { useOptionalTenantIdHeaders } from "@/app/_platform/tenant/tenant-scope-context"

import { fetchFinanceSettlements } from "./finance.api"

export function createFinanceSettlementsQueryKey(tenantId: string | undefined) {
  return ["finance-settlements", tenantId ?? "session-default"] as const
}

export function useFinanceSettlements() {
  const tenantHeaders = useOptionalTenantIdHeaders()
  const tenantId = tenantHeaders["X-Tenant-Id"]

  return useQuery({
    queryKey: createFinanceSettlementsQueryKey(tenantId),
    queryFn: () => fetchFinanceSettlements(tenantHeaders),
  })
}
