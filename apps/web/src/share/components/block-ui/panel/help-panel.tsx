import { useState } from "react"
import {
  BookOpenIcon,
  MailIcon,
  WrenchIcon,
  ZapIcon,
  MessageCircleIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { Button } from "@afenda/shadcn-ui/components/ui/button"
import { Separator } from "@afenda/shadcn-ui/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@afenda/shadcn-ui/components/ui/sheet"

import {
  matchDefaultHelpShortcut,
  useGlobalKeydownShortcut,
} from "@/share/react-hooks"

import { HelpTrigger } from "../trigger"

export interface HelpPanelProps {
  /** URL for documentation */
  docsUrl?: string
  /** URL for troubleshooting */
  troubleshootingUrl?: string
  /** URL for system status page */
  statusUrl?: string
  /** URL for contact support */
  contactUrl?: string
  /** URL for community (e.g., Discord) */
  communityUrl?: string
  /** Disables the trigger and the global keyboard shortcut */
  disabled?: boolean
  /** When false, `?` / `Shift`+`/` does not open the sheet */
  keyboardShortcutEnabled?: boolean
  /** Predicate for the global shortcut (default: `?` or `Shift`+`/`). */
  keyboardShortcutMatch?: (event: KeyboardEvent) => boolean
  /** Merged into {@link HelpTrigger} (e.g. top nav icon rail). */
  triggerClassName?: string
}

interface HelpLinkProps {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
}

function HelpLink({ icon, label, href, onClick }: HelpLinkProps) {
  if (href) {
    return (
      <Button variant="ghost" className="w-full justify-start" asChild>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {icon}
          <span>{label}</span>
        </a>
      </Button>
    )
  }

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </Button>
  )
}

/**
 * HelpPanel provides structured help and support options (Supabase-style).
 * Opens as a slide-in sheet from the right.
 */
export function HelpPanel({
  docsUrl = "https://docs.afenda.io",
  troubleshootingUrl = "https://docs.afenda.io/troubleshooting",
  statusUrl = "https://status.afenda.io",
  contactUrl = "mailto:support@afenda.io",
  communityUrl = "https://discord.gg/afenda",
  disabled = false,
  keyboardShortcutEnabled = true,
  keyboardShortcutMatch = matchDefaultHelpShortcut,
  triggerClassName,
}: HelpPanelProps) {
  const { t } = useTranslation("shell")
  const [open, setOpen] = useState(false)

  useGlobalKeydownShortcut({
    enabled: keyboardShortcutEnabled,
    disabled,
    match: keyboardShortcutMatch,
    onMatch: () => setOpen(true),
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <HelpTrigger disabled={disabled} className={triggerClassName} />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="mb-4">
          <SheetTitle>{t("help.title", "Help & Support")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          <section>
            <h4 className="mb-1 text-sm font-medium text-primary">
              {t("help.section_help_title", "Need help with your project?")}
            </h4>
            <p className="mb-3 text-xs text-muted-foreground">
              {t(
                "help.section_help_subtitle",
                "Start with our docs or community."
              )}
            </p>
            <div className="flex flex-col gap-1">
              <HelpLink
                icon={<BookOpenIcon className="size-4" />}
                label={t("help.docs", "Docs")}
                href={docsUrl}
              />
              <HelpLink
                icon={<WrenchIcon className="size-4" />}
                label={t("help.troubleshooting", "Troubleshooting")}
                href={troubleshootingUrl}
              />
              <HelpLink
                icon={<ZapIcon className="size-4" />}
                label={t("help.status", "Afenda status")}
                href={statusUrl}
              />
              <HelpLink
                icon={<MailIcon className="size-4" />}
                label={t("help.contact", "Contact support")}
                href={contactUrl}
              />
            </div>
          </section>

          <Separator />

          <section>
            <h4 className="mb-1 text-sm font-medium">
              {t("help.community_title", "Community support")}
            </h4>
            <p className="mb-3 text-xs text-muted-foreground">
              {t(
                "help.community_subtitle",
                "Our community can help with code-related issues. Many questions are answered in minutes."
              )}
            </p>
            <Button variant="secondary" className="w-full" asChild>
              <a href={communityUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircleIcon className="mr-2" />
                {t("help.join_community", "Join us on Discord")}
              </a>
            </Button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
