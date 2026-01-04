import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common"
import { LoginRequestBody } from "../presentation/request/login.body"
import { ApiResponse } from "src/common/response/api-response.dto"
import { AuthService } from "../../services/auth.service"
import { AccessAuthGuard } from "src/common/guards/access-auth.guard"
import { Request } from "express"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async login(@Body() body: LoginRequestBody) {
    const { email, password } = body

    const { accessToken, refreshToken, user } =
      await this.authService.authenticateUser(email, password)

    return ApiResponse.success({
      accessToken,
      refreshToken,
      user,
    })
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(body.userId, body.refreshToken)
  }

  @Post("logout")
  @UseGuards(AccessAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const user = req["user"]

    return this.authService.logout(user.id)
  }
}
