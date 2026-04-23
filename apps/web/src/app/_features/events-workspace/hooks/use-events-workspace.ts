import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useOptionalTenantIdHeaders } from "@/app/_platform/tenant"

import {
  advanceWorkspaceEvent,
  claimWorkspaceEvent,
  fetchOpsEventsWorkspaceFeed,
} from "../services/workspace-ops.api"
import { createOpsAuditFeedQueryKey } from "./use-ops-audit-feed"
import { createOpsCounterpartyFeedQueryKey } from "./use-ops-counterparty-feed"

function createWorkspaceOpsQueryKey(tenantId: string | undefined) {
  return ["ops-events-workspace-feed", tenantId ?? "session-default"] as const
}

export function useEventsWorkspace() {
  const tenantHeaders = useOptionalTenantIdHeaders()
  const queryClient = useQueryClient()
  const tenantId = tenantHeaders["X-Tenant-Id"]
  const queryKey = createWorkspaceOpsQueryKey(tenantId)

  const snapshotQuery = useQuery({
    queryKey,
    queryFn: () => fetchOpsEventsWorkspaceFeed(tenantHeaders),
  })

  const claimMutation = useMutation({
    mutationFn: (eventId: string) =>
      claimWorkspaceEvent(eventId, tenantHeaders),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey,
      })
      void queryClient.invalidateQueries({
        queryKey: createOpsAuditFeedQueryKey({ tenantId, limit: 20 }),
      })
      void queryClient.invalidateQueries({
        queryKey: createOpsCounterpartyFeedQueryKey(tenantId),
      })
    },
  })

  const advanceMutation = useMutation({
    mutationFn: (eventId: string) =>
      advanceWorkspaceEvent(eventId, tenantHeaders),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey,
      })
      void queryClient.invalidateQueries({
        queryKey: createOpsAuditFeedQueryKey({ tenantId, limit: 20 }),
      })
      void queryClient.invalidateQueries({
        queryKey: createOpsCounterpartyFeedQueryKey(tenantId),
      })
    },
  })

  return {
    ...snapshotQuery,
    claimEvent: claimMutation.mutateAsync,
    advanceEvent: advanceMutation.mutateAsync,
    isClaimingEvent: claimMutation.isPending,
    isAdvancingEvent: advanceMutation.isPending,
  }
}
