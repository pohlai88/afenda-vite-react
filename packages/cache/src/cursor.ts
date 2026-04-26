import type { CursorPagination, CursorQueryDescriptor } from "./contracts"

export function encodeCursor(
  id: string,
  sortValue: string | number | Date
): string {
  const value =
    sortValue instanceof Date ? sortValue.toISOString() : String(sortValue)
  return Buffer.from(`${id}|${value}`).toString("base64url")
}

export function decodeCursor(cursor: string): {
  id: string
  sortValue: string
} {
  const decoded = Buffer.from(cursor, "base64url").toString("utf8")
  const [id, ...rest] = decoded.split("|")
  if (!id) {
    throw new Error("decodeCursor: invalid cursor payload")
  }
  return { id, sortValue: rest.join("|") }
}

export function buildCursorQuery(
  pagination: CursorPagination,
  sortField = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): CursorQueryDescriptor {
  const query: CursorQueryDescriptor = {
    take: pagination.limit + 1,
    orderBy: { [sortField]: sortOrder },
  }

  if (pagination.cursor) {
    const { id } = decodeCursor(pagination.cursor)
    return {
      ...query,
      cursor: { id },
      skip: 1,
    }
  }

  return query
}
