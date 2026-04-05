# Sentry and OpenTelemetry guide (Afenda)

This document describes **optional** **Sentry** (errors, React/Node SDKs, source maps, tracing) and **OpenTelemetry** (traces, correlation with [Pino](./pino.md)) when the team standardizes observability.

**Status:** **Optional** — not required for [Architecture](../ARCHITECTURE.md) baseline.

**Official documentation**

**Sentry**

- [Sentry docs](https://docs.sentry.io/)
- [JavaScript](https://docs.sentry.io/platforms/javascript/) — shared options and concepts
- [React (SPA / Vite)](https://docs.sentry.io/platforms/javascript/guides/react/) — **`@sentry/react`**, **`browserTracingIntegration()`**, React 19 **`reactErrorHandler`**, ErrorBoundary
- [Node.js](https://docs.sentry.io/platforms/javascript/guides/node/) — **`@sentry/node`**
- [Fastify](https://docs.sentry.io/platforms/javascript/guides/fastify/) — **`@sentry/node`** + **`setupFastifyErrorHandler`**; [OpenTelemetry (Fastify)](https://docs.sentry.io/platforms/javascript/guides/fastify/opentelemetry/) mirrors Node OTel notes
- [Configuration options](https://docs.sentry.io/platforms/javascript/configuration/options/) — **`beforeSend`**, **`tracesSampleRate`** / **`tracesSampler`**, **`sendDefaultPii`**
- [Source maps — Vite](https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/uploading/vite/) — **`@sentry/vite-plugin`**, **`build.sourcemap`**, auth token / CI ([Deployment](../DEPLOYMENT.md), [Vite](./vite.md))
- [Distributed tracing (React)](https://docs.sentry.io/platforms/javascript/guides/react/tracing/distributed-tracing/) — **`tracePropagationTargets`** and backend correlation
- [OpenTelemetry support (Node)](https://docs.sentry.io/platforms/javascript/guides/node/opentelemetry/) — Sentry uses OTel internally; custom setups
- [Custom OpenTelemetry setup (Node)](https://docs.sentry.io/platforms/javascript/guides/node/opentelemetry/custom-setup/) — **`skipOpenTelemetrySetup`**, **`@sentry/opentelemetry`** (`SentrySpanProcessor`, `SentryPropagator`, `SentrySampler`, `SentryContextManager`)
- [OTLP / Sentry](https://docs.sentry.io/concepts/otlp/) — ingesting OTel traces/logs; [Sentry with OTel](https://docs.sentry.io/concepts/otlp/sentry-with-otel/)

**OpenTelemetry (vendor-neutral)**

- [OpenTelemetry docs](https://opentelemetry.io/docs/)
- [JavaScript](https://opentelemetry.io/docs/languages/js/) — Node vs browser entry points
- [JS instrumentation](https://opentelemetry.io/docs/languages/js/instrumentation/)
- [JS propagation](https://opentelemetry.io/docs/languages/js/propagation/) — W3C **`traceparent`** / context injection
- [Instrumentation concepts](https://opentelemetry.io/docs/concepts/instrumentation/)

**Repositories:** [getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript) · [open-telemetry/opentelemetry-js](https://github.com/open-telemetry/opentelemetry-js)

---

## Sentry (illustrative)

| Topic | Convention |
| --- | --- |
| **PII** | **`beforeSend`** / **`beforeSendTransaction`** scrubbing—tenant id, email policy; treat **`sendDefaultPii`** and Session Replay as explicit privacy decisions ([Configuration options](https://docs.sentry.io/platforms/javascript/configuration/options/)) |
| **Source maps** | **`@sentry/vite-plugin`** + **`build.sourcemap: "hidden"`** (or equivalent); upload in CI; strip or delete **`*.map`** from public assets ([Vite upload guide](https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/uploading/vite/)) |
| **Sampling** | Tune **`tracesSampleRate`** / **`tracesSampler`** (and profiling/replay rates) for cost—defaults are rarely right for ERP-scale traffic |
| **Tracing** | Set **`tracePropagationTargets`** so fetch/XHR to **`apps/api`** carries Sentry trace headers where you want end-to-end spans ([Distributed tracing](https://docs.sentry.io/platforms/javascript/guides/react/tracing/distributed-tracing/)) |

**Packages (verify majors when you adopt):** **`@sentry/react`** (`apps/web`), **`@sentry/node`** for **`apps/api`** (see [Fastify guide](https://docs.sentry.io/platforms/javascript/guides/fastify/) — **`Sentry.setupFastifyErrorHandler`**, early **`instrument`**) and optionally **`@sentry/profiling-node`**, **`@sentry/vite-plugin`** (build), and **`@sentry/opentelemetry`** only if you run a **custom** OTel stack alongside Sentry on Node.

---

## OpenTelemetry (illustrative)

| Topic | Convention |
| --- | --- |
| **Sentry + Node** | Modern **`@sentry/node`** already sits on **OpenTelemetry**; follow [OpenTelemetry support](https://docs.sentry.io/platforms/javascript/guides/node/opentelemetry/) before layering a second global SDK |
| **Custom OTel** | Use **`skipOpenTelemetrySetup: true`** and wire **`SentrySpanProcessor`**, **`SentryPropagator`**, **`SentrySampler`**, **`SentryContextManager`** per [custom setup](https://docs.sentry.io/platforms/javascript/guides/node/opentelemetry/custom-setup/); call **`Sentry.validateOpenTelemetrySetup()`** when docs recommend |
| **OTLP → Sentry** | If you export traces/logs elsewhere and also want Sentry, see [OTLP](https://docs.sentry.io/concepts/otlp/) and [Sentry with OTel](https://docs.sentry.io/concepts/otlp/sentry-with-otel/) |
| **Context** | Propagate **W3C trace context** through [Fastify](./fastify.md) and outbound HTTP (`traceparent`) when not using Sentry’s built-in propagation—[JS propagation](https://opentelemetry.io/docs/languages/js/propagation/) |
| **Logs** | Correlate with [Pino](./pino.md) **`requestId`** and [API](../API.md) errors; align fields with whatever backend you choose (Sentry Logs, OTLP logs, or log platform) |

---

## Red flags

- **Sending** secrets, refresh tokens, or full **`Authorization`** values to Sentry or OTLP exporters.
- Turning on **Session Replay** or **`sendDefaultPii`** without a **data policy** review.
- Running **two** competing global OpenTelemetry setups on the same Node process without following Sentry’s **custom OTel** guide.

---

## Related documentation

- [Pino](./pino.md)
- [Fastify](./fastify.md)
- [Vite](./vite.md)
- [Deployment](../DEPLOYMENT.md)

**External:** [docs.sentry.io](https://docs.sentry.io/) · [opentelemetry.io/docs](https://opentelemetry.io/docs/)

**Context7 (AI doc refresh):** **`Sentry`** → **`/websites/sentry_io`** or **`/getsentry/sentry-docs`**; **`OpenTelemetry JS`** → **`/websites/opentelemetry_io`** or **`/open-telemetry/opentelemetry-js`**. Then **`query-docs`** for Node OTel bridge, OTLP, or Vite source maps.
