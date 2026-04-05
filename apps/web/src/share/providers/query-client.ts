import { QueryClient } from '@tanstack/react-query'

import { getHttpStatusFromUnknown } from './get-http-status-from-unknown'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, error) => {
        const status = getHttpStatusFromUnknown(error)
        if (status !== undefined && status >= 400 && status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
