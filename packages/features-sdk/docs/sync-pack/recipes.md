---
title: Sync-Pack Recipes
description: Task-oriented recipes for common Sync-Pack workflows used by operators and contributors.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 60
---

# Sync-Pack Recipes

## Recipe 1: first run after cloning the repo

```txt
pnpm install
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync
pnpm run feature-sync:verify
```

Use when:

- you are new to the repo
- you want to confirm the package is healthy

## Recipe 2: validate seed metadata before doing anything else

```txt
pnpm run feature-sync:validate
```

Use when:

- `rules/sync-pack/openalternative.seed.json` changed
- you suspect metadata quality issues

Then continue with:

```txt
pnpm run feature-sync:generate
pnpm run feature-sync:check
```

## Recipe 3: regenerate planning packs safely

```txt
pnpm run feature-sync:generate
pnpm run feature-sync:check
```

Use when:

- candidate metadata changed
- pack contents were deleted or damaged

## Recipe 4: investigate a failing verify run

```txt
pnpm run feature-sync:verify -- --json --ci
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

Use when:

- `verify` reports errors
- you need to identify the failing step precisely

## Recipe 5: inspect dependency drift only

```txt
pnpm run feature-sync:doctor
```

Use when:

- package versions changed
- workspace catalog policy changed

## Recipe 6: generate a scaffold manifest for a new internal app idea

```txt
pnpm run feature-sync:scaffold -- --app-id internal-support --category business-saas
```

Use when:

- you need a governed stack starting point
- you want category-aware dependency recommendations

## Recipe 7: review candidate priority and portfolio shape

```txt
pnpm run feature-sync:rank
pnpm run feature-sync:report
```

Use when:

- discussing feature priority
- comparing candidates before generation

## Recipe 8: prepare the package for internal release confidence

```txt
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync:release-check -- --json --ci
pnpm run feature-sync:verify -- --json --ci
pnpm run feature-sync:quality-validate
```

Use when:

- docs changed
- package metadata changed
- templates, rules, or bins changed
