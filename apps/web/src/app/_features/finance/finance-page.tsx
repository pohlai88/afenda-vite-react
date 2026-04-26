import { useState } from "react"
import type { TFunction } from "i18next"
import { useTranslation } from "react-i18next"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@afenda/design-system/ui-primitives"

import { useFinanceAllocations } from "./use-finance-allocations"
import { useFinanceInvoices } from "./use-finance-invoices"
import { useFinanceSettlements } from "./use-finance-settlements"

type FinanceTab = "overview" | "invoices" | "allocations" | "settlements"

type FinancePageProps = {
  readonly initialTab?: FinanceTab
  readonly showTabs?: boolean
}

function formatMoney(amountMinor: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amountMinor / 100)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US")
}

function resolveFinancePageTitle(
  activeTab: FinanceTab,
  showTabs: boolean,
  tShell: TFunction<"shell">,
  tInvoice: TFunction<"invoice">,
  tAllocation: TFunction<"allocation">,
  tSettlement: TFunction<"settlement">
): string {
  if (showTabs || activeTab === "overview") {
    return tShell("erp_module.finance.page.title")
  }

  switch (activeTab) {
    case "invoices":
      return tInvoice("header.title.label")
    case "allocations":
      return tAllocation("header.title.label")
    case "settlements":
      return tSettlement("header.title.label")
    default:
      return tShell("erp_module.finance.page.title")
  }
}

function resolveFinancePageDescription(
  activeTab: FinanceTab,
  showTabs: boolean,
  tShell: TFunction<"shell">,
  tInvoice: TFunction<"invoice">,
  tAllocation: TFunction<"allocation">,
  tSettlement: TFunction<"settlement">
): string {
  if (showTabs || activeTab === "overview") {
    return tShell("erp_module.finance.page.description")
  }

  switch (activeTab) {
    case "invoices":
      return tInvoice("summary.description")
    case "allocations":
      return tAllocation("summary.description")
    case "settlements":
      return tSettlement("summary.description")
    default:
      return tShell("erp_module.finance.page.description")
  }
}

function formatInvoiceStatusLabel(
  t: TFunction<"invoice">,
  status: "draft" | "open" | "paid" | "void" | "uncollectible"
): string {
  switch (status) {
    case "open":
      return t("status.draft.label")
    case "paid":
      return t("status.paid.label")
    case "draft":
    default:
      return t("status.draft.label")
  }
}

function formatAllocationStatusLabel(
  t: TFunction<"allocation">,
  status: "planned" | "allocated" | "released"
): string {
  switch (status) {
    case "allocated":
      return t("status.allocated.label")
    case "released":
      return t("status.released.label")
    case "planned":
    default:
      return t("status.planned.label")
  }
}

function formatSettlementStatusLabel(
  t: TFunction<"settlement">,
  status: "pending" | "completed"
): string {
  switch (status) {
    case "completed":
      return t("status.completed.label")
    case "pending":
    default:
      return t("status.pending.label")
  }
}

