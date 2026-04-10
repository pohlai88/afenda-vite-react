/**
 * CONTRACT — shell-search-registration
 * Shape for governed search provider registration when shell-search-policy.requireGovernedSearchRegistration is true.
 * Scope: scope binding, permission filtering, and result taxonomy for shell-wide search extensions.
 * Authority: search integrations should parse payloads through this contract at registration boundaries.
 * Purpose: predictable search registration aligned with shell-search-policy.
 */
import { z } from "zod/v4"

import {
  shellSearchResultClassSchema,
  shellSearchScopeSchema,
} from "../policy/shell-search-policy"

export const shellSearchRegistrationContractSchema = z
  .object({
    scope: shellSearchScopeSchema,
    providerKey: z.string().trim().min(1),
    tenantScoped: z.boolean(),
    workspaceScoped: z.boolean(),
    requiresPermissionFilter: z.boolean(),
    resultKinds: z.array(shellSearchResultClassSchema).min(1),
  })
  .strict()

export type ShellSearchRegistrationContract = z.infer<
  typeof shellSearchRegistrationContractSchema
>
