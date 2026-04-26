export interface CacheConfig {
  readonly defaultTTL: number
  readonly maxMemoryPolicy?: string
  readonly enableCompression?: boolean
  readonly compressionThreshold?: number
  readonly l1MaxSize?: number
  readonly cleanupIntervalMs?: number
  readonly l2?: CacheLayerAdapter
}

export interface CacheEntry<T = unknown> {
  readonly data: T
  readonly createdAt: number
  readonly expiresAt: number
  readonly tags: readonly string[]
  readonly hitCount: number
  readonly lastAccessedAt: number
}

export interface CacheLayerAdapter {
  get<T>(key: string): Promise<CacheEntry<T> | null>
  set<T>(key: string, entry: CacheEntry<T>, ttlSeconds: number): Promise<void>
  delete(key: string): Promise<void>
  invalidateByTag?(tag: string): Promise<number>
  invalidateByPattern?(pattern: string): Promise<number>
  flush?(): Promise<void>
  getStats?(): Promise<Partial<CacheStats>>
}

export interface CacheStats {
  readonly hits: number
  readonly misses: number
  readonly hitRate: number
  readonly totalKeys: number
  readonly memoryUsed: string
  readonly evictions: number
}

export type CacheStrategy =
  | "cache-first"
  | "network-first"
  | "stale-while-revalidate"

export interface CursorPagination {
  readonly cursor?: string
  readonly limit: number
  readonly direction: "forward" | "backward"
}

export interface CursorPage<T> {
  readonly data: readonly T[]
  readonly nextCursor?: string
  readonly prevCursor?: string
  readonly hasMore: boolean
}

export interface CursorQueryDescriptor {
  readonly take: number
  readonly orderBy: Record<string, "asc" | "desc">
  readonly cursor?: { readonly id: string }
  readonly skip?: number
}
