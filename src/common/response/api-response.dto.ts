import { HttpStatus } from "@nestjs/common"

export interface ApiError {
  field: string
  message: string
}

export class ApiResponse<T> {
  public readonly data?: T
  public readonly message?: string
  public readonly errorCode?: string
  public readonly errors?: ApiError[]
  public readonly path?: string
  public readonly traceId?: string

  private constructor(
    data?: T,
    message?: string,
    path?: string,
    errorCode?: string,
    errors?: ApiError[],
    traceId?: string,
  ) {
    this.data = data
    this.message = message
    this.path = path
    this.errorCode = errorCode
    this.errors = errors
    this.traceId = traceId
  }

  public static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse<T>(data)
  }

  public static fail<T>(
    message: string,
    errorCode: string,
    path: string,
    traceId: string,
    errors?: ApiError[],
  ): ApiResponse<T> {
    return new ApiResponse<T>(
      undefined,
      message,
      path,
      errorCode,
      errors,
      traceId,
    )
  }
}
