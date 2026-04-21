import os from "node:os"

import pino, { type DestinationStream } from "pino"

import type { AppLogger } from "./pino-log-contract.js"

export interface ServiceLoggerOptions {
  readonly service: string
  readonly environment: string
  readonly level?: string
  readonly destination?: DestinationStream
}

const redactedPaths = [
  "password",
  "token",
  "authorization",
  "apiKey",
  "*.password",
  "*.token",
  "*.authorization",
  "*.apiKey",
]

export function createServiceLogger(options: ServiceLoggerOptions): AppLogger {
  return pino(
    {
      name: options.service,
      level: options.level ?? process.env.LOG_LEVEL ?? "info",
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: redactedPaths,
        censor: "[REDACTED]",
      },
      base: {
        service: options.service,
        environment: options.environment,
        pid: process.pid,
        hostname: os.hostname(),
      },
    },
    options.destination
  ) as unknown as AppLogger
}
