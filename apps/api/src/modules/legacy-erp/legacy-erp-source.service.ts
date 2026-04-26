/**
 * Legacy ERP source service: remote pull connector for stable legacy system profiles.
 * Owns endpoint configuration, pagination, and remote payload normalization into adapter intake records.
 * module · legacy-erp · source service
 * Upstream: fetch, api env, zod intake schemas.
 * Downstream: legacy ingest routes and anti-corruption adapter service.
 * Side effects: outbound HTTP requests to configured legacy endpoints.
 * Coupling: only the transport contract lives here; owner persistence remains in Afenda services.
 * experimental
 * @module modules/legacy-erp/legacy-erp-source.service
 * @package @afenda/api
 */
import { env } from "../../api-env.js"
import { badRequest } from "../../api-errors.js"
import type {
  LegacyCounterpartyTransformRequest,
  LegacyErpCounterpartySourceProfile,
  LegacyErpCounterpartyPullRequest,
  LegacyErpItemPullRequest,
  LegacyErpItemSourceProfile,
  LegacyInventoryItemTransformRequest,
} from "./legacy-erp.schema.js"

type LegacyTpmCustomerRecord = {
  readonly id: string
  readonly code?: string
  readonly name: string
  readonly taxCode?: string
  readonly isActive?: boolean
  readonly company?: {
    readonly id?: string
    readonly name?: string
    readonly code?: string
  } | null
}

type LegacyTpmCustomersResponse = {
  readonly data?: readonly LegacyTpmCustomerRecord[]
  readonly metadata?: {
    readonly totalPages?: number
    readonly pageNumber?: number
    readonly pageSize?: number
    readonly totalCount?: number
  }
}

type LegacyMrpProductRecord = {
  readonly id: string
  readonly sku?: string
  readonly name: string
  readonly status?: string
}

type LegacyMrpProductsResponse = {
  readonly data?: readonly LegacyMrpProductRecord[]
  readonly pagination?: {
    readonly totalPages?: number
    readonly page?: number
    readonly pageSize?: number
    readonly total?: number
  }
}

interface LegacyCounterpartySourceConfig {
  readonly sourceProfile: LegacyErpCounterpartySourceProfile
  readonly sourceSystem: "legacy_tpm"
  readonly baseUrl: string
  readonly bearerToken?: string
  readonly tenantId?: string
  readonly endpointPath: string
}

interface LegacySourceConfigBase {
  readonly baseUrl: string
  readonly bearerToken?: string
  readonly tenantId?: string
  readonly endpointPath: string
}

interface LegacyItemSourceConfig {
  readonly sourceProfile: LegacyErpItemSourceProfile
  readonly sourceSystem: "legacy_mrp"
  readonly baseUrl: string
  readonly bearerToken?: string
  readonly tenantId?: string
  readonly endpointPath: string
}

let counterpartySourceConfigOverride: LegacyCounterpartySourceConfig | null =
  null
let itemSourceConfigOverride: LegacyItemSourceConfig | null = null

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/u, "")
}

function resolveCounterpartySourceConfig(
  sourceProfile: LegacyErpCounterpartySourceProfile
): LegacyCounterpartySourceConfig {
  if (counterpartySourceConfigOverride) {
    return counterpartySourceConfigOverride
  }

  switch (sourceProfile) {
    case "legacy-tpm-customers":
      if (!env.LEGACY_TPM_API_URL) {
        throw badRequest(
          "Legacy TPM customer pull requires LEGACY_TPM_API_URL to be configured."
        )
      }

      return {
        sourceProfile,
        sourceSystem: "legacy_tpm",
        baseUrl: normalizeBaseUrl(env.LEGACY_TPM_API_URL),
        bearerToken: env.LEGACY_TPM_API_TOKEN,
        tenantId: env.LEGACY_TPM_TENANT_ID,
        endpointPath: "/customers",
      }
  }
}

