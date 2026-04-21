import { PassThrough } from "node:stream"

import { describe, expect, it } from "vitest"

import { createServiceLogger } from "../pino-root-logger.js"

async function collectLogEntry(
  writeEntry: (logger: ReturnType<typeof createServiceLogger>) => void
) {
  const destination = new PassThrough()
  let output = ""

  destination.on("data", (chunk) => {
    output += chunk.toString()
  })

  const logger = createServiceLogger({
    service: "@afenda/pino-logger-test",
    environment: "test",
    destination,
  })

  writeEntry(logger)

  await new Promise((resolve) => setImmediate(resolve))

  const [line] = output
    .trim()
    .split("\n")
    .filter((candidate) => candidate.length > 0)

  return JSON.parse(line) as Record<string, unknown>
}

describe("createServiceLogger", () => {
  it("redacts sensitive fields while preserving base metadata", async () => {
    const entry = await collectLogEntry((logger) => {
      logger.info(
        {
          authorization: "Bearer top-secret",
          headers: { authorization: "Bearer nested-secret" },
          nested: { token: "123456" },
        },
        "redaction check"
      )
    })

    expect(entry.msg).toBe("redaction check")
    expect(entry.service).toBe("@afenda/pino-logger-test")
    expect(entry.environment).toBe("test")
    expect(entry.authorization).toBe("[REDACTED]")
    expect(entry.headers).toMatchObject({ authorization: "[REDACTED]" })
    expect(entry.nested).toMatchObject({ token: "[REDACTED]" })
  })
})
