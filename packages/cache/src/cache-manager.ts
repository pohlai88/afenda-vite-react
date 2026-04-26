import type {
  CacheConfig,
  CacheEntry,
  CacheLayerAdapter,
  CacheStats,
  CacheStrategy,
} from "./contracts"

type MutableCacheEntry<T = unknown> = {
  data: T
  createdAt: number
  expiresAt: number
  tags: string[]
  hitCount: number
  lastAccessedAt: number
}

type CacheSetOptions = {
  readonly ttl?: number
  readonly tags?: readonly string[]
}

type CacheGetOrSetOptions = CacheSetOptions & {
  readonly strategy?: CacheStrategy
}

const defaultCacheConfig = {
  defaultTTL: 300,
  enableCompression: false,
  compressionThreshold: 1024,
  l1MaxSize: 1000,
  cleanupIntervalMs: 60_000,
} satisfies Omit<Required<CacheConfig>, "maxMemoryPolicy" | "l2">

function isExpired(entry: Pick<CacheEntry, "expiresAt">, now: number): boolean {
  return entry.expiresAt <= now
}

function estimateEntryBytes(entry: MutableCacheEntry): number {
  const serialized = JSON.stringify(entry.data)
  return Buffer.byteLength(serialized, "utf8")
}

function patternToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&")
  return new RegExp(`^${escaped.replace(/\*/g, ".*")}$`)
}

