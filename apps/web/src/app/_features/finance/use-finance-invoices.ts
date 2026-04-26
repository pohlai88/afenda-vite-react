import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useOptionalTenantIdHeaders } from "@/app/_platform/tenant/tenant-scope-context"

import {
  createFinanceInvoice,
  fetchFinanceInvoices,
  type CreateFinanceInvoiceInput,
} from "./finance.api"

export function createFinanceInvoicesQueryKey(tenantId: string | undefined) {
  return ["finance-invoices", tenantId ?? "session-default"] as const
}

export function useFinanceInvoices() {
  const tenantHeaders = useOptionalTenantIdHeaders()
  const tenantId = tenantHeaders["X-Tenant-Id"]
  const queryClient = useQueryClient()
  const queryKey = createFinanceInvoicesQueryKey(tenantId)

  const invoiceQuery = useQuery({
    queryKey,
    queryFn: () => fetchFinanceInvoices(tenantHeaders),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateFinanceInvoiceInput) =>
      createFinanceInvoice(payload, tenantHeaders),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey,
      })
    },
  })

  return {
    ...invoiceQuery,
    createInvoice: createMutation.mutateAsync,
    isCreatingInvoice: createMutation.isPending,
  }
}
