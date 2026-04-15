"use client"

import type { ChangeEvent, ComponentProps, ReactNode } from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  FoldVertical,
  LocateFixed,
  UnfoldVertical,
} from "lucide-react"
import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"

import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Separator,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { ShellIcon } from "../shell-icon"
import { ShellLabelsColumnSearch } from "./search"
import type {
  ShellLeftSidebarModuleModel,
  ShellLeftSidebarNavigationModel,
  ShellLeftSidebarSectionModel,
  ShellLeftSidebarWidgetModel,
} from "./shell-left-sidebar-topology"

const SHELL_LABELS_COLUMN_CLASS =
  "bg-sidebar text-sidebar-foreground flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"

const SHELL_LABELS_COLUMN_TOOLTIP_PROPS = {
  side: "bottom" as const,
  align: "center" as const,
  sideOffset: 6,
}

const SHELL_LEFT_SIDEBAR_SHORTCUTS = {
  expandAll: "E",
  collapseAll: "C",
  collapseOthers: "O",
} as const

const SHELL_LEFT_SIDEBAR_INITIAL_VISIBLE_MODULES = 32
const SHELL_LEFT_SIDEBAR_LOAD_MORE_STEP = 32
const SHELL_LEFT_SIDEBAR_SEARCH_VISIBLE_MODULES = 160

export type ShellLabelsColumnProps = ComponentProps<"div"> & {
  model: ShellLeftSidebarNavigationModel
}

type FilteredModuleSection = ShellLeftSidebarSectionModel & {
  readonly items: readonly ShellLeftSidebarModuleModel[]
}

type WidgetShelfItem = ShellLeftSidebarWidgetModel

type SectionVisibleCounts = Record<ShellLeftSidebarSectionModel["id"], number>

function ShellLabelsColumnCompactAction({
  ariaLabel,
  icon,
  onClick,
  tooltip,
}: {
  ariaLabel: string
  icon: ReactNode
  onClick: () => void
  tooltip: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          aria-label={ariaLabel}
          className="size-7 rounded-md text-muted-foreground hover:bg-accent/20 hover:text-foreground"
        >
          <span className="size-4">{icon}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent
        {...SHELL_LABELS_COLUMN_TOOLTIP_PROPS}
        className="max-w-xs"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

function includesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query)
}

function filterModuleSections(
  sections: readonly ShellLeftSidebarSectionModel[],
  query: string
): {
  readonly sections: readonly FilteredModuleSection[]
  readonly matchingModuleIds: readonly ShellLeftSidebarModuleModel["id"][]
} {
  if (!query) {
    return {
      sections,
      matchingModuleIds: [],
    }
  }

  const matchingModuleIds = new Set<ShellLeftSidebarModuleModel["id"]>()
  const filteredSections: FilteredModuleSection[] = []

  for (const section of sections) {
    const sectionMatches = includesQuery(section.label, query)
    const items: ShellLeftSidebarModuleModel[] = []

    for (const module of section.items) {
      const moduleMatches = includesQuery(module.label, query)
      const filteredSubmodules = module.submodules.filter((submodule) =>
        includesQuery(submodule.label, query)
      )

      if (
        !moduleMatches &&
        filteredSubmodules.length === 0 &&
        !sectionMatches
      ) {
        continue
      }

      matchingModuleIds.add(module.id)
      items.push({
        ...module,
        submodules: moduleMatches ? module.submodules : filteredSubmodules,
      })
    }

    if (items.length === 0) {
      continue
    }

    filteredSections.push({
      ...section,
      items,
    })
  }

  return {
    sections: filteredSections,
    matchingModuleIds: [...matchingModuleIds],
  }
}

function filterWidgetShelf(items: readonly WidgetShelfItem[], query: string) {
  if (!query) {
    return items
  }

  return items.filter((item) => includesQuery(item.label, query))
}

