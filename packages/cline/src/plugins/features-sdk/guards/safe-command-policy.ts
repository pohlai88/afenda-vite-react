import type { GovernedClineToolDefinition } from "../mode/cline-mode-contract.js"

const allowedCommandPrefix = "pnpm run feature-sync"
const disallowedShellFragments = ["&&", "||", ";", "|", ">", "<"]
const governedCommandPattern =
  /^pnpm run feature-sync(?::[a-z][a-z0-9-]*)?(?: --[a-z][a-z0-9-]*(?: [^\s].*)?)?$/

export function isSafeGovernedCommand(command: string): boolean {
  if (!command.startsWith(allowedCommandPrefix)) {
    return false
  }

  if (disallowedShellFragments.some((fragment) => command.includes(fragment))) {
    return false
  }

  return governedCommandPattern.test(command.trim())
}

export function assertSafeGovernedCommand(
  command: string,
  context: string
): void {
  if (!isSafeGovernedCommand(command)) {
    throw new Error(
      `${context} resolved to unsupported command ${command}. Governed Cline requires exact pnpm feature-sync commands only.`
    )
  }
}

export function assertSafeCommandPolicy(
  tool: GovernedClineToolDefinition
): void {
  assertSafeGovernedCommand(tool.command, `Tool ${tool.name}`)
}
