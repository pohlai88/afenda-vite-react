import type {
  SearchDocument,
  SearchEntityKey,
  SearchSyncEvent,
} from "./search.contract"
import { SearchIndexerService } from "./search-indexer.service"

export interface SearchSyncServiceOptions {
  readonly indexer: SearchIndexerService
  readonly flushIntervalMs?: number
}

export class SearchSyncService {
  private readonly indexer: SearchIndexerService
  private readonly flushIntervalMs: number
  private readonly queue = new Map<string, SearchSyncEvent>()
  private flushTimer: NodeJS.Timeout | null = null
  private processing = false

  constructor(options: SearchSyncServiceOptions) {
    this.indexer = options.indexer
    this.flushIntervalMs = options.flushIntervalMs ?? 2000
  }

  async queueSync(event: SearchSyncEvent): Promise<void> {
    this.queue.set(`${event.entity}:${event.documentId}`, event)
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
    }
    this.flushTimer = setTimeout(() => {
      void this.flush()
    }, this.flushIntervalMs)
  }

  async syncImmediate(event: SearchSyncEvent): Promise<void> {
    this.queue.set(`${event.entity}:${event.documentId}`, event)
    await this.flush()
  }

  async flush(): Promise<void> {
    if (this.processing || this.queue.size === 0) {
      return
    }

    this.processing = true
    try {
      const grouped = new Map<SearchEntityKey, SearchSyncEvent[]>()
      for (const event of this.queue.values()) {
        const bucket = grouped.get(event.entity) ?? []
        bucket.push(event)
        grouped.set(event.entity, bucket)
      }

      for (const [entity, events] of grouped.entries()) {
        await this.processEntityEvents(entity, events)
      }

      this.queue.clear()
    } finally {
      this.processing = false
    }
  }

  getQueueSize(): number {
    return this.queue.size
  }

  clearQueue(): void {
    this.queue.clear()
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
  }

  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    await this.flush()
  }

  private async processEntityEvents(
    entity: SearchEntityKey,
    events: readonly SearchSyncEvent[]
  ): Promise<void> {
    const upserts: SearchDocument[] = []
    const deletes: string[] = []

    for (const event of events) {
      if (event.action === "delete") {
        deletes.push(event.documentId)
        continue
      }
      if (event.document) {
        upserts.push(event.document)
      }
    }

    if (upserts.length > 0) {
      await this.indexer.indexBatch(entity, upserts)
    }

    for (const documentId of deletes) {
      await this.indexer.removeDocument(entity, documentId)
    }
  }
}