export function FinancePage(props: FinancePageProps = {}) {
  const { initialTab = "overview", showTabs = true } = props
  const { t: tShell } = useTranslation("shell")
  const { t: tInvoice } = useTranslation("invoice")
  const { t: tAllocation } = useTranslation("allocation")
  const { t: tSettlement } = useTranslation("settlement")
  const [activeTab, setActiveTab] = useState<FinanceTab>(initialTab)
  const {
    data: invoiceData,
    isPending: isInvoicesPending,
    isError: isInvoicesError,
    refetch: refetchInvoices,
    createInvoice,
    isCreatingInvoice,
  } = useFinanceInvoices()
  const {
    data: allocationData,
    isPending: isAllocationsPending,
    isError: isAllocationsError,
    refetch: refetchAllocations,
  } = useFinanceAllocations()
  const {
    data: settlementData,
    isPending: isSettlementsPending,
    isError: isSettlementsError,
    refetch: refetchSettlements,
  } = useFinanceSettlements()

  const [customerLabel, setCustomerLabel] = useState("Acme Operations")
  const [description, setDescription] = useState("Monthly advisory retainer")
  const [quantity, setQuantity] = useState("1")
  const [unitPriceMinor, setUnitPriceMinor] = useState("150000")

  async function handleCreateInvoice() {
    await createInvoice({
      customerLabel,
      currencyCode: "USD",
      taxRate: 0.1,
      daysUntilDue: 7,
      items: [
        {
          description,
          quantity: Number(quantity),
          unitPriceMinor: Number(unitPriceMinor),
        },
      ],
    })
  }

  const draftInvoices =
    invoiceData?.items.filter((invoice) => invoice.status === "draft").length ??
    0
  const pendingSettlements =
    settlementData?.items.filter(
      (settlement) => settlement.status === "pending"
    ).length ?? 0
  const latestAllocation = allocationData?.items[0]
  const latestSettlement = settlementData?.items[0]
  const latestInvoice = invoiceData?.items[0]
  const pageTitle = resolveFinancePageTitle(
    activeTab,
    showTabs,
    tShell,
    tInvoice,
    tAllocation,
    tSettlement
  )
  const pageDescription = resolveFinancePageDescription(
    activeTab,
    showTabs,
    tShell,
    tInvoice,
    tAllocation,
    tSettlement
  )
  const headerBadgeLabel =
    activeTab === "allocations"
      ? allocationData
        ? `${allocationData.totalItems} ${tShell("finance_tabs.allocations")}`
        : tAllocation("header.title.label")
      : activeTab === "settlements"
        ? settlementData
          ? `${settlementData.totalItems} ${tShell("finance_tabs.settlements")}`
          : tSettlement("header.title.label")
        : invoiceData
          ? tInvoice("total.message", { count: invoiceData.totalItems })
          : tInvoice("entity.label")

  return (
    <section className="ui-page ui-stack-relaxed">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="ui-title-page">{pageTitle}</h1>
          <p className="ui-lede">{pageDescription}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{headerBadgeLabel}</Badge>
          <Button
            variant="outline"
            onClick={() =>
              void Promise.all([
                refetchInvoices(),
                refetchAllocations(),
                refetchSettlements(),
              ])
            }
          >
            {tShell("actions.refresh")}
          </Button>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as FinanceTab)}
      >
        {showTabs ? (
          <TabsList
            variant="line"
            className="w-full justify-start overflow-x-auto"
          >
            <TabsTrigger value="overview">
              {tShell("finance_tabs.overview")}
            </TabsTrigger>
            <TabsTrigger value="invoices">
              {tShell("finance_tabs.invoices")}
            </TabsTrigger>
            <TabsTrigger value="allocations">
              {tShell("finance_tabs.allocations")}
            </TabsTrigger>
            <TabsTrigger value="settlements">
              {tShell("finance_tabs.settlements")}
            </TabsTrigger>
          </TabsList>
        ) : null}

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border/70">
              <CardHeader>
                <CardDescription>
                  {tShell("finance_tabs.invoices")}
                </CardDescription>
                <CardTitle>
                  {formatMoney(
                    invoiceData?.totalAmountMinor ?? 0,
                    invoiceData?.items[0]?.currencyCode ?? "USD"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {tInvoice("summary.amount.label")}
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardHeader>
                <CardDescription>
                  {tInvoice("status.draft.label")}
                </CardDescription>
                <CardTitle>{draftInvoices}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {tInvoice("summary.count.label")}
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardHeader>
                <CardDescription>
                  {tShell("finance_tabs.allocations")}
                </CardDescription>
                <CardTitle>
                  {formatMoney(
                    allocationData?.totalAmountMinor ?? 0,
                    allocationData?.items[0]?.currencyCode ?? "USD"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {tAllocation("summary.amount.label")}
              </CardContent>
            </Card>
            <Card className="border-border/70">
              <CardHeader>
                <CardDescription>
                  {tSettlement("status.pending.label")}
                </CardDescription>
                <CardTitle>{pendingSettlements}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {tSettlement("summary.pending.label")}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>{tShell("finance_tabs.invoices")}</CardTitle>
                <CardDescription>
                  {tInvoice("summary.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isInvoicesPending ? (
                  <p className="text-sm text-muted-foreground">
                    {tInvoice("state.loading.label")}
                  </p>
                ) : isInvoicesError || !latestInvoice ? (
                  <p className="text-sm text-muted-foreground">
                    {tInvoice("state.error.label")}
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-foreground">
                      {latestInvoice.invoiceNumber}
                    </p>
                    <p className="text-muted-foreground">
                      {latestInvoice.customerLabel}
                    </p>
                    <p className="text-muted-foreground">
                      {formatMoney(
                        latestInvoice.totalMinor,
                        latestInvoice.currencyCode
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>{tAllocation("header.title.label")}</CardTitle>
                <CardDescription>
                  {tAllocation("summary.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isAllocationsPending ? (
                  <p className="text-sm text-muted-foreground">
                    {tShell("states.loading.default_description")}
                  </p>
                ) : isAllocationsError || !latestAllocation ? (
                  <p className="text-sm text-muted-foreground">
                    {tShell("states.error.default_description")}
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-foreground">
                      {latestAllocation.allocationNumber}
                    </p>
                    <p className="text-muted-foreground">
                      {latestAllocation.targetLabel}
                    </p>
                    <p className="text-muted-foreground">
                      {formatMoney(
                        latestAllocation.amountMinor,
                        latestAllocation.currencyCode
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>{tSettlement("header.title.label")}</CardTitle>
                <CardDescription>
                  {tSettlement("summary.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSettlementsPending ? (
                  <p className="text-sm text-muted-foreground">
                    {tShell("states.loading.default_description")}
                  </p>
                ) : isSettlementsError || !latestSettlement ? (
                  <p className="text-sm text-muted-foreground">
                    {tShell("states.error.default_description")}
                  </p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-foreground">
                      {latestSettlement.settlementNumber}
                    </p>
                    <p className="text-muted-foreground">
                      {latestSettlement.counterpartyLabel}
                    </p>
                    <p className="text-muted-foreground">
                      {formatMoney(
                        latestSettlement.amountMinor,
                        latestSettlement.currencyCode
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>{tInvoice("header.title.label")}</CardTitle>
                <CardDescription>
                  {tInvoice("summary.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isInvoicesPending ? (
                  <p className="text-sm text-muted-foreground">
                    {tInvoice("state.loading.label")}
                  </p>
                ) : isInvoicesError || !invoiceData ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {tInvoice("state.error.label")}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => void refetchInvoices()}
                    >
                      {tShell("states.tenant_scope.retry")}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">
                          {tInvoice("summary.count.label")}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">
                          {invoiceData.totalItems}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                        <p className="text-sm text-muted-foreground">
                          {tInvoice("summary.amount.label")}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">
                          {formatMoney(
                            invoiceData.totalAmountMinor,
                            invoiceData.items[0]?.currencyCode ?? "USD"
                          )}
                        </p>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {tInvoice("table.number.label")}
                          </TableHead>
                          <TableHead>
                            {tInvoice("table.customer.label")}
                          </TableHead>
                          <TableHead>
                            {tInvoice("table.status.label")}
                          </TableHead>
                          <TableHead>{tInvoice("table.total.label")}</TableHead>
                          <TableHead>{tInvoice("table.due.label")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoiceData.items.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.invoiceNumber}
                            </TableCell>
                            <TableCell>{invoice.customerLabel}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  invoice.status === "draft"
                                    ? "outline"
                                    : "secondary"
                                }
                              >
                                {formatInvoiceStatusLabel(
                                  tInvoice,
                                  invoice.status
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatMoney(
                                invoice.totalMinor,
                                invoice.currencyCode
                              )}
                            </TableCell>
                            <TableCell>{formatDate(invoice.dueAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle>{tInvoice("create.title.label")}</CardTitle>
                <CardDescription>
                  {tInvoice("create.description.message")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="finance-customer">
                    {tInvoice("form.customer.label")}
                  </Label>
                  <Input
                    id="finance-customer"
                    value={customerLabel}
                    onChange={(event) => setCustomerLabel(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="finance-description">
                    {tInvoice("form.description.label")}
                  </Label>
                  <Input
                    id="finance-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="finance-quantity">
                      {tInvoice("form.quantity.label")}
                    </Label>
                    <Input
                      id="finance-quantity"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finance-unit-price">
                      {tInvoice("form.unit_price.label")}
                    </Label>
                    <Input
                      id="finance-unit-price"
                      inputMode="numeric"
                      value={unitPriceMinor}
                      onChange={(event) =>
                        setUnitPriceMinor(event.target.value)
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={() => void handleCreateInvoice()}
                  disabled={isCreatingInvoice}
                >
                  {isCreatingInvoice
                    ? tInvoice("create.pending.label")
                    : tInvoice("create.action.label")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocations">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{tAllocation("header.title.label")}</CardTitle>
              <CardDescription>
                {tAllocation("summary.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAllocationsPending ? (
                <p className="text-sm text-muted-foreground">
                  {tShell("states.loading.default_description")}
                </p>
              ) : isAllocationsError || !allocationData ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {tShell("states.error.default_description")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => void refetchAllocations()}
                  >
                    {tShell("states.tenant_scope.retry")}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">
                        {tAllocation("summary.count.label")}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {allocationData.totalItems}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">
                        {tAllocation("summary.amount.label")}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {formatMoney(
                          allocationData.totalAmountMinor,
                          allocationData.items[0]?.currencyCode ?? "USD"
                        )}
                      </p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {tAllocation("table.number.label")}
                        </TableHead>
                        <TableHead>
                          {tAllocation("table.invoice.label")}
                        </TableHead>
                        <TableHead>
                          {tAllocation("table.target.label")}
                        </TableHead>
                        <TableHead>
                          {tAllocation("table.status.label")}
                        </TableHead>
                        <TableHead>
                          {tAllocation("table.amount.label")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocationData.items.map((allocation) => (
                        <TableRow key={allocation.id}>
                          <TableCell className="font-medium">
                            {allocation.allocationNumber}
                          </TableCell>
                          <TableCell>{allocation.invoiceNumber}</TableCell>
                          <TableCell>{allocation.targetLabel}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                allocation.status === "allocated"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {formatAllocationStatusLabel(
                                tAllocation,
                                allocation.status
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatMoney(
                              allocation.amountMinor,
                              allocation.currencyCode
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlements">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{tSettlement("header.title.label")}</CardTitle>
              <CardDescription>
                {tSettlement("summary.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSettlementsPending ? (
                <p className="text-sm text-muted-foreground">
                  {tShell("states.loading.default_description")}
                </p>
              ) : isSettlementsError || !settlementData ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {tShell("states.error.default_description")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => void refetchSettlements()}
                  >
                    {tShell("states.tenant_scope.retry")}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">
                        {tSettlement("summary.count.label")}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {settlementData.totalItems}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">
                        {tSettlement("summary.amount.label")}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {formatMoney(
                          settlementData.totalAmountMinor,
                          settlementData.items[0]?.currencyCode ?? "USD"
                        )}
                      </p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {tSettlement("table.number.label")}
                        </TableHead>
                        <TableHead>
                          {tSettlement("table.invoice.label")}
                        </TableHead>
                        <TableHead>
                          {tSettlement("table.counterparty.label")}
                        </TableHead>
                        <TableHead>
                          {tSettlement("table.status.label")}
                        </TableHead>
                        <TableHead>{tSettlement("table.due.label")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settlementData.items.map((settlement) => (
                        <TableRow key={settlement.id}>
                          <TableCell className="font-medium">
                            {settlement.settlementNumber}
                          </TableCell>
                          <TableCell>{settlement.invoiceNumber}</TableCell>
                          <TableCell>{settlement.counterpartyLabel}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                settlement.status === "completed"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {formatSettlementStatusLabel(
                                tSettlement,
                                settlement.status
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(settlement.dueAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}

export function InvoicesPage() {
  return <FinancePage initialTab="invoices" showTabs={false} />
}

export function AllocationsPage() {
  return <FinancePage initialTab="allocations" showTabs={false} />
}

export function SettlementsPage() {
  return <FinancePage initialTab="settlements" showTabs={false} />
}
