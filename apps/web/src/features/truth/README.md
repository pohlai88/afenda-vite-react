# Truth feature (stub — knowledge only)

This folder is a **placeholder** that records what the legacy **“truth”** system was before it was removed from the codebase. There is **no runtime code** here — see `docs/__idea__/truth-operating-delivery-program.md` for the execution plan and future reintegration under ERP-native naming.

## What “truth” covered (historical)

The old system mixed **two concerns** under one name:

### A — Operational scope (ERP shell context)

Core navigation context: tenant, legal entity, accounting period, reporting currency. Implemented as `TruthScope`, Zustand scope store, org/subsidiary pickers in the top nav and breadcrumb strip.

**ERP-oriented terms to use later:** operational context, working scope, active entity context.

### B — Integrity / health / alerts

Optional shell UI for invariants, health summary, alert lists, resolution suggestions, command-palette audit/resolve entries, and severity-colored chrome. Types and stores lived under `@afenda/core` (`truth`, `truth-ui`) and `apps/web` client stores named `truth-*`.

**ERP-oriented terms to use later:** integrity monitor, system health, business-rule violations, reconciliation alerts.

### C — Governance / tooling

Policy surfaces, drift scanners, glossary entries, and i18n keys that referenced `truth` or `@afenda/core/truth` imports were removed or renamed so new work does not reattach to the old vocabulary.

## After removal

Rebuilding scope, health, and alerts is a **separate program**: define ERP-native types and stores first, then wire UI. This README stays as the historical anchor only.
