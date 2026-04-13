# Audit architecture

Normative doctrine and implementation details are maintained next to the `@afenda/database` audit module (single source of truth):

- [Module map and registries (README)](../packages/_database/src/audit/README.md)
- [Doctrine (human-readable)](../packages/_database/src/audit/_DOCTRINE/AUDIT_ARCHITECTURE.md)
- [Agent checklist (full rules)](../packages/_database/src/audit/_agents/SKILL.md)
- [Baseline verdict matrix](../packages/_database/src/audit/_DOCTRINE/AUDIT_VERDICT_MATRIX.md)

SQL migrations for `audit_logs` and related objects live under [`packages/_database/drizzle/`](../packages/_database/drizzle/) (Drizzle journal: `drizzle/meta/_journal.json`).
