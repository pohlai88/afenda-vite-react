---
title: Governance glossary
description: Standard vocabulary for governance policy, contracts, guardrails, evidence, drift, regression, waivers, and CI gates.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: governance-registry
order: 20
---

# Governance glossary

## Policy

A normative rule that defines what the repository expects or forbids.

## Contract

A machine-checkable or review-checkable expression of a policy obligation.

## Guardrail

An enforcement mechanism such as a script, linter, AST check, test, or runtime assertion.

## Evidence

A machine-readable artifact that records current governance state or violations.

## Drift

A divergence between the canonical policy/control plane and the current implementation or evidence.

## Regression

A previously satisfied governance condition becoming violated again.

## Waiver

A time-bounded, owned, reviewable exception recorded in the waiver registry.

## Gate

A CI decision point that validates one governance stage and determines whether the pipeline observes, warns, or blocks.
