/**
 * Minimal PO (gettext) and Frappe CSV parser for i18n corpus ingestion.
 * No external dependencies — parses the subset of PO/CSV used by Odoo and Frappe.
 */

export type PoEntry = {
  msgid: string
  msgstr: string
}

/**
 * Parses a PO/POT file into msgid/msgstr pairs.
 * Handles multiline strings and escaped quotes.
 */
export function parsePo(content: string): PoEntry[] {
  const entries: PoEntry[] = []
  const lines = content.split("\n")

  let currentField: "msgid" | "msgstr" | null = null
  let msgid = ""
  let msgstr = ""

  function flush() {
    if (msgid) {
      entries.push({ msgid, msgstr })
    }
    msgid = ""
    msgstr = ""
    currentField = null
  }

  for (const raw of lines) {
    const line = raw.trim()

    if (line === "" || line.startsWith("#")) {
      if (currentField === "msgstr") {
        flush()
      }
      continue
    }

    if (line.startsWith("msgid ")) {
      if (currentField === "msgstr") {
        flush()
      }
      currentField = "msgid"
      msgid = extractQuoted(line.slice(6))
      continue
    }

    if (line.startsWith("msgstr ")) {
      currentField = "msgstr"
      msgstr = extractQuoted(line.slice(7))
      continue
    }

    if (line.startsWith('"') && line.endsWith('"')) {
      const continuation = extractQuoted(line)
      if (currentField === "msgid") {
        msgid += continuation
      } else if (currentField === "msgstr") {
        msgstr += continuation
      }
    }
  }

  flush()
  return entries.filter((e) => e.msgid !== "")
}

function extractQuoted(s: string): string {
  const trimmed = s.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\\\/g, "\\")
  }
  return trimmed
}

export type CsvEntry = {
  source: string
  translation: string
}

export type DolibarrLangEntry = {
  key: string
  value: string
}

/**
 * Parses a Frappe-style CSV translation file (source,translation,context).
 * First row is the header.
 */
export function parseFrappeCsv(content: string): CsvEntry[] {
  const entries: CsvEntry[] = []
  const lines = content.split("\n")

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const fields = parseCsvLine(line)
    if (fields.length >= 2 && fields[0]) {
      entries.push({
        source: fields[0],
        translation: fields[1] || fields[0],
      })
    }
  }

  return entries
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ",") {
        fields.push(current)
        current = ""
      } else {
        current += ch
      }
    }
  }

  fields.push(current)
  return fields
}

/**
 * Parses a Dolibarr `.lang` file into key/value entries.
 * Format: `TokenKey=Translated text`
 */
export function parseDolibarrLang(content: string): DolibarrLangEntry[] {
  const entries: DolibarrLangEntry[] = []
  const lines = content.split("\n")

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue

    const idx = line.indexOf("=")
    if (idx <= 0) continue

    const key = line.slice(0, idx).trim()
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/\\n/g, "\n")

    if (!key) continue
    entries.push({ key, value })
  }

  return entries
}
