export class BatchLoader<K, V> {
  private queue: Array<{
    key: K
    resolve: (value: V | null) => void
    reject: (error: Error) => void
  }> = []
  private scheduled = false
  private timer: NodeJS.Timeout | null = null

  constructor(
    private readonly batchFn: (keys: readonly K[]) => Promise<Map<K, V>>,
    private readonly options: {
      maxBatchSize?: number
      batchDelayMs?: number
    } = {}
  ) {}

  load(key: K): Promise<V | null> {
    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject })

      if (!this.scheduled) {
        this.scheduled = true
        this.timer = setTimeout(
          () => void this.executeBatch(),
          this.options.batchDelayMs ?? 10
        )
        this.timer.unref?.()
      }

      if (this.queue.length >= (this.options.maxBatchSize ?? 100)) {
        void this.executeBatch()
      }
    })
  }

  private async executeBatch(): Promise<void> {
    this.scheduled = false
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    const batch = this.queue.splice(0)
    if (batch.length === 0) {
      return
    }

    const uniqueKeys = [...new Set(batch.map((item) => item.key))]

    try {
      const results = await this.batchFn(uniqueKeys)
      for (const item of batch) {
        item.resolve(results.get(item.key) ?? null)
      }
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error("BatchLoader batch failed")
      for (const item of batch) {
        item.reject(normalizedError)
      }
    }
  }
}
