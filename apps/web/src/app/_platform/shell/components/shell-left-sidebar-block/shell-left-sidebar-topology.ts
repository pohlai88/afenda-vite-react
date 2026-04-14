"use client"

import type { TFunction } from "i18next"

import type { ShellIconName } from "../../constants/shell-icon-names"
import type { ShellNavigationItemId } from "../../constants/shell-navigation-item-ids"
import type { ShellNavigationItem } from "../../contract/shell-navigation-contract"
import type {
  ShellNavGroupLabelKey,
  ShellNavSidebarSubLabelKey,
} from "../../types/shell-i18n-keys"
import {
  shellRailWidgetSlots,
  type ShellRailWidgetSlot,
} from "../shell-rail-sidebar-block/shell-rail-widgets.config"

export type ShellLeftSidebarSectionId = "primary" | "operations" | "insights"

export type ShellLeftSidebarSubmoduleId =
  | "overview"
  | "activity"
  | "trail"
  | "exports"
  | "integrations"
  | "webhooks"

type ShellLeftSidebarModuleSectionDefinition = {
  readonly id: ShellLeftSidebarSectionId
  readonly labelKey: ShellNavGroupLabelKey
  readonly moduleIds: readonly ShellNavigationItemId[]
}

type ShellLeftSidebarSubmoduleDefinition = {
  readonly id: ShellLeftSidebarSubmoduleId
  readonly labelKey: ShellNavSidebarSubLabelKey
}

type ShellLeftSidebarWidgetSlotDefinition = Extract<
  ShellRailWidgetSlot,
  { kind: "feature" }
>

const shellLeftSidebarModuleSectionDefinitions = [
  {
    id: "primary",
    labelKey: "nav.workspace.section_primary",
    moduleIds: ["events"],
  },
  {
    id: "operations",
    labelKey: "nav.workspace.section_operations",
    moduleIds: ["audit"],
  },
  {
    id: "insights",
    labelKey: "nav.workspace.section_insights",
    moduleIds: ["partners"],
  },
] as const satisfies readonly ShellLeftSidebarModuleSectionDefinition[]

const shellLeftSidebarSubmoduleDefinitions = {
  events: [
    { id: "overview", labelKey: "nav.sub.events.overview" },
    { id: "activity", labelKey: "nav.sub.events.activity" },
  ],
  audit: [
    { id: "trail", labelKey: "nav.sub.audit.trail" },
    { id: "exports", labelKey: "nav.sub.audit.exports" },
  ],
  partners: [
    { id: "integrations", labelKey: "nav.sub.partners.integrations" },
    { id: "webhooks", labelKey: "nav.sub.partners.webhooks" },
  ],
} as const satisfies Readonly<
  Partial<
    Record<
      ShellNavigationItemId,
      readonly ShellLeftSidebarSubmoduleDefinition[] | undefined
    >
  >
>

type ShellLeftSidebarSubmoduleParentId =
  keyof typeof shellLeftSidebarSubmoduleDefinitions

function isShellLeftSidebarSubmoduleParentId(
  id: ShellNavigationItemId
): id is ShellLeftSidebarSubmoduleParentId {
  return id in shellLeftSidebarSubmoduleDefinitions
}

const shellLeftSidebarActiveWidgetSlots = shellRailWidgetSlots.filter(
  (slot): slot is ShellLeftSidebarWidgetSlotDefinition =>
    slot.kind === "feature"
)

