# Playwright (workspace E2E)

Reserved for **shared E2E** concerns when `apps/*` gain Playwright (or similar) projects:

- Base **`playwright.config.ts`** fragments or shared **`testDir`** conventions
- **Storage state** / auth fixtures reused across apps
- **Page objects** or **routes** shared by multiple products

App-specific suites stay under each **`apps/<name>/`**; only **cross-app** or **policy-level** helpers belong here.
