import { PassThrough } from "node:stream"

import { describe, expect, it } from "vitest"

import { createServiceLogger } from "../pino-root-logger.js"
import { timeAsyncOperation } from "../timed-operation.js"

async function collectLines(
  writer: (logger: ReturnType<typeof createServiceLogger>) => Promise<void>
) {
  const destination = new PassThrough()
  let output = ""

  destination.on("data", (chunk) => {
    output += chunk.toString()
  })

  const logger = createServiceLogger({
    service: "@afenda/pino-logger-timed-test",
    environment: "test",
    destination,
    level: "debug",
  })

  await writer(logger)
  await new Promise((resolve) => setImmediate(resolve))

  return output
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as Record<string, unknown>)
}

describe("timeAsyncOperation", () => {
  it("logs successful operation timing", async () => {
    const entries = await collectLines(async (logger) => {
      await timeAsyncOperation(logger, "sync users", async () => "ok", {
        module: "users",
      })
    })

    expect(entries).toHaveLength(1)
    expect(entries[0]?.msg).toBe("sync users completed")
    expect(entries[0]?.module).toBe("users")
    expect(typeof entries[0]?.durationMs).toBe("number")
  })

  it("logs failed operation timing and rethrows", async () => {
    const entries = await collectLines(async (logger) => {
      await expect(
        timeAsyncOperation(logger, "sync users", async () => {
          throw new Error("boom")
        })
      ).rejects.toThrow("boom")
    })

    expect(entries).toHaveLength(1)
    expect(entries[0]?.msg).toBe("sync users failed")
    expect(entries[0]?.error).toMatchObject({
      name: "Error",
      message: "boom",
    })
  })
})
