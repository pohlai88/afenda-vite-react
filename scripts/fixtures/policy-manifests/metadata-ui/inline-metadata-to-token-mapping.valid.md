```tsx
// valid: metadata is normalized and mapped through governed adapter
import { mapInvoiceStatusToUiModel } from "@afenda/shadcn-ui/semantic"

export function InvoiceBadge({ status }: { status: "pending" | "paid" }) {
  const ui = mapInvoiceStatusToUiModel(status)
  return <span className={ui.badgeClass}>{ui.label}</span>
}
```

This should pass because metadata does not map directly to tokens/classes in feature code.
