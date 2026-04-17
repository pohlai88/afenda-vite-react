# Future governance — proposing new terms and fields

Studio **v0** is **read-only**: it helps users **verify** names against the YAML glossary and browse allowlisted enums and recent audit rows. Changing the model still goes through **migrations** and code review.

## When you need a write path

If non-engineers must **propose** or **approve** new business terms or mapped columns without editing Git:

1. **DB-backed glossary tables** — `glossary_term`, `glossary_mapping`, versioning, steward roles; YAML becomes **export** or **seed** from DB.
2. **External catalog** — deploy [OpenMetadata](https://github.com/open-metadata/OpenMetadata) or [DataHub](https://github.com/datahub-project/datahub) beside Afenda; link out or sync via batch jobs.

## Trade-offs

| Approach | Pros | Cons |
| -------- | ---- | ---- |
| Native Afenda tables | Single product, tenant RBAC reuse | Build workflows, UI, migrations |
| OpenMetadata / DataHub | Mature glossary + lineage | Ops cost, integration surface |

**Recommendation:** stay on YAML + Studio read-only until volume of change justifies a workflow; then prefer **native tables** if ERP UX must stay in-app, or **external catalog** if enterprise data-platform standards require it.