function resolveItemSourceConfig(
  sourceProfile: LegacyErpItemSourceProfile
): LegacyItemSourceConfig {
  if (itemSourceConfigOverride) {
    return itemSourceConfigOverride
  }

  switch (sourceProfile) {
    case "legacy-mrp-products":
      if (!env.LEGACY_MRP_API_URL) {
        throw badRequest(
          "Legacy MRP product pull requires LEGACY_MRP_API_URL to be configured."
        )
      }

      return {
        sourceProfile,
        sourceSystem: "legacy_mrp",
        baseUrl: normalizeBaseUrl(env.LEGACY_MRP_API_URL),
        bearerToken: env.LEGACY_MRP_API_TOKEN,
        tenantId: env.LEGACY_MRP_TENANT_ID,
        endpointPath: "/products",
      }
  }
}

function createRequestUrl(input: {
  readonly config: LegacyCounterpartySourceConfig
  readonly page: number
  readonly request: LegacyErpCounterpartyPullRequest
}): URL {
  const url = new URL(`${input.config.baseUrl}${input.config.endpointPath}`)
  url.searchParams.set("page", String(input.page))
  url.searchParams.set("pageSize", String(input.request.pageSize))

  if (input.request.search) {
    url.searchParams.set("search", input.request.search)
  }
  if (input.request.channel) {
    url.searchParams.set("channel", input.request.channel)
  }
  if (input.request.companyId) {
    url.searchParams.set("companyId", input.request.companyId)
  }
  if (typeof input.request.isActive === "boolean") {
    url.searchParams.set("isActive", String(input.request.isActive))
  }

  return url
}

function createRequestHeaders(
  config: LegacySourceConfigBase
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  }

  if (config.bearerToken) {
    headers.Authorization = `Bearer ${config.bearerToken}`
  }

  if (config.tenantId) {
    headers["X-Tenant-ID"] = config.tenantId
  }

  return headers
}

function parseLegacyTpmCustomersResponse(
  value: unknown
): LegacyTpmCustomersResponse {
  if (!value || typeof value !== "object") {
    throw badRequest("Legacy TPM customer response must be a JSON object.")
  }

  const payload = value as Record<string, unknown>
  const records = Array.isArray(payload.data) ? payload.data : []
  const normalizedRecords = records
    .filter(
      (record): record is Record<string, unknown> =>
        Boolean(record) && typeof record === "object"
    )
    .map((record) => ({
      id: typeof record.id === "string" ? record.id : "",
      code: typeof record.code === "string" ? record.code : undefined,
      name: typeof record.name === "string" ? record.name : "",
      taxCode: typeof record.taxCode === "string" ? record.taxCode : undefined,
      isActive:
        typeof record.isActive === "boolean" ? record.isActive : undefined,
      company:
        record.company && typeof record.company === "object"
          ? {
              id:
                typeof (record.company as Record<string, unknown>).id ===
                "string"
                  ? ((record.company as Record<string, unknown>).id as string)
                  : undefined,
              name:
                typeof (record.company as Record<string, unknown>).name ===
                "string"
                  ? ((record.company as Record<string, unknown>).name as string)
                  : undefined,
              code:
                typeof (record.company as Record<string, unknown>).code ===
                "string"
                  ? ((record.company as Record<string, unknown>).code as string)
                  : undefined,
            }
          : null,
    }))
    .filter((record) => record.id.length > 0 && record.name.length > 0)

  const metadata =
    payload.metadata && typeof payload.metadata === "object"
      ? {
          totalPages:
            typeof (payload.metadata as Record<string, unknown>).totalPages ===
            "number"
              ? ((payload.metadata as Record<string, unknown>)
                  .totalPages as number)
              : undefined,
          pageNumber:
            typeof (payload.metadata as Record<string, unknown>).pageNumber ===
            "number"
              ? ((payload.metadata as Record<string, unknown>)
                  .pageNumber as number)
              : undefined,
          pageSize:
            typeof (payload.metadata as Record<string, unknown>).pageSize ===
            "number"
              ? ((payload.metadata as Record<string, unknown>)
                  .pageSize as number)
              : undefined,
          totalCount:
            typeof (payload.metadata as Record<string, unknown>).totalCount ===
            "number"
              ? ((payload.metadata as Record<string, unknown>)
                  .totalCount as number)
              : undefined,
        }
      : undefined

  return {
    data: normalizedRecords,
    metadata,
  }
}

