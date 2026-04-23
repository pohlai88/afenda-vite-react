---
owner: marketing-public
truthStatus: canonical
docClass: canonical-doc
relatedDomain: brand-identity
---

# Afenda ERP — Brand guidelines

This document defines the **visual identity defaults** for the Afenda ERP web client. In multi-tenant deployments, **organizations** can customize brand colors and logos via **admin settings**. For the full **design system** (principles, motion, spacing, ERP module colors, accessibility), see [**DESIGN_SYSTEM.md**](./DESIGN_SYSTEM.md).

---

## 1. Logo

### 1.1 Primary logo

The default product logo combines:

- **Logo mark** — Rounded square with the brand gradient (primary → secondary) and a bold white initial character (e.g. **A** for Afenda).
- **Wordmark** — Application name in bold with the same gradient text treatment.

### 1.2 Logo sizes

| Size          | Mark    | Text | Usage                       |
| ------------- | ------- | ---- | --------------------------- |
| Small (`sm`)  | 28×28px | 16px | Collapsed sidebar, favicons |
| Medium (`md`) | 32×32px | 18px | Default header, navigation  |
| Large (`lg`)  | 40×40px | 24px | Landing, marketing          |

### 1.3 Logo clear space

Keep minimum clear space equal to the **height of the logo mark** on all sides.

### 1.4 Logo usage rules

- **Do** — Use on light backgrounds (white, off-white, light gray).
- **Do** — Use on dark backgrounds (gradient remains legible).
- **Do** — Use the tenant’s **custom logo URL** when configured in admin settings.
- **Don’t** — Place on busy imagery without a solid or blurred backdrop.
- **Don’t** — Stretch, rotate, or distort the mark or wordmark.
- **Don’t** — Change gradient stops outside **admin branding** settings.

### 1.5 Tenant custom logos

When an organization sets `logoUrl` in admin settings, the **custom image replaces the default logo mark**; the **wordmark** stays as defined by product copy/branding policy. Custom marks should:

- Be square or near-square (**1:1** recommended).
- Prefer **transparent** background (PNG or SVG).
- Be at least **128×128px** for sharp rendering at all breakpoints.

---

## 2. Color palette

### 2.1 Brand colors (tenant-configurable)

| Role          | Default hex | Default HSL   | Usage                                             |
| ------------- | ----------- | ------------- | ------------------------------------------------- |
| **Primary**   | `#4F5BD5`   | `245 58% 52%` | Buttons, links, focus rings, brand gradient start |
| **Secondary** | `#7C6EAF`   | `270 30% 58%` | Secondary actions, brand gradient end             |
| **Accent**    | `#2BA8A4`   | `175 55% 40%` | Tertiary highlights, differentiation              |

Defaults can be overridden per tenant through admin settings where the product supports it.

### 2.2 Status colors

| Status      | Color                       | Usage                         |
| ----------- | --------------------------- | ----------------------------- |
| Success     | Green `oklch(62% 0.17 150)` | Completed, approved, positive |
| Warning     | Amber `oklch(75% 0.16 75)`  | Needs attention, pending      |
| Destructive | Red `oklch(58% 0.22 25)`    | Errors, deletions, critical   |
| Info        | Blue `oklch(62% 0.14 240)`  | Informational, tips           |

### 2.3 Neutral palette

Warm gray with a slight blue undertone (hue ~**260**). See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §3.2 for the full twelve-step scale.

---

## 3. Typography

### 3.1 Font

**DM Sans** — geometric sans from Google Fonts; modern, readable, suitable for dense ERP screens.

Weights: Regular **400**, Medium **500**, Semibold **600**, Bold **700**.

### 3.2 Heading style

Headings use **semibold (600)** (or **bold** for `h1` per design system) with **negative letter-spacing** (`-0.02em` to `-0.03em`) for a tight, editorial feel.

```text
h1: 2.25rem / bold / -0.03em tracking
h2: 1.875rem / semibold / -0.025em tracking
h3: 1.5rem / semibold / -0.02em tracking
```

### 3.3 Body text

Body uses **regular (400)** and default letter-spacing for long-form and table content.

---

## 4. The brand gradient

The brand gradient runs **primary → secondary**.

```css
background: linear-gradient(
  135deg,
  hsl(var(--brand-gradient-from)),
  hsl(var(--brand-gradient-to))
);
```

### 4.1 Where it appears

| Location              | Implementation                                                       |
| --------------------- | -------------------------------------------------------------------- |
| Logo mark             | `.brand-gradient` on the logo container                              |
| Dashboard hero        | Page header `variant="hero"` (or equivalent) using `.brand-gradient` |
| Sidebar/header accent | Optional **0.5px** top stripe using `.brand-gradient`                |

### 4.2 Where it does **not** appear

- Primary buttons (use solid **`bg-primary`**).
- Card backgrounds (use elevation/shadow).
- Progress bars (solid domain/status colors).
- Icon containers (solid domain color at ~10% opacity).
- General decoration.

**Scarcity is intentional** — the gradient should feel **premium and deliberate**, not like a default UI kit.

---

## 5. Visual signature summary

| Element                  | Description                          | Where                 |
| ------------------------ | ------------------------------------ | --------------------- |
| **Domain accent bar**    | 3px colored **left border** on cards | Domain/module cards   |
| **Premium elevation**    | Layered shadows, hover transitions   | Cards, menus          |
| **Solid primary action** | `bg-primary`, no gradient            | Primary buttons       |
| **Brand moment**         | Primary→secondary gradient           | Logo mark + hero only |
| **Warm neutral canvas**  | Slightly warm off-white background   | Page backgrounds      |

---

## 6. Do’s and don’ts

### Do

- Use **domain accent bars** so users recognize module/card type quickly.
- Use solid **`bg-primary`** for primary actions.
- Use **elevation** (shadows) for depth and interactive affordance.
- Use the brand gradient **only** on logo mark and hero (or explicitly approved marketing surfaces).
- Reference **semantic tokens** (`bg-primary`, `text-muted-foreground`, etc.) — avoid raw hex in components.
- Check **contrast** (4.5:1 text, 3:1 UI).

### Don’t

- Put gradients on buttons, cards, progress bars, or icon circles.
- Use decorative blur blobs as default page backgrounds.
- Hardcode hex in class names (e.g. `from-[#5D73F5]`) — use tokens.
- Emphasize everything at once; reserve strong emphasis for primary tasks.
- Use invalid Tailwind gradient utilities — prefer `bg-gradient-to-*` with token stops or documented classes.
- Mix color spaces carelessly — follow [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) §1 for HSL vs OKLCH usage.

---

_For token tables and neutral scale, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md). For component structure and styling stacks, see [COMPONENTS_AND_STYLING.md](./COMPONENTS_AND_STYLING.md)._
