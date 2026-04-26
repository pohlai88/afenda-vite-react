export type CommonAppErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "UNPROCESSABLE_ENTITY"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR"
  | "BAD_GATEWAY"
  | "SERVICE_UNAVAILABLE"

export type AppErrorCode = CommonAppErrorCode | (string & {})

export type ErrorDetails = unknown

export type SerializableError = {
  readonly code: string
  readonly message: string
  readonly status: number
  readonly details?: ErrorDetails
  readonly timestamp: string
}
