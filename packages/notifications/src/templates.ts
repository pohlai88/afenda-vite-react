import type {
  NotificationDraft,
  NotificationTemplateContext,
} from "./contracts"
import { NotificationError } from "./notification-error"

type TaskAssignedInput = {
  readonly taskId: string
  readonly taskTitle: string
  readonly projectName?: string
}

type ApprovalRequiredInput = {
  readonly entityId: string
  readonly entityLabel: string
  readonly entityType: string
}

type PaymentReceivedInput = {
  readonly paymentId: string
  readonly amount: number
  readonly currency: string
  readonly counterpartyName: string
}

type LowInventoryInput = {
  readonly itemId: string
  readonly itemName: string
  readonly remainingUnits: number
}

type NotificationDraftShape = Required<
  Pick<
    NotificationDraft,
    "kind" | "priority" | "title" | "body" | "topic" | "channels"
  >
> &
  Pick<NotificationDraft, "actionUrl" | "expiresAt" | "metadata">

export function taskAssignedTemplate(
  input: TaskAssignedInput
): NotificationDraftShape {
  return {
    kind: "action_required",
    priority: "high",
    title: "New task assigned",
    body: input.projectName
      ? `You were assigned "${input.taskTitle}" in ${input.projectName}.`
      : `You were assigned "${input.taskTitle}".`,
    topic: "work.task.assigned",
    channels: ["in_app", "email", "push"],
    actionUrl: `/tasks/${input.taskId}`,
    metadata: input,
  }
}

export function approvalRequiredTemplate(
  input: ApprovalRequiredInput
): NotificationDraftShape {
  return {
    kind: "action_required",
    priority: "urgent",
    title: "Approval required",
    body: `${input.entityType} ${input.entityLabel} requires review and approval.`,
    topic: "workflow.approval.required",
    channels: ["in_app", "email"],
    actionUrl: `/${input.entityType}/${input.entityId}`,
    metadata: input,
  }
}

export function paymentReceivedTemplate(
  input: PaymentReceivedInput,
  context: NotificationTemplateContext = {}
): NotificationDraftShape {
  const formattedAmount = new Intl.NumberFormat(context.locale ?? "en-US", {
    style: "currency",
    currency: input.currency,
  }).format(input.amount)

  return {
    kind: "success",
    priority: "medium",
    title: "Payment received",
    body: `${formattedAmount} received from ${input.counterpartyName}.`,
    topic: "finance.payment.received",
    channels: ["in_app", "email"],
    actionUrl: `/payments/${input.paymentId}`,
    metadata: input,
  }
}

export function lowInventoryTemplate(
  input: LowInventoryInput
): NotificationDraftShape {
  return {
    kind: "warning",
    priority: "high",
    title: "Low inventory alert",
    body: `${input.itemName} is down to ${input.remainingUnits} units.`,
    topic: "inventory.low_stock",
    channels: ["in_app", "email", "push"],
    actionUrl: `/inventory/items/${input.itemId}`,
    metadata: input,
  }
}

export class NotificationBuilder {
  private draft: {
    kind?: NotificationDraft["kind"]
    priority?: NotificationDraft["priority"]
    title?: string
    body?: string
    topic?: string
    channels?: readonly NotificationDraft["channels"][number][]
    actionUrl?: string
    expiresAt?: Date
    metadata?: Readonly<Record<string, unknown>>
  } = {}

  setKind(kind: NotificationDraft["kind"]): this {
    this.draft.kind = kind
    return this
  }

  setPriority(priority: NotificationDraft["priority"]): this {
    this.draft.priority = priority
    return this
  }

  setTitle(title: string): this {
    this.draft.title = title
    return this
  }

  setBody(body: string): this {
    this.draft.body = body
    return this
  }

  setTopic(topic: string): this {
    this.draft.topic = topic
    return this
  }

  setChannels(
    channels: readonly NotificationDraft["channels"][number][]
  ): this {
    this.draft.channels = channels
    return this
  }

  setActionUrl(actionUrl: string): this {
    this.draft.actionUrl = actionUrl
    return this
  }

  setExpiresAt(expiresAt: Date): this {
    this.draft.expiresAt = expiresAt
    return this
  }

  setMetadata(metadata: Readonly<Record<string, unknown>>): this {
    this.draft.metadata = metadata
    return this
  }

  build(): NotificationDraft {
    const { kind, priority, title, body, topic, channels } = this.draft
    if (!kind || !priority || !title || !body || !topic || !channels) {
      throw new NotificationError(
        "NotificationBuilder requires kind, priority, title, body, topic, and channels."
      )
    }

    return {
      kind,
      priority,
      title,
      body,
      topic,
      channels,
      actionUrl: this.draft.actionUrl,
      expiresAt: this.draft.expiresAt,
      metadata: this.draft.metadata,
    }
  }
}
