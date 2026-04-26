import { AppError } from "@afenda/errors"

import type { FeatureTier } from "./contracts"

export class FeatureFlagError extends AppError {
  readonly requiredTier: FeatureTier
  readonly currentTier: FeatureTier

  constructor(
    message: string,
    requiredTier: FeatureTier,
    currentTier: FeatureTier
  ) {
    super({
      code: "FORBIDDEN",
      message,
      status: 403,
      details: {
        requiredTier,
        currentTier,
      },
    })
    this.name = "FeatureFlagError"
    this.requiredTier = requiredTier
    this.currentTier = currentTier
  }
}