function summarizeModuleSecondaryLine(
  module: ShellLeftSidebarModuleModel
): string {
  if (module.submodules.length === 0) {
    const shortPath = module.href.replace(/^\/app\//, "")
    return shortPath.replaceAll("/", " / ")
  }

  const labels = module.submodules.map((submodule) => submodule.label)
  if (labels.length <= 2) {
    return labels.join(" / ")
  }

  const visible = labels.slice(0, 2).join(" / ")
  return `${visible} +${labels.length - 2}`
}

function ShellLabelsColumnWidgetCard({
  item,
  onToggle,
}: {
  item: WidgetShelfItem
  onToggle: (id: WidgetShelfItem["id"]) => void
}) {
  const { t } = useTranslation("shell")

  return (
    <button
      type="button"
      aria-pressed={item.isEnabled}
      aria-label={`${item.label} — ${item.isEnabled ? "hide from rail" : "show on rail"}`}
      onClick={() => {
        onToggle(item.id)
      }}
      className={cn(
        "group ui-shell-sidebar-widget-card",
        item.isEnabled && "ui-shell-sidebar-widget-card-active"
      )}
    >
      <span className="ui-shell-sidebar-card-icon">
        <ShellIcon name={item.iconName} className="size-3.5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-xs leading-tight font-medium tracking-normal">
            {item.label}
          </span>
          {item.lifecycle === "comingSoon" ? (
            <Badge
              variant="outline"
              className="h-4 max-w-16 rounded-full px-1.5 text-[8px]"
            >
              {t("nav.lifecycle.coming_soon")}
            </Badge>
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted-foreground">
          {item.description}
        </span>
      </span>

      <Badge
        variant={item.isEnabled ? "secondary" : "outline"}
        className="h-4 max-w-[4.2rem] shrink-0 truncate rounded-full px-1.5 text-[8px]"
      >
        {item.isEnabled ? "On rail" : "Hidden"}
      </Badge>
    </button>
  )
}

function ShellLabelsColumnModuleGroup({
  hasMore,
  onLoadMore,
  section,
  visibleItems,
  expandedModuleIds,
  onToggleModuleExpanded,
}: {
  hasMore: boolean
  onLoadMore: () => void
  section: FilteredModuleSection
  visibleItems: readonly ShellLeftSidebarModuleModel[]
  expandedModuleIds: ReadonlySet<ShellLeftSidebarModuleModel["id"]>
  onToggleModuleExpanded: (moduleId: ShellLeftSidebarModuleModel["id"]) => void
}) {
  const { t } = useTranslation("shell")

  return (
    <SidebarGroup className="ui-shell-sidebar-section-card">
      <SidebarGroupLabel className="h-6 px-0">
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate text-[10px] font-semibold tracking-normal uppercase">
            {section.label}
          </span>
          <Badge
            variant="outline"
            className="h-4 rounded-full px-1.5 text-[8px]"
          >
            {section.items.length}
          </Badge>
        </span>
      </SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {visibleItems.map((module) => {
            const isExpanded =
              expandedModuleIds.has(module.id) || module.isActive
            const canToggle = !module.isActive && module.submodules.length > 0

            return (
              <Collapsible
                key={module.id}
                open={isExpanded}
                onOpenChange={() => {
                  onToggleModuleExpanded(module.id)
                }}
              >
                <SidebarMenuItem className="space-y-1">
                  <div className="flex items-start gap-1">
                    <SidebarMenuButton
                      asChild
                      variant="outline"
                      size="lg"
                      isActive={module.isActive}
                      className={cn(
                        "ui-shell-sidebar-module-card",
                        module.isActive && "ui-shell-sidebar-module-card-active"
                      )}
                    >
                      <NavLink to={module.href} className="min-w-0">
                        <span className="ui-shell-sidebar-card-icon">
                          <ShellIcon
                            name={module.iconName}
                            className="size-3.5"
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-xs leading-tight font-medium tracking-normal">
                              {module.label}
                            </span>
                            <Badge
                              variant="outline"
                              className="h-4 rounded-full px-1.5 text-[8px]"
                            >
                              {module.submoduleCount}
                            </Badge>
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted-foreground">
                            {summarizeModuleSecondaryLine(module)}
                          </span>
                        </span>
                      </NavLink>
                    </SidebarMenuButton>

                    {canToggle ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CollapsibleTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="mt-0.5 size-6 shrink-0 rounded-md text-muted-foreground hover:bg-accent/15 hover:text-foreground"
                              aria-label={
                                isExpanded
                                  ? t(
                                      "sidebar.labels_column.toggle_nesting_collapse",
                                      { module: module.label }
                                    )
                                  : t(
                                      "sidebar.labels_column.toggle_nesting_expand",
                                      { module: module.label }
                                    )
                              }
                              aria-expanded={isExpanded}
                            >
                              <ChevronDown
                                className={cn(
                                  "size-3.5 transition-transform duration-150",
                                  isExpanded && "rotate-180"
                                )}
                              />
                            </Button>
                          </CollapsibleTrigger>
                        </TooltipTrigger>
                        <TooltipContent
                          {...SHELL_LABELS_COLUMN_TOOLTIP_PROPS}
                          className="max-w-xs"
                        >
                          {isExpanded
                            ? t(
                                "sidebar.labels_column.toggle_nesting_collapse",
                                { module: module.label }
                              )
                            : t("sidebar.labels_column.toggle_nesting_expand", {
                                module: module.label,
                              })}
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>

                  <CollapsibleContent>
                    <SidebarMenuSub className="ui-shell-sidebar-submodule-list">
                      {module.submodules.map((submodule) => (
                        <SidebarMenuSubItem key={submodule.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={submodule.isActive}
                            className="ui-shell-sidebar-submodule-row"
                          >
                            <NavLink to={submodule.href}>
                              <span className="truncate text-[11px] leading-tight tracking-normal">
                                {submodule.label}
                              </span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>

        {hasMore ? (
          <div className="px-0.5 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              className="h-6 w-full rounded-sm text-[10px] tracking-normal text-muted-foreground uppercase hover:text-foreground"
            >
              Load more
            </Button>
          </div>
        ) : null}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/**
 * ERP-grade module explorer next to the icon rail:
 * - search
 * - active feature sections
 * - nested submodules
 * - customizable widget shelf
 */
export function ShellLabelsColumn({
  model,
  className,
  ...divProps
}: ShellLabelsColumnProps) {
  const { t } = useTranslation("shell")
  const [searchValue, setSearchValue] = useState("")
  const [isWidgetShelfOpen, setIsWidgetShelfOpen] = useState(false)
  const [sectionVisibleCounts, setSectionVisibleCounts] =
    useState<SectionVisibleCounts>({
      primary: SHELL_LEFT_SIDEBAR_INITIAL_VISIBLE_MODULES,
      operations: SHELL_LEFT_SIDEBAR_INITIAL_VISIBLE_MODULES,
      insights: SHELL_LEFT_SIDEBAR_INITIAL_VISIBLE_MODULES,
    })
  const [expandedModuleIds, setExpandedModuleIds] = useState<
    ReadonlySet<ShellLeftSidebarModuleModel["id"]>
  >(() => {
    const seed = new Set<ShellLeftSidebarModuleModel["id"]>()
    if (model.activeModuleId) {
      seed.add(model.activeModuleId)
    }
    for (const section of model.moduleSections) {
      for (const item of section.items.slice(0, 2)) {
        seed.add(item.id)
      }
    }
    return seed
  })

  const normalizedQuery = searchValue.trim().toLowerCase()

  const filtered = useMemo(
    () => filterModuleSections(model.moduleSections, normalizedQuery),
    [model.moduleSections, normalizedQuery]
  )

  const visibleSections = useMemo(
    () => filtered.sections.filter((section) => section.items.length > 0),
    [filtered.sections]
  )

  const sectionRenderData = useMemo(
    () =>
      visibleSections.map((section) => {
        const visibleLimit = normalizedQuery
          ? SHELL_LEFT_SIDEBAR_SEARCH_VISIBLE_MODULES
          : sectionVisibleCounts[section.id]
        const visibleItems = section.items.slice(0, visibleLimit)
        return {
          ...section,
          visibleItems,
          hasMore: section.items.length > visibleItems.length,
        }
      }),
    [normalizedQuery, sectionVisibleCounts, visibleSections]
  )

  const visibleModuleIds = useMemo(
    () =>
      sectionRenderData.flatMap((section) =>
        section.visibleItems.map((item) => item.id)
      ),
    [sectionRenderData]
  )

  const setAllExpanded = useCallback(() => {
    setExpandedModuleIds(new Set(visibleModuleIds))
  }, [visibleModuleIds])

  const setAllCollapsed = useCallback(() => {
    setExpandedModuleIds(new Set())
  }, [])

  const setCollapseOthers = useCallback(() => {
    const activeModuleId = model.activeModuleId
    setExpandedModuleIds(new Set(activeModuleId ? [activeModuleId] : []))
  }, [model.activeModuleId])

  useEffect(() => {
    const activeModuleId = model.activeModuleId
    if (!activeModuleId) {
      return
    }

    queueMicrotask(() => {
      setExpandedModuleIds((prev) => {
        if (prev.has(activeModuleId)) {
          return prev
        }

        const next = new Set(prev)
        next.add(activeModuleId)
        return next
      })
    })
  }, [model.activeModuleId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || !event.shiftKey) {
        return
      }

      switch (event.key.toLowerCase()) {
        case SHELL_LEFT_SIDEBAR_SHORTCUTS.expandAll.toLowerCase():
          event.preventDefault()
          setAllExpanded()
          break
        case SHELL_LEFT_SIDEBAR_SHORTCUTS.collapseAll.toLowerCase():
          event.preventDefault()
          setAllCollapsed()
          break
        case SHELL_LEFT_SIDEBAR_SHORTCUTS.collapseOthers.toLowerCase():
          event.preventDefault()
          setCollapseOthers()
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setAllCollapsed, setAllExpanded, setCollapseOthers])

  const widgetShelfItems = useMemo(
    () => filterWidgetShelf(model.widgetShelf.items, normalizedQuery),
    [model.widgetShelf.items, normalizedQuery]
  )

  useEffect(() => {
    if (!normalizedQuery) {
      return
    }

    queueMicrotask(() => {
      setExpandedModuleIds((prev) => {
        const next = new Set(prev)
        for (const moduleId of filtered.matchingModuleIds) {
          next.add(moduleId)
        }
        return next
      })
    })
  }, [filtered.matchingModuleIds, normalizedQuery])

  const hasResults = sectionRenderData.length > 0 || widgetShelfItems.length > 0

  const visibleModuleCount = visibleSections.reduce(
    (count, section) => count + section.items.length,
    0
  )

  const renderedModuleCount = sectionRenderData.reduce(
    (count, section) => count + section.visibleItems.length,
    0
  )

  return (
    <div
      {...divProps}
      data-slot="shell.labels-column"
      className={cn(
        SHELL_LABELS_COLUMN_CLASS,
        "ui-shell-sidebar-fit",
        className
      )}
    >
      <div className="ui-shell-sidebar-fit border-b border-sidebar-border/80 bg-sidebar/95 px-2.5 pt-2 pb-2 backdrop-blur supports-backdrop-filter:bg-sidebar/90">
        <ShellLabelsColumnSearch
          className="px-0 pt-0"
          inputProps={{
            value: searchValue,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
              setSearchValue(event.currentTarget.value)
            },
            placeholder: "Search…",
          }}
        />

        <div className="mt-2 flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-normal text-muted-foreground uppercase">
              Module explorer
            </p>
            <h2 className="truncate text-[14px] leading-tight font-semibold text-sidebar-foreground">
              {t("nav.workspace.placeholder_title")}
            </h2>
          </div>

          <Badge
            variant="outline"
            className="h-5 rounded-full border-border/70 bg-background/70 px-1.5 text-[8px] tracking-normal uppercase"
          >
            ERP · {renderedModuleCount}/{visibleModuleCount}
          </Badge>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 px-1">
          <span className="text-[10px] font-medium tracking-normal text-muted-foreground uppercase">
            Modules
          </span>
          <div className="flex items-center gap-1">
            <ShellLabelsColumnCompactAction
              ariaLabel="Expand all modules"
              icon={<UnfoldVertical className="size-3.5" />}
              onClick={setAllExpanded}
              tooltip={t("sidebar.labels_column.expand_all_title")}
            />
            <ShellLabelsColumnCompactAction
              ariaLabel="Collapse all modules"
              icon={<FoldVertical className="size-3.5" />}
              onClick={setAllCollapsed}
              tooltip={t("sidebar.labels_column.collapse_all_title")}
            />
            <ShellLabelsColumnCompactAction
              ariaLabel="Focus active module"
              icon={<LocateFixed className="size-3.5" />}
              onClick={setCollapseOthers}
              tooltip={t("sidebar.labels_column.focus_active_title")}
            />
          </div>
        </div>
      </div>

      <div className="ui-scrollbar-hidden flex min-h-0 ui-shell-sidebar-fit flex-1 flex-col gap-2 overflow-y-auto px-2 py-2">
        {hasResults ? (
          <>
            {sectionRenderData.map((section) => (
              <ShellLabelsColumnModuleGroup
                key={section.id}
                section={section}
                visibleItems={section.visibleItems}
                hasMore={section.hasMore}
                onLoadMore={() => {
                  setSectionVisibleCounts((prev) => ({
                    ...prev,
                    [section.id]:
                      prev[section.id] + SHELL_LEFT_SIDEBAR_LOAD_MORE_STEP,
                  }))
                }}
                expandedModuleIds={expandedModuleIds}
                onToggleModuleExpanded={(moduleId) => {
                  setExpandedModuleIds((prev) => {
                    const next = new Set(prev)
                    if (next.has(moduleId)) {
                      next.delete(moduleId)
                    } else {
                      next.add(moduleId)
                    }
                    return next
                  })
                }}
              />
            ))}

            <Separator className="mx-1.5 my-1 bg-sidebar-border/70" />

            <Collapsible
              open={isWidgetShelfOpen}
              onOpenChange={setIsWidgetShelfOpen}
            >
              <SidebarGroup className="ui-shell-sidebar-section-card">
                <SidebarGroupLabel className="h-6 px-0">
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <span className="truncate text-[10px] font-semibold tracking-normal uppercase">
                      {model.widgetShelf.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="h-4 rounded-full px-1.5 text-[8px]"
                      >
                        {widgetShelfItems.length}
                      </Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CollapsibleTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={
                                isWidgetShelfOpen
                                  ? t(
                                      "sidebar.labels_column.widget_shelf_collapse"
                                    )
                                  : t(
                                      "sidebar.labels_column.widget_shelf_expand"
                                    )
                              }
                              className="size-5 rounded-sm text-muted-foreground hover:bg-accent/15 hover:text-foreground"
                            >
                              <ChevronDown
                                className={cn(
                                  "size-3 transition-transform duration-150",
                                  isWidgetShelfOpen && "rotate-180"
                                )}
                              />
                            </Button>
                          </CollapsibleTrigger>
                        </TooltipTrigger>
                        <TooltipContent
                          {...SHELL_LABELS_COLUMN_TOOLTIP_PROPS}
                          className="max-w-xs"
                        >
                          {isWidgetShelfOpen
                            ? t("sidebar.labels_column.widget_shelf_collapse")
                            : t("sidebar.labels_column.widget_shelf_expand")}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </span>
                </SidebarGroupLabel>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    <div className="grid gap-1">
                      {widgetShelfItems.length > 0 ? (
                        widgetShelfItems.map((item) => (
                          <ShellLabelsColumnWidgetCard
                            key={item.id}
                            item={item}
                            onToggle={model.toggleWidget}
                          />
                        ))
                      ) : (
                        <div className="rounded-md border border-dashed border-sidebar-border/80 bg-background/40 px-2 py-2.5 text-[11px] leading-tight text-muted-foreground">
                          {t("nav.widgets.empty_title")}
                        </div>
                      )}
                    </div>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-2 py-5">
            <div className="max-w-xs text-center">
              <p className="text-[13px] leading-tight font-medium text-sidebar-foreground">
                {t("global_search.no_results")}
              </p>
              <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                {t("nav.widgets.empty_description")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
