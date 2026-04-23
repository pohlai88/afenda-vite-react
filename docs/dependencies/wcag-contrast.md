---
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: dependency-guide
category: web-client-planned
status: Planned
---

# WCAG contrast & `wcag-contrast` guide (Afenda)

This document describes **planned** use of the **[`wcag-contrast`](https://www.npmjs.com/package/wcag-contrast)** npm package for **contrast ratio** checks against **design tokens** — complementary to **ESLint jsx-a11y** and manual a11y review, not a full audit.

**Status:** **Planned** — add when the team wants automated token/contrast gates.

**Package note:** **`wcag-contrast`** (API: **`hex`**, **`rgb`**, **`luminance`**, **`score`**) implements the same **relative luminance** math as WCAG; the last npm publish is **dated**—evaluate **`pnpm outdated`**, upstream [GitHub](https://github.com/tmcw/wcag-contrast), or newer tooling (e.g. design-token pipelines, **axe**/Lighthouse in CI) before hard-coding it in critical gates.

**Official / reference documentation:**

**Normative / WAI**

- [WCAG 2.2 — How to Meet (Quick Reference)](https://www.w3.org/WAI/WCAG22/quickref/)
- [Understanding 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) — **Level AA**: generally **4.5:1** normal text, **3:1** large text / UI components (see doc for exceptions)
- [Understanding 1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html) — **Level AAA** (**7:1** / **4.5:1** large)
- [WCAG 2.2 Recommendation (TR)](https://www.w3.org/TR/WCAG22/) — normative definitions (e.g. **contrast ratio**)

**npm utility**

- [`wcag-contrast` on npm](https://www.npmjs.com/package/wcag-contrast)
- [Source: `tmcw/wcag-contrast`](https://github.com/tmcw/wcag-contrast)

**In-repo**

- [ESLint](./eslint.md) (`eslint-plugin-jsx-a11y`)
- [Design system](../DESIGN_SYSTEM.md) · [Components and styling](../COMPONENTS_AND_STYLING.md)

---

## How we use `wcag-contrast`

| Topic               | Convention                                                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Targets**         | Gate against **WCAG 2.2** **1.4.3** (minimum) by default; optionally assert **1.4.6** (enhanced) for marketing or high-risk surfaces ([Understanding docs](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)) |
| **Inputs**          | Run against **CSS variables** / token tables, not one-off hex in leaf components                                                                                                                                               |
| **Modes**           | Check **light**, **dark**, optional **high-contrast** / forced-colors considerations ([Design system](../DESIGN_SYSTEM.md))                                                                                                    |
| **API**             | Use **`hex`/`rgb`** for pairs; map ratios to labels with **`score()`** only if it matches your chosen level (AA vs AAA)—verify thresholds in W3C text, not only the helper string                                              |
| **Beyond contrast** | Non-color cues, focus, semantics, motion — [Design system](../DESIGN_SYSTEM.md); contrast tooling does **not** replace keyboard or SR testing                                                                                  |

---

## Red flags

- **Passing** contrast checks while **failing** keyboard or screen reader requirements.
- Trusting **only** math on **gradients**, **images behind text**, or **semi-transparent** overlays—WCAG exceptions and “adjacent color” rules still need human judgment ([Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).

---

## Related documentation

- [Design system](../DESIGN_SYSTEM.md)
- [Brand guidelines](../BRAND_GUIDELINES.md)
- [ESLint](./eslint.md)

**External:** [WAI WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) · [`wcag-contrast` on npm](https://www.npmjs.com/package/wcag-contrast)

**Context7 (AI doc refresh):** **`WCAG 2.2`** → **`/websites/w3_wai_wcag22`** or **`/w3c/wcag`**. Then **`query-docs`** for **1.4.3**, **1.4.6**, or relative luminance. The **`wcag-contrast`** package is not indexed as its own library—use npm/README for API details.
