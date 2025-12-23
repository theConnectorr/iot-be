import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const QueryParams = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): unknown => {
    const request = ctx.switchToHttp().getRequest()
    const params = request.query

    if (params.limit) params.limit = Number(params.limit)
    if (params.offset) params.offset = Number(params.offset)

    params.filter = convertToObject(params, "filter")
    if (params.filter === undefined) {
      delete params.filter
    }

    params.sort = convertToObject(params, "sort")
    if (params.sort === undefined) {
      delete params.sort
    }

    return params
  },
)

function convertToObject(
  params: Record<string, string>,
  property: string,
): object | undefined {
  const object: Record<string, string | number | Date> = {}

  const regex = new RegExp(`${property}\\[(.*?)\\]`)

  for (const key in params) {
    const match = regex.exec(key)
    if (match) {
      object[match[1]] = params[key]
      delete params[key]
    }
  }

  return Object.keys(object).length !== 0 ? object : undefined
}
