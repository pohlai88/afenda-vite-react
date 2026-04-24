---
title: Sync-Pack Finding and Remediation Catalog
description: Current finding codes for Sync-Pack release checks, pack checks, and doctor inspections, with explanations and operator fixes.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 40
---

# Sync-Pack Finding and Remediation Catalog

This catalog documents current finding codes visible in the active source.

Core finding contract: `FSDK-FINDING-001`

Current remediation rule:

- every gated `error` must include remediation
- warnings should include remediation when there is a concrete next step
- remediation should point to the next rerun command and the governed doc family

## Severity model

- `error`: blocking and should be fixed before release/handoff
- `warning`: advisory or policy guidance; currently non-blocking in CI mode unless promoted later

## Release-check findings

| Code                             | Severity | Meaning                                                 | Why it happens                                              | How to fix                                            | Related command |
| -------------------------------- | -------- | ------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- | --------------- |
| `missing-export-target`          | error    | An exported build target does not exist.                | `package.json` exports point to files missing under `dist`. | Build the package and restore missing export targets. | `release-check` |
| `bin-target-not-js`              | error    | A CLI bin target does not end in `.js`.                 | Package bin metadata points to the wrong file type.         | Point bin entries at built JavaScript files.          | `release-check` |
| `missing-bin-target`             | error    | A CLI bin target file does not exist.                   | `dist` is stale or bin path is wrong.                       | Rebuild package and verify bin paths.                 | `release-check` |
| `bin-target-missing-shebang`     | error    | A built CLI entrypoint is missing the Node shebang.     | Source/build output lost `#!/usr/bin/env node`.             | Restore shebang in the entrypoint source and rebuild. | `release-check` |
| `invalid-package-name`           | error    | Package name no longer matches `@afenda/features-sdk`.  | `package.json` was changed incorrectly.                     | Restore package name.                                 | `release-check` |
| `missing-package-version`        | error    | Package version is missing.                             | `package.json` version removed.                             | Restore version field.                                | `release-check` |
| `invalid-package-module-type`    | error    | Package is not marked as ESM module.                    | `type` changed from `module`.                               | Set `type` back to `module`.                          | `release-check` |
| `missing-package-description`    | error    | Package description is missing.                         | `description` removed.                                      | Restore package description.                          | `release-check` |
| `invalid-package-license`        | error    | License is not `UNLICENSED`.                            | License changed away from internal posture.                 | Restore `UNLICENSED`.                                 | `release-check` |
| `invalid-repository-directory`   | error    | `repository.directory` is wrong.                        | Package metadata drift.                                     | Restore `packages/features-sdk`.                      | `release-check` |
| `missing-package-bugs-url`       | error    | `bugs.url` is missing.                                  | Metadata incomplete.                                        | Add or restore `bugs.url`.                            | `release-check` |
| `missing-package-homepage`       | error    | `homepage` is missing.                                  | Metadata incomplete.                                        | Add or restore homepage.                              | `release-check` |
| `invalid-publish-access`         | error    | `publishConfig.access` is not `restricted`.             | Internal publish policy drift.                              | Restore restricted access.                            | `release-check` |
| `missing-sync-pack-keyword`      | error    | `sync-pack` keyword is missing.                         | Package keyword metadata drift.                             | Add `sync-pack` to keywords.                          | `release-check` |
| `missing-files-entry`            | error    | Required `files` entry is missing in package metadata.  | Package publish file list drifted.                          | Restore required file entries.                        | `release-check` |
| `missing-required-package-file`  | error    | A required docs/rules/seed file is missing from source. | Required package file deleted or moved.                     | Restore the missing file.                             | `release-check` |
| `missing-required-build-asset`   | error    | A required built template asset is missing.             | Build output incomplete or stale.                           | Rebuild package and restore templates.                | `release-check` |
| `missing-runtime-zod-dependency` | error    | `zod` is not declared as a runtime dependency.          | Dependency moved incorrectly to dev-only or removed.        | Restore `zod` under `dependencies`.                   | `release-check` |
| `node-engine-policy-mismatch`    | error    | Package node engine differs from root policy.           | Package and root metadata drift.                            | Align `engines.node` with root package.               | `release-check` |

## Pack-check findings

