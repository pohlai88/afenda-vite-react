export interface ShellTraceExpectation {
  readonly pathname: string
  readonly expectedMode: "direct" | "fallback" | "none"
  readonly expectedResolvedRouteId: string | null
}

export interface ShellValidationTraceSamples {
  readonly required: readonly ShellTraceExpectation[]
  readonly negativeControls: readonly ShellTraceExpectation[]
}