export class CacheManager {
  private readonly l1 = new Map<string, MutableCacheEntry>()
  private readonly tagIndex = new Map<string, Set<string>>()
  private readonly config: Required<
    Omit<CacheConfig, "maxMemoryPolicy" | "l2">
  > & {
    maxMemoryPolicy?: string
  }
  private readonly l2?: CacheLayerAdapter
  private readonly cleanupHandle: NodeJS.Timeout
  private l1Hits = 0
  private l1Misses = 0
  private l2Hits = 0
  private l2Misses = 0
  private evictions = 0

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ...defaultCacheConfig,
      ...config,
    }
    this.l2 = config.l2
    this.cleanupHandle = setInterval(
      () => this.cleanExpiredL1(),
      this.config.cleanupIntervalMs
    )
    this.cleanupHandle.unref?.()
  }

  async get<T>(key: string): Promise<T | null> {
    const now = Date.now()
    const l1Entry = this.l1.get(key)
    if (l1Entry && !isExpired(l1Entry, now)) {
      l1Entry.hitCount += 1
      l1Entry.lastAccessedAt = now
      this.l1Hits += 1
      return l1Entry.data as T
    }

    if (l1Entry) {
      this.removeFromL1(key)
    }
    this.l1Misses += 1

    if (!this.l2) {
      this.l2Misses += 1
      return null
    }

    const l2Entry = await this.l2.get<T>(key)
    if (!l2Entry || isExpired(l2Entry, now)) {
      this.l2Misses += 1
      if (l2Entry) {
        await this.l2.delete(key)
      }
      return null
    }

    this.l2Hits += 1
    this.writeToL1(key, {
      ...l2Entry,
      tags: [...l2Entry.tags],
      hitCount: l2Entry.hitCount + 1,
      lastAccessedAt: now,
    })
    return l2Entry.data
  }

  async set<T>(
    key: string,
    value: T,
    options: CacheSetOptions = {}
  ): Promise<void> {
    const ttl = options.ttl ?? this.config.defaultTTL
    const tags = [...(options.tags ?? [])]
    const now = Date.now()
    const entry: MutableCacheEntry<T> = {
      data: value,
      createdAt: now,
      expiresAt: now + ttl * 1000,
      tags,
      hitCount: 0,
      lastAccessedAt: now,
    }

    this.writeToL1(key, entry)
    if (this.l2) {
      await this.l2.set(key, entry, ttl)
    }
  }

  async delete(key: string): Promise<void> {
    this.removeFromL1(key)
    await this.l2?.delete(key)
  }

  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag)
    let count = 0

    if (keys) {
      for (const key of keys) {
        if (this.l1.has(key)) {
          this.removeFromL1(key)
          count += 1
        }
      }
      this.tagIndex.delete(tag)
    }

    const l2Count = (await this.l2?.invalidateByTag?.(tag)) ?? 0
    return Math.max(count, l2Count)
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    const regex = patternToRegex(pattern)
    let count = 0

    for (const key of [...this.l1.keys()]) {
      if (regex.test(key)) {
        this.removeFromL1(key)
        count += 1
      }
    }

    const l2Count = (await this.l2?.invalidateByPattern?.(pattern)) ?? 0
    return Math.max(count, l2Count)
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheGetOrSetOptions = {}
  ): Promise<T> {
    const strategy = options.strategy ?? "cache-first"

    if (strategy === "cache-first") {
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }
      const value = await factory()
      await this.set(key, value, options)
      return value
    }

    if (strategy === "stale-while-revalidate") {
      const cached = await this.get<T>(key)
      if (cached !== null) {
        void factory()
          .then(async (value) => this.set(key, value, options))
          .catch(() => undefined)
        return cached
      }
      const value = await factory()
      await this.set(key, value, options)
      return value
    }

    try {
      const value = await factory()
      await this.set(key, value, options)
      return value
    } catch (error) {
      const cached = await this.get<T>(key)
      if (cached !== null) {
        return cached
      }
      throw error instanceof Error
        ? error
        : new Error(`Cache miss and factory failure for key: ${key}`)
    }
  }

  async mget<T>(keys: readonly string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>()
    await Promise.all(
      keys.map(async (key) => {
        results.set(key, await this.get<T>(key))
      })
    )
    return results
  }

  async mset<T>(
    entries: readonly {
      key: string
      value: T
      ttl?: number
      tags?: readonly string[]
    }[]
  ): Promise<void> {
    await Promise.all(
      entries.map((entry) =>
        this.set(entry.key, entry.value, {
          ttl: entry.ttl,
          tags: entry.tags,
        })
      )
    )
  }

  async getStats(): Promise<CacheStats> {
    const totalHits = this.l1Hits + this.l2Hits
    const totalMisses = this.l1Misses + this.l2Misses
    const totalRequests = totalHits + totalMisses
    const l2Stats = (await this.l2?.getStats?.()) ?? {}
    const memoryBytes = [...this.l1.values()].reduce((total, entry) => {
      return total + estimateEntryBytes(entry)
    }, 0)

    return {
      hits: totalHits,
      misses: totalMisses,
      hitRate: totalRequests === 0 ? 0 : totalHits / totalRequests,
      totalKeys: this.l1.size + (l2Stats.totalKeys ?? 0),
      memoryUsed: `${Math.max(1, Math.round(memoryBytes / 1024))}KB`,
      evictions: this.evictions + (l2Stats.evictions ?? 0),
    }
  }

  async flush(): Promise<void> {
    this.l1.clear()
    this.tagIndex.clear()
    this.l1Hits = 0
    this.l1Misses = 0
    this.l2Hits = 0
    this.l2Misses = 0
    this.evictions = 0
    await this.l2?.flush?.()
  }

  dispose(): void {
    clearInterval(this.cleanupHandle)
  }

  private writeToL1(key: string, entry: MutableCacheEntry): void {
    if (this.l1.has(key)) {
      this.removeFromTagIndex(key, this.l1.get(key)?.tags ?? [])
    }

    while (this.l1.size >= this.config.l1MaxSize) {
      this.evictL1()
    }

    this.l1.set(key, entry)
    this.addToTagIndex(key, entry.tags)
  }

  private addToTagIndex(key: string, tags: readonly string[]): void {
    for (const tag of tags) {
      const keys = this.tagIndex.get(tag) ?? new Set<string>()
      keys.add(key)
      this.tagIndex.set(tag, keys)
    }
  }

  private removeFromTagIndex(key: string, tags: readonly string[]): void {
    for (const tag of tags) {
      const keys = this.tagIndex.get(tag)
      if (!keys) {
        continue
      }
      keys.delete(key)
      if (keys.size === 0) {
        this.tagIndex.delete(tag)
      }
    }
  }

  private removeFromL1(key: string): void {
    const entry = this.l1.get(key)
    if (!entry) {
      return
    }
    this.removeFromTagIndex(key, entry.tags)
    this.l1.delete(key)
  }

  private evictL1(): void {
    const candidate = [...this.l1.entries()].sort((left, right) => {
      if (left[1].hitCount !== right[1].hitCount) {
        return left[1].hitCount - right[1].hitCount
      }
      return left[1].lastAccessedAt - right[1].lastAccessedAt
    })[0]

    if (!candidate) {
      return
    }

    this.removeFromL1(candidate[0])
    this.evictions += 1
  }

  private cleanExpiredL1(): void {
    const now = Date.now()
    for (const [key, entry] of this.l1.entries()) {
      if (isExpired(entry, now)) {
        this.removeFromL1(key)
      }
    }
  }
}

export function createCacheManager(
  config?: Partial<CacheConfig>
): CacheManager {
  return new CacheManager(config)
}
