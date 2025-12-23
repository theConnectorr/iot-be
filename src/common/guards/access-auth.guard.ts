import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"
import { Request } from "express"
import { UnauthorizedException } from "../exceptions/unauthorized.exception"
import { JwtService } from "src/modules/users/services/jwt.service"
import { isNone } from "effect/Option"
import { InvalidAccessTokenException } from "../exceptions/invalid-access-token.exception"

@Injectable()
export class AccessAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  private readonly publicUrls: string[] = [
    "/api/v1/analytics/revenue/zone",
    "/api/v1/leaderboard/seller-by-revenue",
  ]

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    if (this.publicUrls.includes(request.path)) return true

    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException()
    }

    const accessToken: string = authHeader.split(" ")[1]

    const tokenPayloadOption =
      await this.jwtService.verifyAccessToken(accessToken)

    if (isNone(tokenPayloadOption)) {
      throw new InvalidAccessTokenException()
    }

    request["user"] = tokenPayloadOption.value.user

    return true
  }
}
