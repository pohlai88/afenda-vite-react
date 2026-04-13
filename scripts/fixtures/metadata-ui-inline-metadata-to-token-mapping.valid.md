```tsx
// valid: metadata is normalized and mapped through governed constant layer
import { getToneBgClass } from "@afenda/shadcn-ui-deprecated/lib/constant"

export function InvoiceBadge({ status }: { status: "pending" | "paid" }) {
  const tone = status === "paid" ? "success" : "warning"
  return <span className={getToneBgClass(tone)}>{status}</span>
}
```

This should pass because metadata does not map directly to tokens/classes in feature code.
