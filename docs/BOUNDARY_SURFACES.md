---
title: Boundary surfaces
description: Canonical boundary doctrine for root vs owner-local surfaces across docs, doctrine, rules, scripts, schema, and tests.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
surfaceType: doctrine
relatedDomain: monorepo-governance
order: 15
---

# Boundary surfaces

This document defines the canonical boundary model for repository surfaces.
It answers three questions before a file is placed:

1. What surface is this?
2. Who owns it?
3. Does root placement have repo-wide justification?

The repo uses two axes:

- **Scope axis:** `root` vs `owner-local`
- **Surface axis:** `docs`, `doctrine`, `rules`, `scripts`, `schema`, `tests`

Root placement always requires repo-wide justification.
Owner-local placement is the default unless the surface truly governs or serves the whole repository.

## Surface definitions

### Docs

Docs are explanatory, supporting, reference, generated-index, or operational guidance surfaces.

Examples:

- onboarding
- usage notes
- operating maps
- generated README indexes
- local runbooks

Docs may be canonical, supporting, generated, or historical.
They are not automatically doctrine.

### Doctrine

Doctrine is the semantic class for authoritative governing text.

Doctrine answers:

- what governs this area
- which decision or contract is authoritative
- which source wins if guidance conflicts

Doctrine is not a separate required filesystem tree.
By default:

- root doctrine lives under `docs/architecture/**`
- owner-local doctrine lives under the owner's `docs/` surface and is classified as doctrine by metadata

Owner-local doctrine is optional and rare.
Create it only when an owner has a durable bounded policy or contract surface that would otherwise become duplicated, unstable, or ambiguous under root doctrine alone.

### Rules

Rules are policy artifacts tied directly to enforcement posture, machine consumption, or formal review.

`rules/` is not a general governance archive.
It is reserved for artifacts that are:

- machine-consumed
- review-consumed
- directly tied to enforcement posture

Allowed examples:

- waiver registries
- rule registries
- policy artifacts consumed by checks
- formally reviewed enforcement records

Disallowed by doctrine:

- general narrative docs
- generic handoff notes
- broad planning prose with no rule or enforcement relationship

### Scripts

Scripts are execution surfaces.

At root, `scripts/` is only for:

- repo-local orchestration
- repo-wide checks
- repo-wide generation
- repo-wide runtime and tooling diagnostics
- external bridges

Owner-local scripts belong with the owner by default.

### Schema

Schema defaults to the owner.

Use owner-local schema for:

- feature-owned schema
- package-owned schema
- bounded internal models

Use root schema only for:

- cross-repo binding or config schema
- repo-global machine contract schema

### Tests

Tests are also part of the boundary model.

Root tests:

- repo-wide integration, governance, or workspace verification only

Owner-local tests:

- default home for tests proving owner-local behavior, contracts, schema, rules, and scripts

## Scope rules

### Root surfaces

**Root docs**

- repo-wide guidance
- generated navigation
- cross-cutting references

**Root doctrine**

- repo-wide architecture
- contracts
- constitutions
- canonical governance

**Root rules**

- repo-wide policy artifacts tied to enforcement or formal review

**Root scripts**

- repo-wide execution and orchestration only

**Root schema**

- repo-global binding or config schema only

**Root tests**

- workspace, governance, or integration verification only

### Owner-local surfaces

Apply the same vocabulary to both:

- app features and platform slices
- workspace packages

Allowed owner-local surfaces:

- `docs`
- `doctrine` inside owner docs, by metadata classification
- `rules`
- `scripts`
- `schema`
- `tests`

Folders are optional when unused, but the conceptual model is the same.

## Placement defaults

- Repo-wide or multi-owner concerns may justify root placement.
- Owner-specific concerns should stay with the owner.
- Do not create a dedicated `doctrine/` tree.
- Do not move schema to root just because it feels important.
- Do not treat `rules/` as a narrative overflow area.
- Do not move owner-local runnable tooling into root `scripts/` for convenience.

## Default answers

When deciding where a new surface belongs, use these defaults:

- feature or package guidance: owner-local `docs/`
- authoritative repo-wide governance or architecture: root doctrine under `docs/architecture/**`
- authoritative owner-local policy or contract: owner-local `docs/`, classified as doctrine
- machine-consumed or enforcement-tied policy artifact: `rules/` at the appropriate scope
- runnable owner-local tooling: owner-local `scripts/`
- bounded schema: owner-local `schema`
- behavior verification: owner-local `tests`

If root placement cannot explain why the whole repository needs the surface, it is probably the wrong scope.
