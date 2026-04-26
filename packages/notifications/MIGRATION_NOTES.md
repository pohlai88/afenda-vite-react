# Migration Notes: Legacy `notifications` -> `@afenda/notifications`

## Preserved Ideas

- typed notification severity, priority, and channel concepts
- persistent store abstraction
- unread/read workflows
- reusable templates for common operational events

## Deliberate Changes

- removed the bundled browser WebSocket client
- removed the bundled WebSocket server implementation
- replaced the legacy `module` field with a clearer `topic`
- normalized recipient ownership to `{ userId, tenantId? }`
- made realtime delivery an adapter contract instead of a hard dependency on `ws`
- kept the package transport-agnostic so Hono, SSE, WebSocket, queues, or broker integrations can compose on top

## Why

The legacy package assumed one delivery model and mixed runtime infrastructure with domain truth. In Afenda, the package boundary is tighter:

- `@afenda/notifications` owns contracts, orchestration, and templates
- apps or server runtimes own delivery transport
- product domains own when and why notifications are emitted
