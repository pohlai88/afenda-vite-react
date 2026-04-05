export interface DashboardModule {
  title: string
  path: string
  description: string
}

export function listDashboardModules(): DashboardModule[] {
  return []
}
