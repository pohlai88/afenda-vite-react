import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../app.js"
import {
  resetBetterAuthRuntimeForTests,
  setBetterAuthRuntimeForTests,
} from "../lib/better-auth-runtime.js"
import {
  __resetOpsProjectionStoreForTests,
  __seedOpsProjectionStoreForTests,
  claimStateForActor,
  persistOpsMutation,
  readOpsEventProjection,
} from "../modules/operations/ops.projection.js"
import {
  createAnonymousSessionContext,
  setSessionContext,
} from "../middleware/request-context.js"
import { __resetUsersForTests } from "../modules/users/user.service.js"

function createRuntimeOverride(input?: {
  getSession?: () => Promise<unknown>
  listSessions?: () => Promise<unknown[]>
  listTenantCandidates?: () => Promise<{
    afendaUserId: string
    defaultTenantId: string | null
    candidates: Array<{
      tenantId: string
      membershipId: string
      tenantName: string
      tenantCode: string
      isDefault: boolean
    }>
  }>
  revokeSession?: (input: { body: { token: string } }) => Promise<unknown>
  activateTenantContext?: (input: {
    headers: Headers
    activeTenantId?: string | null
  }) => Promise<{
    context: {
      authProvider: string
      authUserId: string
      authSessionId: string | null
      afendaUserId: string
      tenantId: string
      membershipId: string
    }
    outgoingHeaders: Headers
  }>
  resolveCommandAuthority?: (input: { tenantId: string }) => Promise<{
    roles: readonly string[]
    permissions: readonly string[]
  }>
  capabilityHooks?: {
    passkeyEnabled: boolean
    mfaEnabled: boolean
    magicLinkEnabled: boolean
    agentAuthEnabled: boolean
    stepUpPolicy: "off" | "risk_based"
    googleOneTapEnabled: boolean
    allPluginsEnabled: boolean
  }
}) {
  return {
    auth: {
      handler: async () =>
        new Response(JSON.stringify({ ok: true, auth: "handler" }), {
          headers: {
            "content-type": "application/json",
          },
        }),
      api: {
        getSession: input?.getSession ?? (async () => null),
        listSessions: input?.listSessions ?? (async () => []),
        revokeSession: input?.revokeSession ?? (async () => ({ status: true })),
      },
    } as never,
    db: null as never,
    resolveCommandAuthority: input?.resolveCommandAuthority
      ? async ({
          tenantId,
        }: {
          session: {
            authenticated: boolean
            authSessionId: string | null
            userId: string | null
            membershipId: string | null
            tenantId: string | null
          }
          tenantId: string
          actorLabel: string
          requestId?: string
        }) =>
          input.resolveCommandAuthority?.({ tenantId }) ?? {
            roles: ["workspace_admin"],
            permissions: [],
          }
      : undefined,
    capabilityHooks: {
      passkeyEnabled: true,
      mfaEnabled: true,
      magicLinkEnabled: true,
      agentAuthEnabled: true,
      stepUpPolicy: "risk_based" as const,
      googleOneTapEnabled: false,
      allPluginsEnabled: true,
      ...input?.capabilityHooks,
    },
    listTenantCandidates:
      input?.listTenantCandidates ??
      (async () => ({
        afendaUserId: "afenda-user-1",
        defaultTenantId: "tenant-1",
        candidates: [
          {
            tenantId: "tenant-1",
            membershipId: "membership-1",
            tenantName: "Acme Operations",
            tenantCode: "ACME",
            isDefault: true,
          },
          {
            tenantId: "tenant-2",
            membershipId: "membership-2",
            tenantName: "Acme Supply",
            tenantCode: "ACME-SUPPLY",
            isDefault: false,
          },
        ],
      })),
    activateTenantContext:
      input?.activateTenantContext ??
      (async () => ({
        context: {
          authProvider: "better-auth",
          authUserId: "user-1",
          authSessionId: "auth-session-1",
          afendaUserId: "afenda-user-1",
          tenantId: "tenant-1",
          membershipId: "membership-1",
        },
        outgoingHeaders: new Headers({
          "set-cookie": "better-auth.session=updated; Path=/; HttpOnly",
        }),
      })),
  }
}

