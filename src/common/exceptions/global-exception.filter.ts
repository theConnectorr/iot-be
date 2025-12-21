import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common"
import { Request, Response } from "express"
import { ApiError, ApiResponse } from "../response/api-response.dto"
import { HttpAdapterHost } from "@nestjs/core"
import { v4 } from "uuid"
import { ErrorCode } from "../enums/error-code.enum"

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(GlobalHttpExceptionFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    let httpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string = "Internal server error"
    const { httpAdapter } = this.httpAdapterHost
    const path = httpAdapter.getRequestUrl(request)
    let errorCode: string = ErrorCode.INTERNAL_SERVER_ERROR
    let errors: ApiError[] | undefined = undefined
    const traceId = v4()

    if (exception instanceof HttpException) {
      console.log(JSON.stringify(exception, null, 4))
      httpStatusCode = exception.getStatus()

      const errorResponse = exception.getResponse()
      errorCode = exception.message
      message = exception.message

      if (typeof errorResponse === "object" && errorResponse !== null) {
        errors = (errorResponse as any).errors
      }
    } else if (exception instanceof Error) {
      message = exception.message
    }

    const logMessage = `[TraceID: ${traceId}] - Path: ${path} - ${message}`
    this.logger.error(logMessage, (exception as Error).stack)
    this.logger.log(process.env.NODE_ENV)

    const responseBody = ApiResponse.fail(
      message,
      errorCode,
      path,
      traceId,
      errors,
    )

    httpAdapter.reply(response, responseBody, httpStatusCode)
  }
}
