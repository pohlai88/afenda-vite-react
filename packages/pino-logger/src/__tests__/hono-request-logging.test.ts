import { PassThrough } from "node:stream"

import { Hono } from "hono"
import type { Context } from "hono"
import { describe, expect, it } from "vitest"

import {
  createHonoRequestLoggingMiddleware,
  getRequestLogger,
} from "../hono-request-logging.js"
import type { AppLogger } from "../pino-log-contract.js"
import { createServiceLogger } from "../pino-root-logger.js"

type TestSession = {
  authenticated: boolean
  authSessionId: string | null
  userId: string | null
  membershipId: string | null
  tenantId: string | null
}

type TestVariables = {
  requestId: string
  session: TestSession
  logger: AppLogger
}

async function flushLogOutput() {
  await new Promise((resolve) => setImmediate(resolve))
}

describe("getRequestLogger", () => {
  it("returns the fallback logger when request scope has no logger", () => {
    const fallback = createServiceLogger({
      service: "@afenda/pino-logger-fallback",
      environment: "test",
      destination: new PassThrough(),
    })

    const contextWithoutLogger = {
      get: () => undefined,
    } as unknown as Context

    expect(getRequestLogger(contextWithoutLogger, fallback)).toBe(fallback)
  })

  it("returns the request logger when one is already bound", () => {
    const fallback = createServiceLogger({
      service: "@afenda/pino-logger-fallback",
      environment: "test",
      destination: new PassThrough(),
    })
    const requestLogger = createServiceLogger({
      service: "@afenda/pino-logger-request",
      environment: "test",
      destination: new PassThrough(),
    })

    const contextWithLogger = {
      get: (key: string) => (key === "logger" ? requestLogger : undefined),
    } as unknown as Context

    expect(getRequestLogger(contextWithLogger, fallback)).toBe(requestLogger)
  })
})

describe("createHonoRequestLoggingMiddleware", () => {
  it("binds request and session metadata to the request completion log", async () => {
    const destination = new PassThrough()
    let output = ""

    destination.on("data", (chunk) => {
      output += chunk.toString()
    })

    const rootLogger = createServiceLogger({
      service: "@afenda/pino-logger-request-test",
      environment: "test",
      destination,
    })

    const app = new Hono<{ Variables: TestVariables }>()
    let loggerSeenInHandler: AppLogger | undefined

    app.use("*", async (context, next) => {
      context.set("requestId", "req-123")
      context.set("session", {
        authenticated: true,
        authSessionId: "auth-session-1",
        userId: "user-1",
        membershipId: "member-1",
        tenantId: "tenant-1",
      })

      await next()
    })

    app.use(
      "*",
      createHonoRequestLoggingMiddleware({
        rootLogger,
        getBindings: (context) => {
          const session = context.get("session")

          return {
            authenticated: session.authenticated,
            ...(session.authSessionId
              ? { authSessionId: session.authSessionId }
              : {}),
            ...(session.userId ? { userId: session.userId } : {}),
            ...(session.membershipId
              ? { membershipId: session.membershipId }
              : {}),
            ...(session.tenantId ? { tenantId: session.tenantId } : {}),
          }
        },
      })
    )

    app.get("/bound", (context) => {
      loggerSeenInHandler = getRequestLogger(context, rootLogger)
      return context.json({ ok: true })
    })

    const response = await app.request("/bound")

    expect(response.status).toBe(200)
    expect(loggerSeenInHandler).toBeDefined()
    expect(loggerSeenInHandler).not.toBe(rootLogger)

    await flushLogOutput()

    const [line] = output
      .trim()
      .split("\n")
      .filter((candidate) => candidate.length > 0)
    const entry = JSON.parse(line) as Record<string, unknown>

    expect(entry.msg).toBe("request completed")
    expect(entry.requestId).toBe("req-123")
    expect(entry.method).toBe("GET")
    expect(entry.path).toBe("/bound")
    expect(entry.statusCode).toBe(200)
    expect(entry.authenticated).toBe(true)
    expect(entry.authSessionId).toBe("auth-session-1")
    expect(entry.userId).toBe("user-1")
    expect(entry.membershipId).toBe("member-1")
    expect(entry.tenantId).toBe("tenant-1")
  })
})