describe("createApp (scaffold)", () => {
  beforeEach(() => {
    __resetUsersForTests()
    __resetOpsProjectionStoreForTests()
    setBetterAuthRuntimeForTests(createRuntimeOverride())
    process.env.DATABASE_URL ??=
      "postgresql://afenda:afenda@localhost:5432/afenda"
    process.env.BETTER_AUTH_SECRET ??= "a".repeat(32)
    process.env.BETTER_AUTH_URL ??= "http://localhost:5173"
  })

  afterEach(async () => {
    await resetBetterAuthRuntimeForTests()
  })
  it("GET /health returns ok", async () => {
    const app = createApp()
    const res = await app.request("/health")
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok?: boolean
      data?: { status?: string }
    }
    expect(body.ok).toBe(true)
    expect(body.data?.status).toBe("ok")
  })

  it("GET / returns service map", async () => {
    const app = createApp()
    const res = await app.request("/")
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok?: boolean
      data?: { service?: string; runtime?: string; version?: string }
    }
    expect(body.ok).toBe(true)
    expect(body.data?.service).toBe("@afenda/api")
    expect(body.data?.runtime).toBe("node")
    expect(typeof body.data?.version).toBe("string")
  })

  it("GET /api/users returns an empty list initially", async () => {
    const app = createApp()
    const res = await app.request("/api/users")
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok?: boolean; data?: unknown[] }
    expect(body.ok).toBe(true)
    expect(body.data).toEqual([])
  })

  it("POST /api/users accepts valid JSON and returns User", async () => {
    const app = createApp()
    const res = await app.request("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", name: "Ada" }),
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as {
      ok?: boolean
      data?: { id?: string; email?: string; name?: string }
    }
    expect(body.ok).toBe(true)
    expect(body.data?.email).toBe("user@example.com")
    expect(body.data?.name).toBe("Ada")
    expect(body.data?.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it("GET /api/users lists users after create", async () => {
    const app = createApp()
    await app.request("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "list@example.com", name: "Bob" }),
    })
    const res = await app.request("/api/users")
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok?: boolean
      data?: Array<{ email?: string; name?: string }>
    }
    expect(body.ok).toBe(true)
    expect(body.data).toHaveLength(1)
    expect(body.data?.[0]?.email).toBe("list@example.com")
    expect(body.data?.[0]?.name).toBe("Bob")
  })

  it("POST /api/users returns 400 when body fails Zod validation", async () => {
    const app = createApp()
    const res = await app.request("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", name: "" }),
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { success?: boolean }
    expect(body.success).toBe(false)
  })

  it("request context session sync helper updates both session surfaces", async () => {
    const app = createApp()

    app.use("/sync-check", async (c, next) => {
      const session = {
        ...createAnonymousSessionContext(),
        authenticated: true,
        authSessionId: "auth-session-1",
        userId: "user-1",
        membershipId: "member-1",
        tenantId: "tenant-1",
      }

      setSessionContext(c, session)

      await next()
    })

    app.get("/sync-check", (c) =>
      c.json({
        session: c.get("session"),
        requestContext: c.get("requestContext"),
      })
    )

    const res = await app.request("/sync-check")

    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      session: { authSessionId?: string; userId?: string; tenantId?: string }
      requestContext: {
        session?: { authSessionId?: string; userId?: string; tenantId?: string }
      }
    }

    expect(body.session.authSessionId).toBe("auth-session-1")
    expect(body.requestContext.session?.authSessionId).toBe("auth-session-1")
    expect(body.requestContext.session?.userId).toBe("user-1")
    expect(body.requestContext.session?.tenantId).toBe("tenant-1")
  })

  it("forwards /api/auth/* requests to the Better Auth handler", async () => {
    const app = createApp()
    const res = await app.request("/api/auth/test-probe")

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ ok: true, auth: "handler" })
  })

  it("hydrates request context from Better Auth sessions on /api/* routes", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            emailVerified: true,
          },
        }),
      })
    )

    const app = createApp()

    app.get("/api/context-check", (c) =>
      c.json({
        session: c.get("session"),
        requestContext: c.get("requestContext"),
      })
    )

    const res = await app.request("/api/context-check")

    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      session: {
        authenticated: boolean
        authSessionId: string
        userId: string
        membershipId: string
        tenantId: string
      }
      requestContext: {
        session: {
          authSessionId: string
          tenantId: string
        }
      }
    }

    expect(body.session.authenticated).toBe(true)
    expect(body.session.authSessionId).toBe("auth-session-1")
    expect(body.session.userId).toBe("user-1")
    expect(body.session.membershipId).toBe("membership-1")
    expect(body.session.tenantId).toBe("tenant-1")
    expect(body.requestContext.session.authSessionId).toBe("auth-session-1")
    expect(body.requestContext.session.tenantId).toBe("tenant-1")
  })

  it("auto-activates tenant context for authenticated sessions missing an active tenant lens", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: null,
            activeMembershipId: null,
          },
          user: {
            id: "user-1",
            emailVerified: true,
          },
        }),
      })
    )

    const app = createApp()

    app.get("/api/context-check", (c) =>
      c.json({
        session: c.get("session"),
      })
    )

    const activated = await app.request("/api/context-check")

    expect(activated.status).toBe(200)
    expect(activated.headers.get("set-cookie")).toContain(
      "better-auth.session=updated"
    )

    const body = (await activated.json()) as {
      session: {
        tenantId: string
        membershipId: string
      }
    }

    expect(body.session.tenantId).toBe("tenant-1")
    expect(body.session.membershipId).toBe("membership-1")
  })

  it("GET /api/v1/auth/intelligence returns a session-aware snapshot", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            emailVerified: true,
          },
        }),
        listSessions: async () => [
          {
            id: "auth-session-1",
            token: "token-current",
            createdAt: new Date("2026-04-20T08:00:00.000Z"),
            updatedAt: new Date("2026-04-22T09:30:00.000Z"),
            userAgent: "Mozilla/5.0 Chrome/135.0",
            ipAddress: "10.22.44.99",
          },
        ],
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/auth/intelligence")

    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      data: {
        trustLevel: string
        passkeyAvailable: boolean
        stepUpPolicy: string
        reasons: Array<{ code: string }>
      }
      meta: { requestId?: string }
    }

    expect(body.data.trustLevel).toBe("verified")
    expect(body.data.passkeyAvailable).toBe(true)
    expect(body.data.stepUpPolicy).toBe("risk_based")
    expect(
      body.data.reasons.some(
        (reason) => reason.code === "auth.step_up.risk_based"
      )
    ).toBe(true)
    expect(typeof body.meta.requestId).toBe("string")
  })

  it("GET /api/v1/auth/sessions returns mapped Better Auth sessions", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            emailVerified: true,
          },
        }),
        listSessions: async () => [
          {
            id: "auth-session-1",
            token: "token-current",
            createdAt: new Date("2026-04-20T08:00:00.000Z"),
            updatedAt: new Date("2026-04-22T09:30:00.000Z"),
            userAgent: "Mozilla/5.0 Chrome/135.0",
            ipAddress: "10.22.44.99",
          },
          {
            id: "auth-session-2",
            token: "token-other",
            createdAt: new Date("2026-04-19T05:30:00.000Z"),
            updatedAt: new Date("2026-04-21T06:15:00.000Z"),
            userAgent: null,
            ipAddress: null,
          },
        ],
        capabilityHooks: {
          passkeyEnabled: true,
          mfaEnabled: false,
          magicLinkEnabled: true,
          agentAuthEnabled: true,
          stepUpPolicy: "off",
          googleOneTapEnabled: false,
          allPluginsEnabled: true,
        },
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/auth/sessions")

    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      data: {
        sessions: Array<{
          id: string
          isCurrent: boolean
          risk: string
        }>
        factors: {
          passkey: boolean
          mfa: boolean
        }
      }
    }

    expect(body.data.sessions).toHaveLength(2)
    expect(body.data.sessions[0]).toMatchObject({
      id: "auth-session-1",
      isCurrent: true,
      risk: "low",
    })
    expect(body.data.sessions[1]).toMatchObject({
      id: "auth-session-2",
      isCurrent: false,
      risk: "high",
    })
    expect(body.data.factors.passkey).toBe(true)
    expect(body.data.factors.mfa).toBe(false)
  })

  it("POST /api/v1/auth/sessions/revoke revokes a non-current session by token", async () => {
    const revokedTokens: string[] = []

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            emailVerified: true,
          },
        }),
        listSessions: async () => [
          {
            id: "auth-session-1",
            token: "token-current",
            createdAt: new Date("2026-04-20T08:00:00.000Z"),
            updatedAt: new Date("2026-04-22T09:30:00.000Z"),
            userAgent: "Mozilla/5.0 Chrome/135.0",
            ipAddress: "10.22.44.99",
          },
          {
            id: "auth-session-2",
            token: "token-other",
            createdAt: new Date("2026-04-19T05:30:00.000Z"),
            updatedAt: new Date("2026-04-21T06:15:00.000Z"),
            userAgent: null,
            ipAddress: null,
          },
        ],
        revokeSession: async ({ body }: { body: { token: string } }) => {
          revokedTokens.push(body.token)
          return { status: true }
        },
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/auth/sessions/revoke", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: "auth-session-2" }),
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      data: { revokedSessionId: "auth-session-2" },
    })
    expect(revokedTokens).toEqual(["token-other"])
  })

  it("POST /api/v1/auth/tenant-context/activate persists the tenant lens onto the auth session", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: null,
            activeMembershipId: null,
          },
          user: {
            id: "user-1",
            emailVerified: true,
          },
        }),
        activateTenantContext: async ({ activeTenantId }) => ({
          context: {
            authProvider: "better-auth",
            authUserId: "user-1",
            authSessionId: "auth-session-1",
            afendaUserId: "afenda-user-1",
            tenantId: activeTenantId ?? "tenant-1",
            membershipId: "membership-1",
          },
          outgoingHeaders: new Headers({
            "set-cookie": "better-auth.session=activated; Path=/; HttpOnly",
          }),
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/auth/tenant-context/activate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ activeTenantId: "tenant-7" }),
    })

    expect(res.status).toBe(200)
    expect(res.headers.get("set-cookie")).toContain(
      "better-auth.session=activated"
    )
    await expect(res.json()).resolves.toMatchObject({
      data: {
        activated: true,
        authSessionId: "auth-session-1",
        tenantId: "tenant-7",
        membershipId: "membership-1",
        afendaUserId: "afenda-user-1",
      },
    })
  })

  it("GET /api/v1/auth/tenant-context/candidates returns named tenant choices", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: null,
            activeMembershipId: null,
          },
          user: {
            id: "user-1",
            emailVerified: true,
          },
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/auth/tenant-context/candidates")

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      data: {
        authSessionId: "auth-session-1",
        afendaUserId: "afenda-user-1",
        defaultTenantId: "tenant-1",
        candidates: [
          {
            tenantId: "tenant-1",
            tenantName: "Acme Operations",
            tenantCode: "ACME",
            isDefault: true,
          },
          {
            tenantId: "tenant-2",
            tenantName: "Acme Supply",
            tenantCode: "ACME-SUPPLY",
            isDefault: false,
          },
        ],
      },
    })
  })

  it("GET /api/v1/me returns the current Better Auth user and tenant context", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["workspace_admin"],
          permissions: [
            "ops:event:view",
            "ops:event:claim",
            "ops:event:advance",
            "ops:audit:view",
            "admin:workspace:manage",
          ],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/me")

    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      betterAuth?: {
        user?: { email?: string; name?: string }
        session?: { activeTenantId?: string }
      }
      afenda?: {
        afendaUserId?: string
        tenantIds?: string[]
        defaultTenantId?: string
      }
      actor?: { roles?: string[]; permissions?: string[] }
      truthContext?: { enabledModules?: string[]; commandMatrix?: unknown[] }
    }

    expect(body.betterAuth?.user?.email).toBe("operator@acme.test")
    expect(body.betterAuth?.user?.name).toBe("Rhea Coleman")
    expect(body.betterAuth?.session?.activeTenantId).toBe("tenant-1")
    expect(body.afenda?.defaultTenantId).toBe("tenant-1")
    expect(body.afenda?.tenantIds).toEqual(["tenant-1", "tenant-2"])
    expect(body.actor?.permissions).toContain("ops:event:claim")
    expect(body.truthContext?.enabledModules).toEqual(["ops"])
    expect(body.truthContext?.commandMatrix).toHaveLength(2)
  })

  it("GET /api/v1/ops/workspace returns an empty workspace when no ops projection exists", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["ops_viewer"],
          permissions: ["ops:event:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/workspace")

    expect(res.status).toBe(200)
    expect(res.headers.get("deprecation")).toBe("true")
    expect(res.headers.get("x-afenda-legacy-surface")).toBe(
      "ops-workspace-snapshot"
    )
    await expect(res.json()).resolves.toMatchObject({
      workspace: {
        tenantId: "tenant-1",
        tenantName: "Acme Operations",
      },
      events: [],
      auditEntries: [],
      counterparties: [],
    })
  })

  it("GET /api/v1/ops/workspace forbids actors without workspace read permission", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["ops_viewer"],
          permissions: [],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/workspace")

    expect(res.status).toBe(403)
  })

  it("GET /api/v1/ops/workspace hides audit entries when audit permission is absent", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["ops_viewer"],
          permissions: ["ops:event:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/workspace")

    expect(res.status).toBe(200)
    expect(res.headers.get("deprecation")).toBe("true")
    expect(res.headers.get("x-afenda-legacy-surface")).toBe(
      "ops-workspace-snapshot"
    )
    await expect(res.json()).resolves.toMatchObject({
      events: expect.any(Array),
      auditEntries: [],
    })
  })

  it("GET /api/v1/ops/events-workspace returns a tenant-scoped events surface without workspace preload", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["ops_viewer"],
          permissions: ["ops:event:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/events-workspace")

    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      eventsWorkspace: { tenantId: string; tenantName: string }
      events: Array<{ id: string; counterpartyId: string | null }>
      counterparties: Array<{ id: string; name: string }>
      recentAuditEntries: unknown[]
    }

    expect(body.eventsWorkspace.tenantId).toBe("tenant-1")
    expect(body.eventsWorkspace.tenantName).toBe("Acme Operations")
    expect(body.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "evt-4301",
          counterpartyId: "counterparty-northstar",
        }),
      ])
    )
    expect(body.counterparties).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "counterparty-northstar",
          name: "Northstar Logistics",
        }),
      ])
    )
    expect(body.recentAuditEntries).toEqual([])
  })

  it("GET /api/v1/ops/events-workspace forbids actors without workspace read permission", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["auditor"],
          permissions: ["ops:audit:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/events-workspace")

    expect(res.status).toBe(403)
  })

  it("GET /api/v1/ops/audit returns a tenant-scoped truth feed without workspace preload", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["auditor"],
          permissions: ["ops:audit:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/audit?limit=1")

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      audit: {
        tenantId: "tenant-1",
        tenantName: "Acme Operations",
      },
      entries: [
        {
          tenantId: "tenant-1",
          commandType: "ops.event.bootstrap",
          eventCode: "EVT-4301",
          actionLabel: "Bootstrapped",
        },
      ],
      page: {
        limit: 1,
        nextBefore: expect.any(String),
      },
    })
  })

  it("GET /api/v1/ops/counterparties returns a tenant-scoped operating feed without workspace preload", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["ops_viewer"],
          permissions: ["ops:event:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/counterparties")

    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      counterparties: { tenantId: string; tenantName: string }
      items: Array<{ id: string; name: string }>
      events: Array<{ id: string; counterpartyId: string | null }>
    }

    expect(body.counterparties.tenantId).toBe("tenant-1")
    expect(body.counterparties.tenantName).toBe("Acme Operations")
    expect(body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "counterparty-atlas",
          name: "Atlas Commerce",
        }),
      ])
    )
    expect(body.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "evt-4301",
          counterpartyId: "counterparty-northstar",
        }),
      ])
    )
  })

  it("GET /api/v1/ops/counterparties forbids actors without workspace read permission", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["auditor"],
          permissions: ["ops:audit:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/counterparties")

    expect(res.status).toBe(403)
  })

  it("GET /api/v1/ops/audit returns an explicit empty success state for tenants without truth rows", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["auditor"],
          permissions: ["ops:audit:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/audit")

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      audit: {
        tenantId: "tenant-1",
      },
      entries: [],
      page: {
        limit: 20,
        nextBefore: null,
      },
    })
  })

  it("GET /api/v1/ops/audit forbids actors without audit permission", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["ops_viewer"],
          permissions: ["ops:event:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/audit")

    expect(res.status).toBe(403)
  })

  it("GET /api/v1/ops/audit rejects invalid pagination cursors", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["auditor"],
          permissions: ["ops:audit:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/ops/audit?before=not-a-timestamp")

    expect(res.status).toBe(400)
  })

  it("POST /api/v1/commands/execute hides audit entries when the actor can mutate but not audit", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["ops_operator"],
          permissions: ["ops:event:view", "ops:event:claim"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/commands/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "ops.event.claim",
        payload: { eventId: "evt-4301" },
      }),
    })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      truthRecordId: expect.any(String),
    })

    const auditRes = await app.request("/api/v1/ops/audit")
    expect(auditRes.status).toBe(403)
  })

  it("POST /api/v1/commands/execute claims and advances an ops event through the truth spine", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["workspace_admin"],
          permissions: [
            "ops:event:view",
            "ops:event:claim",
            "ops:event:advance",
            "ops:audit:view",
            "admin:workspace:manage",
          ],
        }),
      })
    )

    const app = createApp()

    const initialRes = await app.request("/api/v1/ops/events-workspace")
    expect(initialRes.status).toBe(200)
    const initialBody = (await initialRes.json()) as {
      events: Array<{
        id: string
        ownerLabel: string | null
        stageLabel: string
      }>
      recentAuditEntries: Array<{ eventId: string; actionLabel: string }>
    }

    expect(initialBody.events[0]?.id).toBe("evt-4301")
    expect(initialBody.events[0]?.ownerLabel).toBeNull()

    const claimRes = await app.request("/api/v1/commands/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "ops.event.claim",
        payload: { eventId: "evt-4301" },
      }),
    })
    expect(claimRes.status).toBe(200)
    const claimBody = (await claimRes.json()) as {
      truthRecordId: string
    }

    expect(typeof claimBody.truthRecordId).toBe("string")
    const afterClaimRead = await app.request("/api/v1/ops/events-workspace")
    expect(afterClaimRead.status).toBe(200)
    const afterClaimBody = (await afterClaimRead.json()) as {
      events: Array<{ id: string; ownerLabel: string | null; status: string }>
      recentAuditEntries: Array<{ eventId: string; actionLabel: string }>
    }

    const claimedEvent = afterClaimBody.events.find(
      (event) => event.id === "evt-4301"
    )
    expect(claimedEvent?.ownerLabel).toBe("Rhea Coleman")
    expect(claimedEvent?.status).toBe("assigned")
    expect(
      afterClaimBody.recentAuditEntries.some(
        (entry) =>
          entry.eventId === "evt-4301" && entry.actionLabel === "Claimed event"
      )
    ).toBe(true)

    const advanceRes = await app.request("/api/v1/commands/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "ops.event.advance",
        payload: { eventId: "evt-4301" },
      }),
    })
    expect(advanceRes.status).toBe(200)
    const advanceBody = (await advanceRes.json()) as {
      truthRecordId: string
    }
    expect(typeof advanceBody.truthRecordId).toBe("string")

    const afterAdvanceRead = await app.request("/api/v1/ops/events-workspace")
    expect(afterAdvanceRead.status).toBe(200)
    const afterAdvanceBody = (await afterAdvanceRead.json()) as {
      events: Array<{ id: string; stageLabel: string; status: string }>
      recentAuditEntries: Array<{ eventId: string; actionLabel: string }>
    }

    const advancedEvent = afterAdvanceBody.events.find(
      (event) => event.id === "evt-4301"
    )
    expect(advancedEvent?.stageLabel).toBe("In progress")
    expect(
      afterAdvanceBody.recentAuditEntries.some(
        (entry) =>
          entry.eventId === "evt-4301" && entry.actionLabel === "Advanced stage"
      )
    ).toBe(true)
  })

  it("rejects forbidden commands when actor permissions do not include the command grant", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["ops_viewer"],
          permissions: ["ops:event:view"],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/commands/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "ops.event.advance",
        payload: { eventId: "evt-4301" },
      }),
    })

    expect(res.status).toBe(403)
  })

  it("rejects invalid transitions when advancing a draft event before it is claimed", async () => {
    __seedOpsProjectionStoreForTests()

    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
        resolveCommandAuthority: async () => ({
          roles: ["workspace_admin"],
          permissions: [
            "ops:event:view",
            "ops:event:claim",
            "ops:event:advance",
            "ops:audit:view",
            "admin:workspace:manage",
          ],
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/commands/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "ops.event.advance",
        payload: { eventId: "evt-4301" },
      }),
    })

    expect(res.status).toBe(409)
  })

  it("rejects commands when the requested tenant header does not match the active session tenant", async () => {
    setBetterAuthRuntimeForTests(
      createRuntimeOverride({
        getSession: async () => ({
          session: {
            id: "auth-session-1",
            activeTenantId: "tenant-1",
            activeMembershipId: "membership-1",
          },
          user: {
            id: "user-1",
            email: "operator@acme.test",
            emailVerified: true,
            name: "Rhea Coleman",
          },
        }),
      })
    )

    const app = createApp()
    const res = await app.request("/api/v1/commands/execute", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant-2",
      },
      body: JSON.stringify({
        type: "ops.event.claim",
        payload: { eventId: "evt-4301" },
      }),
    })

    expect(res.status).toBe(409)
  })

  it("rejects stale ops mutations when projection state has already changed", async () => {
    __seedOpsProjectionStoreForTests()

    const current = await readOpsEventProjection("tenant-1", "evt-4301")
    expect(current).not.toBeNull()

    const nextEvent = claimStateForActor(current!, "user-1", "Rhea Coleman")

    const buildTruthRecord = (actionLabel: string) => ({
      tenantId: "tenant-1",
      entityType: "ops_event",
      entityId: "evt-4301",
      commandType: "ops.event.claim",
      actorId: "user-1",
      timestamp: new Date(nextEvent.updatedAt),
      beforeState: {
        eventCode: current!.eventCode,
        state: current!.state,
        ownerActorId: current!.ownerActorId,
        ownerLabel: current!.ownerLabel,
      },
      afterState: {
        eventCode: nextEvent.eventCode,
        state: nextEvent.state,
        ownerActorId: nextEvent.ownerActorId,
        ownerLabel: nextEvent.ownerLabel,
      },
      metadata: {
        eventCode: nextEvent.eventCode,
        actionLabel,
      },
    })

    await expect(
      persistOpsMutation({
        tenantId: "tenant-1",
        expectedEvent: current!,
        nextEvent,
        truthRecord: buildTruthRecord("First claim"),
      })
    ).resolves.toMatch(/.+/)

    await expect(
      persistOpsMutation({
        tenantId: "tenant-1",
        expectedEvent: current!,
        nextEvent,
        truthRecord: buildTruthRecord("Stale claim"),
      })
    ).rejects.toThrow("ops_event_concurrency_conflict:evt-4301")
  })
})