| Code                                        | Severity | Meaning                                                      | Why it happens                                                      | How to fix                                            | Related command |
| ------------------------------------------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------- | --------------- |
| `pack-file-contract-mismatch`               | error    | Generated pack does not match the governed 11-file contract. | Files are missing, renamed, or extra files were added.              | Regenerate the pack or restore the governed file set. | `check`         |
| `invalid-candidate-json`                    | error    | `00-candidate.json` is not valid JSON.                       | The pack candidate file was edited into invalid JSON.               | Fix JSON syntax, then rerun `check`.                  | `check`         |
| `invalid-candidate-schema`                  | error    | `00-candidate.json` does not satisfy the candidate schema.   | Candidate data drifted from the governed schema.                    | Correct candidate fields, then rerun `check`.         | `check`         |
| `candidate-read-failed`                     | error    | `00-candidate.json` could not be read or validated.          | The file is unreadable, missing, or failed validation unexpectedly. | Restore the file and rerun `check`.                   | `check`         |
| `candidate-id-path-mismatch`                | error    | Candidate id does not match the pack directory name.         | `00-candidate.json` and folder path drifted apart.                  | Rename directory or fix candidate id.                 | `check`         |
| `candidate-category-path-mismatch`          | error    | Candidate category does not match the category directory.    | Candidate metadata and pack folder location drifted.                | Move the pack or fix `internalCategory`.              | `check`         |
| `adopt-requires-approval`                   | error    | `adopt` candidates are not yet approved.                     | Candidate status is too early for handoff.                          | Set status to `approved` or change `buildMode`.       | `check`         |
| `high-sensitivity-requires-security-review` | error    | High-sensitivity candidate lacks security review flag.       | `dataSensitivity` is `high` but `securityReviewRequired` is false.  | Set `securityReviewRequired=true`.                    | `check`         |
| `empty-pack-section`                        | error    | A markdown section is empty.                                 | Generated or edited content was left blank.                         | Fill it in or explicitly state `Not yet known`.       | `check`         |
| `no-generated-packs`                        | error    | No generated pack directories were found.                    | Packs were never generated or wrong root is being checked.          | Run generation first.                                 | `check`         |

## Doctor findings

| Code                             | Severity | Meaning                                                        | Why it happens                                        | How to fix                                                 | Related command |
| -------------------------------- | -------- | -------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- | --------------- |
| `guarded-major-version-mismatch` | error    | Critical dependency major version violates workspace policy.   | Package resolves to the wrong major version.          | Align dependency with governed version policy.             | `doctor`        |
| `catalog-major-version-drift`    | error    | Declared version major does not match workspace catalog major. | Explicit dependency version diverged from catalog.    | Update version or switch to `catalog:`.                    | `doctor`        |
| `catalog-not-used`               | warning  | Catalog exists but package uses an explicit version.           | Package is not yet using preferred catalog reference. | Replace explicit version with `catalog:` if policy allows. | `doctor`        |

## Validate findings

| Code                     | Severity | Meaning                                              | Why it happens                                              | How to fix                                                     | Related command |
| ------------------------ | -------- | ---------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- | --------------- |
| `invalid-seed-json`      | error    | The curated seed file is not valid JSON.             | The seed file was edited into invalid JSON syntax.          | Fix JSON syntax and rerun `validate`.                          | `validate`      |
| `invalid-seed-candidate` | error    | One or more seed candidates fail the Zod schema.     | Required fields, enums, URLs, or lane/category rules drift. | Correct the invalid candidate fields and rerun `validate`.     | `validate`      |
| `missing-seed-file`      | error    | The expected seed file does not exist.               | The file was moved, deleted, or the wrong root was used.    | Restore the seed file or pass the correct path, then validate. | `validate`      |
| `seed-read-failed`       | error    | The seed file could not be read or validated safely. | Workspace discovery or file access failed unexpectedly.     | Fix the access/discovery issue, then rerun `validate`.         | `validate`      |

## Step-level verify failure wrapper

| Code                                                   | Severity | Meaning                               | Why it happens                                                                                    | How to fix                                                   | Related command |
| ------------------------------------------------------ | -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------- |
| `sync-pack-verify-step-failed` or propagated step code | error    | A verify sub-step threw unexpectedly. | One of `release-check`, `check`, `doctor`, or `validate` failed before producing a normal result. | Run the failing step directly and fix that root cause first. | `verify`        |

## How to use this catalog operationally

When you see a finding:

1. identify the command that produced it
2. check whether it is `error` or `warning`
3. use the matching fix above
4. rerun the specific command first
5. rerun `feature-sync:verify` last
