export const CacheKeys = {
  customer: (tenantId: string, id: string) => `md:customer:${tenantId}:${id}`,
  customerList: (tenantId: string, page: number) =>
    `md:customers:${tenantId}:p${page}`,
  product: (tenantId: string, id: string) => `md:product:${tenantId}:${id}`,
  productList: (tenantId: string, page: number) =>
    `md:products:${tenantId}:p${page}`,
  employee: (tenantId: string, id: string) => `md:employee:${tenantId}:${id}`,
  trialBalance: (tenantId: string, period: string) =>
    `acc:tb:${tenantId}:${period}`,
  balanceSheet: (tenantId: string, date: string) =>
    `acc:bs:${tenantId}:${date}`,
  chartOfAccounts: (tenantId: string) => `acc:coa:${tenantId}`,
  cart: (cartId: string) => `ecom:cart:${cartId}`,
  productCatalog: (storeId: string, page: number) =>
    `ecom:catalog:${storeId}:p${page}`,
  shippingRates: (storeId: string, province: string) =>
    `ecom:ship:${storeId}:${province}`,
  userSession: (userId: string) => `session:${userId}`,
  userPermissions: (userId: string) => `perms:${userId}`,
  tenantConfig: (tenantId: string) => `tenant:config:${tenantId}`,
  tenantFeatures: (tenantId: string) => `tenant:features:${tenantId}`,
} as const

export const CacheTTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 3600,
  VERY_LONG: 86_400,
  SESSION: 1800,
} as const
