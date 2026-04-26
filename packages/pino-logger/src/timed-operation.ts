import type { AppLogBindings, AppLogger } from "./pino-log-contract.js"

export async function timeAsyncOperation<T>(
  logger: AppLogger,
  message: string,
  operation: () => Promise<T>,
  bindings: AppLogBindings = {}
): Promise<T> {
  const startedAt = performance.now()

  try {
    const result = await operation()
    logger.info(
      {
        ...bindings,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
      },
      `${message} completed`
    )
    return result
  } catch (error) {
    logger.error(
      {
        ...bindings,
        durationMs: Number((performance.now() - startedAt).toFixed(2)),
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : { message: String(error) },
      },
      `${message} failed`
    )
    throw error
  }
}
