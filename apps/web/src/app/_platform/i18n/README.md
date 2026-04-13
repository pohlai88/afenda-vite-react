# I18n Platform Capability

`_platform/i18n` owns application localization runtime behavior. It is a platform capability because every feature consumes the same locale policy, i18next lifecycle, namespace registry, and format helpers.

## Boundary

- Import public APIs from `@/app/_platform/i18n`.
- Keep i18next wiring in `adapters/i18next-adapter.ts`.
- Keep locale and namespace rules in `policy/i18n-policy.ts`.
- Keep app-wide formatting helpers in `services/i18n-format-service.ts`.
- Keep translation JSON, glossary files, and audit artifacts inside this capability.
- Features may consume this capability, but this capability must not import feature internals.

## Structure

```text
_platform/i18n/
├── adapters/
├── components/
├── policy/
├── services/
├── types/
├── locales/
├── glossary/
├── audit/
├── __tests__/
└── index.ts
```
