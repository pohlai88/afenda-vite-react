import { listFinancePlaceholder } from '../services/financeService'

export function refreshFinanceAction() {
  return Promise.resolve(listFinancePlaceholder())
}
