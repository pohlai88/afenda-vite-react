export type TemplateContext = Readonly<Record<string, string>>

const templateTokenPattern = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g

export function renderTemplate(
  template: string,
  context: TemplateContext
): string {
  return template.replace(templateTokenPattern, (_match, key: string) => {
    const value = context[key]
    return value === undefined || value.trim().length === 0
      ? "Not yet known"
      : value
  })
}

export function renderBulletList(values: readonly string[]): string {
  if (values.length === 0) {
    return "- Not yet known"
  }

  return values.map((value) => `- ${value}`).join("\n")
}

export function renderYesNo(value: boolean): string {
  return value ? "Yes" : "No"
}

export function renderTitle(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function renderTechStack(
  sections: Readonly<Record<string, readonly string[]>>
): string {
  return Object.entries(sections)
    .map(
      ([section, values]) =>
        `### ${renderTitle(section)}\n\n${renderBulletList(values)}`
    )
    .join("\n\n")
}
