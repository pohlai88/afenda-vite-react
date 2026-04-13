import type { ShellMetadata } from "../contract/shell-metadata-contract"

declare module "react-router-dom" {
  interface RouteHandle {
    /**
     * Declarative shell chrome from `ShellRouteMetadata.shell` in route modules.
     * Use `null` to declare explicitly that this route does not participate in shell chrome.
     */
    shell?: ShellMetadata | null
  }
}

export {}
