import { listSettingsPlaceholder } from '../services/settingsService'

export function refreshSettingsAction() {
  return Promise.resolve(listSettingsPlaceholder())
}
