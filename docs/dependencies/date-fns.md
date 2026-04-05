# date-fns guide (Afenda)

This document describes how **`apps/web`** uses **[date-fns](https://date-fns.org/)** for **immutable** date parsing, formatting, and comparison with **named imports** (tree-shaking friendly), aligned with API **ISO 8601** strings, **[Zod](./zod.md)** parsing at boundaries, and future **[i18n](./i18n.md)**.

**Status:** **Adopted** in **`apps/web`** — **`date-fns` ^4.x** in dependencies (verify exact version in [`apps/web/package.json`](../../apps/web/package.json)).

**Official documentation:**

- [date-fns.org](https://date-fns.org/) — landing and search
- [Getting started](https://date-fns.org/docs/Getting-Started) — install, ESM / bundler notes
- [Unicode tokens (`format` / `parse`)](https://date-fns.org/docs/format)
- [I18n](https://date-fns.org/docs/I18n) — locales, bundle size
- [FP submodule (`date-fns/fp`)](https://github.com/date-fns/date-fns/blob/main/docs/fp.md) — curried, composable APIs
- [date-fns on GitHub](https://github.com/date-fns/date-fns)

**Time zones (ecosystem):**

- [**`@date-fns/tz`**](https://github.com/date-fns/tz) — **`TZDate`** / **`TZDateMini`**, IANA zones, DST-safe math with core **date-fns** functions ([README](https://github.com/date-fns/tz/blob/main/README.md))

---

## How we use date-fns

| Topic | Convention |
| --- | --- |
| **Imports** | **Named imports** from **`date-fns`** — e.g. `import { format, parseISO } from 'date-fns'`. Avoid **`import * as dfns`** or barrels that pull the whole library ([Performance](../PERFORMANCE.md)) |
| **API JSON** | Prefer **ISO 8601** strings in [API](../API.md) payloads; validate with [Zod](./zod.md), then **`parseISO`** (or **`parse`**) before passing to **date-fns** |
| **Locales** | Import **only** locales you need — e.g. `import { de } from 'date-fns/locale/de'` — and pass **`{ locale }`** into **`format`**, **`formatDistance`**, **`formatRelative`**, etc. ([I18n](https://date-fns.org/docs/I18n)) |
| **Time zones** | For ERP scheduling and **DST**-correct arithmetic in a **fixed IANA zone**, prefer **`@date-fns/tz`** **`TZDate`** with **date-fns** (`addHours`, `format`, …). **`TZDateMini`** is smaller but **`toString()`** follows the **system** zone—use **`TZDate`** when display in the target zone matters |

### Illustrative patterns

**Format + locale:**

```typescript
import { format, formatDistance, subDays } from 'date-fns';
import { es } from 'date-fns/locale/es';

format(new Date(2024, 8, 15), 'PPPP', { locale: es });
formatDistance(subDays(new Date(), 3), new Date(), { addSuffix: true, locale: es });
```

**ISO from the wire:**

```typescript
import { parseISO, isValid } from 'date-fns';

const d = parseISO(isoStringFromApi);
if (!isValid(d)) {
  /* handle bad data — Zod should catch this earlier when possible */
}
```

**Optional FP style** (curried / composable pipelines):

```typescript
import { addDays, format } from 'date-fns/fp';

const addWeek = addDays(7);
const asYmd = format('yyyy-MM-dd');
```

**Time zone–aware instance** (when product requires it):

```typescript
import { TZDate } from '@date-fns/tz';
import { addHours } from 'date-fns';

const closing = new TZDate(2025, 3, 15, 9, 0, 0, 'Europe/Copenhagen');
const next = addHours(closing, 8);
```

Add **`@date-fns/tz`** to the package that needs it; keep **server** and **client** boundaries clear for audits.

---

## Red flags

- **Date arithmetic** in the UI without documenting **UTC vs local** vs **tenant timezone** for compliance and support.
- Importing **entire** **`date-fns`** or **unused locales** (bundle bloat).
- Assuming **`Date`** in the browser matches **server** or **tenant** “calendar day” without explicit policy.

---

## Related documentation

- [i18n](./i18n.md)
- [Zod](./zod.md)
- [API reference](../API.md)
- [Performance](../PERFORMANCE.md)

**External:** [date-fns.org](https://date-fns.org/) · [GitHub — date-fns](https://github.com/date-fns/date-fns) · [GitHub — @date-fns/tz](https://github.com/date-fns/tz)

**Context7 library IDs (doc refresh):** `/date-fns/date-fns` · `/date-fns/tz`
