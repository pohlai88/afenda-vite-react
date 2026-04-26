# `@afenda/notifications`

Typed notification contracts, storage abstractions, orchestration, and reusable templates for Afenda runtimes.

## What This Package Owns

- notification domain contracts
- store interface plus a safe in-memory implementation
- orchestration for create/list/read/unread flows
- optional realtime adapter contract for websocket, SSE, or broker-backed delivery
- reusable notification templates for common operational events

## What This Package Does Not Own

- product feature implementation
- browser UI components
- websocket server bootstrapping
- email/SMS/push provider SDK wiring
- database schema ownership

The legacy package mixed domain contracts, WebSocket transport, and a browser client. Afenda keeps the package narrower: transport-specific code should live in the app or runtime that owns that transport.

## Quick Start

```ts
import {
  InMemoryNotificationStore,
  NotificationService,
  taskAssignedTemplate,
} from "@afenda/notifications"

const service = new NotificationService({
  store: new InMemoryNotificationStore(),
})

const notification = await service.create({
  recipient: { userId: "user_123", tenantId: "tenant_123" },
  ...taskAssignedTemplate({
    taskId: "task_123",
    taskTitle: "Approve vendor payout",
    projectName: "Finance Close",
  }),
})
```

## Realtime Integration

If an app wants real-time delivery, it should provide a `NotificationRealtimeAdapter`:

```ts
import type {
  NotificationRealtimeAdapter,
  NotificationRealtimeEvent,
} from "@afenda/notifications"

class WebSocketNotificationAdapter implements NotificationRealtimeAdapter {
  async publish(event: NotificationRealtimeEvent): Promise<void> {
    // fan out to WebSocket or SSE subscribers here
  }
}
```

## Notes For Afenda

- `@afenda/better-auth` already carries notification-token fields in its auth schema. This package does not assume those fields are active delivery infrastructure.
- Use this package for server/runtime truth first. Add UI inbox components or websocket endpoints only where the owning app actually needs them.
