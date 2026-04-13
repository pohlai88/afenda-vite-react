```tsx
// invalid: inline metadata->token map in feature code
const statusToTokenMap = {
  pending: "text-warning bg-warning/10 border-warning/30",
  paid: "text-success bg-success/10 border-success/30",
  failed: "text-destructive bg-destructive/10 border-destructive/30",
} as const

export function InvoiceBadge({ status }: { status: "pending" | "paid" | "failed" }) {
  return <span className={statusToTokenMap[status]}>{status}</span>
}
```

This should fail because feature code performs inline metadata-to-token mapping.
