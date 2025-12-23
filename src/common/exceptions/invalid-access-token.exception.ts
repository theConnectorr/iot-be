import { HttpException, HttpStatus } from "@nestjs/common"
import { ErrorCode } from "../enums/error-code.enum"

export class InvalidAccessTokenException extends HttpException {
  constructor() {
    super(ErrorCode.INVALID_ACCESS_TOKEN, HttpStatus.UNAUTHORIZED)
  }
}
