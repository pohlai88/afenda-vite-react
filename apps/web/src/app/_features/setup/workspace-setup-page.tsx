import { type SyntheticEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  FieldDescription,
  FieldError,
  Input,
  Label,
  Spinner,
} from "@afenda/design-system/ui-primitives"
import {
  activateAuthTenantContext,
  authOrganizationClient,
  listAuthTenantCandidates,
  mapAuthErrorToUserMessage,
  resolveAuthErrorCode,
  type AuthTenantCandidate,
  useAfendaSession,
  useAuthPostLoginDestination,
} from "@/app/_platform/auth"
import { SetupShell } from "./setup-shell"

function createWorkspaceSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function WorkspaceSetupPage() {
  const { t } = useTranslation("auth")
  const text = (key: string) => String(t(key as never))
  const navigate = useNavigate()
  const destinationPath = useAuthPostLoginDestination()
  const sessionQuery = useAfendaSession()
  const organizationsQuery = authOrganizationClient.useListOrganizations()

  const [name, setName] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [pendingOrganizationId, setPendingOrganizationId] = useState<
    string | null
  >(null)
  const [tenantCandidates, setTenantCandidates] = useState<
    readonly AuthTenantCandidate[]
  >([])
  const [pendingTenantId, setPendingTenantId] = useState<string | null>(null)
  const [isLoadingTenantCandidates, setIsLoadingTenantCandidates] =
    useState(false)

  const organizations = organizationsQuery.data ?? []
  const hasOrganizations = organizations.length > 0
  const hasTenantCandidates = tenantCandidates.length > 0

  async function finalizeSetupNavigation(activeTenantId?: string) {
    await activateAuthTenantContext(activeTenantId)
    setTenantCandidates([])
    await sessionQuery.refetch()
    void navigate(destinationPath, { replace: true })
  }

  async function loadTenantCandidates() {
    setIsLoadingTenantCandidates(true)

    try {
      const payload = await listAuthTenantCandidates()
      setTenantCandidates(payload.candidates)
      setSubmitError(
        payload.candidates.length > 0
          ? null
          : mapAuthErrorToUserMessage(
              "tenant_context_resolution_failed",
              "No active workspace access was found for this account."
            )
      )
    } catch (error) {
      setSubmitError(
        mapAuthErrorToUserMessage(
          resolveAuthErrorCode(error),
          "Workspace access could not be loaded for tenant selection."
        )
      )
    } finally {
      setIsLoadingTenantCandidates(false)
    }
  }

  async function handleTenantActivationFailure(
    error: unknown,
    fallbackMessage: string
  ) {
    const code = resolveAuthErrorCode(error)

    if (code === "tenant_selection_required") {
      await loadTenantCandidates()
      return
    }

    setSubmitError(mapAuthErrorToUserMessage(code, fallbackMessage))
  }

  async function handleActivateOrganization(organizationId: string) {
    setPendingOrganizationId(organizationId)
    setSubmitError(null)
    setTenantCandidates([])

    const result = await authOrganizationClient.organization.setActive({
      organizationId,
    })

    setPendingOrganizationId(null)

    if (result.error) {
      setSubmitError(
        result.error.message ?? text("setup.workspace.errors.invalid_name")
      )
      return
    }

    try {
      await finalizeSetupNavigation()
    } catch (error) {
      await handleTenantActivationFailure(
        error,
        "Workspace was selected, but tenant activation is not complete yet."
      )
    }
  }

  async function handleCreateWorkspace(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmedName = name.trim()
    const slug = createWorkspaceSlug(trimmedName)

    if (!trimmedName || slug.length === 0) {
      setFieldError(text("setup.workspace.errors.invalid_name"))
      return
    }

    setFieldError(null)
    setSubmitError(null)
    setTenantCandidates([])
    setIsCreating(true)

    const result = await authOrganizationClient.organization.create({
      name: trimmedName,
      slug,
    })

    setIsCreating(false)

    if (result.error) {
      if (
        result.error.code === "ORGANIZATION_ALREADY_EXISTS" ||
        result.error.code === "ORGANIZATION_SLUG_ALREADY_TAKEN"
      ) {
        setFieldError(text("setup.workspace.errors.name_taken"))
        return
      }

      setSubmitError(
        result.error.message ?? text("setup.workspace.errors.invalid_name")
      )
      return
    }

    try {
      await finalizeSetupNavigation()
    } catch (error) {
      await handleTenantActivationFailure(
        error,
        "Workspace was created, but tenant activation is not complete yet."
      )
    }
  }

  async function handleSelectTenant(tenantId: string) {
    setPendingTenantId(tenantId)
    setSubmitError(null)

    try {
      await finalizeSetupNavigation(tenantId)
    } catch (error) {
      await handleTenantActivationFailure(
        error,
        "Workspace access was selected, but tenant activation is not complete yet."
      )
    } finally {
      setPendingTenantId(null)
    }
  }

  const accountSummary = [
    {
      label: text("setup.workspace.account_labels.email"),
      value:
        sessionQuery.data?.user.email ||
        text("setup.workspace.account_labels.missing"),
    },
    {
      label: text("setup.workspace.account_labels.name"),
      value:
        sessionQuery.data?.user.name ||
        text("setup.workspace.account_labels.missing"),
    },
  ]

  return (
    <SetupShell
      title={text("setup.workspace.title")}
      description={text("setup.workspace.description")}
      aside={
        <div className="setup-aside-stack">
          <Card className="setup-panel-card py-0">
            <CardHeader className="setup-panel-header">
              <CardTitle className="setup-panel-title">
                {text("setup.workspace.account_title")}
              </CardTitle>
              <CardDescription className="setup-panel-description">
                {text("setup.workspace.account_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="setup-panel-content">
              <dl className="setup-detail-list">
                {accountSummary.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <dt className="setup-detail-label">{item.label}</dt>
                    <dd className="setup-detail-value">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="setup-panel-card py-0">
            <CardHeader className="setup-panel-header">
              <CardTitle className="setup-panel-title">
                {text("setup.workspace.binding_title")}
              </CardTitle>
              <CardDescription className="setup-panel-description">
                {text("setup.workspace.binding_description")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <form onSubmit={handleCreateWorkspace}>
        <Card className="setup-panel-card py-0">
          <CardHeader className="setup-panel-header">
            <CardTitle className="setup-panel-title">
              {text("setup.workspace.create_title")}
            </CardTitle>
            <CardDescription className="setup-panel-description">
              {text("setup.workspace.create_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="setup-panel-content">
            <Field data-invalid={fieldError !== null}>
              <Label htmlFor="workspace-name">
                {text("setup.workspace.name_label")}
              </Label>
              <Input
                id="workspace-name"
                name="workspaceName"
                autoComplete="organization"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setFieldError(null)
                }}
                placeholder={text("setup.workspace.name_placeholder")}
                disabled={isCreating}
                required
                aria-invalid={fieldError !== null}
              />
              <FieldDescription>
                {text("setup.workspace.name_help")}
              </FieldDescription>
              <FieldError>{fieldError}</FieldError>
            </Field>

            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
          </CardContent>

          <CardFooter className="setup-panel-footer">
            <p className="text-sm text-muted-foreground">
              {text("setup.workspace.owner_note")}
            </p>

            <Button
              type="submit"
              disabled={isCreating || pendingTenantId !== null}
            >
              {isCreating ? <Spinner /> : null}
              {text("setup.workspace.create_action")}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {hasTenantCandidates || isLoadingTenantCandidates ? (
        <Card className="setup-panel-card py-0">
          <CardHeader className="setup-panel-header">
            <CardTitle className="setup-panel-title">
              {text("setup.workspace.tenant_selector_title")}
            </CardTitle>
            <CardDescription className="setup-panel-description">
              {text("setup.workspace.tenant_selector_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="setup-panel-content">
            {isLoadingTenantCandidates ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                {text("setup.workspace.tenant_selector_loading")}
              </div>
            ) : (
              <div className="setup-selection-grid">
                {tenantCandidates.map((tenant) => (
                  <div
                    key={tenant.membershipId}
                    className="setup-selection-card"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {tenant.tenantName}
                    </p>
                    <p className="mt-1 text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      {tenant.tenantCode}
                    </p>
                    {tenant.isDefault ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {text("setup.workspace.tenant_selector_default")}
                      </p>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 w-full"
                      disabled={pendingTenantId !== null || isCreating}
                      onClick={() => handleSelectTenant(tenant.tenantId)}
                    >
                      {pendingTenantId === tenant.tenantId ? <Spinner /> : null}
                      {text("setup.workspace.tenant_selector_action")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {hasOrganizations || organizationsQuery.isPending ? (
        <Card className="setup-panel-card py-0">
          <CardHeader className="setup-panel-header">
            <CardTitle className="setup-panel-title">
              {text("setup.workspace.resume_title")}
            </CardTitle>
            <CardDescription className="setup-panel-description">
              {text("setup.workspace.resume_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="setup-panel-content">
            {organizationsQuery.isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                {text("setup.workspace.loading")}
              </div>
            ) : (
              <div className="setup-selection-grid">
                {organizations.map((organization) => (
                  <div key={organization.id} className="setup-selection-card">
                    <p className="text-sm font-semibold text-foreground">
                      {organization.name}
                    </p>
                    <p className="mt-1 text-xs tracking-[0.2em] text-muted-foreground uppercase">
                      {organization.slug}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 w-full"
                      disabled={
                        pendingOrganizationId !== null ||
                        pendingTenantId !== null
                      }
                      onClick={() =>
                        handleActivateOrganization(organization.id)
                      }
                    >
                      {pendingOrganizationId === organization.id ? (
                        <Spinner />
                      ) : null}
                      {text("setup.workspace.resume_action")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </SetupShell>
  )
}
