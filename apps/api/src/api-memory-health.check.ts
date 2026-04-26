/**
 * Non-critical process memory check for API health reporting.
 *
 * @module api-memory-health.check
 * @package @afenda/api
 */
import type { ApiHealthCheck } from "./api-health.contract.js"

export function createApiMemoryHealthCheck(
  maxHeapMb: number = 512
): ApiHealthCheck {
  return {
    name: "memory",
    critical: false,
    timeoutMs: 1_000,
    check: async () => {
      const memoryUsage = process.memoryUsage()
      const heapUsedMb = Math.round(memoryUsage.heapUsed / 1024 / 1024)
      const heapTotalMb = Math.round(memoryUsage.heapTotal / 1024 / 1024)

      return {
        healthy: heapUsedMb < maxHeapMb,
        message:
          heapUsedMb >= maxHeapMb
            ? `Heap usage high: ${heapUsedMb}MB / ${maxHeapMb}MB`
            : undefined,
        details: {
          heapUsedMb,
          heapTotalMb,
          maxHeapMb,
        },
      }
    },
  }
}
