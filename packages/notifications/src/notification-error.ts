import { AppError } from "@afenda/errors"

export class NotificationError extends AppError {
  constructor(message: string, details?: Readonly<Record<string, unknown>>) {
    super({
      code: "BAD_REQUEST",
      message,
      status: 400,
      details,
    })
    this.name = "NotificationError"
  }
}
