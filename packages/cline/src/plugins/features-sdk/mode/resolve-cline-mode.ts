import {
  clineOperatorModes,
  type ClineOperatorMode,
} from "../../../runtime/contracts.js"

export function resolveClineMode(input: unknown): ClineOperatorMode {
  if (
    typeof input === "string" &&
    (clineOperatorModes as readonly string[]).includes(input)
  ) {
    return input as ClineOperatorMode
  }

  throw new Error(
    `Unsupported Cline mode ${String(input)}. Expected one of: ${clineOperatorModes.join(", ")}.`
  )
}
