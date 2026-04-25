import { operatorModes, type OperatorMode } from "../../../runtime/contracts.js"

export function resolveOperatorMode(input: unknown): OperatorMode {
  if (
    typeof input === "string" &&
    (operatorModes as readonly string[]).includes(input)
  ) {
    return input as OperatorMode
  }

  throw new Error(
    `Unsupported Operator mode ${String(input)}. Expected one of: ${operatorModes.join(", ")}.`
  )
}
