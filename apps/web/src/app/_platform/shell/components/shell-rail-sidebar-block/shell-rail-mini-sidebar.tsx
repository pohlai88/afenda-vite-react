"use client"

/**
 * Static icon rail only (narrow column): brand tile, feature links, widget picker, user block.
 *
 * Labels column UI lives under `shell-left-sidebar-block/*`.
 *
 * Drift control rules:
 * - shell route fallbacks are centralized
 * - repeated tooltip/focus/avatar mechanics are centralized
 * - user identity rendering is shared across trigger + dropdown label
 * - user menu rows are descriptor-driven instead of duplicated JSX
 */

import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import type { ShellNavigationItemId } from "../../constants/shell-navigation-item-ids"
import type { ShellNavWidgetLabelKey } from "../../types/shell-i18n-keys"
import type { LucideIcon } from "lucide-react"
import {
  BadgeCheck,
  Bell,
  BookOpen,
  ChevronsUpDown,
  CreditCard,
  ExternalLink,
  LogOut,
  Plus,
  ScrollText,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useSidebar,
} from "@afenda/design-system/ui-primitives"

import { APP_PACKAGE_VERSION } from "../../constants/app-version"
import { ShellUserMenuAccessibility } from "../shell-user-menu-accessibility"
import { ShellUserMenuAppearance } from "../shell-user-menu-appearance"
import { ShellUserMenuLanguage } from "../shell-user-menu-language"
import { ShellUserMenuQuickActions } from "../shell-user-menu-quick-actions"
import { ShellUserMenuSecurityPanel } from "../shell-user-menu-security-panel"
import { cn } from "@afenda/design-system/utils"

import { useCloseMobileSidebar } from "../../hooks/use-close-mobile-sidebar"
import { shellWorkspaceHomeHref } from "../../routes/shell-route-constants"
import {
  shellUserMenuFallbackLinks,
  type ShellUserMenuLinkKey,
} from "../../routes/shell-user-menu-route-map"
import { initialsFromName } from "./shell-user-initials"

const SHELL_TOOLTIP_CONTENT_PROPS = {
  side: "right",
  align: "center",
  sideOffset: 8,
} as const

const SHELL_FOCUS_RING_CLASS =
  "outline-none ring-sidebar-ring focus-visible:ring-2"

const SHELL_USER_TRIGGER_STATE_CLASS =
  "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-[2rem] md:p-[0]"

export const SHELL_USER_MENU_CONTENT_CLASS =
  "w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"

const SHELL_AVATAR_CLASS = "size-8 rounded-full"

/** Dropdown panel positioning shared across shell user menu instances. */
export const SHELL_USER_MENU_DROPDOWN_CONTENT_PROPS = {
  align: "end",
  sideOffset: 4,
} as const

/** Widget picker checklist: opens from the rail toward the labels column. */
const SHELL_WIDGET_PICKER_DROPDOWN_CONTENT_PROPS = {
  side: "right",
  align: "start",
  sideOffset: 8,
} as const

type ShellUserMenuItemDefinition = {
  key: ShellUserMenuLinkKey
  labelKey:
    | "user_menu.account"
    | "user_menu.billing"
    | "user_menu.notifications"
    | "user_menu.notification_settings"
    | "user_menu.help_docs"
    | "user_menu.changelog"
    | "user_menu.keyboard_shortcuts"
  icon: LucideIcon
}

const SHELL_USER_MENU_ITEM_DEFINITIONS = [
  {
    key: "account",
    labelKey: "user_menu.account",
    icon: BadgeCheck,
  },
  {
    key: "billing",
    labelKey: "user_menu.billing",
    icon: CreditCard,
  },
  {
    key: "notifications",
    labelKey: "user_menu.notifications",
    icon: Bell,
  },
  {
    key: "notification_settings",
    labelKey: "user_menu.notification_settings",
    icon: SlidersHorizontal,
  },
  {
    key: "help",
    labelKey: "user_menu.help_docs",
    icon: BookOpen,
  },
  {
    key: "changelog",
    labelKey: "user_menu.changelog",
    icon: ScrollText,
  },
  {
    key: "keyboard_shortcuts",
    labelKey: "user_menu.keyboard_shortcuts",
    icon: ExternalLink,
  },
] as const satisfies readonly ShellUserMenuItemDefinition[]

