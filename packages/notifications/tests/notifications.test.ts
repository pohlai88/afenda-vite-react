import { describe, expect, it, vi } from "vitest"

import { NotificationBuilder, paymentReceivedTemplate } from "../src/templates"
import { NotificationService } from "../src/service"
import { InMemoryNotificationStore } from "../src/store"

describe("@afenda/notifications", () => {
  it("creates notifications and reports unread feed state", async () => {
    const realtime = {
      publish: vi.fn().mockResolvedValue(undefined),
    }

    const service = new NotificationService({
      store: new InMemoryNotificationStore(),
      realtime,
      now: () => new Date("2026-04-25T10:00:00.000Z"),
      createId: () => "notif_001",
    })

    const notification = await service.create({
      recipient: { userId: "user_1", tenantId: "tenant_1" },
      kind: "info",
      priority: "medium",
      title: "Workspace updated",
      body: "The workspace settings changed.",
      topic: "workspace.updated",
      channels: ["in_app"],
    })

    expect(notification.id).toBe("notif_001")
    expect(notification.readAt).toBeNull()
    await expect(service.getUnreadCount("user_1")).resolves.toBe(1)
    await expect(service.getFeedSnapshot("user_1")).resolves.toMatchObject({
      unreadCount: 1,
      notifications: [expect.objectContaining({ id: "notif_001" })],
    })
    expect(realtime.publish).toHaveBeenCalledWith({
      type: "notification.created",
      notification,
    })
  })

  it("marks notifications as read and publishes realtime events", async () => {
    const realtime = {
      publish: vi.fn().mockResolvedValue(undefined),
    }

    const store = new InMemoryNotificationStore()
    const service = new NotificationService({
      store,
      realtime,
      now: () => new Date("2026-04-25T10:00:00.000Z"),
      createId: () => "notif_002",
    })

    await service.create({
      recipient: { userId: "user_2" },
      kind: "warning",
      priority: "high",
      title: "Action required",
      body: "Review the pending change.",
      topic: "review.pending",
      channels: ["in_app", "email"],
    })

    await expect(service.markRead("user_2", "notif_002")).resolves.toBe(true)
    await expect(service.getUnreadCount("user_2")).resolves.toBe(0)
    expect(realtime.publish).toHaveBeenCalledWith({
      type: "notification.read",
      userId: "user_2",
      notificationId: "notif_002",
      readAt: new Date("2026-04-25T10:00:00.000Z"),
    })
  })

  it("creates fan-out notifications for multiple recipients", async () => {
    let counter = 0
    const service = new NotificationService({
      store: new InMemoryNotificationStore(),
      createId: () => `notif_${++counter}`,
      now: () => new Date("2026-04-25T10:00:00.000Z"),
    })

    const notifications = await service.createMany(
      [{ userId: "a" }, { userId: "b" }],
      {
        kind: "success",
        priority: "low",
        title: "Done",
        body: "Nightly sync completed.",
        topic: "system.sync.completed",
        channels: ["in_app"],
      }
    )

    expect(notifications.map((notification) => notification.id)).toEqual([
      "notif_1",
      "notif_2",
    ])
  })

  it("deletes expired notifications", async () => {
    const service = new NotificationService({
      store: new InMemoryNotificationStore(),
      createId: () => "notif_expired",
      now: () => new Date("2026-04-25T10:00:00.000Z"),
    })

    await service.create({
      recipient: { userId: "user_3" },
      kind: "info",
      priority: "low",
      title: "Temporary",
      body: "This expires immediately.",
      topic: "system.temporary",
      channels: ["in_app"],
      expiresAt: new Date("2026-04-25T09:00:00.000Z"),
    })

    await expect(
      service.deleteExpired(new Date("2026-04-25T10:00:00.000Z"))
    ).resolves.toBe(1)
  })

  it("builds reusable templates and custom drafts", () => {
    expect(
      paymentReceivedTemplate(
        {
          paymentId: "pay_1",
          amount: 1200,
          currency: "USD",
          counterpartyName: "Acme Corp",
        },
        { locale: "en-US" }
      )
    ).toMatchObject({
      kind: "success",
      topic: "finance.payment.received",
      title: "Payment received",
    })

    const draft = new NotificationBuilder()
      .setKind("action_required")
      .setPriority("urgent")
      .setTitle("Review policy")
      .setBody("A policy update requires your approval.")
      .setTopic("governance.policy.review")
      .setChannels(["in_app", "email"])
      .build()

    expect(draft.channels).toEqual(["in_app", "email"])
  })
})