function parseLegacyMrpProductsResponse(
  value: unknown
): LegacyMrpProductsResponse {
  if (!value || typeof value !== "object") {
    throw badRequest("Legacy MRP product response must be a JSON object.")
  }

  const payload = value as Record<string, unknown>
  const records = Array.isArray(payload.data) ? payload.data : []
  const normalizedRecords = records
    .filter(
      (record): record is Record<string, unknown> =>
        Boolean(record) && typeof record === "object"
    )
    .map((record) => ({
      id: typeof record.id === "string" ? record.id : "",
      sku: typeof record.sku === "string" ? record.sku : undefined,
      name: typeof record.name === "string" ? record.name : "",
      status: typeof record.status === "string" ? record.status : undefined,
    }))
    .filter((record) => record.id.length > 0 && record.name.length > 0)

  const pagination =
    payload.pagination && typeof payload.pagination === "object"
      ? {
          totalPages:
            typeof (payload.pagination as Record<string, unknown>)
              .totalPages === "number"
              ? ((payload.pagination as Record<string, unknown>)
                  .totalPages as number)
              : undefined,
          page:
            typeof (payload.pagination as Record<string, unknown>).page ===
            "number"
              ? ((payload.pagination as Record<string, unknown>).page as number)
              : undefined,
          pageSize:
            typeof (payload.pagination as Record<string, unknown>).pageSize ===
            "number"
              ? ((payload.pagination as Record<string, unknown>)
                  .pageSize as number)
              : undefined,
          total:
            typeof (payload.pagination as Record<string, unknown>).total ===
            "number"
              ? ((payload.pagination as Record<string, unknown>)
                  .total as number)
              : undefined,
        }
      : undefined

  return {
    data: normalizedRecords,
    pagination,
  }
}

function mapLegacyTpmCustomerToCounterpartyRecord(
  record: LegacyTpmCustomerRecord
): LegacyCounterpartyTransformRequest {
  return {
    entityKind: "counterparty",
    sourceSystem: "legacy_tpm",
    payload: {
      externalId: record.id,
      code: record.code,
      name: record.name,
      type: "customer",
      status: record.isActive === false ? "inactive" : "active",
      taxCode: record.taxCode,
      aliases: record.company?.name ? [record.company.name] : undefined,
    },
  }
}

function mapLegacyMrpProductToItemRecord(
  record: LegacyMrpProductRecord
): LegacyInventoryItemTransformRequest {
  return {
    entityKind: "inventory-item",
    sourceSystem: "legacy_mrp",
    payload: {
      externalId: record.id,
      sku: record.sku,
      name: record.name,
      status: record.status,
      itemType: "inventory",
      baseUomCode: "EA",
    },
  }
}

