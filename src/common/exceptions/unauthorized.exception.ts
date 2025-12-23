import { HttpException, HttpStatus } from "@nestjs/common"
import { ErrorCode } from "../enums/error-code.enum"

export class UnauthorizedException extends HttpException {
  constructor() {
    super(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
  }
}
