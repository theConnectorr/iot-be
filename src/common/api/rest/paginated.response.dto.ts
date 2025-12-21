import { Collection } from "./collection.interface"

export interface PaginatedResponse<E> {
  readonly items: E[]
  readonly offset: number
  readonly limit: number
  readonly total: number
}

export const toPaginatedResponse = <E>(
  data: Collection<E>,
  offset: number,
  limit: number,
): PaginatedResponse<E> => {
  return {
    items: data.items,
    offset,
    limit,
    total: data.total,
  }
}
