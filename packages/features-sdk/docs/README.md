---
title: Features SDK Documentation
description: Documentation entrypoint for @afenda/features-sdk with internal-first onboarding and maintainer workflow references.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 1
---

# Features SDK Documentation

`@afenda/features-sdk` is Afenda’s internal SDK package for governed feature planning, validation, and maintainer closure.

Its active module is **Sync-Pack**.

## Start Here By Role

### New contributor or junior operator

Read in this order:

1. [getting-started.md](./getting-started.md)
2. [junior-devops-quickstart.md](./junior-devops-quickstart.md)
3. [junior-developer-usage-guide.md](./junior-developer-usage-guide.md)
4. [sync-pack/README.md](./sync-pack/README.md)

### Maintainer changing the SDK/package

Use these next:

- [sync-pack/FSDK-INTENT-001_CHANGE_INTENT_CONTRACT.md](./sync-pack/FSDK-INTENT-001_CHANGE_INTENT_CONTRACT.md)
- [sync-pack/change-intents/README.md](./sync-pack/change-intents/README.md)
- [sync-pack/FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md](./sync-pack/FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md)
- [sync-pack/QUALITY_VALIDATION_EXECUTION_PLAN.md](./sync-pack/QUALITY_VALIDATION_EXECUTION_PLAN.md)

## Current Internal Surface

The active internal surface now covers:

- deterministic root quickstart through `feature-sync`
- explicit daily operator workflow through `feature-sync:verify`
- truth-bound change intent through `feature-sync:intent` and `feature-sync:intent-check`
- governed golden example fitness through `feature-sync:sync-examples`
- package-first closure through `feature-sync:quality-validate`

## Documentation Map

| Document                                                                                                                         | Audience                  | Purpose                                                |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------ |
| [getting-started.md](./getting-started.md)                                                                                       | all new users             | Explain what Sync-Pack is and the safe first commands. |
| [junior-devops-quickstart.md](./junior-devops-quickstart.md)                                                                     | junior DevOps             | Daily operator path and failure isolation.             |
| [junior-developer-usage-guide.md](./junior-developer-usage-guide.md)                                                             | junior developers         | Safe command order from seed to generated pack.        |
| [sync-pack/README.md](./sync-pack/README.md)                                                                                     | all users                 | Active Sync-Pack guide and docs map.                   |
| [sync-pack/command-handbook.md](./sync-pack/command-handbook.md)                                                                 | operators and maintainers | Command purpose, examples, and recovery guidance.      |
| [sync-pack/FSDK-INTENT-001_CHANGE_INTENT_CONTRACT.md](./sync-pack/FSDK-INTENT-001_CHANGE_INTENT_CONTRACT.md)                     | maintainers               | Truth-bound change intent contract.                    |
| [sync-pack/change-intents/README.md](./sync-pack/change-intents/README.md)                                                       | maintainers               | Intent lifecycle and file rules.                       |
| [sync-pack/FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md](./sync-pack/FSDK-EXAMPLE-001_GOLDEN_EXAMPLE_FITNESS_CONTRACT.md) | maintainers               | Golden example fitness rules and repair flow.          |
| [sync-pack/GOLDEN_EXAMPLES.md](./sync-pack/GOLDEN_EXAMPLES.md)                                                                   | operators and maintainers | Golden example starting points and usage guidance.     |
| [sync-pack/finding-remediation-catalog.md](./sync-pack/finding-remediation-catalog.md)                                           | operators                 | Meaning and fixes for current finding codes.           |
| [sync-pack/INTERNAL_ROADMAP.md](./sync-pack/INTERNAL_ROADMAP.md)                                                                 | maintainers and leads     | Internal roadmap and closure state.                    |

## Operating Rule

The package is internal-first.

It is not currently optimized for partner or public externalization. Those surfaces remain explicitly deferred.
