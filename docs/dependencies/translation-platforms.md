---
title: Translation platforms
description: Compare self-hosted localization platforms for Afenda translation operations and terminology governance.
category: optional
status: Research
order: 90
---

# Translation platforms (Transifex-like) for Afenda

This guide evaluates open-source, self-hosted localization platforms for Afenda and enforces a strict separation between operations workflow and semantic authority.

## Final architecture (decision framing)

Do not mix platform selection with corpus authority:

1. **Primary operations platform**
   - Translator workflow
   - Review and approval
   - Collaboration
   - API/export and release versioning
2. **Reference corpora only**
   - Odoo/Frappe/Weblate-linked sources as candidate terminology inputs
   - Bootstrap suggestions and conflict comparison only
3. **Afenda semantic truth**
   - `apps/web/src/share/i18n/glossary/canonical-terms.json`
   - `apps/web/src/share/i18n/glossary/decisions.json`

Authority rule: platform content is never final truth without passing glossary/decision constraints.

---

## Candidates verified

- [Tolgee platform](https://github.com/tolgee/tolgee-platform)
- [Weblate](https://github.com/WeblateOrg/weblate)
- [Mozilla Pontoon](https://github.com/mozilla/pontoon)
- [Ever Traduora](https://github.com/ever-co/ever-traduora)

Reference baseline: [Transifex](https://www.transifex.com/).

---

## Quality matrix (Afenda-weighted)

Scoring legend: `1` (weak) to `5` (strong).

| Criterion                                            |   Weight |   Tolgee |  Weblate |  Pontoon | Traduora |
| ---------------------------------------------------- | -------: | -------: | -------: | -------: | -------: |
| Operations workflow fit                              |      30% |        5 |        4 |        4 |        4 |
| Developer integration fit                            |      20% |        5 |        4 |        3 |        4 |
| Self-hosting readiness                               |      20% |        5 |        5 |        3 |        4 |
| Maintenance/maturity                                 |      15% |        5 |        5 |        4 |        3 |
| Bootstrap language asset usefulness (`ms`,`id`,`vi`) |      10% |        3 |        5 |        2 |        2 |
| License/operational risk clarity                     |       5% |        4 |        5 |        5 |        4 |
| **Weighted score (5 max)**                           | **100%** | **4.75** | **4.50** | **3.45** | **3.65** |

### Why these scores

- **Tolgee**
  - Strong workflow/product fit for i18next-oriented teams, with in-context workflows, automation, and modern integration posture ([source](https://github.com/tolgee/tolgee-platform/blob/main/README.md)).
  - Strong self-hosting and engineering structure (`docker/`, backend + webapp split) ([source](https://github.com/tolgee/tolgee-platform)).
  - Bootstrap language signal is weaker for direct `ms/id/vi` reuse from platform repo locale files ([source](https://github.com/tolgee/tolgee-platform/tree/main/webapp/src/i18n)).

- **Weblate**
  - Very mature operations platform and strong self-hosting profile ([source](https://github.com/WeblateOrg/weblate/blob/main/README.rst)).
  - Strong bootstrap language asset signal: `ms`, `id`, `vi` present under `weblate/locale` ([source](https://github.com/WeblateOrg/weblate/tree/main/weblate/locale)).
  - Slightly lower fit than Tolgee for Afenda's current i18next + developer-velocity operating model.

- **Pontoon**
  - Proven localization platform with strong pedigree ([source](https://github.com/mozilla/pontoon/blob/main/README.md)).
  - Bundled locale sample is limited for direct Malay bootstrap (`translate/public/locale`) ([source](https://github.com/mozilla/pontoon/tree/main/translate/public/locale)).
  - Less turnkey self-hosting profile for Afenda's immediate path.

- **Traduora**
  - Viable open-source TMS with Docker/Kubernetes and API orientation ([source](https://github.com/ever-co/ever-traduora/blob/develop/README.md)).
  - Useful option, but lower maturity confidence than Tolgee/Weblate for this migration.
  - Weaker direct bootstrap language signal from current repository locale assets ([source](https://github.com/ever-co/ever-traduora/tree/develop/webapp/src/i18n)).

---

## Verified bootstrap language asset signal (GitHub MCP)

This criterion measures bootstrap usefulness, not semantic correctness:

- **Weblate:** strongest signal for immediate `ms/id/vi` language assets.
- **Tolgee:** strongest operations platform signal, weaker direct `ms/id/vi` corpus signal in repo locale files.
- **Pontoon/Traduora:** lower immediate bootstrap signal for this locale set.

Important: locale presence does not equal ERP-domain semantic correctness. All imported candidates must be filtered by Afenda glossary and decision policy.

---

## Final recommendation for Afenda

**Decision statement**

> Adopt Tolgee for workflow and developer velocity.
> Use Weblate/Odoo/Frappe-derived material only as migration input, never as semantic authority.

### Operating rules

- `Tolgee` manages translation operations workflow.
- `Weblate`, `Odoo`, and `Frappe` feed candidate/reference terminology only.
- `canonical-terms.json` + `decisions.json` remain final semantic authority.

---

## Hack-and-adopt: self-hosted Tolgee setup

This section documents the actual operational setup — not a future plan.

### Prerequisites

- Docker and Docker Compose installed

### 1. Start the Tolgee instance

```bash
docker compose -f docker-compose.tolgee.yml up -d
```

This starts Postgres 16 + Tolgee on `http://localhost:8085` with default admin credentials (`admin`/`admin`).

### 2. Create project and API key

1. Open `http://localhost:8085` and log in.
2. Create an organization (e.g. "Afenda").
3. Create a project (e.g. "afenda-web") with base language `en` and target languages `ms`, `id`, `vi`.
4. Go to user settings and generate a Personal Access Token (PAT).

### 3. Configure environment

```bash
cp .env.tolgee.example .env.tolgee
```

Fill in `TOLGEE_API_URL`, `TOLGEE_PROJECT_ID`, and `TOLGEE_API_KEY` from step 2.

### 4. Seed existing translations into Tolgee

```bash
pnpm run script:i18n-tolgee-seed
```

This pushes all keys from `apps/web/src/share/i18n/locales/{en,ms,id,vi}/*.json` into the running Tolgee instance, creating languages and importing keys with namespace tags.

### 5. Verify the live pipeline

```bash
pnpm run script:i18n-corpus-ingest
pnpm run script:i18n-crossref-audit
pnpm run script:validate-i18n
```

The ingest script automatically loads `.env.tolgee` and fetches from the live Tolgee translations API. The audit then cross-references against glossary, and validation enforces CI gates.

### Key files

| File                             | Purpose                                                   |
| -------------------------------- | --------------------------------------------------------- |
| `docker-compose.tolgee.yml`      | Self-hosted Tolgee + Postgres                             |
| `.env.tolgee.example`            | Template for Tolgee connection env vars                   |
| `.env.tolgee`                    | Local config (git-ignored)                                |
| `scripts/i18n-tolgee-seed.ts`    | Seeds locale JSON into Tolgee via API                     |
| `scripts/i18n-corpus-ingest.ts`  | Pulls from Tolgee API (or local fallback)                 |
| `scripts/i18n-crossref-audit.ts` | Cross-refs Tolgee (primary) + ERP (reference) vs glossary |
| `scripts/validate-i18n.ts`       | CI gate: fails on unresolved conflicts                    |

### Auth note

Tolgee PATs use the `X-API-Key` header (not `Authorization: Bearer`). Both the seed and ingest scripts auto-detect the token format from the `tgpat_` prefix.

---

## Implementation status

Fully operational with deterministic defaults:

- **`scripts/i18n-corpus-ingest.ts`**
  - Generates `scripts/data/i18n-corpus-tolgee.json` (primary), plus Frappe/Odoo reference corpora.
  - Loads `.env.tolgee` automatically for local runs.
  - Uses Tolgee translations API (`/v2/projects/{id}/translations`) when configured.
  - Falls back to `apps/web/src/share/i18n/locales` when Tolgee env vars are not set (deterministic CI-safe behavior).
- **`scripts/i18n-tolgee-seed.ts`**
  - Reads all locale JSON files and bulk-imports into Tolgee via `/v2/projects/{id}/keys/import`.
  - Auto-creates missing languages.
- **`scripts/i18n-crossref-audit.ts`**
  - Treats `tolgee` as `sourceTier: primary`.
  - Treats `frappe`/`odoo` as `sourceTier: reference`.
  - Keeps glossary and decisions as semantic authority.
- **`scripts/validate-i18n.ts`**
  - Fails on release namespaces when primary-platform conflicts/missing values are detected.
- **`.github/workflows/ci.yml`**
  - Regenerates corpora + audit.
  - Verifies generated artifacts are committed (`git diff --exit-code`).
  - Runs i18n validation as a required gate.
