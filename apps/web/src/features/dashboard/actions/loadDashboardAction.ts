import { listDashboardModules } from '../services/dashboardService'

export function loadDashboardAction() {
  return Promise.resolve(listDashboardModules())
}
