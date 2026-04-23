import type { ReactNode } from "react"

export type AppSurfaceKind = "workspace" | "truth"

export type AppSurfaceStateKind = "loading" | "empty" | "failure" | "forbidden"

export interface AppSurfaceActionSpec {
  readonly id: string
  readonly label: string
  readonly kind: "button" | "link"
  readonly variant?: "default" | "secondary" | "outline"
  readonly href?: string
  readonly onAction?: () => void
  readonly disabled?: boolean
}

export interface AppSurfaceMetaItem {
  readonly id: string
  readonly label: string
  readonly value: string
}

export interface AppSurfaceSectionSpec {
  readonly id: string
  readonly title?: string
  readonly description?: string
}

export interface AppSurfaceStateSpec {
  readonly title: string
  readonly description: string
}

export interface AppSurfaceContract {
  readonly kind: AppSurfaceKind
  readonly header: {
    readonly kicker?: string
    readonly title: string
    readonly description: string
    readonly actions?: readonly AppSurfaceActionSpec[]
  }
  readonly metaRow?: {
    readonly items: readonly AppSurfaceMetaItem[]
  }
  readonly content: {
    readonly sections: readonly AppSurfaceSectionSpec[]
  }
  readonly stateSurface: Readonly<
    Record<AppSurfaceStateKind, AppSurfaceStateSpec>
  >
}

export interface AppSurfaceProps {
  readonly contract: AppSurfaceContract
  readonly children: ReactNode
  readonly className?: string
}

export interface StateSurfaceProps {
  readonly surfaceKind: AppSurfaceKind
  readonly kind: AppSurfaceStateKind
  readonly title: string
  readonly description: string
  readonly actions?: ReactNode
  readonly icon?: ReactNode
  readonly className?: string
}
