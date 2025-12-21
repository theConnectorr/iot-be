import { HttpException, HttpStatus } from "@nestjs/common"
import { ErrorCode } from "src/common/enums/error-code.enum"

export class UnmatchedCredentialException extends HttpException {
  constructor() {
    super(ErrorCode.UNMATCHED_CREDENTIALS, HttpStatus.UNAUTHORIZED)
  }
}
