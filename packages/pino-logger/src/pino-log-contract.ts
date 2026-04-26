export interface AppLogBindings {
  readonly [key: string]: unknown
}

export interface AppLogger {
  child(bindings: AppLogBindings): AppLogger
  debug(bindings: AppLogBindings, message?: string): void
  info(bindings: AppLogBindings, message?: string): void
  warn(bindings: AppLogBindings, message?: string): void
  error(bindings: AppLogBindings, message?: string): void
  fatal(bindings: AppLogBindings, message?: string): void
}
