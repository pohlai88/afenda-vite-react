import { listCustomersPlaceholder } from '../services/customersService'

export function refreshCustomersAction() {
  return Promise.resolve(listCustomersPlaceholder())
}
