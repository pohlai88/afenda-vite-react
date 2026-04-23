import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import {
  authOrganizationClient,
  useAuthPostLoginDestination,
} from "@/app/_platform/auth"
import { UserProfile } from "@/share/components/settings/account/user-profile"
import { SetupShell } from "./setup-shell"

export function ProfileSetupPage() {
  const { t } = useTranslation("auth")
  const text = (key: string, options?: Record<string, string>) =>
    String(t(key as never, options as never))
  const navigate = useNavigate()
  const destinationPath = useAuthPostLoginDestination()
  const activeOrganizationQuery = authOrganizationClient.useActiveOrganization()
  const organizationName =
    activeOrganizationQuery.data?.name ??
    text("setup.profile.organization_fallback")

  return (
    <SetupShell
      title={text("setup.profile.title")}
      description={text("setup.profile.description")}
      aside={
        <Card className="setup-panel-card py-0">
          <CardHeader className="setup-panel-header">
            <CardTitle className="setup-panel-title">
              {text("setup.profile.next_title")}
            </CardTitle>
            <CardDescription className="setup-panel-description">
              {text("setup.profile.next_description", {
                organization: organizationName,
              })}
            </CardDescription>
          </CardHeader>

          <CardContent className="setup-panel-content">
            <div className="grid gap-3">
              <Button
                onClick={() =>
                  void navigate(destinationPath, { replace: true })
                }
              >
                {text("setup.profile.continue_action")}
              </Button>

              <Button asChild variant="outline">
                <Link to="/app/settings/account">
                  {text("setup.profile.settings_action")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <UserProfile />
    </SetupShell>
  )
}
