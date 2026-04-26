import { describe, expect, it } from "vitest"

import { CacheManager } from "../src/cache-manager"

describe("CacheManager", () => {
  it("returns cached values from L1", async () => {
    const cache = new CacheManager({ cleanupIntervalMs: 1000 })

    await cache.set("customer:1", { name: "Afenda" }, { ttl: 60 })
    await expect(cache.get<{ name: string }>("customer:1")).resolves.toEqual({
      name: "Afenda",
    })

    const stats = await cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(0)

    cache.dispose()
  })

  it("invalidates cached keys by tag", async () => {
    const cache = new CacheManager()

    await cache.set(
      "tenant:1:config",
      { theme: "light" },
      { tags: ["tenant:1"] }
    )
    await cache.set("tenant:1:features", ["erp"], { tags: ["tenant:1"] })

    await expect(cache.invalidateByTag("tenant:1")).resolves.toBe(2)
    await expect(cache.get("tenant:1:config")).resolves.toBeNull()

    cache.dispose()
  })

  it("falls back to cached data for network-first strategy", async () => {
    const cache = new CacheManager()
    await cache.set("report:1", { total: 42 })

    const value = await cache.getOrSet(
      "report:1",
      async () => {
        throw new Error("upstream failure")
      },
      { strategy: "network-first" }
    )

    expect(value).toEqual({ total: 42 })
    cache.dispose()
  })

  it("tracks evictions when L1 exceeds max size", async () => {
    const cache = new CacheManager({ l1MaxSize: 1 })

    await cache.set("a", 1)
    await cache.set("b", 2)

    const stats = await cache.getStats()
    expect(stats.evictions).toBe(1)

    cache.dispose()
  })
})
