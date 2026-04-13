import { createShellCommandActivityStore } from "./shell-command-activity-store"

/** App-wide shell command activity (single concurrent map per `commandId`). */
export const shellCommandActivityStore = createShellCommandActivityStore()
