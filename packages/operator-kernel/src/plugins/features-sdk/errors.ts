export interface GovernedOperatorErrorOptions {
  readonly code: string
  readonly invariant?: string
  readonly doctrine?: string
  readonly resolution?: string
}

export class GovernedOperatorError extends Error {
  readonly code: string
  readonly invariant?: string
  readonly doctrine?: string
  readonly resolution?: string

  constructor(message: string, options: GovernedOperatorErrorOptions) {
    super(message)
    this.name = "GovernedOperatorError"
    this.code = options.code
    this.invariant = options.invariant
    this.doctrine = options.doctrine
    this.resolution = options.resolution
  }
}
