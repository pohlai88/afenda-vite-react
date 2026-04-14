import { shellAppLayoutRoute } from "./shell-route-definitions"

/**
 * Workspace shell root URL (`/app`). Router index redirects to {@link shellAppDefaultChildSegment}.
 * Use for brand / home links — do not duplicate `/app` in feature components.
 */
export const shellWorkspaceHomeHref = shellAppLayoutRoute.path
