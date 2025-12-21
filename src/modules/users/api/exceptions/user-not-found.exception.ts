import { HttpException, HttpStatus } from "@nestjs/common"
import { ErrorCode } from "src/common/enums/error-code.enum"

export class UserNotFoundException extends HttpException {
  constructor() {
    super(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND)
  }
}
