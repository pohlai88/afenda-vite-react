/**
 * TanStack Query **client configuration** (cache defaults, retry policy).
 * Not HTTP services — `queryFn` / API calls live in features or `share/api` as you add them.
 * React wiring: `QueryProvider` in `share/components/providers/query-provider.tsx`.
 */
export { queryClient } from './query-client'
export { getHttpStatusFromUnknown } from './get-http-status-from-unknown'
