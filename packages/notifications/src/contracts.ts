export const notificationKinds = [
  "info",
  "warning",
  "error",
  "success",
  "action_required",
] as const

export type NotificationKind = (typeof notificationKinds)[number]

export const notificationPriorities = [
  "low",
  "medium",
  "high",
  "urgent",
] as const

export type NotificationPriority = (typeof notificationPriorities)[number]

export const notificationChannels = ["in_app", "email", "sms", "push"] as const

export type NotificationChannel = (typeof notificationChannels)[number]

export type NotificationMetadata = Readonly<Record<string, unknown>>

export type NotificationRecipient = {
  readonly userId: string
  readonly tenantId?: string | null
}

export type NotificationDraft = {
  readonly kind: NotificationKind
  readonly priority: NotificationPriority
  readonly title: string
  readonly body: string
  readonly topic: string
  readonly channels: readonly NotificationChannel[]
  readonly actionUrl?: string
  readonly expiresAt?: Date
  readonly metadata?: NotificationMetadata
}

export type Notification = NotificationDraft & {
  readonly id: string
  readonly recipient: NotificationRecipient
  readonly createdAt: Date
  readonly readAt: Date | null
}

export type CreateNotificationInput = NotificationDraft & {
  readonly recipient: NotificationRecipient
}

export type ListNotificationsInput = {
  readonly userId: string
  readonly limit?: number
  readonly includeRead?: boolean
}

export type NotificationFeedSnapshot = {
  readonly notifications: readonly Notification[]
  readonly unreadCount: number
}

export type NotificationRealtimeEvent =
  | {
      readonly type: "notification.created"
      readonly notification: Notification
    }
  | {
      readonly type: "notification.read"
      readonly userId: string
      readonly notificationId: string
      readonly readAt: Date
    }
  | {
      readonly type: "notification.all_read"
      readonly userId: string
      readonly readAt: Date
    }

export type NotificationTemplateContext = {
  readonly locale?: string
}
