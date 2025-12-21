import { Body, Controller, Post } from "@nestjs/common"
import { LoginRequestBody } from "../presentation/request/login.body"
import { ApiResponse } from "src/common/response/api-response.dto"
import { AuthService } from "../../services/auth.service"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
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
}
