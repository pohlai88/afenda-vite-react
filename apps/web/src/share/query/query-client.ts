import { QueryClient } from '@tanstack/react-query'

import { getHttpStatusFromUnknown } from './get-http-status-from-unknown'

const MAX_RETRY_COUNT = 3

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry(failureCount, error) {
        const status = getHttpStatusFromUnknown(error)
        if (
          status !== undefined &&
          status >= 400 &&
          status < 500 &&
          status !== 429
        ) {
          return false
        }
        return failureCount < MAX_RETRY_COUNT
      },
    },
  },
})
