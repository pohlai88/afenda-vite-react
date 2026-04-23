import { Link } from "react-router-dom"

import {
  AppSurface,
  type AppSurfaceContract,
  StateSurface,
  type AppSurfaceStateKind,
} from "@/app/_platform/app-surface"
import { Button } from "@afenda/design-system/ui-primitives"

function createShellRouteStateContract(input: {
  readonly stateLabel: string
  readonly stateTitle: string
  readonly stateDescription: string
}): AppSurfaceContract {
  return {
    kind: "workspace",
    header: {
      kicker: "Authenticated shell",
      title: "Shell route state",
      description:
        "This surface keeps shell-edge states inside the same governed workspace composition as the rest of the authenticated application.",
    },
    metaRow: {
      items: [
        {
          id: "shell-state",
          label: "Shell state",
          value: input.stateLabel,
        },
      ],
    },
    content: {
      sections: [{ id: "shell-route-state" }],
    },
    stateSurface: {
      loading: {
        title: "Loading shell route",
        description:
          "Please wait while Afenda resolves the authenticated shell state.",
      },
      empty: {
        title: "Shell route unavailable",
        description:
          "The shell route responded without governed content for this state.",
      },
      failure: {
        title: input.stateTitle,
        description: input.stateDescription,
      },
      forbidden: {
        title: input.stateTitle,
        description: input.stateDescription,
      },
    },
  }
}

export function AppShellRouteState(props: {
  readonly stateKind: Extract<AppSurfaceStateKind, "failure" | "forbidden">
  readonly stateLabel: string
  readonly stateTitle: string
  readonly stateDescription: string
  readonly homeHref: string
  readonly homeLabel: string
}) {
  const {
    stateKind,
    stateLabel,
    stateTitle,
    stateDescription,
    homeHref,
    homeLabel,
  } = props

  const contract = createShellRouteStateContract({
    stateLabel,
    stateTitle,
    stateDescription,
  })

  return (
    <AppSurface contract={contract}>
      <StateSurface
        surfaceKind="workspace"
        kind={stateKind}
        title={stateTitle}
        description={stateDescription}
        actions={
          <Button asChild variant="secondary">
            <Link to={homeHref}>{homeLabel}</Link>
          </Button>
        }
      />
    </AppSurface>
  )
}
