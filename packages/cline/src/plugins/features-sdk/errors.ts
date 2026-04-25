export interface GovernedClineErrorOptions {
  readonly code: string
  readonly invariant?: string
  readonly doctrine?: string
  readonly resolution?: string
}

export class GovernedClineError extends Error {
  readonly code: string
  readonly invariant?: string
  readonly doctrine?: string
  readonly resolution?: string

  constructor(message: string, options: GovernedClineErrorOptions) {
    super(message)
    this.name = "GovernedClineError"
    this.code = options.code
    this.invariant = options.invariant
    this.doctrine = options.doctrine
    this.resolution = options.resolution
  }
}
