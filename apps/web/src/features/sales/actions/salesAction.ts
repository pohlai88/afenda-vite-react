import { listSalesPlaceholder } from '../services/salesService'

export function refreshSalesAction() {
  return Promise.resolve(listSalesPlaceholder())
}
