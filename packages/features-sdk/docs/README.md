---
title: Features SDK Documentation
description: Documentation entrypoint for @afenda/features-sdk with junior-friendly onboarding and Sync-Pack references.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 1
---

# Features SDK Documentation

`@afenda/features-sdk` is Afenda's internal SDK package for governed feature discovery, planning, validation, and handoff workflows.

Today the active module is **Sync-Pack**.

Use this folder when you need a practical path from:

```txt
new operator / junior developer
-> understand the tool
-> run the correct command
-> interpret findings
-> follow the remediation path
-> fix common failures
```

The internal operating chain is:

```txt
Idea -> Template -> Tech Stack -> Contract -> Implementation Plan -> DoD
```

## Start here by role

### If you are new to the package

Read these in order:

1. [getting-started.md](./getting-started.md)
2. [junior-devops-quickstart.md](./junior-devops-quickstart.md)
3. [junior-developer-usage-guide.md](./junior-developer-usage-guide.md)
4. [sync-pack/README.md](./sync-pack/README.md)

### If you need the daily operator path

Go straight to:

- [junior-devops-quickstart.md](./junior-devops-quickstart.md)
- [junior-developer-usage-guide.md](./junior-developer-usage-guide.md)
- [sync-pack/command-handbook.md](./sync-pack/command-handbook.md)
- [sync-pack/troubleshooting.md](./sync-pack/troubleshooting.md)

### If you need schema and contract details

Go to:

- [sync-pack/metadata-reference.md](./sync-pack/metadata-reference.md)
- [sync-pack/finding-remediation-catalog.md](./sync-pack/finding-remediation-catalog.md)
- [sync-pack/architecture-map.md](./sync-pack/architecture-map.md)

## Documentation map

| Document                                                                                           | Audience                          | Purpose                                                                |
| -------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| [getting-started.md](./getting-started.md)                                                         | new contributors                  | Explain what the package is, what it owns, and the safe starting path. |
| [junior-devops-quickstart.md](./junior-devops-quickstart.md)                                       | junior DevOps / junior developers | Operational quickstart from clone to verify to basic failure handling. |
| [junior-developer-usage-guide.md](./junior-developer-usage-guide.md)                               | junior developers                 | Safe command order from candidate metadata to generated pack handoff.  |
| [sync-pack/README.md](./sync-pack/README.md)                                                       | all users                         | Sync-Pack module index and docs map.                                   |
| [sync-pack/command-handbook.md](./sync-pack/command-handbook.md)                                   | operators                         | Purpose, usage, output meaning, exit behavior, and fixes per command.  |
| [sync-pack/QUALITY_VALIDATION_EXECUTION_PLAN.md](./sync-pack/QUALITY_VALIDATION_EXECUTION_PLAN.md) | maintainers and release owners    | Package-first sequential release validation and closure policy.        |
| [sync-pack/metadata-reference.md](./sync-pack/metadata-reference.md)                               | operators and contributors        | Field-by-field reference for seed candidate and scaffold metadata.     |
| [sync-pack/finding-remediation-catalog.md](./sync-pack/finding-remediation-catalog.md)             | operators                         | Meaning and fixes for current finding codes.                           |
| [sync-pack/troubleshooting.md](./sync-pack/troubleshooting.md)                                     | operators                         | Failure isolation and recovery playbook.                               |
| [sync-pack/recipes.md](./sync-pack/recipes.md)                                                     | operators and contributors        | Task-based examples for common workflows.                              |
| [sync-pack/architecture-map.md](./sync-pack/architecture-map.md)                                   | contributors                      | Source layout, export map, and flow between modules.                   |
| [sync-pack/INTERNAL_ROADMAP.md](./sync-pack/INTERNAL_ROADMAP.md)                                   | maintainers and leads             | Internal-first now/next/later plan for the SDK and CLI.                |

## Current package boundary

- Supported environment: Afenda pnpm workspace
- Current active module: `sync-pack`
- Stable daily workflow: `quickstart -> verify`
- Internal status: internal-only tooling for Afenda operators and contributors

## Documentation contract

**FSDK-DOCS-001: Junior Operator Documentation Contract**

Rule:

```txt
A junior DevOps engineer must be able to clone, build, verify,
inspect warnings, and fix common failures using docs only.
```

**FSDK-DOCS-002: Junior Developer Usage Contract**

Rule:

```txt
A junior developer must be able to identify the safe command order,
generate a governed pack, and understand when to stop and ask for help.
```

This docs set now covers both contracts.

It also keeps the remediation layer in sync with the live commands:

- exact rerun command where applicable
- governed doc link for the finding family
- operator-safe workflow from failure back to green
