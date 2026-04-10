```ts
// valid: does not import class-variance-authority directly
import { Badge } from "@afenda/shadcn-ui/components/ui/badge"
```

Feature/shared code should consume governed components instead of creating local CVA factories.
