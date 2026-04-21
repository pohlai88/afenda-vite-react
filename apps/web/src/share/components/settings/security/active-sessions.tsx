"use client"

import {
  Card,
  CardContent,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Separator,
  Skeleton,
} from "@afenda/design-system/ui-primitives"
import { useAuth, useListSessions, useSession } from "@better-auth-ui/react"
import { LaptopMinimal } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@afenda/design-system/utils"
import { ActiveSession } from "./active-session"

export type ActiveSessionsProps = {
  className?: string
}

/**
 * Render a card listing all active sessions for the current user with revoke controls.
 *
 * Shows each session's browser, OS, IP address, and creation time. The current session is marked
 * and navigates to sign-out on click, while other sessions can be revoked individually.
 *
 * @returns A JSX element containing the sessions card
 */
export function ActiveSessions({ className }: ActiveSessionsProps) {
  const { localization } = useAuth()
  const { t } = useTranslation("auth", {
    keyPrefix: "experience.settings.empty",
  })
  const { data: session } = useSession()

  const { data: sessions, isPending } = useListSessions()

  const activeSessions = [...(sessions ?? [])].sort((activeSession) =>
    activeSession.id === session?.session.id ? -1 : 1
  )

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold tracking-[-0.02em]">
        {localization.settings.activeSessions}
      </h2>

      <Card className={cn("border-border/70 p-0 shadow-none", className)}>
        <CardContent className="p-0">
          {isPending ? (
            <SessionRowSkeleton />
          ) : activeSessions.length === 0 ? (
            <Empty className="rounded-xl border-0 px-6 py-10 md:px-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LaptopMinimal aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>{t("sessions_title")}</EmptyTitle>
                <EmptyDescription>{t("sessions_body")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            activeSessions?.map((activeSession, index) => (
              <div key={activeSession.id}>
                {index > 0 && <Separator />}

                <ActiveSession activeSession={activeSession} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SessionRowSkeleton() {
  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardContent className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}
