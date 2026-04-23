import { and, eq } from "drizzle-orm"

import { type DatabaseClient } from "@afenda/database"
import { tenantRoleAssignments, tenantRoles } from "@afenda/database/schema"

import type { SessionContext } from "../contract/request-context.js"
import { getBetterAuthRuntime } from "../lib/better-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../lib/env.js"
import type { CommandExecutionRequest } from "./command-contracts.js"
import { rolePermissionCatalog } from "./command-matrix.js"
import { commandRegistry } from "./command-registry.js"

export interface CommandExecutionContext {
  readonly actorId: string
  readonly actorLabel: string
  readonly membershipId: string | null
  readonly tenantId: string
  readonly roles: readonly string[]
  readonly permissions: readonly string[]
  readonly requestId?: string
}

export interface CommandExecutionResult {
  readonly truthRecordId: string
}

async function resolveRoleCodes(
  db: DatabaseClient,
  tenantId: string,
  membershipId: string
): Promise<string[]> {
  const rows = await db
    .select({
      roleCode: tenantRoles.roleCode,
    })
    .from(tenantRoleAssignments)
    .innerJoin(
      tenantRoles,
      and(
        eq(tenantRoles.id, tenantRoleAssignments.tenantRoleId),
        eq(tenantRoles.tenantId, tenantRoleAssignments.tenantId)
      )
    )
    .where(
      and(
        eq(tenantRoleAssignments.tenantId, tenantId),
        eq(tenantRoleAssignments.tenantMembershipId, membershipId)
      )
    )

  return rows.map((row: { roleCode: string }) => row.roleCode)
}

function resolvePermissionsFromRoles(roleCodes: readonly string[]): string[] {
  if (roleCodes.length === 0) {
    return []
  }

  return [
    ...new Set(roleCodes.flatMap((role) => rolePermissionCatalog[role] ?? [])),
  ]
}

export async function resolveActorAuthorityForTenant(input: {
  session: SessionContext
  tenantId: string
  actorLabel: string
  requestId?: string
}): Promise<CommandExecutionContext> {
  const { session, tenantId } = input

  if (!session.authenticated || !session.userId) {
    throw new Error("command_auth_required")
  }

  const actorId = session.userId
  const membershipId = session.membershipId

  if (hasBetterAuthRuntimeEnv()) {
    const runtime = getBetterAuthRuntime() as ReturnType<
      typeof getBetterAuthRuntime
    > & {
      db?: DatabaseClient
    }

    if (runtime.resolveCommandAuthority) {
      const authority = await runtime.resolveCommandAuthority({
        session,
        tenantId,
        actorLabel: input.actorLabel,
        requestId: input.requestId,
      })

      return {
        actorId,
        actorLabel: input.actorLabel,
        membershipId,
        tenantId,
        roles: [...authority.roles],
        permissions: [...authority.permissions],
        requestId: input.requestId,
      }
    }

    if (!membershipId || !runtime.db) {
      return {
        actorId,
        actorLabel: input.actorLabel,
        membershipId,
        tenantId,
        roles: [],
        permissions: [],
        requestId: input.requestId,
      }
    }

    const roles = await resolveRoleCodes(runtime.db, tenantId, membershipId)

    return {
      actorId,
      actorLabel: input.actorLabel,
      membershipId,
      tenantId,
      roles,
      permissions: resolvePermissionsFromRoles(roles),
      requestId: input.requestId,
    }
  }

  if (!membershipId) {
    return {
      actorId,
      actorLabel: input.actorLabel,
      membershipId,
      tenantId,
      roles: [],
      permissions: [],
      requestId: input.requestId,
    }
  }

  return {
    actorId,
    actorLabel: input.actorLabel,
    membershipId,
    tenantId,
    roles: [],
    permissions: [],
    requestId: input.requestId,
  }
}

export async function executeCommand(input: {
  request: CommandExecutionRequest
  session: SessionContext
  tenantId: string
  actorLabel: string
  requestId?: string
}): Promise<CommandExecutionResult> {
  const registration = commandRegistry[input.request.type]
  if (!registration) {
    throw new Error(`unknown_command:${input.request.type}`)
  }

  const context = await resolveActorAuthorityForTenant({
    session: input.session,
    tenantId: input.tenantId,
    actorLabel: input.actorLabel,
    requestId: input.requestId,
  })

  if (!context.permissions.includes(registration.permission)) {
    throw new Error(`command_forbidden:${registration.permission}`)
  }

  const result = await registration.execute(context, input.request.payload)

  return result
}