export async function pullLegacyCounterpartyBatch(input: {
  readonly request: LegacyErpCounterpartyPullRequest
}): Promise<{
  readonly sourceProfile: LegacyErpCounterpartySourceProfile
  readonly sourceSystem: "legacy_tpm"
  readonly fetchedCount: number
  readonly pagesFetched: number
  readonly records: readonly LegacyCounterpartyTransformRequest[]
}> {
  const config = resolveCounterpartySourceConfig(input.request.sourceProfile)
  const collected: LegacyCounterpartyTransformRequest[] = []
  let page = 1
  let pagesFetched = 0

  while (collected.length < input.request.maxRecords) {
    const url = createRequestUrl({
      config,
      page,
      request: input.request,
    })

    const response = await fetch(url, {
      method: "GET",
      headers: createRequestHeaders(config),
    })

    if (!response.ok) {
      throw badRequest(
        `Legacy source request failed with status ${response.status}.`,
        {
          sourceProfile: config.sourceProfile,
          statusCode: response.status,
          requestUrl: url.toString(),
        }
      )
    }

    const parsed = parseLegacyTpmCustomersResponse(await response.json())
    const pageRecords = (parsed.data ?? []).map(
      mapLegacyTpmCustomerToCounterpartyRecord
    )

    pagesFetched += 1
    if (pageRecords.length === 0) {
      break
    }

    for (const record of pageRecords) {
      collected.push(record)
      if (collected.length >= input.request.maxRecords) {
        break
      }
    }

    const totalPages = parsed.metadata?.totalPages
    if (typeof totalPages === "number" && page >= totalPages) {
      break
    }

    if (pageRecords.length < input.request.pageSize) {
      break
    }

    page += 1
  }

  return {
    sourceProfile: config.sourceProfile,
    sourceSystem: config.sourceSystem,
    fetchedCount: collected.length,
    pagesFetched,
    records: collected,
  }
}

export async function pullLegacyItemBatch(input: {
  readonly request: LegacyErpItemPullRequest
}): Promise<{
  readonly sourceProfile: LegacyErpItemSourceProfile
  readonly sourceSystem: "legacy_mrp"
  readonly fetchedCount: number
  readonly pagesFetched: number
  readonly records: readonly LegacyInventoryItemTransformRequest[]
}> {
  const config = resolveItemSourceConfig(input.request.sourceProfile)
  const collected: LegacyInventoryItemTransformRequest[] = []
  let page = 1
  let pagesFetched = 0

  while (collected.length < input.request.maxRecords) {
    const url = new URL(`${config.baseUrl}${config.endpointPath}`)
    url.searchParams.set("page", String(page))
    url.searchParams.set("pageSize", String(input.request.pageSize))

    if (input.request.search) {
      url.searchParams.set("search", input.request.search)
    }
    if (input.request.status) {
      url.searchParams.set("status", input.request.status)
    }

    const response = await fetch(url, {
      method: "GET",
      headers: createRequestHeaders(config),
    })

    if (!response.ok) {
      throw badRequest(
        `Legacy source request failed with status ${response.status}.`,
        {
          sourceProfile: config.sourceProfile,
          statusCode: response.status,
          requestUrl: url.toString(),
        }
      )
    }

    const parsed = parseLegacyMrpProductsResponse(await response.json())
    const pageRecords = (parsed.data ?? []).map(mapLegacyMrpProductToItemRecord)

    pagesFetched += 1
    if (pageRecords.length === 0) {
      break
    }

    for (const record of pageRecords) {
      collected.push(record)
      if (collected.length >= input.request.maxRecords) {
        break
      }
    }

    const totalPages = parsed.pagination?.totalPages
    if (typeof totalPages === "number" && page >= totalPages) {
      break
    }

    if (pageRecords.length < input.request.pageSize) {
      break
    }

    page += 1
  }

  return {
    sourceProfile: config.sourceProfile,
    sourceSystem: config.sourceSystem,
    fetchedCount: collected.length,
    pagesFetched,
    records: collected,
  }
}

export function __setLegacyCounterpartySourceConfigForTests(
  value: LegacyCounterpartySourceConfig | null
): void {
  counterpartySourceConfigOverride = value
}

export function __resetLegacyCounterpartySourceConfigForTests(): void {
  counterpartySourceConfigOverride = null
}

export function __setLegacyItemSourceConfigForTests(
  value: LegacyItemSourceConfig | null
): void {
  itemSourceConfigOverride = value
}

export function __resetLegacyItemSourceConfigForTests(): void {
  itemSourceConfigOverride = null
}
