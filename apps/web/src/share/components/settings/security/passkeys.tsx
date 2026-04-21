"use client"

import {
  Button,
  Card,
  CardContent,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Separator,
  Skeleton,
  Spinner,
} from "@afenda/design-system/ui-primitives"
import {
  useAddPasskey,
  useAuth,
  useListUserPasskeys,
} from "@better-auth-ui/react"
import { KeyRound } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@afenda/design-system/utils"
import { Passkey } from "./passkey"

export type PasskeysProps = {
  className?: string
}

export function Passkeys({ className }: PasskeysProps) {
  const { localization } = useAuth()
  const { t } = useTranslation("auth", {
    keyPrefix: "experience.settings.empty",
  })

  const { data: passkeys, isPending } = useListUserPasskeys()

  const { mutate: addPasskey, isPending: isAdding } = useAddPasskey()

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold tracking-[-0.02em]">
        {localization.settings.passkeys}
      </h2>

      <Card className={cn("border-border/70 p-0 shadow-none", className)}>
        <CardContent className="p-0">
          <Card className="border-0 bg-transparent shadow-none ring-0">
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm leading-tight font-medium">
                  {localization.settings.passkeysDescription}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {localization.settings.passkeysInstructions}
                </p>
              </div>

              <Button
                className="shrink-0"
                size="sm"
                disabled={isPending || isAdding}
                onClick={() => addPasskey()}
              >
                {isAdding && <Spinner />}
                {localization.settings.addPasskey}
              </Button>
            </CardContent>
          </Card>

          {isPending ? (
            <>
              <Separator />
              <PasskeySkeleton />
            </>
          ) : !passkeys?.length ? (
            <>
              <Separator />
              <Empty className="rounded-xl border-0 px-6 py-10 md:px-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <KeyRound aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle>{t("passkeys_title")}</EmptyTitle>
                  <EmptyDescription>{t("passkeys_body")}</EmptyDescription>
                </EmptyHeader>

                <EmptyContent>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isAdding}
                    onClick={() => addPasskey()}
                  >
                    {isAdding && <Spinner />}
                    {localization.settings.addPasskey}
                  </Button>
                </EmptyContent>
              </Empty>
            </>
          ) : (
            passkeys?.map((passkey) => (
              <div key={passkey.id}>
                <Separator />
                <Passkey passkey={passkey} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function PasskeySkeleton() {
  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardContent className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}