function hasPathPrefix(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function buildSubmoduleHref(moduleHref: string, submoduleId: string): string {
  return `${moduleHref}?view=${submoduleId}`
}

export type ShellLeftSidebarSubmoduleModel = {
  readonly id: ShellLeftSidebarSubmoduleId
  readonly label: string
  readonly href: string
  readonly isActive: boolean
}

export type ShellLeftSidebarModuleModel = {
  readonly id: ShellNavigationItemId
  readonly label: string
  readonly href: string
  readonly iconName: ShellIconName
  readonly lifecycle: ShellNavigationItem["lifecycle"]
  readonly isActive: boolean
  readonly submoduleCount: number
  readonly submodules: readonly ShellLeftSidebarSubmoduleModel[]
}

export type ShellLeftSidebarSectionModel = {
  readonly id: ShellLeftSidebarSectionId
  readonly label: string
  readonly items: readonly ShellLeftSidebarModuleModel[]
}

export type ShellLeftSidebarWidgetModel = {
  readonly id: ShellNavigationItemId
  readonly label: string
  readonly href: string
  readonly iconName: ShellIconName
  readonly lifecycle: ShellNavigationItem["lifecycle"]
  readonly description: string
  readonly isEnabled: boolean
}

export type ShellLeftSidebarWidgetShelfModel = {
  readonly id: "application"
  readonly label: string
  readonly items: readonly ShellLeftSidebarWidgetModel[]
}

export type ShellLeftSidebarNavigationModel = {
  readonly moduleSections: readonly ShellLeftSidebarSectionModel[]
  readonly widgetShelf: ShellLeftSidebarWidgetShelfModel
  readonly activeModuleId: ShellNavigationItemId | null
  readonly activeSubmoduleId: ShellLeftSidebarSubmoduleId | null
  readonly toggleWidget: (id: ShellNavigationItemId) => void
}

export type BuildShellLeftSidebarNavigationModelOptions = {
  readonly t: TFunction<"shell">
  readonly pathname: string
  readonly search: string
  readonly allowedItems: readonly ShellNavigationItem[]
  readonly enabledWidgetIds: ReadonlySet<ShellNavigationItemId>
  readonly toggleWidget: (id: ShellNavigationItemId) => void
}

function resolveShellLeftSidebarActiveModuleId(
  pathname: string,
  allowedItems: readonly ShellNavigationItem[]
): ShellNavigationItemId | null {
  for (const item of allowedItems) {
    if (item.lifecycle !== "active") {
      continue
    }

    if (hasPathPrefix(pathname, item.href)) {
      return item.id
    }
  }

  return null
}

function resolveShellLeftSidebarActiveSubmoduleId(
  search: string,
  moduleId: ShellNavigationItemId | null
): ShellLeftSidebarSubmoduleId | null {
  if (!moduleId || !isShellLeftSidebarSubmoduleParentId(moduleId)) {
    return null
  }

  const submodules = shellLeftSidebarSubmoduleDefinitions[moduleId]

  const searchParams = new URLSearchParams(search)
  const requestedId = searchParams.get("view")
  if (requestedId) {
    const match = submodules.find((submodule) => submodule.id === requestedId)
    if (match) {
      return match.id
    }
  }

  return submodules[0]?.id ?? null
}

export function buildShellLeftSidebarNavigationModel({
  t,
  pathname,
  search,
  allowedItems,
  enabledWidgetIds,
  toggleWidget,
}: BuildShellLeftSidebarNavigationModelOptions): ShellLeftSidebarNavigationModel {
  const activeItems = [...allowedItems]
    .filter((item) => item.lifecycle === "active")
    .sort((a, b) => a.order - b.order)
  const activeById = new Map<ShellNavigationItemId, ShellNavigationItem>(
    activeItems.map((item) => [item.id, item])
  )
  const allowedById = new Map(
    allowedItems.map((item) => [item.id, item] as const)
  )
  const activeModuleId = resolveShellLeftSidebarActiveModuleId(
    pathname,
    allowedItems
  )
  const activeSubmoduleId = resolveShellLeftSidebarActiveSubmoduleId(
    search,
    activeModuleId
  )

  const assignedModuleIds = new Set<ShellNavigationItemId>(
    shellLeftSidebarModuleSectionDefinitions.flatMap((section) =>
      section.moduleIds.filter((moduleId) => activeById.has(moduleId))
    )
  )
  const overflowActiveItems = activeItems.filter(
    (item) => !assignedModuleIds.has(item.id)
  )

  const moduleSections = shellLeftSidebarModuleSectionDefinitions
    .map((section) => {
      const explicitItems = section.moduleIds.flatMap((moduleId) => {
        const item = activeById.get(moduleId)
        if (!item) {
          return []
        }
        return [item]
      })
      const sectionItems =
        section.id === "operations"
          ? [...explicitItems, ...overflowActiveItems]
          : explicitItems

      return {
        id: section.id,
        label: t(section.labelKey),
        items: sectionItems.map((item) => {
          const submoduleDefinitions = isShellLeftSidebarSubmoduleParentId(
            item.id
          )
            ? shellLeftSidebarSubmoduleDefinitions[item.id]
            : []
          const submodules = submoduleDefinitions.map((definition) => ({
            id: definition.id,
            label: t(definition.labelKey),
            href: buildSubmoduleHref(item.href, definition.id),
            isActive:
              activeModuleId === item.id && activeSubmoduleId === definition.id,
          }))

          const model: ShellLeftSidebarModuleModel = {
            id: item.id,
            label: t(item.labelKey),
            href: item.href,
            iconName: item.iconName,
            lifecycle: item.lifecycle,
            isActive: activeModuleId === item.id,
            submoduleCount: submodules.length,
            submodules,
          }

          return model
        }),
      }
    })
    .filter((section) => {
      if (section.items.length > 0) {
        return true
      }
      if (section.id !== "operations") {
        return false
      }
      return activeItems.length === 0
    })

  const widgetShelf = {
    id: "application" as const,
    label: t("nav.workspace.section_app"),
    items: shellLeftSidebarActiveWidgetSlots.flatMap((slot) => {
      const item = allowedById.get(slot.featureId)
      if (!item) {
        return []
      }

      return [
        {
          id: item.id,
          label: t(slot.labelKey),
          href: item.href,
          iconName: item.iconName,
          lifecycle: item.lifecycle,
          description:
            item.lifecycle === "comingSoon"
              ? t("nav.lifecycle.coming_soon")
              : t("nav.widgets.customize"),
          isEnabled: enabledWidgetIds.has(item.id),
        } satisfies ShellLeftSidebarWidgetModel,
      ]
    }),
  } satisfies ShellLeftSidebarWidgetShelfModel

  return {
    moduleSections,
    widgetShelf,
    activeModuleId,
    activeSubmoduleId,
    toggleWidget,
  }
}

export {
  resolveShellLeftSidebarActiveModuleId,
  resolveShellLeftSidebarActiveSubmoduleId,
}
