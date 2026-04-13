export {
  changeLocale,
  getActiveLocale,
  i18n,
  initI18n,
  loadI18nNamespace,
  preloadI18nNamespaces,
} from "./adapters/i18next-adapter"
export * from "./policy/i18n-policy"
export {
  formatCurrency,
  formatCurrencyByBusinessRule,
  formatDate,
  formatNumber,
  formatPercent,
  getFormatLocale,
} from "./services/i18n-format-service"
export { LanguageSwitcher } from "./components/language-switcher"
export { ErpModulePage } from "./components/ErpModulePage"
export type { ErpModulePageId } from "./components/ErpModulePage"
