import type { TruthGovernanceSnapshot } from "@afenda/database/studio/snapshots"

export type TruthGovernanceDoc = Pick<
  TruthGovernanceSnapshot,
  | "description"
  | "truth_classes"
  | "scope_models"
  | "time_models"
  | "artifact_bindings"
>
