import { getSharedApiClient, resolveApiV1Path } from "@/app/_platform/runtime"

import type {
  OpsAuditFeedResponse,
  OpsCounterpartyFeedResponse,
  OpsEventsWorkspaceFeedResponse,
} from "../types/workspace-ops"

export interface OpsCommandExecutionReceipt {
  readonly truthRecordId: string
}

export async function fetchOpsEventsWorkspaceFeed(
  tenantHeaders: Record<string, string>
): Promise<OpsEventsWorkspaceFeedResponse> {
  const client = getSharedApiClient()
  return client.get<OpsEventsWorkspaceFeedResponse>(
    resolveApiV1Path("/ops/events-workspace"),
    {
      headers: tenantHeaders,
    }
  )
}

export async function fetchOpsAuditFeed(
  tenantHeaders: Record<string, string>,
  options: {
    readonly limit?: number
    readonly before?: string
  } = {}
): Promise<OpsAuditFeedResponse> {
  const query = new URLSearchParams()

  if (options.limit !== undefined) {
    query.set("limit", String(options.limit))
  }

  if (options.before) {
    query.set("before", options.before)
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : ""
  const client = getSharedApiClient()

  return client.get<OpsAuditFeedResponse>(
    `${resolveApiV1Path("/ops/audit")}${suffix}`,
    {
      headers: tenantHeaders,
    }
  )
}

export async function fetchOpsCounterpartyFeed(
  tenantHeaders: Record<string, string>
): Promise<OpsCounterpartyFeedResponse> {
  const client = getSharedApiClient()
  return client.get<OpsCounterpartyFeedResponse>(
    resolveApiV1Path("/ops/counterparties"),
    {
      headers: tenantHeaders,
    }
  )
}

export async function claimWorkspaceEvent(
  eventId: string,
  tenantHeaders: Record<string, string>
): Promise<OpsCommandExecutionReceipt> {
  const client = getSharedApiClient()
  return client.post<OpsCommandExecutionReceipt>(
    resolveApiV1Path("/commands/execute"),
    {
      type: "ops.event.claim",
      payload: {
        eventId,
      },
    },
    {
      headers: tenantHeaders,
    }
  )
}

export async function advanceWorkspaceEvent(
  eventId: string,
  tenantHeaders: Record<string, string>
): Promise<OpsCommandExecutionReceipt> {
  const client = getSharedApiClient()
  return client.post<OpsCommandExecutionReceipt>(
    resolveApiV1Path("/commands/execute"),
    {
      type: "ops.event.advance",
      payload: {
        eventId,
      },
    },
    {
      headers: tenantHeaders,
    }
  )
}
