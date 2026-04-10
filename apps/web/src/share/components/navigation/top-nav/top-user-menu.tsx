import {
  ActivityIcon,
  BellIcon,
  CircleIcon,
  CreditCardIcon,
  GlobeIcon,
  LogOutIcon,
  MoonIcon,
  PaletteIcon,
  ScrollTextIcon,
  SunIcon,
  UserIcon,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/components/theme-provider"

import { cn } from "@afenda/shadcn-ui/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@afenda/shadcn-ui/components/ui/avatar"
import { Button } from "@afenda/shadcn-ui/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@afenda/shadcn-ui/components/ui/dropdown-menu"
import { SUPPORTED_LOCALES } from "@/share/i18n"
import type { ShellHealthSummary } from "@/share/types"
import { useAppShellStore } from "@/share/client-store/app-shell-store"
import { getIntegritySeverityPresentation } from "@afenda/shadcn-ui/semantic"

const LOCALE_DISPLAY: Record<string, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  ms: { name: "Bahasa Malaysia", flag: "🇲🇾" },
  id: { name: "Bahasa Indonesia", flag: "🇮🇩" },
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
}

export interface TopUserMenuProps {
  loginHref?: string
  /** Shell health summary for Section 0 (optional). */
  healthSummary?: ShellHealthSummary | null
  /** Merged into the avatar trigger button (e.g. top nav icon rail). */
  triggerClassName?: string
}

function getInitials(name: string | null | undefined) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getIntegritySeverity(score: number) {
  if (score >= 90) return "valid" as const
  if (score >= 70) return "warning" as const
  return "broken" as const
}

/**
 * Top nav user menu: 6-section dropdown on the right of `TopNavBar`.
 * 0. System health (integrity score, last reconciliation) when provided
 * 1. Identity (avatar, name, email)
 * 2. User Status (available/busy/away/invisible)
 * 3. Personal Navigation (account, billing, notifications, audit log)
 * 4. Settings (theme, language - inline switches)
 * 5. Session (logout)
 */
export function TopUserMenu({
  loginHref = "/login",
  healthSummary,
  triggerClassName,
}: TopUserMenuProps) {
  const { t, i18n } = useTranslation("shell")
  const { theme, setTheme } = useTheme()
  const currentUser = useAppShellStore((state) => state.currentUser)
  const logout = useAppShellStore((state) => state.logout)
  const language = useAppShellStore((state) => state.language)
  const setLanguage = useAppShellStore((state) => state.setLanguage)

  if (!currentUser) {
    return (
      <Link to={loginHref}>
        <Button size="sm">{t("marketing.landing.sign_in", "Sign In")}</Button>
      </Link>
    )
  }

  const displayName = currentUser.name ?? "Guest"
  const email = currentUser.id
    ? `${currentUser.id}@afenda.app`
    : "guest@afenda.app"

  const handleLanguageChange = (locale: string) => {
    setLanguage(locale)
    void i18n.changeLanguage(locale)
  }

  const integrityTone = healthSummary
    ? getIntegritySeverityPresentation(
        getIntegritySeverity(healthSummary.integrityScore)
      )
    : null
  const brokenTone = getIntegritySeverityPresentation("broken")
  const warningTone = getIntegritySeverityPresentation("warning")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            triggerClassName ?? "rounded-full",
            triggerClassName && "overflow-hidden p-0"
          )}
        >
          <Avatar className={triggerClassName ? "size-7" : undefined}>
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56" align="end">
        {/* Section 0: System health */}
        {healthSummary && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {t("user_menu.system_health", "System Health")}
              </DropdownMenuLabel>
              <div className="px-2 py-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("user_menu.integrity_score", "Integrity")}
                  </span>
                  <span
                    className={cn("font-medium", integrityTone?.textClassName)}
                  >
                    {healthSummary.integrityScore}%
                  </span>
                </div>
                {healthSummary.lastReconciliation && (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("user_menu.last_reconciled", "Last reconciled")}
                    </span>
                    <span className="text-xs">
                      {new Date(
                        healthSummary.lastReconciliation
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {(healthSummary.invariantFailures.length > 0 ||
                  healthSummary.warnings.length > 0) && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {healthSummary.invariantFailures.length > 0 && (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5",
                          brokenTone.pillClassName
                        )}
                      >
                        {healthSummary.invariantFailures.length}{" "}
                        {t("user_menu.failures", "failures")}
                      </span>
                    )}
                    {healthSummary.warnings.length > 0 && (
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5",
                          warningTone.pillClassName
                        )}
                      >
                        {healthSummary.warnings.length}{" "}
                        {t("user_menu.warnings", "warnings")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Section 1: Identity */}
        <DropdownMenuGroup>
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar>
              <AvatarImage src="" alt={displayName} />
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Section 2: User Status */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ActivityIcon className="mr-2 size-4" />
              {t("user_menu.status", "Status")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <CircleIcon
                    className={cn(
                      "size-3",
                      getIntegritySeverityPresentation("valid").iconClassName
                    )}
                  />
                  {t("user_menu.status_available", "Available")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CircleIcon className="size-3 fill-destructive text-destructive" />
                  {t("user_menu.status_busy", "Busy")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CircleIcon
                    className={cn("size-3", warningTone.iconClassName)}
                  />
                  {t("user_menu.status_away", "Away")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CircleIcon className="size-3 fill-muted-foreground text-muted-foreground" />
                  {t("user_menu.status_invisible", "Invisible")}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Section 3: Personal Navigation */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/app/account">
              <UserIcon className="mr-2 size-4" />
              {t("user_menu.account", "Account")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/app/billing">
              <CreditCardIcon className="mr-2 size-4" />
              {t("user_menu.billing", "Billing")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/app/settings/notifications">
              <BellIcon className="mr-2 size-4" />
              {t("user_menu.notification_settings", "Notifications")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/app/audit-log">
              <ScrollTextIcon className="mr-2 size-4" />
              {t("user_menu.audit_log", "Audit Log")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Section 4: Settings (Theme + Language inline) */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PaletteIcon className="mr-2 size-4" />
              {t("user_menu.theme", "Theme")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(value) => {
                    if (
                      value === "light" ||
                      value === "dark" ||
                      value === "system"
                    ) {
                      setTheme(value)
                    }
                  }}
                >
                  <DropdownMenuRadioItem value="light">
                    <SunIcon className="mr-2 size-4" />
                    {t("user_menu.theme_light", "Light")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    <MoonIcon className="mr-2 size-4" />
                    {t("user_menu.theme_dark", "Dark")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">
                    {t("user_menu.theme_system", "System")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <GlobeIcon className="mr-2 size-4" />
              {t("user_menu.language", "Language")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={language}
                  onValueChange={handleLanguageChange}
                >
                  {SUPPORTED_LOCALES.map((locale) => (
                    <DropdownMenuRadioItem key={locale} value={locale}>
                      {LOCALE_DISPLAY[locale]?.flag ?? ""}{" "}
                      {LOCALE_DISPLAY[locale]?.name ?? locale}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Section 5: Session */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => logout()}
          >
            <LogOutIcon className="mr-2 size-4" />
            {t("user_menu.logout", "Log out")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
