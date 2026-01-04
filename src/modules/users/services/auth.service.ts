import { ForbiddenException, Injectable } from "@nestjs/common"
import { PrismaService } from "src/common/prisma/prisma.service"
import * as bcrypt from "bcrypt"
import { JwtService } from "./jwt.service"
import { UserNotFoundException } from "../api/exceptions/user-not-found.exception"
import { UnmatchedCredentialException } from "../api/exceptions/unmatched-credential.exception"

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public async authenticateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (user === null) {
      throw new UserNotFoundException()
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnmatchedCredentialException()
    }

    const payload = {
      id: user.id,
      email: user.email,
    }

    const accessToken = await this.jwtService.generateAccessToken(payload)
    const refreshToken = await this.jwtService.generateRefreshToken(payload)

    this.updateRefreshToken(user.id, refreshToken)

    return {
      accessToken,
      refreshToken,
      user: payload,
    }
  }

  /**
   * Đăng xuất: Xóa Refresh Token trong DB để chặn việc cấp mới Access Token
   */
  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: { id: userId, refreshToken: { not: null } },
      data: { refreshToken: null },
    })
    return { message: "Logged out successfully" }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.refreshToken) {
      throw new ForbiddenException("Access Denied: No Refresh Token found")
    }

    if (user.refreshToken !== refreshToken) {
      throw new ForbiddenException("Access Denied: Invalid Refresh Token")
    }

    const payload = {
      id: user.id,
      email: user.email,
    }

    const accessToken = await this.jwtService.generateAccessToken(payload)

    await this.updateRefreshToken(user.id, refreshToken)

    return {
      accessToken: accessToken,
      refreshToken,
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    })
  }
}
