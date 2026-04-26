import type { ListNotificationsInput, Notification } from "./contracts"

export interface NotificationStore {
  save(notification: Notification): Promise<void>
  listByUser(input: ListNotificationsInput): Promise<readonly Notification[]>
  markRead(notificationId: string, readAt: Date): Promise<boolean>
  markAllRead(userId: string, readAt: Date): Promise<number>
  delete(notificationId: string): Promise<boolean>
  deleteExpired(now: Date): Promise<number>
  getUnreadCount(userId: string): Promise<number>
}

export class InMemoryNotificationStore implements NotificationStore {
  private readonly notifications = new Map<string, Notification>()
  private readonly notificationsByUser = new Map<string, Set<string>>()

  async save(notification: Notification): Promise<void> {
    this.notifications.set(notification.id, notification)
    const userNotifications =
      this.notificationsByUser.get(notification.recipient.userId) ??
      new Set<string>()
    userNotifications.add(notification.id)
    this.notificationsByUser.set(
      notification.recipient.userId,
      userNotifications
    )
  }

  async listByUser(
    input: ListNotificationsInput
  ): Promise<readonly Notification[]> {
    const userNotificationIds =
      this.notificationsByUser.get(input.userId) ?? new Set<string>()
    const limit = input.limit ?? 50
    const includeRead = input.includeRead ?? true

    return [...userNotificationIds]
      .map((id) => this.notifications.get(id))
      .filter((notification): notification is Notification => {
        if (!notification) {
          return false
        }

        return includeRead ? true : notification.readAt === null
      })
      .sort((left, right) => {
        return right.createdAt.getTime() - left.createdAt.getTime()
      })
      .slice(0, limit)
  }

  async markRead(notificationId: string, readAt: Date): Promise<boolean> {
    const current = this.notifications.get(notificationId)
    if (!current || current.readAt !== null) {
      return false
    }

    this.notifications.set(notificationId, {
      ...current,
      readAt,
    })
    return true
  }

  async markAllRead(userId: string, readAt: Date): Promise<number> {
    const userNotificationIds = this.notificationsByUser.get(userId)
    if (!userNotificationIds) {
      return 0
    }

    let updated = 0
    for (const notificationId of userNotificationIds) {
      const current = this.notifications.get(notificationId)
      if (!current || current.readAt !== null) {
        continue
      }

      this.notifications.set(notificationId, {
        ...current,
        readAt,
      })
      updated += 1
    }

    return updated
  }

  async delete(notificationId: string): Promise<boolean> {
    const current = this.notifications.get(notificationId)
    if (!current) {
      return false
    }

    this.notifications.delete(notificationId)
    this.notificationsByUser
      .get(current.recipient.userId)
      ?.delete(notificationId)
    return true
  }

  async deleteExpired(now: Date): Promise<number> {
    let deleted = 0
    for (const [notificationId, notification] of this.notifications.entries()) {
      if (
        notification.expiresAt &&
        notification.expiresAt.getTime() <= now.getTime()
      ) {
        await this.delete(notificationId)
        deleted += 1
      }
    }

    return deleted
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.listByUser({
      userId,
      limit: Number.MAX_SAFE_INTEGER,
      includeRead: false,
    })
    return notifications.length
  }
}
