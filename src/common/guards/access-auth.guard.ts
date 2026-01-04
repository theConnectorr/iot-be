import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Request } from "express"
import { UnauthorizedException } from "../exceptions/unauthorized.exception"
import { JwtService } from "src/modules/users/services/jwt.service"
import { isNone } from "effect/Option"
import { InvalidAccessTokenException } from "../exceptions/invalid-access-token.exception"

@Injectable()
export class AccessAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  private readonly publicUrls: string[] = []

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    if (this.publicUrls.includes(request.path)) return true

    // 1. Khởi tạo biến accessToken
    let accessToken: string | undefined

    // 2. Ưu tiên lấy từ Header (Bearer Token) - Dành cho API thường
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.split(" ")[1]
    }

    // 3. Nếu Header không có, thử lấy từ Query Params - Dành cho SSE
    // (Client gửi lên dạng: ?accessToken=xyz...)
    if (!accessToken && request.query.accessToken) {
      accessToken = request.query.accessToken as string
    }

    // 4. Nếu kiểm tra cả 2 nơi đều không có Token -> Lỗi Unauthorized
    if (!accessToken) {
      throw new UnauthorizedException()
    }

    // 5. Xác thực Token
    const tokenPayloadOption =
      await this.jwtService.verifyAccessToken(accessToken)

    if (isNone(tokenPayloadOption)) {
      throw new InvalidAccessTokenException()
    }

    request["user"] = tokenPayloadOption.value.user

    return true
  }
}
