import { joinApiClientUrl } from "../utils/api-client-utils"

export interface FetchWithTimeoutParams {
  readonly url: string
  readonly init: RequestInit
  readonly timeoutMs: number
}

function createTimeoutError(timeoutMs: number): Error {
  if (typeof DOMException === "function") {
    return new DOMException(
      `Request timed out after ${timeoutMs}ms`,
      "TimeoutError"
    )
  }
  return new Error(`Request timed out after ${timeoutMs}ms`)
}

function createAbortError(): Error {
  if (typeof DOMException === "function") {
    return new DOMException("Request aborted", "AbortError")
  }
  return new Error("Request aborted")
}

function getAbortReason(signal: AbortSignal): unknown {
  return signal.reason ?? createAbortError()
}

/**
 * Executes `fetch` with an AbortSignal that fires after `timeoutMs`.
 * Forwards an existing `init.signal` abort to the same controller so timeout and caller cancel both work.
 */
export async function fetchWithTimeout({
  url,
  init,
  timeoutMs,
}: FetchWithTimeoutParams): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(
    () => controller.abort(createTimeoutError(timeoutMs)),
    timeoutMs
  )
  const outer = init.signal
  let removeOuterAbortListener: (() => void) | undefined

  if (outer) {
    if (outer.aborted) {
      clearTimeout(id)
      return Promise.reject(getAbortReason(outer))
    }
    const abortFromOuter = () => {
      clearTimeout(id)
      controller.abort(getAbortReason(outer))
    }
    outer.addEventListener("abort", abortFromOuter, { once: true })
    removeOuterAbortListener = () => {
      outer.removeEventListener("abort", abortFromOuter)
    }
  }

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(id)
    removeOuterAbortListener?.()
  }
}

export function resolveRequestUrl(baseUrl: string, path: string): string {
  return joinApiClientUrl(baseUrl, path)
}
