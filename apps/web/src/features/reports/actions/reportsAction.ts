import { listReportsPlaceholder } from '../services/reportsService'

export function refreshReportsAction() {
  return Promise.resolve(listReportsPlaceholder())
}
