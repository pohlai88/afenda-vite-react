/**
 * APP SHELL BREADCRUMB
 *
 * Pure presentational breadcrumb component for the platform shell.
 * This component renders only resolved breadcrumb items and does not own route,
 * translation, or structural breadcrumb decision logic.
 */

import { Fragment, type ReactElement } from "react"
import { Link } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@afenda/design-system/ui-primitives"

import { useShellBreadcrumbs } from "../hooks/use-shell-breadcrumbs"

export function AppShellBreadcrumb(): ReactElement | null {
  const items = useShellBreadcrumbs()

  if (items.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 ? (
              <BreadcrumbSeparator className="[&>svg]:size-3.5" />
            ) : null}

            <BreadcrumbItem>
              {item.kind === "link" && item.to ? (
                <BreadcrumbLink asChild>
                  <Link to={item.to}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
