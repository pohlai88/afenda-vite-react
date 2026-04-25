---
title: ADR-0015 governed extension and plugin doctrine
description: Decision record for Afenda's doctrine-first extension model: declarative, registered, auditable, and never allowed to bypass command, truth, tenancy, or permission enforcement.
status: active
owner: governance-extension-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 30
---

# ADR-0015: Governed extension and plugin doctrine

This document records a governed architecture decision.
Use it before any extension or plugin runtime implementation lands.

- **Decision status:** Accepted
- **Implementation status:** Doctrine-only
- **Enforcement status:** Manual today
- **Evidence status:** Minimal
- **Date:** 2026-04-25
- **Owner:** Governance extension architecture
- **Review by:** 2026-06-25
- **Scope:** future extension and plugin design across Afenda
- **Decision type:** Adopt now
- **Operational posture:** Prerequisite doctrine
- **Related governance domains:** GOV-ARCH-001, GOV-DOC-001
- **Related ATCs:** ATC-0013
- **Supersedes:** None
- **Superseded by:** None

## Context

Benchmark audits showed meaningful extension ideas, especially from Akaunting-style ecosystems, but Afenda does not yet have doctrine protecting truth, tenancy, permissions, or command integrity from extension drift.

Without doctrine first, "plugin support" would likely arrive as direct imports, monkey patches, or uncontrolled runtime hooks. That would immediately weaken the execution fabric Afenda is trying to stabilize.

## Decision summary

1. Afenda extensions and plugins are doctrine-first, not runtime-first.
2. Any future extension model must be:
   declarative, registered, and auditable.
3. Extensions may contribute bounded capabilities, but they may not override core truth, command, tenancy, or permission law.
4. Direct legacy coupling is forbidden: benchmark repos may inspire design, but their code is not import authority for production extension runtime.
5. No extension runtime implementation may land before its governance boundary is accepted.

## Delivery classification

### What is immediately true

- Afenda now has an official extension doctrine.
- Extensibility is allowed as a future architecture direction only inside a governed registry model.

### What is not yet true

- This ADR does not introduce an extension loader.
- This ADR does not approve hot-plug runtime code injection.
- This ADR does not create a marketplace, public SDK, or partner plugin model.

### How this ADR should be used

- Treat as **binding policy** for what extensions may and may not do.
- Treat as **design prerequisite** before any extension runtime or generator work begins.

## Scope and boundaries

- In scope:
  doctrine for extension registration, lifecycle, tenancy, permissions, command integration, truth/audit behavior, and governance
- Out of scope:
  runtime loader implementation, marketplace design, and public partner APIs

## Architecture contract

### Required

- Extensions must be declarative.
- Extensions must be registered in an explicit registry.
- Extensions must be auditable through lifecycle evidence.
- Extensions must interact with governed commands rather than bypassing them.

### Forbidden

- Runtime monkey patching
- direct writes to truth records
- bypassing command execution or permission checks
- overriding tenant enforcement
- direct import of benchmark repo code as extension runtime

### Allowed exceptions

- None until a future extension runtime proposal lands under this doctrine.

## Alternatives considered

### Option A: implement extension runtime first and document boundaries later

- Pros:
  appears faster
- Cons:
  creates governance debt exactly where Afenda needs the strongest control

### Option B: reject all extensibility indefinitely

- Pros:
  simplest governance story
- Cons:
  blocks future ecosystem and module-economy work even when governed patterns are possible

## Consequences

### Positive

- Afenda now has a safe doctrine baseline for future extensibility.
- Benchmark influence is filtered through governance rather than copied directly.

### Negative

- Extension runtime work remains deferred until follow-up design and implementation waves.

## Evidence and enforcement matrix

| Contract statement                                        | Source of truth                   | Current evidence | Enforcement mechanism             | Gap / follow-up                                                   |
| --------------------------------------------------------- | --------------------------------- | ---------------- | --------------------------------- | ----------------------------------------------------------------- |
| Extensions must be declarative, registered, and auditable | this ADR + ATC-0013               | doctrine exists  | architecture review today         | add runtime enforcement when extension implementation is proposed |
| Extensions may not bypass command/truth/tenant law        | this ADR + command/truth doctrine | doctrine exists  | architecture review today         | bind future runtime hooks to these rules                          |
| Benchmark code is inspiration, not import authority       | reuse audit + this ADR            | doctrine exists  | code review + architecture review | enforce when extension runtime proposals appear                   |

## Implementation plan

### Completed now

- [x] Published extension/plugin doctrine before runtime work

### Required follow-through

- [ ] Add runtime architecture proposal only after this doctrine is accepted and referenced
- [ ] Add governance enforcement when extension implementation becomes active work

## Validation plan

- Required checks:
  `pnpm run script:check-architecture-contracts`, `pnpm run script:check-governance`
- Required manual QA:
  architecture review of any future extension proposal against this doctrine

## References

- Related docs:
  [`ADR-0013`](./ADR-0013-gap-closure-sequencing-and-runtime-truth-convergence.md), [`ATC-0013`](../atc/ATC-0013-governed-extension-and-plugin-boundaries.md), [`ADR-0011`](./ADR-0011-consolidated-reuse-decision-audit.md)
