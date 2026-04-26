/**
 * Compatibility shim over `@afenda/errors` for existing API imports.
 * Transport mapping still lives in `api-error-handler.middleware.ts`.
 */
export {
  AppError,
  badRequest,
  conflict,
  forbidden,
  internalServerError,
  notFound,
  serviceUnavailable,
  tooManyRequests,
  unauthorized,
  unprocessableEntity,
  type AppErrorCode,
} from "@afenda/errors"