function shellUserMenuHrefIsExternal(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

/**
 * When the widget picker closes, dismiss the mobile sheet so the rail does not stay “open” underneath.
 * (Dropdown `onOpenChange` is about menu visibility; this ties it to shell mobile chrome explicitly.)
 */
function handleWidgetPickerDropdownOpenChange(
  open: boolean,
  closeMobileSidebar: () => void
): void {
  if (!open) {
    closeMobileSidebar()
  }
}

type ShellUserIdentityProps = {
  user: AppShellSidebarUserProfile
  compact?: boolean
}

/** Avatar + image; empty avatar URL shows initials (no placeholder icon). */
export function ShellUserAvatar({
  user,
  className,
}: {
  user: AppShellSidebarUserProfile
  className?: string
}) {
  const initials = initialsFromName(user.name)

  return (
    <Avatar className={cn(SHELL_AVATAR_CLASS, className)}>
      <AvatarImage src={user.avatar} alt="" className="object-cover" />
      <AvatarFallback className="rounded-full text-xs font-medium tabular-nums">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

function ShellUserIdentity({ user, compact = false }: ShellUserIdentityProps) {
  return (
    <>
      <ShellUserAvatar user={user} />

      {!compact ? (
        <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </div>
      ) : null}
    </>
  )
}

export type AppShellSidebarUserProfile = {
  name: string
  email: string
  /** Empty string shows initials in the avatar fallback */
  avatar: string
}

export type AppShellSidebarUserProps = {
  user: AppShellSidebarUserProfile
  /** `rail`: avatar only (static icon column). `default`: full row with name/email */
  layout?: "default" | "rail"
  /** Defaults match {@link shellUserMenuFallbackLinks} until dedicated account surfaces ship */
  links?: Partial<Record<ShellUserMenuLinkKey, string>>
  showUpgrade?: boolean
  onLogout?: () => void
}

export type ShellUserMenuDropdownPanelProps = {
  user: AppShellSidebarUserProfile
  links?: Partial<Record<ShellUserMenuLinkKey, string>>
  showUpgrade?: boolean
  onLogout?: () => void
}

/**
 * Shared account actions for any shell user-menu surface (rail, top nav, etc.).
 */
export function ShellUserMenuDropdownPanel({
  user,
  links: linksProp,
  showUpgrade = true,
  onLogout,
}: ShellUserMenuDropdownPanelProps) {
  const { t } = useTranslation("shell")
  const closeMobileSidebar = useCloseMobileSidebar()

  const links = {
    ...shellUserMenuFallbackLinks,
    ...linksProp,
  }

  return (
    <>
      <DropdownMenuLabel className="p-[0] font-normal">
        <div className="flex items-center gap-[0.5rem] px-1 py-1.5 text-left text-sm">
          <ShellUserIdentity user={user} />
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      {showUpgrade ? (
        <>
          <DropdownMenuGroup>
            <DropdownMenuItem disabled className="gap-[0.5rem]">
              <Sparkles className="size-4" />
              {t("user_menu.upgrade_pro")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </>
      ) : null}

      <ShellUserMenuAppearance />
      <ShellUserMenuLanguage />
      <ShellUserMenuAccessibility />
      <DropdownMenuSeparator />

      <ShellUserMenuQuickActions />

      <DropdownMenuGroup>
        <ShellUserMenuSecurityPanel />
        {SHELL_USER_MENU_ITEM_DEFINITIONS.map((item) => {
          const Icon = item.icon
          const href = links[item.key]

          if (shellUserMenuHrefIsExternal(href)) {
            return (
              <DropdownMenuItem key={item.key} asChild>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex cursor-pointer items-center gap-[0.5rem]"
                  onClick={closeMobileSidebar}
                >
                  <Icon className="size-4" />
                  {t(item.labelKey)}
                </a>
              </DropdownMenuItem>
            )
          }

          return (
            <DropdownMenuItem key={item.key} asChild>
              <NavLink
                to={href}
                className="flex items-center gap-[0.5rem]"
                onClick={closeMobileSidebar}
              >
                <Icon className="size-4" />
                {t(item.labelKey)}
              </NavLink>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        disabled
        className="pointer-events-none cursor-default opacity-100 focus:bg-transparent"
      >
        <span className="text-xs text-muted-foreground">
          {t("user_menu.version", { version: APP_PACKAGE_VERSION })}
        </span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        variant="destructive"
        className="gap-[0.5rem]"
        onSelect={(event) => {
          event.preventDefault()
          closeMobileSidebar()
          onLogout?.()
        }}
      >
        <LogOut className="size-4" />
        {t("user_menu.logout")}
      </DropdownMenuItem>
    </>
  )
}

/** Workspace home — `/app` index redirects to the default feature segment. */
export function AppShellSidebarBrandRail() {
  const { t } = useTranslation("shell")
  const closeMobileSidebar = useCloseMobileSidebar()

  return (
    <SidebarMenu className="ui-shell-brand-rail-menu">
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild tooltip={t("sidebar.brand")}>
          <NavLink
            to={shellWorkspaceHomeHref}
            aria-label={t("sidebar.brand_nav_aria")}
            onClick={closeMobileSidebar}
            className={cn(
              "flex size-8 items-center justify-center",
              SHELL_FOCUS_RING_CLASS
            )}
          >
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Zap className="size-4" aria-hidden />
            </div>
            <span className="sr-only">{t("sidebar.brand")}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/**
 * shadcn-style NavUser for sidebars:
 * - avatar trigger
 * - dropdown actions
 * - React Router navigation
 */
export function AppShellSidebarUser({
  user,
  layout = "default",
  links: linksProp,
  showUpgrade = true,
  onLogout,
}: AppShellSidebarUserProps) {
  const { isMobile } = useSidebar()

  const links = {
    ...shellUserMenuFallbackLinks,
    ...linksProp,
  }

  const isRail = layout === "rail"
  const tooltipLabel = `${user.name} — ${user.email}`

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={isRail ? tooltipLabel : undefined}
              className={cn(
                SHELL_USER_TRIGGER_STATE_CLASS,
                isRail && "justify-center"
              )}
            >
              <ShellUserIdentity user={user} compact={isRail} />

              {!isRail ? (
                <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
              ) : (
                <span className="sr-only">{tooltipLabel}</span>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className={SHELL_USER_MENU_CONTENT_CLASS}
            side={isMobile ? "bottom" : "right"}
            {...SHELL_USER_MENU_DROPDOWN_CONTENT_PROPS}
          >
            <ShellUserMenuDropdownPanel
              user={user}
              links={links}
              showUpgrade={showUpgrade}
              onLogout={onLogout}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export type AppShellSidebarRailNavLinkProps = {
  href: string
  isActive: boolean
  tooltip: string
  icon: ReactNode
  label: string
}

/** Icon-only nav control for the static left rail. */
export function AppShellSidebarRailNavLink({
  href,
  isActive,
  tooltip,
  icon,
  label,
}: AppShellSidebarRailNavLinkProps) {
  const closeMobileSidebar = useCloseMobileSidebar()

  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton
            asChild
            isActive={isActive}
            className="justify-center"
          >
            <NavLink
              to={href}
              aria-label={label}
              onClick={closeMobileSidebar}
              className={cn(
                "flex size-full items-center justify-center [&>svg]:m-0",
                SHELL_FOCUS_RING_CLASS
              )}
            >
              {icon}
              <span className="sr-only">{label}</span>
            </NavLink>
          </SidebarMenuButton>
        </TooltipTrigger>

        <TooltipContent {...SHELL_TOOLTIP_CONTENT_PROPS}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  )
}

export type AppShellSidebarRailPlaceholderProps = {
  emoji: string
  label: string
  tooltip: string
}

/** Disabled rail tile (for example: coming soon). */
export function AppShellSidebarRailPlaceholder({
  emoji,
  label,
  tooltip,
}: AppShellSidebarRailPlaceholderProps) {
  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Disabled buttons do not emit hover reliably in some browsers. */}
          <span className="inline-flex w-full">
            <SidebarMenuButton
              aria-disabled
              className="ui-shell-nav-disabled justify-center"
              disabled
              type="button"
              aria-label={label}
            >
              <span className="ui-shell-rail-emoji" aria-hidden>
                {emoji}
              </span>
              <span className="sr-only">{label}</span>
            </SidebarMenuButton>
          </span>
        </TooltipTrigger>

        <TooltipContent {...SHELL_TOOLTIP_CONTENT_PROPS}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  )
}

export type AppShellSidebarRailWidgetPickerFeature = {
  featureId: ShellNavigationItemId
  emoji: string
  labelKey: ShellNavWidgetLabelKey
}

export type AppShellSidebarRailWidgetPickerProps = {
  /** Opens the menu (tooltip + control label). */
  addButtonLabel: string
  /** Menu section title. */
  customizeLabel: string
  features: readonly AppShellSidebarRailWidgetPickerFeature[]
  allowedFeatureIds: ReadonlySet<ShellNavigationItemId>
  enabledFeatureIds: ReadonlySet<ShellNavigationItemId>
  onToggleFeature: (id: ShellNavigationItemId) => void
}

/**
 * "+" control: opens a checklist to show/hide rail widgets.
 * At least one feature stays enabled.
 */
export function AppShellSidebarRailWidgetPicker({
  addButtonLabel,
  customizeLabel,
  features,
  allowedFeatureIds,
  enabledFeatureIds,
  onToggleFeature,
}: AppShellSidebarRailWidgetPickerProps) {
  const { t } = useTranslation("shell")
  const closeMobileSidebar = useCloseMobileSidebar()

  const pickable = features.filter((feature) =>
    allowedFeatureIds.has(feature.featureId)
  )

  return (
    <SidebarMenuItem>
      <DropdownMenu
        onOpenChange={(open) =>
          handleWidgetPickerDropdownOpenChange(open, closeMobileSidebar)
        }
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                type="button"
                className="justify-center"
                aria-label={addButtonLabel}
                aria-haspopup="menu"
              >
                <Plus className="size-4 shrink-0" aria-hidden />
                <span className="sr-only">{addButtonLabel}</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </TooltipTrigger>

          <TooltipContent {...SHELL_TOOLTIP_CONTENT_PROPS}>
            {addButtonLabel}
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          className="min-w-56"
          {...SHELL_WIDGET_PICKER_DROPDOWN_CONTENT_PROPS}
        >
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {customizeLabel}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {pickable.map((feature) => {
              const checked = enabledFeatureIds.has(feature.featureId)
              const lastOne = checked && enabledFeatureIds.size <= 1

              return (
                <DropdownMenuCheckboxItem
                  key={feature.featureId}
                  checked={checked}
                  disabled={lastOne}
                  onSelect={(event) => {
                    event.preventDefault()
                  }}
                  onCheckedChange={() => {
                    onToggleFeature(feature.featureId)
                  }}
                >
                  <span className="ui-shell-rail-emoji" aria-hidden>
                    {feature.emoji}
                  </span>
                  <span>{t(feature.labelKey)}</span>
                </DropdownMenuCheckboxItem>
              )
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
