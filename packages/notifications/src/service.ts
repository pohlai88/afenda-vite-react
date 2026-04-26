import { randomUUID } from "node:crypto"

import type {
  CreateNotificationInput,
  ListNotificationsInput,
  Notification,
  NotificationFeedSnapshot,
  NotificationRealtimeEvent,
} from "./contracts"
import { NotificationError } from "./notification-error"
import type { NotificationStore } from "./store"

export interface NotificationRealtimeAdapter {
  publish(event: NotificationRealtimeEvent): Promise<void>
}

export interface NotificationServiceOptions {
  readonly store: NotificationStore
  readonly realtime?: NotificationRealtimeAdapter
  readonly now?: () => Date
  readonly createId?: () => string
}

export class NotificationService {
  private readonly store: NotificationStore
  private readonly realtime?: NotificationRealtimeAdapter
  private readonly now: () => Date
  private readonly createId: () => string

  constructor(options: NotificationServiceOptions) {
    this.store = options.store
    this.realtime = options.realtime
    this.now = options.now ?? (() => new Date())
    this.createId = options.createId ?? randomUUID
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    assertNotificationInput(input)

    const notification: Notification = {
      ...input,
      id: this.createId(),
      createdAt: this.now(),
      readAt: null,
    }

    await this.store.save(notification)
    await this.realtime?.publish({
      type: "notification.created",
      notification,
    })

    return notification
  }

  async createMany(
    recipients: readonly CreateNotificationInput["recipient"][],
    draft: Omit<CreateNotificationInput, "recipient">
  ): Promise<readonly Notification[]> {
    const notifications: Notification[] = []

    for (const recipient of recipients) {
      notifications.push(
        await this.create({
          ...draft,
          recipient,
        })
      )
    }

    return notifications
  }

  listByUser(input: ListNotificationsInput): Promise<readonly Notification[]> {
    return this.store.listByUser(input)
  }

  async getFeedSnapshot(userId: string): Promise<NotificationFeedSnapshot> {
    const [notifications, unreadCount] = await Promise.all([
      this.store.listByUser({
        userId,
        limit: 50,
        includeRead: true,
      }),
      this.store.getUnreadCount(userId),
    ])

    return { notifications, unreadCount }
  }

  async markRead(userId: string, notificationId: string): Promise<boolean> {
    if (!notificationId.trim()) {
      throw new NotificationError("Notification ID is required.", {
        userId,
      })
    }

    const readAt = this.now()
    const updated = await this.store.markRead(notificationId, readAt)
    if (!updated) {
      return false
    }

    await this.realtime?.publish({
      type: "notification.read",
      userId,
      notificationId,
      readAt,
    })
    return true
  }

  async markAllRead(userId: string): Promise<number> {
    if (!userId.trim()) {
      throw new NotificationError("User ID is required.")
    }

    const readAt = this.now()
    const updated = await this.store.markAllRead(userId, readAt)
    if (updated > 0) {
      await this.realtime?.publish({
        type: "notification.all_read",
        userId,
        readAt,
      })
    }

    return updated
  }

  delete(notificationId: string): Promise<boolean> {
    return this.store.delete(notificationId)
  }

  deleteExpired(now = this.now()): Promise<number> {
    return this.store.deleteExpired(now)
  }

  getUnreadCount(userId: string): Promise<number> {
    return this.store.getUnreadCount(userId)
  }
}

function assertNotificationInput(input: CreateNotificationInput): void {
  if (!input.recipient.userId.trim()) {
    throw new NotificationError("Notification recipient userId is required.")
  }

  if (!input.title.trim()) {
    throw new NotificationError("Notification title is required.")
  }

  if (!input.body.trim()) {
    throw new NotificationError("Notification body is required.")
  }

  if (!input.topic.trim()) {
    throw new NotificationError("Notification topic is required.")
  }

  if (input.channels.length === 0) {
    throw new NotificationError(
      "At least one notification channel is required."
    )
  }
}
