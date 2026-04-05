import { listEmployeesPlaceholder } from '../services/employeesService'

export function refreshEmployeesAction() {
  return Promise.resolve(listEmployeesPlaceholder())
}
