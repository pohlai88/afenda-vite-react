import { listInventoryPlaceholder } from '../services/inventoryService'

export function refreshInventoryAction() {
  return Promise.resolve(listInventoryPlaceholder())
}
