/** Safe double-quoted PostgreSQL identifier (table/column names only). */
export function qident(name: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Unsafe SQL identifier: ${name}`)
  }
  return `"${name}"`
}

export function tcol(table: string, column: string): string {
  return `${qident(table)}.${qident(column)}`
}
